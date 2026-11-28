// Giving a conversation its own git worktree: the checks, the creation and
// the saving, shared by the settings button (the `use_worktree` WebSocket
// message in server/index.js) and the `use_worktree` tool a colleague can
// call herself (adapters/claude.js). Replacing the running adapter is left
// to the caller: the button does it at once, the tool only after the turn.

import { existsSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, isAbsolute, join as joinPath, sep } from 'node:path';

import { parseRepoSlug } from './githubRepos.js';
import { chatBranchName, createWorktree, gitRoot, worktreeFolderName, worktreesDir } from './worktree.js';

// Whether a conversation could get a worktree: a workforce id to keep it
// under, and none yet. The repo is not checked here: it may be the
// workforce folder or one the person names (`repoPath`). Decides if the
// tool is offered at all.
export function canOfferWorktree({ workforceId, existing }) {
  return Boolean(workforceId) && !existing;
}

function real(path) {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
}

// Checks a repo path given for a worktree: absolute, an existing folder,
// the top of a git repo (not a subfolder of one, not outside any), and not
// inside the colleagues' own folder. Returns { ok: true, repoDir } (the
// resolved repo root) or { ok: false, message }.
export function checkRepoPath(repoPath, { home = homedir() } = {}) {
  if (typeof repoPath !== 'string' || !isAbsolute(repoPath)) {
    return { ok: false, message: 'The repo path must be an absolute path.' };
  }
  const resolved = real(repoPath);
  if (!resolved || !existsSync(resolved)) return { ok: false, message: 'That path does not exist.' };
  if (!statSync(resolved).isDirectory()) return { ok: false, message: 'That path is not a folder.' };
  const forbidden = real(joinPath(home, '.ki-belegschaft')) ?? joinPath(home, '.ki-belegschaft');
  if (resolved === forbidden || resolved.startsWith(forbidden + sep)) {
    return { ok: false, message: "That path is inside the colleagues' own folder and cannot get a worktree." };
  }
  const root = gitRoot(resolved);
  if (!root) return { ok: false, message: 'That folder is not a git repository.' };
  if (real(root) !== resolved) {
    return { ok: false, message: `That folder is inside the git repository ${basename(root)}, not its top. Give the repo's top folder.` };
  }
  return { ok: true, repoDir: resolved };
}

// Whether a worktree for `repoDir` (a repo root) becomes the colleague's
// working directory: only when it is the workforce folder's own repo. For
// another repo her cwd stays the workforce folder (her agents and project
// settings are read from there) and she is told the worktree path instead.
export function worktreeIsStartRepo(repoPath, startDir) {
  if (!repoPath) return true; // saved before repo_path existed: it was the start folder's
  const start = gitRoot(startDir);
  return Boolean(start) && real(start) === real(repoPath);
}

// Returns { ok: true, created, branch, path, repoPath } (created is false when
// the conversation already had one) or { ok: false, message }.
// `repoDir` is the workforce folder; `repoPath` (optional) names another
// repo's top folder to branch from instead.
// `busy`: the conversation's adapter is mid-turn; the button refuses then,
// the tool (which runs inside the turn) passes false.
// A conversation's worktree of one repository, if it has one.
function worktreeOfRepo(store, colleagueId, sessionId, repoDir) {
  const want = real(repoDir) || repoDir;
  return store.getWorktrees(colleagueId, sessionId).find((w) => (real(w.repoPath || '') || w.repoPath) === want) || null;
}

// Where a conversation's worktree of a repository goes: the first one keeps
// the folder name it always had; each further one gets the repository's
// name appended, so several sit side by side.
function worktreePathFor(store, workforceId, colleagueId, sessionId, repoLabel) {
  const base = joinPath(worktreesDir(workforceId), worktreeFolderName(colleagueId, sessionId));
  if (!store.getWorktrees(colleagueId, sessionId).length) return base;
  return `${base}--${String(repoLabel).toLowerCase().replace(/[^a-z0-9._-]+/g, '-')}`;
}

export function activateWorktree({ store, workforceId, repoDir, repoPath, colleagueId, sessionId, busy = false }) {
  if (!workforceId) {
    return { ok: false, message: 'A worktree needs a workforce id to be stored under, and this workforce has none yet.' };
  }
  let source;
  if (repoPath) {
    const checked = checkRepoPath(repoPath);
    if (!checked.ok) return checked;
    source = checked.repoDir;
  } else {
    source = gitRoot(repoDir);
    if (!source) {
      return { ok: false, message: 'The workforce folder is not a git repository. Give the path of the repo to work in.' };
    }
  }
  const existing = worktreeOfRepo(store, colleagueId, sessionId, source);
  if (existing) return { ok: true, created: false, branch: existing.branch, path: existing.path, repoPath: existing.repoPath };
  if (busy) return { ok: false, message: 'She is still answering. Try again once the reply is finished.' };
  const branch = chatBranchName(colleagueId, sessionId);
  const path = worktreePathFor(store, workforceId, colleagueId, sessionId, basename(source));
  try {
    createWorktree({ repoDir: source, worktreeDir: path, branch });
  } catch (err) {
    return { ok: false, message: `Could not create the worktree: ${(err.stderr || err.message).toString().trim()}` };
  }
  store.setWorktree(colleagueId, sessionId, path, branch, source);
  return { ok: true, created: true, branch, path, repoPath: source };
}

// Like activateWorktree, with a GitHub repository ("owner/name") as the
// base: its local clone is made or fetched first (githubRepos.ensureClone),
// and the new branch starts from the remote's default branch, so the work
// begins on the current state of GitHub. Async: a first clone takes a while.
// `onProgress(message)` says what is happening.
export async function activateGithubWorktree({ store, repos, workforceId, githubRepo, colleagueId, sessionId, busy = false, onProgress = () => {} }) {
  if (!workforceId) return { ok: false, message: 'A worktree needs a workforce id to be stored under, and this workforce has none yet.' };
  const repo = parseRepoSlug(githubRepo);
  if (!repo) return { ok: false, message: 'That is not a GitHub repository (owner/name).' };
  if (busy) return { ok: false, message: 'She is still answering. Try again once the reply is finished.' };
  let clone;
  try {
    onProgress(`Getting ${repo.slug} from GitHub…`);
    clone = await repos.ensureClone(workforceId, repo);
  } catch (err) {
    return { ok: false, message: `Could not get ${repo.slug}: ${String(err.stderr || err.message).trim().split('\n').pop()}` };
  }
  // Already one of this repository (perhaps made while the clone was fetched).
  const existing = worktreeOfRepo(store, colleagueId, sessionId, clone.dir);
  if (existing) return { ok: true, created: false, branch: existing.branch, path: existing.path, repoPath: existing.repoPath };
  const branch = chatBranchName(colleagueId, sessionId);
  const path = worktreePathFor(store, workforceId, colleagueId, sessionId, `${repo.owner}-${repo.name}`);
  try {
    createWorktree({ repoDir: clone.dir, worktreeDir: path, branch, start: clone.start });
  } catch (err) {
    return { ok: false, message: `Could not create the worktree: ${(err.stderr || err.message).toString().trim()}` };
  }
  store.setWorktree(colleagueId, sessionId, path, branch, clone.dir);
  return { ok: true, created: true, branch, path, repoPath: clone.dir, base: clone.start };
}

// Free work in a conversation's own worktrees: a file tool (read, write,
// edit, search) whose path lies inside one of them needs no question; the
// worktrees are local copies on their own branches, and nothing reaches a
// remote without a push. The path must be absolute and stays inside after
// symlinks are resolved. Shell commands are not covered: what they touch
// cannot be read from them reliably, so they keep the usual permissions.
const FILE_TOOLS = new Set(['Read', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'Glob', 'Grep', 'LS']);

function realOrParent(path) {
  let current = path;
  for (let i = 0; i < 64; i++) {
    const r = real(current);
    if (r) return current === path ? r : joinPath(r, path.slice(current.length));
    const parent = joinPath(current, '..');
    if (parent === current) return null;
    current = parent;
  }
  return null;
}

export function worktreeToolAllowed(worktreePaths, toolName, input) {
  if (!FILE_TOOLS.has(toolName) || !worktreePaths?.length) return false;
  const target = input?.file_path ?? input?.notebook_path ?? input?.path;
  if (typeof target !== 'string' || !isAbsolute(target)) return false;
  const resolved = realOrParent(target);
  if (!resolved) return false;
  return worktreePaths.some((p) => {
    const root = real(p);
    return Boolean(root) && (resolved === root || resolved.startsWith(root + sep));
  });
}
