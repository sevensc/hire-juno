// What the chat needs to know about sub-agents beyond what the stream says
// while they run:
//
//   - the brief the colleague gave them: it is the `prompt` input of her
//     Agent/Task tool call, which the sub-agent's own messages never repeat;
//   - how a background sub-agent ends. Its tool call returns at once with a
//     "launched" notice, so the tool result is not its answer. The answer
//     comes later as a `task_notification` system message (`summary`, with
//     the tool call's id as `tool_use_id`), measured against the SDK: a
//     background agent printed `summary: "SUBDONE"` for a prompt asking it
//     to reply exactly that. A foreground sub-agent still ends with the tool
//     result, which carries the full report.
export class SubagentTracker {
  constructor() {
    this._inputs = new Map(); // tool_use id -> input of the Agent/Task call
    this._background = new Set(); // tool_use ids started in the background
  }

  // Call for every tool_use block of the colleague's own turns.
  rememberToolUse(block) {
    if (block?.type === 'tool_use' && (block.name === 'Task' || block.name === 'Agent') && block.id) {
      this._inputs.set(block.id, block.input || {});
    }
  }

  // The brief for a sub-agent started by the tool call `id`, or undefined.
  brief(id) {
    const prompt = this._inputs.get(id)?.prompt;
    return typeof prompt === 'string' && prompt ? prompt : undefined;
  }

  // Call for every `system` message; remembers which sub-agents run in the
  // background.
  noteSystemMessage(message) {
    if (message?.subtype === 'task_started' && message.tool_use_id && message.is_backgrounded === true) {
      this._background.add(message.tool_use_id);
    }
  }

  // Whether the tool result of call `id` is a "launched" notice rather than
  // the answer.
  isBackground(id) {
    return this._background.has(id);
  }

  // For a `task_notification` of a background sub-agent: the end event to
  // send, {id, report}, else null (not a notification, not ours, or the
  // sub-agent runs in the foreground and ends with its tool result).
  endFromNotification(message) {
    if (message?.subtype !== 'task_notification' || !message.tool_use_id) return null;
    if (!this._background.has(message.tool_use_id)) return null;
    const summary = typeof message.summary === 'string' ? message.summary : '';
    const report = message.status === 'completed' ? summary : `(${message.status}) ${summary}`.trim();
    this.forget(message.tool_use_id);
    return { id: message.tool_use_id, report };
  }

  forget(id) {
    this._inputs.delete(id);
    this._background.delete(id);
  }
}
