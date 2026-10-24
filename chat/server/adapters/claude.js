// The Claude adapter. Talks to the official Claude Agent SDK
// (`@anthropic-ai/claude-agent-sdk`) directly, in-process — no
// subprocess, no ACP, no community wrapper. See chat/README.md and the
// planning notes for why: the SDK's own `query()` already gives every
// primitive this adapter needs, verified against its shipped type
// declarations (`node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`):
// a per-call `systemPrompt`, a `canUseTool` permission callback with
// rich, ready-to-render fields (title/displayName/description), token-
// level streaming via `includePartialMessages`, and several independent
// concurrent `query()` calls in one process — exactly "one persistent
// session per colleague".
//
// One `query()` call lives for the adapter's whole lifetime, fed by an
// async generator we can push new user turns into (`prompt` accepts
// `AsyncIterable<SDKUserMessage>`) — not a fresh `query()` per message.
// That keeps `canUseTool` and conversation context alive across turns
// without touching `resume` at all.
//
// `onUpdate`/`onPermissionRequest` are adapter-level properties, not
// something passed fresh into each sendMessage() call — found the hard
// way. A colleague can spawn a Task subagent in the *background*
// ("I'll let you know once she's back" — she doesn't wait) and reply
// immediately; the subagent's own messages (tagged with
// parent_tool_use_id) then arrive well after that turn's `result` and
// its sendMessage() promise have already resolved. Binding delivery to
// that one call meant those later messages had nowhere to go — a
// silent, complete loss of the subagent thread, not a rendering bug.

import { createSdkMcpServer, query, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

import { isStaleResumeError, STALE_RESUME_MESSAGE } from './staleResume.js';
import { SubagentTracker } from './subagents.js';
import { TextBlockSeparator } from './textBlocks.js';

// Tools that always ask in the chat unless its Auto mode is on, whatever the
// Claude settings allow. The names are Claude Code's own tool names.
export const ASK_UNLESS_AUTO_MODE = ['Bash', 'Edit', 'Write', 'NotebookEdit', 'WebFetch', 'WebSearch', 'mcp__*'];

// A tool_result's `content` (ToolResultBlockParam, per @anthropic-ai/sdk)
// is either a plain string or an array of content blocks — normalizes
// both to text, keeping only the text blocks (a Task/Agent result is
// text; other block kinds there would be unusual and aren't rendered).
// `message.modelUsage` (SDKResultMessage) is a running total across every
// model call the query() pipeline has made so far — main loop, subagents,
// compaction, the lot — keyed by raw model string, re-sent in full on
// every result. Summed across models rather than picking one, since a
// colleague's own turn and any subagent she ran along the way can use
// different models; "how many tokens has this session cost so far" is the
// question the UI is actually asking, not "which model used how many".
function summarizeUsage(message) {
  const modelUsage = message.modelUsage || {};
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheTokens = 0;
  for (const usage of Object.values(modelUsage)) {
    inputTokens += usage.inputTokens || 0;
    outputTokens += usage.outputTokens || 0;
    cacheTokens += (usage.cacheReadInputTokens || 0) + (usage.cacheCreationInputTokens || 0);
  }
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens + cacheTokens,
    costUsd: message.total_cost_usd,
  };
}

// What the `use_worktree` tool tells her, from the result of useWorktree().
export function worktreeToolResult(result) {
  if (!result.ok) return { content: [{ type: 'text', text: result.message }], isError: true };
  const text = result.created
    ? `Created a git worktree on branch ${result.branch} at ${result.path}. ` +
      (result.cwdIsWorktree === false
        ? `Your working directory stays where it is, because it is not this repository: ` +
          `work on this repository in ${result.path} by absolute path (or cd there).`
        : `Your shell and file tools still start in the old folder for the rest of this turn: ` +
          `work in ${result.path} by absolute path. From your next turn on it is your working directory.`)
    : `This conversation already has a worktree, on branch ${result.branch} at ${result.path}.`;
  return { content: [{ type: 'text', text }] };
}

// An in-process MCP server with the one `use_worktree` tool (shown to her as
// mcp__juno__use_worktree; it asks in the chat like any mcp__* tool, see
// ASK_UNLESS_AUTO_MODE).
export function worktreeServer(useWorktree) {
  return createSdkMcpServer({
    name: 'juno',
    tools: [
      tool(
        'use_worktree',
        'Moves this conversation into its own git worktree on a new branch, so the changes stay off the main ' +
          'checkout. Optional `repoPath`: the absolute path of the top folder of the git repository to branch ' +
          'from, when you work in a repo other than the one you started in. Returns the worktree path and branch.',
        { repoPath: z.string().optional().describe('Absolute path of the git repository to work in') },
        async ({ repoPath }) => worktreeToolResult(useWorktree({ repoPath }))
      ),
    ],
  });
}

function toolResultText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  }
  return '';
}

export class ClaudeAdapter {
  // `resume`: the SDK's own session id from a previous run of this same
  // (colleague, our session) adapter, if server/index.js found one saved
  // (see store.js's adapter_sessions table) — passed straight through to
  // query()'s own `resume` option (sdk.d.ts: "Session ID to resume. Loads
  // the conversation history from the specified session," no companion
  // option required). Omitted entirely for a first-ever conversation.
  // `useWorktree`: when set, she gets the `use_worktree` tool (worktreeServer
  // above); see createAdapter in agentAdapter.js.
  constructor(colleague, { systemPrompt, cwd, resume, model, useWorktree }) {
    this.colleague = colleague;
    this.systemPrompt = systemPrompt;
    this.cwd = cwd;
    // Set by whoever owns this adapter (server/index.js) right after
    // creating it, and re-bound on every subsequent message so a
    // reconnected browser tab takes over delivery. Both may be null
    // between the adapter being created and the first bind.
    this.onUpdate = null;
    this.onPermissionRequest = null;
    // Also set once, right after creation, by server/index.js — not a
    // per-message rebind like the two above, since this is bookkeeping
    // (persist the SDK's own session id) rather than UI delivery. Called
    // every time the 'init' system message names it, which today is once
    // per adapter lifetime, but nothing here assumes that stays true.
    this.onSessionId = null;
    // Called once when the CLI reports that the session id this adapter was
    // asked to resume has no transcript anymore (see staleResume.js), so
    // whoever owns the saved pointer can clear it and drop this adapter.
    this.onStaleResume = null;
    // Called when the last outstanding turn has ended and nothing is queued
    // behind it: the one safe moment for the owner to replace this adapter.
    this.onIdle = null;
    this._staleResumeHandled = false;
    this._queue = [];
    this._notifyQueued = null;
    this._pendingResolve = null; // resolves the in-flight sendMessage() call, if any
    this._resolvers = new Map(); // message uuid -> resolve of its own sendMessage() call (see cancel())
    this._textBlocks = new TextBlockSeparator(); // blank line between a turn's text blocks
    // Messages sent whose turn has not ended yet. A message sent mid-turn
    // counts too, which _pendingResolve alone can't say: it only holds the latest.
    this._outstanding = 0;
    // Tool-use IDs of Task calls whose subagent thread we've already
    // announced to the frontend, so the second message in doesn't
    // re-announce it.
    this._openSubagents = new Set();
    this._subagents = new SubagentTracker(); // briefs and background endings (see subagents.js)
    // How each tool call of this session got its go-ahead, by tool-use id:
    // 'asked' (the human answered a prompt) or whatever `via` the owner's
    // permission callback reported (e.g. 'auto mode'). A call that never
    // reached the callback was allowed by a settings rule or needed no
    // approval at all — see the 'tool_done' update below.
    this._approvals = new Map();

    this._session = query({
      prompt: this._inputStream(),
      options: {
        systemPrompt,
        // Without this, the SDK defaults to process.cwd() — the chat
        // server's own working directory, not the repo the colleague
        // actually lives in. Otherwise a colleague can't see the others as
        // spawnable subagents, because .claude/agents/<id>.md lives in
        // the target repo and nothing points the session there.
        cwd,
        includePartialMessages: true,
        // Makes the CLI hand every user message that carries a uuid back as
        // `isReplay: true` at the moment the session takes it up (measured: a
        // message pushed during a running tool call came back with the tool
        // result that it was folded into). That is the exact "read" signal for a
        // waiting message; see the `isReplay` branch below.
        extraArgs: { 'replay-user-messages': null },
        // On the newest models (this account's resolved default is
        // "sonnet" — checked via the SDK's own resolveSettings(), not
        // guessed) thinking already runs by default; what was missing
        // is `display: 'summarized'` — without it the returned
        // thinking block's text is empty by default
        // (docs.claude.com/en/docs/build-with-claude/thinking). First
        // attempt at this was `{type:'enabled', budgetTokens}` (the
        // legacy manual-budget form for older, thinking-only models)
        // and produced no thinking block at all — the newest models
        // want `adaptive` instead. Real, billed output tokens on every
        // turn.
        thinking: { type: 'adaptive', display: 'summarized' },
        // Without this, a tool call that a permission rule from the user's,
        // the project's or the local Claude settings already allows never
        // reaches `canUseTool`: it runs without anyone being asked, with or
        // without the chat's Auto mode. Ask rules are checked before allow
        // rules whatever they are written for (Claude Code permissions docs:
        // "deny, then ask, then allow"), so these make the chat ask for these
        // tools every time; only Auto mode (see server/index.js) answers for
        // the human. Read-only tools (Read, Grep, Glob) keep Claude's own
        // default of not asking.
        settings: { permissions: { ask: ASK_UNLESS_AUTO_MODE } },
        canUseTool: (toolName, input, opts) => this._handlePermission(toolName, input, opts),
        ...(resume ? { resume } : {}),
        // The model picked in the conversation's settings, if any — an
        // option of its own in the SDK (sdk.d.ts: "Claude model to use.
        // Defaults to the CLI default model."), left out entirely otherwise.
        ...(model ? { model } : {}),
        ...(useWorktree ? { mcpServers: { juno: worktreeServer(useWorktree) } } : {}),
      },
    });

    // Fire-and-forget: this loop outlives any single sendMessage() call,
    // which is the point — the session (and canUseTool) stay alive
    // between messages, and so does update delivery.
    this._readLoop().catch((err) => {
      if (isStaleResumeError(err.message)) {
        this._handleStaleResume();
        return;
      }
      this.onUpdate?.({ type: 'message', role: 'system', text: `Session error: ${err.message}` });
      this._textBlocks.reset();
      this._pendingResolve?.();
      this._pendingResolve = null;
      this._outstanding = 0;
    });
  }

  // Feeds the SDK's `prompt` parameter. Idle until sendMessage() pushes
  // something in, exactly once per pushed message — this is not polling.
  async *_inputStream() {
    while (true) {
      while (this._queue.length > 0) {
        yield this._queue.shift();
      }
      await new Promise((resolve) => {
        this._notifyQueued = resolve;
      });
    }
  }

  async _readLoop() {
    for await (const message of this._session) {
      this._handleMessage(message);
    }
  }

  _handleMessage(message) {
    const parentId = message.parent_tool_use_id;

    // A non-null parent_tool_use_id means this message is a subagent's
    // own turn, spawned by the Task tool call with that ID — not the
    // colleague's own reply. Routed to its own update channel (the
    // frontend's nested, closable sub-chat) instead of the main one.
    // This can arrive long after the turn that spawned it if the
    // colleague ran it in the background — see the file header.
    if (parentId && (message.type === 'stream_event' || message.type === 'assistant')) {
      if (!this._openSubagents.has(parentId)) {
        this._openSubagents.add(parentId);
        this.onUpdate?.({
          type: 'subagent_start',
          id: parentId,
          subagentType: message.subagent_type,
          taskDescription: message.task_description,
          prompt: this._subagents.brief(parentId),
        });
      }
      if (message.type === 'stream_event') {
        const delta = message.event?.delta;
        if (delta?.type === 'text_delta' && delta.text) {
          this.onUpdate?.({ type: 'subagent_delta', id: parentId, text: delta.text });
        } else if (delta?.type === 'thinking_delta' && delta.thinking) {
          this.onUpdate?.({ type: 'subagent_delta', id: parentId, text: delta.thinking });
        }
      } else {
        for (const block of message.message?.content ?? []) {
          if (block.type === 'tool_use') {
            this.onUpdate?.({ type: 'subagent_tool_use', id: parentId, name: block.name, input: block.input });
            // Its real report: shown at once, in case the end comes late.
            const handback = this._subagents.rememberHandback(parentId, block);
            if (handback) this.onUpdate?.({ type: 'subagent_message', id: parentId, text: handback });
          } else if (block.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
            // A sub-agent sends no partial messages; its finished text
            // between tool calls only arrives here.
            this.onUpdate?.({ type: 'subagent_message', id: parentId, text: block.text });
          }
        }
      }
      return;
    }

    switch (message.type) {
      case 'system': {
        // Model/effort/tokens are shown per colleague — the
        // `init` system message is the one place the SDK actually says
        // which model and effort level a session ended up running on
        // (org caps and model-support downgrades mean that's not
        // necessarily what profile.md asked for). Every other `system`
        // subtype (session_state_changed, …) falls through, unrendered for
        // now same as before. The sub-agent ones are read in subagents.js:
        // a background sub-agent's answer arrives as a task_notification.
        this._subagents.noteSystemMessage(message);
        const ended = this._subagents.endFromNotification(message);
        if (ended && this._openSubagents.delete(ended.id)) {
          this.onUpdate?.({ type: 'subagent_end', id: ended.id, report: ended.report });
        }
        if (message.subtype === 'init') {
          this.onUpdate?.({ type: 'session_info', model: message.model, effort: message.effort ?? null });
          // Separate from onUpdate on purpose (see the constructor
          // comment) — this is what makes a resume after a server
          // restart possible at all (see server/index.js's adapterFor).
          this.onSessionId?.(message.session_id);
        }
        return;
      }
      case 'stream_event': {
        // Token-level text as it's generated, plus extended-thinking
        // text on its own channel — this is the part the native apps
        // show as "<name> is thinking…" before she acts.
        const delta = message.event?.delta;
        const separator = this._textBlocks.separatorFor(message.event);
        if (separator) this.onUpdate?.({ type: 'delta', text: separator });
        if (delta?.type === 'text_delta' && delta.text) {
          this.onUpdate?.({ type: 'delta', text: delta.text });
        } else if (delta?.type === 'thinking_delta' && delta.thinking) {
          this.onUpdate?.({ type: 'thinking_delta', text: delta.thinking });
        }
        return;
      }
      case 'assistant': {
        // Tool-use notifications, so the chat shows what a colleague is
        // doing the same way the native apps do — separate from the
        // canUseTool approval flow below, which is about permission,
        // not visibility.
        for (const block of message.message?.content ?? []) {
          if (block.type === 'tool_use') {
            this._subagents.rememberToolUse(block);
            this.onUpdate?.({ type: 'tool_use', id: block.id, name: block.name, input: block.input });
          } else if (block.type === 'text') {
            this._textBlocks.addText(block.text);
          }
        }
        return;
      }
      case 'user': {
        // The session took up a message that was sent with a uuid: it is read.
        if (message.isReplay) {
          if (message.uuid) this.onUpdate?.({ type: 'message_read', uuid: message.uuid });
          return;
        }
        // The main loop's own tool_result for a finished Task call is
        // the closing signal for that subagent's thread — the subagent
        // itself never sends an explicit "I'm done".
        //
        // Report text comes from `message.tool_use_result.content` —
        // checked directly against a real Task-tool run, not assumed:
        // it's the clean report ([{type:'text', text:'hello from
        // subagent'}]), while the sibling `block.content` on the
        // tool_result itself carries an extra text block Claude Code
        // appends for the orchestrating model's own benefit
        // ("agentId: … <usage>subagent_tokens: …</usage>") — plumbing,
        // not an answer. `tool_use_result` is typed `unknown` in the
        // SDK, so it's read defensively and `block.content` kept as a
        // fallback for whatever shape doesn't match.
        const blocks = message.message?.content;
        if (Array.isArray(blocks)) {
          // A tool call has run once its result is back: say how it was
          // allowed, so the chat can show the ones nobody was asked about.
          for (const block of blocks) {
            if (block.type !== 'tool_result') continue;
            // A foreground sub-agent's result ends its thread (below); the
            // "launched" notice of a background one is just a finished call.
            if (this._openSubagents.has(block.tool_use_id) && !this._subagents.isBackground(block.tool_use_id)) continue;
            const approval = this._approvals.get(block.tool_use_id) || 'not asked';
            this._approvals.delete(block.tool_use_id);
            this.onUpdate?.({ type: 'tool_done', id: block.tool_use_id, approval });
          }
          for (const block of blocks) {
            if (
              block.type === 'tool_result' &&
              this._openSubagents.has(block.tool_use_id) &&
              !this._subagents.isBackground(block.tool_use_id)
            ) {
              this._openSubagents.delete(block.tool_use_id);
              const result = message.tool_use_result;
              const rawReport = result && typeof result === 'object' && 'content' in result
                ? toolResultText(result.content)
                : toolResultText(block.content);
              const report = this._subagents.resolveReport(block.tool_use_id, rawReport);
              this._subagents.forget(block.tool_use_id);
              this.onUpdate?.({ type: 'subagent_end', id: block.tool_use_id, report });
            }
          }
        }
        return;
      }
      case 'result': {
        if (message.subtype === 'success') {
          // The SDK's `result` is only the last text block of the turn;
          // what was written before a tool call is kept (see textBlocks.js).
          this.onUpdate?.({ type: 'message', role: 'colleague', text: this._textBlocks.turnText(message.result) });
        } else if (isStaleResumeError((message.errors || []).join(' '))) {
          this._handleStaleResume();
          return;
        } else {
          this.onUpdate?.({
            type: 'message',
            role: 'system',
            text: `(turn ended without a result: ${message.subtype})`,
          });
        }
        this.onUpdate?.({ type: 'usage', ...summarizeUsage(message) });
        this._pendingResolve?.();
        this._pendingResolve = null;
        this._textBlocks.reset();
        this._outstanding = Math.max(0, this._outstanding - 1);
        if (this._outstanding === 0) {
          this._resolvers.clear();
          this.onIdle?.();
        }
        return;
      }
      default:
        // Every other SDKMessage variant (system notices, hook events,
        // rate-limit info, task_notification/task_updated for
        // background tasks, …) is real information the SDK exposes,
        // just not rendered in this first version — ignored, not
        // swallowed silently as an error.
        return;
    }
  }

  // The CLI answers a resume of a vanished session twice (an error result,
  // then an error from the stream); only the first one acts.
  _handleStaleResume() {
    if (this._staleResumeHandled) return;
    this._staleResumeHandled = true;
    this.onUpdate?.({ type: 'message', role: 'system', text: STALE_RESUME_MESSAGE });
    this._textBlocks.reset();
    this._pendingResolve?.();
    this._pendingResolve = null;
    this._outstanding = 0;
    this.onStaleResume?.();
  }

  async _handlePermission(toolName, input, opts) {
    if (!this.onPermissionRequest) {
      return { behavior: 'deny', message: 'No one is listening for a permission decision right now.' };
    }
    const decision = await this.onPermissionRequest({
      toolUseID: opts.toolUseID,
      toolName,
      input,
      title: opts.title,
      displayName: opts.displayName,
      description: opts.description,
    });
    if (opts.toolUseID) this._approvals.set(opts.toolUseID, decision.via || 'asked');
    return decision.allow
      ? { behavior: 'allow' }
      : { behavior: 'deny', message: decision.message || 'Denied.' };
  }

  // True while a turn is in flight (sendMessage() sent, result not yet in).
  get busy() {
    return this._outstanding > 0;
  }

  // `uuid` names the message so it can be withdrawn again (see cancel());
  // `priority: 'later'` makes it a turn of its own after the running one
  // ends instead of being read at the next tool result (measured, see the
  // server's waiting.js).
  sendMessage(text, attachments, { uuid, priority } = {}) {
    this._outstanding++;
    return new Promise((resolve) => {
      this._pendingResolve = resolve;
      if (uuid) this._resolvers.set(uuid, resolve);
      // A plain string keeps the common case simple; the Messages API
      // only wants the array shape once there's more than text to say
      // (Base64ImageSource, verified against @anthropic-ai/sdk's own
      // types — image/png|jpeg|gif|webp only, matching agentAdapter.js).
      const content = attachments?.length
        ? [
            { type: 'text', text },
            ...attachments.map((a) => ({
              type: 'image',
              source: { type: 'base64', media_type: a.mimeType, data: a.data },
            })),
          ]
        : text;
      this._queue.push({
        type: 'user',
        message: { role: 'user', content },
        parent_tool_use_id: null,
        ...(uuid ? { uuid } : {}),
        ...(priority ? { priority } : {}),
      });
      const notify = this._notifyQueued;
      this._notifyQueued = null;
      notify?.();
    });
  }

  // Whether a message can be taken back at all: the SDK's
  // cancelAsyncMessage() is in its control protocol but not in its public
  // types, so it may be missing in another SDK version.
  get canCancel() {
    return typeof this._session?.cancelAsyncMessage === 'function';
  }

  // Takes a message back that the session has not read yet. true: it was
  // dropped and will never be read; this turn's bookkeeping is undone (no
  // result will ever come for it). false: the session had already taken it
  // up (or it is unknown). Throws if the call itself fails.
  async cancel(uuid) {
    if (!uuid || !this.canCancel) return false;
    const cancelled = (await this._session.cancelAsyncMessage(uuid)) === true;
    if (cancelled) {
      this._outstanding = Math.max(0, this._outstanding - 1);
      const resolve = this._resolvers.get(uuid);
      this._resolvers.delete(uuid);
      resolve?.();
      if (this._outstanding === 0) this.onIdle?.();
    }
    return cancelled;
  }

  // Showing Claude's own session/weekly usage limits, not just this
  // app's own token/cost tallies. The SDK's
  // `usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET()` (that
  // name is the SDK's own, verified against sdk.d.ts — not something
  // added here) is the one call that exposes claude.ai plan rate-limit
  // utilization (five_hour/seven_day/... windows); everything else this
  // adapter reads is per-turn token/cost totals, not plan limits. Given
  // the name, this is wrapped defensively: any shape change, removal,
  // or an account where plan limits don't apply at all (API key,
  // Bedrock, Vertex — `rate_limits_available: false`) just yields null,
  // never an error surfaced to the UI.
  async getRateLimits() {
    try {
      const data = await this._session.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET();
      return data?.rate_limits_available ? data.rate_limits : null;
    } catch {
      return null;
    }
  }

  // The models this account can pick from, as the SDK reports them
  // (`value` is what setModel()/the `model` option take). Answers before
  // the first message has been sent.
  async supportedModels() {
    return this._session.supportedModels();
  }

  // Switches the model for the replies that follow, in the running
  // session (sdk.d.ts: Query.setModel, streaming input mode only — which
  // is the only mode this adapter uses). undefined goes back to the default.
  async setModel(model) {
    await this._session.setModel(model || undefined);
  }

  // Terminates the underlying `claude` subprocess. Found the hard way:
  // without this, the process this adapter lives in never exits on its
  // own — the SDK keeps its CLI subprocess (and the event loop) alive
  // for as long as the Query generator exists, server shutdown or not.
  close() {
    this._session.close();
  }
}
