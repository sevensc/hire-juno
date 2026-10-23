// The Copilot adapter — over the Agent Client Protocol (ACP), unlike
// the Claude adapter. Different backends, different official
// mechanisms: `copilot --acp` is GitHub's own, documented way to run
// Copilot CLI as an ACP agent (see `copilot --help`); there is no separate SDK to reach for
// here the way there is for Claude. See chat/README.md and the
// planning notes for why ACP is the right choice for this backend
// specifically, not a universal transport this whole module is built
// on.
//
// Talks to `@agentclientprotocol/sdk` (the official TypeScript ACP
// library) directly: spawns `copilot --acp`, wraps its stdio as an ACP
// `Stream`, and drives one session per colleague through the SDK's
// `ClientContext`/`ActiveSession` helpers — the same shape
// `agentAdapter.js` expects, so nothing above this file needs to know
// ACP exists.
//
// Every type used here (SessionUpdate variants, ToolCall, PermissionOption,
// RequestPermissionResponse) is checked against the SDK's own shipped
// declarations (node_modules/@agentclientprotocol/sdk/dist/*.d.ts) — but
// unlike the Claude adapter, this one has not yet been run against a real
// `copilot --acp` process. Do that before trusting it end to end.

import { spawn } from 'node:child_process';
import { Readable, Writable } from 'node:stream';

import { client, ndJsonStream } from '@agentclientprotocol/sdk';

export class CopilotAdapter {
  constructor(colleague, { cwd }) {
    this.colleague = colleague;
    // Adapter-level, not per-sendMessage() — see claude.js's file
    // header for why: a background-run task's updates can arrive
    // after the turn that spawned it already resolved, and binding
    // delivery to that one call drops them silently.
    this.onUpdate = null;
    this.onPermissionRequest = null;
    this._queue = [];
    this._notifyQueued = null;
    this._pendingResolve = null;
    this._outstanding = 0; // messages sent whose turn has not ended yet
    this._closed = false;

    this._child = spawn('copilot', ['--acp'], { stdio: ['pipe', 'pipe', 'inherit'] });

    const stream = ndJsonStream(
      Writable.toWeb(this._child.stdin),
      Readable.toWeb(this._child.stdout)
    );

    const app = client({ name: 'hire-juno-chat' }).onRequest(
      'session/request_permission',
      (ctx) => this._handlePermission(ctx.params)
    );

    // connectWith's callback scopes the connection's lifetime — it has
    // to stay pending for as long as this adapter is alive, which is
    // why the whole session loop lives inside it rather than being
    // awaited up front.
    this._ready = app.connectWith(stream, async (ctx) => {
      this._session = await ctx.buildSession(cwd).start();
      await this._runLoop();
    });
  }

  async _runLoop() {
    while (!this._closed) {
      const queued = await this._nextQueuedMessage();
      if (this._closed) return;
      let fullText = '';

      // A plain string keeps the common case simple; ACP's ContentBlock
      // array form (verified against the SDK's own schema types) only
      // comes into play once there's an attachment to send alongside
      // the text.
      const prompt = queued.attachments?.length
        ? [
            { type: 'text', text: queued.text },
            ...queued.attachments.map((a) => ({ type: 'image', data: a.data, mimeType: a.mimeType })),
          ]
        : queued.text;

      const promptPromise = this._session.prompt(prompt).catch((err) => {
        this.onUpdate?.({ type: 'message', role: 'system', text: `Error: ${err.message}` });
      });

      for (;;) {
        const message = await this._session.nextUpdate();
        if (message.kind === 'stop') break;
        const update = message.update;
        if (update.sessionUpdate === 'agent_message_chunk' && update.content?.type === 'text') {
          fullText += update.content.text;
          this.onUpdate?.({ type: 'delta', text: update.content.text });
        } else if (update.sessionUpdate === 'tool_call') {
          this.onUpdate?.({ type: 'tool_use', name: update.name || update.title, input: update.rawInput });
        }
        // Other update kinds (thought chunks, plans, mode changes, tool
        // status updates past the initial call) are real ACP updates,
        // just not rendered in this first version.
      }
      await promptPromise;

      this.onUpdate?.({ type: 'message', role: 'colleague', text: fullText });
      this._pendingResolve?.();
      this._pendingResolve = null;
      this._outstanding = Math.max(0, this._outstanding - 1);
    }
  }

  async _handlePermission({ toolCall, options }) {
    if (!this.onPermissionRequest) {
      // Fail closed: reject-shaped outcome so the tool call does not
      // silently proceed with no one deciding.
      const reject = options.find((o) => o.kind.startsWith('reject')) ?? options[0];
      return { outcome: { outcome: 'selected', optionId: reject.optionId } };
    }
    const decision = await this.onPermissionRequest({
      toolUseID: toolCall.toolCallId,
      toolName: toolCall.name || toolCall.title,
      input: toolCall.rawInput,
      title: toolCall.title,
      displayName: toolCall.name,
      description: undefined,
    });
    const wanted = decision.allow ? 'allow' : 'reject';
    const option = options.find((o) => o.kind.startsWith(wanted)) ?? options[0];
    return { outcome: { outcome: 'selected', optionId: option.optionId } };
  }

  _nextQueuedMessage() {
    if (this._queue.length > 0) return Promise.resolve(this._queue.shift());
    return new Promise((resolve) => {
      this._notifyQueued = () => resolve(this._queue.shift());
    });
  }

  // True while a turn is in flight (sendMessage() sent, result not yet in).
  get busy() {
    return this._outstanding > 0;
  }

  sendMessage(text, attachments) {
    this._outstanding++;
    return new Promise((resolve) => {
      this._pendingResolve = resolve;
      this._queue.push({ text, attachments });
      const notify = this._notifyQueued;
      this._notifyQueued = null;
      notify?.();
    });
  }

  close() {
    this._closed = true;
    this._notifyQueued?.();
    this._child.kill();
  }
}
