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

import { query } from '@anthropic-ai/claude-agent-sdk';

import { isStaleResumeError, STALE_RESUME_MESSAGE } from './staleResume.js';

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
  constructor(colleague, { systemPrompt, cwd, resume }) {
    this.colleague = colleague;
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
    this._staleResumeHandled = false;
    this._queue = [];
    this._notifyQueued = null;
    this._pendingResolve = null; // resolves the in-flight sendMessage() call, if any
    // Tool-use IDs of Task calls whose subagent thread we've already
    // announced to the frontend, so the second message in doesn't
    // re-announce it.
    this._openSubagents = new Set();

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
        canUseTool: (toolName, input, opts) => this._handlePermission(toolName, input, opts),
        ...(resume ? { resume } : {}),
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
      this._pendingResolve?.();
      this._pendingResolve = null;
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
        // subtype (task_notification, session_state_changed, …) falls
        // through to `default`, unrendered for now same as before.
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
            this.onUpdate?.({ type: 'tool_use', name: block.name, input: block.input });
          }
        }
        return;
      }
      case 'user': {
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
          for (const block of blocks) {
            if (block.type === 'tool_result' && this._openSubagents.has(block.tool_use_id)) {
              this._openSubagents.delete(block.tool_use_id);
              const result = message.tool_use_result;
              const report = result && typeof result === 'object' && 'content' in result
                ? toolResultText(result.content)
                : toolResultText(block.content);
              this.onUpdate?.({ type: 'subagent_end', id: block.tool_use_id, report });
            }
          }
        }
        return;
      }
      case 'result': {
        if (message.subtype === 'success') {
          this.onUpdate?.({ type: 'message', role: 'colleague', text: message.result });
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
    this._pendingResolve?.();
    this._pendingResolve = null;
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
    return decision.allow
      ? { behavior: 'allow' }
      : { behavior: 'deny', message: decision.message || 'Denied.' };
  }

  sendMessage(text, attachments) {
    return new Promise((resolve) => {
      this._pendingResolve = resolve;
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
      });
      const notify = this._notifyQueued;
      this._notifyQueued = null;
      notify?.();
    });
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

  // Terminates the underlying `claude` subprocess. Found the hard way:
  // without this, the process this adapter lives in never exits on its
  // own — the SDK keeps its CLI subprocess (and the event loop) alive
  // for as long as the Query generator exists, server shutdown or not.
  close() {
    this._session.close();
  }
}
