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
// How the tool result / notification of a sub-agent begins when its report
// was delivered by its SubagentHandback call instead.
export const PLACEHOLDER_START = "This agent's report was delivered to you as a message from";

export class SubagentTracker {
  constructor() {
    this._inputs = new Map(); // tool_use id -> input of the Agent/Task call
    this._background = new Set(); // tool_use ids started in the background
    this._handbacks = new Map(); // sub-agent tool_use id -> text of its SubagentHandback call
    this._agentIds = new Map(); // agent id (what SendMessage's `to` names) -> tool_use id of its window
  }

  // Call for every tool_use block a sub-agent sends (`id` = the call that
  // started it). Its real report is the `message` of its SubagentHandback
  // call; the tool result and the task notification only carry a
  // placeholder pointing there. Returns the text when the block is one.
  rememberHandback(id, block) {
    if (block?.type !== 'tool_use' || block.name !== 'SubagentHandback') return undefined;
    const message = block.input?.message;
    if (typeof message !== 'string' || !message.trim()) return undefined;
    this._handbacks.set(id, message);
    return message;
  }

  // The report to show for a sub-agent that ended with `report`: the
  // remembered handback text when `report` is the placeholder, else `report`.
  resolveReport(id, report) {
    if (typeof report === 'string' && report.startsWith(PLACEHOLDER_START)) {
      return this._handbacks.get(id) ?? report;
    }
    return report;
  }

  // Call for every tool result: the launch result of an Agent/Task call names
  // the agent (`tool_use_result.agentId`), which is how a later SendMessage
  // finds the window. `result` is typed unknown in the SDK, so it is read
  // defensively. Only meaningful when the message carries one tool result.
  rememberLaunch(toolUseId, result) {
    if (toolUseId && result && typeof result === 'object' && typeof result.agentId === 'string') {
      this._agentIds.set(result.agentId, toolUseId);
    }
  }

  // For a `SendMessage` tool call of the colleague's own turn: the window it
  // goes to and the text, {id, text}; null when it names no sub-agent we know
  // (a colleague, a name, an agent whose launch we never saw) or has no text.
  messageTo(block) {
    if (block?.type !== 'tool_use' || block.name !== 'SendMessage') return null;
    const id = this._agentIds.get(block.input?.to);
    const text = block.input?.message;
    if (!id || typeof text !== 'string' || !text.trim()) return null;
    return { id, text };
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
    const resolved = this.resolveReport(message.tool_use_id, summary);
    const report = message.status === 'completed' ? resolved : `(${message.status}) ${resolved}`.trim();
    this.forget(message.tool_use_id);
    return { id: message.tool_use_id, report };
  }

  forget(id) {
    this._inputs.delete(id);
    this._background.delete(id);
    this._handbacks.delete(id);
  }
}
