// Tool permissions the human has granted ahead of time, held in the
// server's memory only. Two kinds, per conversation key (`colleagueId::
// sessionId` for a 1:1, `colleagueId::channelId` for one member of a
// channel):
//   - "allow all tools": every tool that would otherwise ask.
//   - "always allow <tool>": that one tool.
// Nothing here is written to disk on purpose: both are blanket
// permissions and must not survive a server restart unnoticed. Being
// server-side, they survive a page reload and apply to every open tab.

export const VIA_ALLOW_ALL = 'allow all tools';
export const VIA_ALWAYS_ALLOW = 'always allow';

export function createPermissions() {
  const allowAll = new Set();
  const tools = new Map(); // key -> Set of tool names

  const toolList = (key) => [...(tools.get(key) || [])].sort();

  const api = {
    setAllowAll(key, enabled) {
      if (enabled) allowAll.add(key);
      else allowAll.delete(key);
    },
    setAlwaysAllow(key, tool, enabled) {
      if (typeof tool !== 'string' || !tool) return;
      if (enabled) {
        if (!tools.has(key)) tools.set(key, new Set());
        tools.get(key).add(tool);
      } else {
        tools.get(key)?.delete(tool);
        if (tools.get(key)?.size === 0) tools.delete(key);
      }
    },
    // Why a request needs no question, or null when it does.
    decide(key, toolName) {
      if (allowAll.has(key)) return VIA_ALLOW_ALL;
      if (tools.get(key)?.has(toolName)) return VIA_ALWAYS_ALLOW;
      return null;
    },
    // One conversation's state, the shape sent to tabs.
    stateFor(key) {
      return { key, allowAll: allowAll.has(key), tools: toolList(key) };
    },
    // Everything, for a tab that just connected or reloaded.
    snapshot() {
      const keys = new Set([...allowAll, ...tools.keys()]);
      return [...keys].map((key) => api.stateFor(key));
    },
  };
  return api;
}
