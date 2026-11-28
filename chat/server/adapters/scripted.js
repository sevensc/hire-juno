// A colleague that answers from a script instead of a model: for recording
// demos and screenshots without spending tokens, and for trying the chat
// without an account. Chosen only when HIRE_JUNO_DEMO_SCRIPT names a script
// file (see createAdapter in agentAdapter.js); never otherwise.
//
// The script is JSON:
//   { "rules": [ { "colleague": "juno", "match": "regex", "steps": [...] } ],
//     "fallback": "text for anything no rule matches" }
// The first rule whose colleague (optional) and `match` (case-insensitive,
// against the whole message she receives) fit is played; a rule with
// "once": true is played only the first time. Steps, in order:
//   { "think": "..." }                      her thinking, streamed
//   { "say": "..." }                        reply text, streamed
//   { "tool": { "name", "input" }, "ask": true }   a tool line; "ask" shows
//                                           the permission card first and
//                                           waits for the answer
//   { "subagent": { "type", "description", "text", "report" } }
//                                           a sub-agent window
//   { "pause": 800 }                        milliseconds of nothing
// It emits the same updates as the Claude adapter, so the chat cannot tell
// the difference on screen.

import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function loadScript(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  return {
    rules: (raw.rules || []).map((r, i) => ({ ...r, index: i, pattern: new RegExp(r.match || '.', 'i') })),
    fallback: raw.fallback || 'This is a scripted demo colleague; there is nothing in the script for that.',
    speed: Number(raw.speed) || 1,
  };
}

// The rule a message plays, or null.
export function pickRule(script, colleagueId, text, played = new Set()) {
  return script.rules.find((r) => (!r.colleague || r.colleague === colleagueId) && r.pattern.test(text) && !(r.once && played.has(r.index))) || null;
}

export class ScriptedAdapter {
  // `worktrees`: the conversation's worktrees; "WORKTREE/<repo>" in a tool
  // input becomes the path of the one for that repository.
  constructor(colleague, { scriptFile, cwd, worktrees = [] }) {
    this.colleague = colleague;
    this.cwd = cwd;
    this.worktrees = worktrees;
    this.script = loadScript(scriptFile);
    this.onUpdate = null;
    this.onPermissionRequest = null;
    this.onSessionId = null;
    this.onStaleResume = null;
    this.onIdle = null;
    this._outstanding = 0;
    this._played = new Set();
    this._started = false;
    this._chain = Promise.resolve();
    this._closed = false;
  }

  get busy() {
    return this._outstanding > 0;
  }

  get canCancel() {
    return false;
  }

  async _stream(type, text) {
    const step = Math.max(2, Math.round(6 * this.script.speed));
    for (let i = 0; i < text.length && !this._closed; i += step) {
      this.onUpdate?.({ type, text: text.slice(i, i + step) });
      await sleep(18);
    }
  }

  _paths(value) {
    if (typeof value === 'string') {
      return value.replace(/WORKTREE\/([A-Za-z0-9._-]+)/g, (all, repo) => {
        const w = this.worktrees.find((t) => t.path.endsWith(`-${repo}`) || t.path.endsWith(`/${repo}`)) || this.worktrees[0];
        return w ? w.path : all;
      });
    }
    if (Array.isArray(value)) return value.map((v) => this._paths(v));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, this._paths(v)]));
    return value;
  }

  async _play(text) {
    if (!this._started) {
      this._started = true;
      this.onSessionId?.(randomUUID());
    }
    const rule = pickRule(this.script, this.colleague.id, text, this._played);
    if (rule) this._played.add(rule.index);
    const steps = rule ? rule.steps : [{ say: this.script.fallback }];
    const said = [];
    await sleep(500);
    for (const step of steps) {
      if (this._closed) return;
      if (step.pause) await sleep(step.pause);
      if (step.think) await this._stream('thinking_delta', step.think);
      if (step.tool) {
        const id = `toolu_demo_${randomUUID().slice(0, 8)}`;
        const input = this._paths(step.tool.input || {});
        // No approval line for a tool that needs none, as with a real session.
        let approval;
        // "ask": goes through the chat's real permission check, which may
        // answer by itself (a standing permission, her own worktree) or
        // show the card.
        if (step.ask && this.onPermissionRequest) {
          const decision = await this.onPermissionRequest({ toolUseID: id, toolName: step.tool.name, input, title: step.tool.title });
          approval = decision.via || 'asked';
          if (!decision.allow) {
            said.push(step.denied || 'Understood, I will leave that.');
            continue;
          }
        }
        this.onUpdate?.({ type: 'tool_use', id, name: step.tool.name, input });
        await sleep(step.tool.ms || 700);
        this.onUpdate?.({ type: 'tool_done', id, approval });
      }
      if (step.subagent) {
        const id = `toolu_demo_${randomUUID().slice(0, 8)}`;
        const s = step.subagent;
        this.onUpdate?.({ type: 'tool_use', id, name: 'Task', input: { description: s.description, subagent_type: s.type, prompt: s.prompt || s.description } });
        this.onUpdate?.({ type: 'subagent_start', id, subagentType: s.type, taskDescription: s.description, prompt: s.prompt || s.description });
        for (const tool of s.tools || []) {
          this.onUpdate?.({ type: 'subagent_tool_use', id, name: tool.name, input: tool.input || {} });
          await sleep(400);
        }
        if (s.text) await this._stream('subagent_delta', s.text).then(() => {});
        this.onUpdate?.({ type: 'subagent_end', id, report: s.report || s.text || '' });
        this.onUpdate?.({ type: 'tool_done', id });
      }
      if (step.say) {
        if (said.length) await this._stream('delta', '\n\n');
        await this._stream('delta', step.say);
        said.push(step.say);
      }
    }
    if (this._closed) return;
    this.onUpdate?.({ type: 'message', role: 'colleague', text: said.join('\n\n') });
  }

  sendMessage(text) {
    this._outstanding++;
    const run = this._chain.then(() => this._play(String(text || ''))).catch((err) => {
      this.onUpdate?.({ type: 'message', role: 'system', text: `Script error: ${err.message}` });
    }).finally(() => {
      this._outstanding = Math.max(0, this._outstanding - 1);
      if (this._outstanding === 0) this.onIdle?.();
    });
    this._chain = run;
    return run;
  }

  async cancel() {
    return false;
  }

  async getRateLimits() {
    return null;
  }

  async supportedModels() {
    return [{ value: 'default', displayName: 'Scripted demo', description: 'Answers from the demo script' }];
  }

  async setModel() {}

  async supportedCommands() {
    return [
      { name: 'compact', description: 'Free up context by summarizing the conversation so far', argumentHint: '<optional instructions>' },
      { name: 'context', description: 'Show current context usage', argumentHint: '' },
      { name: 'code-review', description: 'Review the current diff for correctness bugs', argumentHint: '[<pr#>|<branch>]' },
    ];
  }

  close() {
    this._closed = true;
  }
}
