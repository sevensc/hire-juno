// The person's own GitHub account in the chat. Optional: with a personal
// token (a fine-grained token from GitHub's settings), what the chat does
// on GitHub, from previews to closing an issue, happens as that person.
// Without one the chat uses whatever `gh` is signed in with on this
// machine (on a team server typically a GitHub App). The token is kept in
// the home directory of the account this chat runs as, readable by that
// account only, and only the chat's own `gh` calls get it: the colleagues'
// sessions keep their own GitHub identity.
//
// The GitHub login (for "assigned to me") comes from the token; without
// one from the sign-in in front of this chat, where a login proxy passes
// the GitHub name on (--github-login-header); else it is what the person
// entered, or whom `gh` itself is signed in as.

import { execFile } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

export function validGithubToken(value) {
  if (typeof value !== 'string') return null;
  const token = value.trim();
  if (token.length < 20 || token.length > 400 || !/^[A-Za-z0-9_]+$/.test(token)) return null;
  return token;
}

export function validLogin(value) {
  const login = String(value || '').trim().replace(/^@/, '');
  return LOGIN.test(login) ? login : null;
}

function writePrivate(file, text) {
  writeFileSync(file + '.new', text, { mode: 0o600 });
  chmodSync(file + '.new', 0o600);
  renameSync(file + '.new', file);
}

function readTrimmed(file) {
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    return '';
  }
}

// `run`: execFile, replaceable in tests.
export function createGithubAccount({ home = homedir(), run = execFile, baseEnv = process.env } = {}) {
  const dir = join(home, '.hire-juno');
  const tokenFile = join(dir, 'github-token');
  const loginFile = join(dir, 'github-login');
  let token = validGithubToken(readTrimmed(tokenFile));
  let login = validLogin(readTrimmed(loginFile));
  let ghLogin; // whom plain `gh` is signed in as: undefined = not asked yet
  let signInLogin = null; // from the login proxy's header, see noteSignIn

  const userOf = (env) => new Promise((resolve) => {
    run('gh', ['api', 'user', '--jq', '.login'], { env, timeout: 10000 }, (err, stdout) => resolve(err ? null : validLogin(stdout)));
  });

  return {
    // The environment for the chat's own `gh` calls.
    env() {
      return token ? { ...baseEnv, GH_TOKEN: token, GITHUB_TOKEN: token } : baseEnv;
    },
    hasToken: () => Boolean(token),
    // The GitHub name the login proxy reported for the person using this
    // chat (every request carries it). Returns whether it changed.
    noteSignIn(value) {
      const next = validLogin(value);
      if (!next || next === signInLogin) return false;
      signInLogin = next;
      return true;
    },
    // { login, source: 'token' | 'sign-in' | 'entered' | 'gh' | null, token: bool }
    async account() {
      if (token) return { login, source: 'token', token: true };
      if (signInLogin) return { login: signInLogin, source: 'sign-in', token: false };
      if (login) return { login, source: 'entered', token: false };
      if (ghLogin === undefined) ghLogin = await userOf(baseEnv);
      return { login: ghLogin, source: ghLogin ? 'gh' : null, token: false };
    },
    // Checks the token with GitHub first; saves it with the login it belongs to.
    async setToken(value) {
      const candidate = validGithubToken(value);
      if (!candidate) throw new Error('That does not look like a GitHub token.');
      const owner = await userOf({ ...baseEnv, GH_TOKEN: candidate, GITHUB_TOKEN: candidate });
      if (!owner) throw new Error('GitHub did not accept this token.');
      mkdirSync(dir, { recursive: true, mode: 0o700 });
      writePrivate(tokenFile, candidate + '\n');
      writePrivate(loginFile, owner + '\n');
      token = candidate;
      login = owner;
      return owner;
    },
    removeToken() {
      if (existsSync(tokenFile)) unlinkSync(tokenFile);
      token = null;
    },
    // The GitHub name, entered by hand where there is no token.
    setLogin(value) {
      const next = validLogin(value);
      if (!next) throw new Error('That is not a GitHub username.');
      mkdirSync(dir, { recursive: true, mode: 0o700 });
      writePrivate(loginFile, next + '\n');
      login = next;
      return next;
    },
  };
}
