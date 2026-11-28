// A GitHub repository as the base of a conversation's worktree: the list
// to pick from, and one local clone per repository that every worktree of
// it branches from. The clones live next to the workforce's worktrees
// (~/.hire-juno/<workforce>/repos/<owner>/<repo>), outside every repo, and
// stay when a worktree is cleaned up, so the next one only has to fetch.
// Everything runs through the GitHub CLI and git with argument lists (no
// shell), asynchronously, since a first clone can take a while.

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NAME = /^[A-Za-z0-9._-]{1,100}$/;

// "owner/name" checked, as { owner, name, slug }, or null.
export function parseRepoSlug(value) {
  const m = String(value || '').trim().match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!m || !OWNER.test(m[1]) || !NAME.test(m[2]) || m[2] === '.' || m[2] === '..') return null;
  return { owner: m[1], name: m[2].replace(/\.git$/, ''), slug: `${m[1]}/${m[2].replace(/\.git$/, '')}` };
}

// "owner/name" of a GitHub remote URL, or null.
export function repoSlugOf(remoteUrl) {
  const m = String(remoteUrl || '').trim().match(/github\.com[:/]([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/);
  return m ? parseRepoSlug(`${m[1]}/${m[2]}`)?.slug || null : null;
}

export function reposDir(workforceId, baseDir = join(homedir(), '.hire-juno')) {
  return join(baseDir, workforceId, 'repos');
}

export function clonePath(workforceId, repo, baseDir) {
  return join(reposDir(workforceId, baseDir), repo.owner, repo.name);
}

function runAsync(run, cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    run(cmd, args, { timeout: 10 * 60 * 1000, maxBuffer: 16 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        return reject(err);
      }
      resolve(String(stdout || ''));
    });
  });
}

// `run`: execFile, replaceable in tests; `env()`: the environment for gh.
export function createGithubRepos({ run = execFile, env = () => undefined, now = () => Date.now() } = {}) {
  const lists = new Map(); // owner -> { at, value }
  const cloning = new Map(); // clone path -> Promise (one clone or fetch at a time)

  return {
    // The repositories of an account, recently pushed first:
    // [{ slug, description, private, defaultBranch }]. Cached five minutes.
    async list(owner) {
      if (!OWNER.test(owner || '')) return [];
      const hit = lists.get(owner);
      if (hit && now() - hit.at < 5 * 60 * 1000) return hit.value;
      const out = await runAsync(run, 'gh', ['repo', 'list', owner, '--limit', '200', '--no-archived', '--json', 'nameWithOwner,description,isPrivate,defaultBranchRef,pushedAt'], { env: env(), timeout: 30000 });
      const value = JSON.parse(out || '[]')
        .map((r) => ({ slug: r.nameWithOwner, description: String(r.description || '').slice(0, 160), private: Boolean(r.isPrivate), defaultBranch: r.defaultBranchRef?.name || null, pushedAt: r.pushedAt || '' }))
        .filter((r) => parseRepoSlug(r.slug))
        .sort((a, b) => String(b.pushedAt).localeCompare(String(a.pushedAt)));
      lists.set(owner, { at: now(), value });
      return value;
    },

    // Makes sure the clone exists and is current: cloned the first time,
    // fetched after that. Returns { dir, start } where `start` is the
    // remote's default branch to branch from (e.g. "origin/main").
    async ensureClone(workforceId, repo, baseDir) {
      const dir = clonePath(workforceId, repo, baseDir);
      if (!cloning.has(dir)) {
        cloning.set(dir, (async () => {
          if (!existsSync(join(dir, '.git'))) {
            mkdirSync(dirname(dir), { recursive: true, mode: 0o700 });
            await runAsync(run, 'gh', ['repo', 'clone', repo.slug, dir, '--', '--quiet'], { env: env() });
          } else {
            await runAsync(run, 'git', ['-C', dir, 'fetch', '--quiet', '--prune', 'origin'], { env: env() });
          }
          // The remote's default branch, as the clone knows it.
          let head = '';
          try {
            head = (await runAsync(run, 'git', ['-C', dir, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])).trim();
          } catch {
            await runAsync(run, 'git', ['-C', dir, 'remote', 'set-head', 'origin', '--auto']);
            head = (await runAsync(run, 'git', ['-C', dir, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])).trim();
          }
          return { dir, start: head || 'origin/main' };
        })().finally(() => cloning.delete(dir)));
      }
      return cloning.get(dir);
    },

    // The pull requests ever opened from `branch` in `slug`:
    // [{ number, state: 'OPEN' | 'MERGED' | 'CLOSED' }].
    async pullsOf(slug, branch) {
      const out = await runAsync(run, 'gh', ['pr', 'list', '--repo', slug, '--head', branch, '--state', 'all', '--json', 'number,state'], { env: env(), timeout: 30000 });
      return JSON.parse(out || '[]');
    },
  };
}
