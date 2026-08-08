// Both the token and the port a workforce's chat gets served on
// are now sticky per targetDir instead of randomized on every launch —
// once a workforce has been served, the same bookmarkable address
// keeps working across restarts. Same "once known, always known"
// principle as workforceRegistry.js's own file, applied here to "once
// served, always at the same address" instead of "once registered,
// always in the switcher" — deliberately a separate file rather than
// folded into that one: this is per-workforce runtime state (an
// address to reach it at), not the cross-workforce list itself.
//
// The token stays a real random secret — this app has no other access
// control (see runChatServer's own comment on why --lan needs one at
// all) — it's just generated once per path and reused, not
// regenerated every restart. A caller who wants a fresh one (rotating
// out an old bookmark, say) can still delete this file by hand; there
// is deliberately no in-app "reset" for it yet.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';

const SESSIONS_PATH = resolve(homedir(), '.hire-juno', 'sessions.json');

function readSessions() {
  try {
    return JSON.parse(readFileSync(SESSIONS_PATH, 'utf8'));
  } catch {
    return {}; // missing file or unreadable JSON — no sessions remembered yet, not an error
  }
}

function writeSessions(sessions) {
  mkdirSync(dirname(SESSIONS_PATH), { recursive: true });
  writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}

// { token, port } for this exact targetDir — creates one (a fresh
// random token, `port: null` until the caller actually binds one and
// calls saveSessionPort) the first time this path is ever served.
export function getOrCreateSession(targetDir) {
  const path = resolve(targetDir);
  const sessions = readSessions();
  if (!sessions[path]) {
    sessions[path] = { token: randomBytes(16).toString('hex'), port: null };
    writeSessions(sessions);
  }
  return sessions[path];
}

// Called once the server actually bound a port (see runChatServer's own
// listen/retry dance — the remembered port is only ever a *preference*,
// something else may have taken it since the last run) — persists it
// so the *next* launch tries that same port first.
export function saveSessionPort(targetDir, port) {
  const path = resolve(targetDir);
  const sessions = readSessions();
  const existing = sessions[path] || { token: randomBytes(16).toString('hex'), port: null };
  sessions[path] = { ...existing, port };
  writeSessions(sessions);
}
