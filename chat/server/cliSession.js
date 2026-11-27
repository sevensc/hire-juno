import { closeSync, openSync, readdirSync, readSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

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

// --- Taking a terminal session over into the chat ---------------------
// The CLI keeps each session as <config>/projects/<folder>/<id>.jsonl, the
// folder being the working directory with every character that is not a
// letter or digit turned into "-". The chat only offers sessions started in
// the terminal (entrypoint "cli") in the conversation's own working
// directory: the SDK resumes a session from that folder only.

export function cliConfigDir(env = process.env, home = homedir()) {
  return env.CLAUDE_CONFIG_DIR || join(home, '.claude');
}

export function cliProjectDir(cwd, configDir = cliConfigDir()) {
  return join(configDir, 'projects', String(cwd).replace(/[^a-zA-Z0-9]/g, '-'));
}

const HEAD_BYTES = 64 * 1024;
const TAIL_BYTES = 64 * 1024;

function readSlice(file, size, fromEnd) {
  const fd = openSync(file, 'r');
  try {
    const length = Math.min(size, statSync(file).size);
    const buffer = Buffer.alloc(length);
    const start = fromEnd ? Math.max(0, statSync(file).size - length) : 0;
    readSync(fd, buffer, 0, length, start);
    return buffer.toString('utf8');
  } finally {
    closeSync(fd);
  }
}

function parseLines(text) {
  const out = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('{')) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // a line cut by the slice boundary
    }
  }
  return out;
}

function userText(entry) {
  if (entry?.type !== 'user' || entry.isMeta) return '';
  const content = entry.message?.content;
  const text = typeof content === 'string'
    ? content
    : Array.isArray(content) ? content.filter((p) => p?.type === 'text').map((p) => p.text).join(' ') : '';
  const trimmed = text.trim();
  // Slash commands, caveats and reminders arrive as tagged text.
  return trimmed.startsWith('<') ? '' : trimmed;
}

function shorten(text, max = 120) {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

// Newest first. `exclude`: sdk session ids the chat already uses (taking one
// of those over would let two conversations write to the same session).
export function listCliSessions({ cwd, configDir = cliConfigDir(), exclude = [], limit = 10 } = {}) {
  if (typeof cwd !== 'string' || !cwd) return [];
  const dir = cliProjectDir(cwd, configDir);
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const skip = new Set(exclude);
  const files = [];
  for (const name of names) {
    const id = name.endsWith('.jsonl') ? name.slice(0, -'.jsonl'.length) : '';
    if (!isSessionUuid(id) || skip.has(id)) continue;
    try {
      files.push({ id, file: join(dir, name), mtime: statSync(join(dir, name)).mtimeMs });
    } catch {
      // vanished meanwhile
    }
  }
  files.sort((a, b) => b.mtime - a.mtime);
  const sessions = [];
  for (const { id, file, mtime } of files) {
    if (sessions.length >= limit) break;
    let head;
    let tail;
    try {
      head = parseLines(readSlice(file, HEAD_BYTES, false));
      tail = parseLines(readSlice(file, TAIL_BYTES, true));
    } catch {
      continue;
    }
    const entries = [...head, ...tail];
    if (!entries.some((e) => e.entrypoint === 'cli')) continue;
    const agent = entries.find((e) => e.type === 'agent-setting')?.agentSetting || null;
    const firstPrompt = head.map(userText).find(Boolean) || '';
    const lastPrompt = [...tail].reverse().find((e) => e.type === 'last-prompt')?.lastPrompt
      || [...tail].reverse().map(userText).find(Boolean) || '';
    if (!firstPrompt && !lastPrompt) continue;
    sessions.push({
      id,
      agent,
      updatedAt: new Date(mtime).toISOString(),
      firstPrompt: shorten(firstPrompt),
      lastPrompt: shorten(lastPrompt),
    });
  }
  return sessions;
}

// Points the conversation at the terminal session: the running adapter (if
// any) is closed, the saved id replaced, and the next message resumes it.
// Refused while she is answering, and for an id that is not one of the
// offered sessions.
export function adoptCliSession({ store, handovers, adapters, key, colleagueId, sessionId, sdkSessionId, offered }) {
  if (!isSessionUuid(sdkSessionId) || !offered.some((s) => s.id === sdkSessionId)) {
    return { ok: false, message: 'That terminal session is not available here.' };
  }
  const adapter = adapters.get(key);
  if (adapter?.busy) return { ok: false, message: 'She is still answering. Take the session over once she is done.' };
  adapter?.close?.();
  adapters.delete(key);
  store.saveAdapterSession(colleagueId, sessionId, sdkSessionId);
  handovers.remove(key);
  return { ok: true };
}

// Sent along with the first message after a terminal session was taken over:
// the session's last turns happened in the terminal, so without it she would
// go on answering as if she were still there.
export const TAKEN_OVER_NOTE =
  'This conversation was just taken over from a terminal session into the chat. The terminal session is closed; you are answering in the chat now.';

// The message as she gets it: the text, then each non-empty note in brackets.
export function withNotes(text, notes) {
  const present = notes.filter(Boolean);
  return present.length ? `${text}\n\n${present.map((note) => `[${note}]`).join('\n')}` : text;
}
