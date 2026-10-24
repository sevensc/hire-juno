// Continuing a conversation in the Claude Code terminal. The chat keeps the
// SDK session id per conversation (store.js, adapter_sessions); the CLI can
// resume that id (`claude --resume <id>`), or branch off a copy of it
// (`--fork-session`). Commands are only built here, never run.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSessionUuid(value) {
  return typeof value === 'string' && UUID.test(value);
}

// One shell word in single quotes; a single quote inside becomes '\''.
export function shellQuote(text) {
  return `'${String(text).replace(/'/g, `'\\''`)}'`;
}

// What api/cli-session answers. `cwd` is the folder the colleague runs in.
// Without a usable saved session id (no turn yet, or not a uuid) nothing is
// offered and no command is built.
export function cliSessionInfo({ sdkSessionId, cwd }) {
  if (!isSessionUuid(sdkSessionId) || typeof cwd !== 'string' || !cwd) {
    return { available: false, sessionId: null, cwd: null, resumeCommand: null, forkCommand: null };
  }
  const resumeCommand = `cd ${shellQuote(cwd)} && claude --resume ${sdkSessionId}`;
  return { available: true, sessionId: sdkSessionId, cwd, resumeCommand, forkCommand: `${resumeCommand} --fork-session` };
}

// Conversations the terminal has been handed (in memory: a restart of the
// chat forgets it, and the next message then resumes the session as usual).
export function createHandovers() {
  const keys = new Set();
  return {
    has: (key) => keys.has(key),
    add: (key) => void keys.add(key),
    remove: (key) => keys.delete(key),
  };
}

// Handing over closes the conversation's adapter so the chat stops writing to
// the session. Refused while a turn runs. `adapter` may be undefined (not
// started yet).
export function transferToTerminal({ handovers, key, adapter }) {
  if (adapter?.busy) return { ok: false, message: 'She is still answering. Hand over once she is done.' };
  adapter?.close?.();
  handovers.add(key);
  return { ok: true };
}
