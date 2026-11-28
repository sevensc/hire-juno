// A Claude sign-in token entered in the chat itself, for a chat served
// with --socket on a server, where nobody can run an interactive login in
// a terminal. The token comes from `claude setup-token` on the person's
// own computer and is kept in the home directory of the account this
// chat runs as (one account per person, see chat/README.md), readable by
// that account only. It reaches the agents through the environment
// variable Claude Code reads for it; the chat never sends it back to a
// browser.

import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const TOKEN_ENV = 'CLAUDE_CODE_OAUTH_TOKEN';

export function tokenFile(home = homedir()) {
  return join(home, '.hire-juno', 'claude-token');
}

// A token is one line of printable characters without spaces, as
// `claude setup-token` prints it: it starts with "sk-ant-" (its sign-in
// tokens with "sk-ant-oat01-"). Quotes around it and a "Bearer " in front,
// both easily copied along, are taken off. A paste that is something else
// (another kind of key, a cut-off token) is refused here, before it would
// fail every colleague's next message; whether a well-formed token is still
// valid shows on the next message.
export function validToken(value) {
  if (typeof value !== 'string') return null;
  const token = value.trim().replace(/^bearer\s+/i, '').replace(/^(["'])(.*)\1$/, '$2').trim();
  if (token.length < 40 || token.length > 500) return null;
  if (!/^[\x21-\x7e]+$/.test(token)) return null;
  if (!token.startsWith('sk-ant-')) return null;
  return token;
}

// Loads a saved token into the environment unless one is set already
// (an environment set by the service manager wins). Returns whether a
// token is available afterwards.
export function loadToken({ env = process.env, home = homedir() } = {}) {
  if (env[TOKEN_ENV]) return true;
  try {
    const token = validToken(readFileSync(tokenFile(home), 'utf8'));
    if (token) env[TOKEN_ENV] = token;
  } catch {
    // no saved token
  }
  return Boolean(env[TOKEN_ENV]);
}

export function saveToken(value, { env = process.env, home = homedir() } = {}) {
  const token = validToken(value);
  if (!token) throw new Error('That does not look like a token from `claude setup-token`: those start with sk-ant-oat01- and are one line. Copy the whole line it prints.');
  const file = tokenFile(home);
  mkdirSync(join(home, '.hire-juno'), { recursive: true, mode: 0o700 });
  writeFileSync(file + '.new', token + '\n', { mode: 0o600 });
  chmodSync(file + '.new', 0o600);
  renameSync(file + '.new', file);
  env[TOKEN_ENV] = token;
}

export function removeToken({ env = process.env, home = homedir() } = {}) {
  const file = tokenFile(home);
  if (existsSync(file)) unlinkSync(file);
  delete env[TOKEN_ENV];
}
