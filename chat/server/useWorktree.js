// Giving a conversation its own git worktree: the checks, the creation and
// the saving, shared by the settings button (the `use_worktree` WebSocket
// message in server/index.js) and the `use_worktree` tool a colleague can
// call herself (adapters/claude.js). Replacing the running adapter is left
// to the caller: the button does it at once, the tool only after the turn.

import { existsSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, isAbsolute, join as joinPath, sep } from 'node:path';

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
export function activateWorktree({ store, workforceId, repoDir, repoPath, colleagueId, sessionId, busy = false }) {
  const existing = store.getWorktree(colleagueId, sessionId);
  if (existing) return { ok: true, created: false, branch: existing.branch, path: existing.path, repoPath: existing.repoPath };
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
  if (busy) return { ok: false, message: 'She is still answering. Try again once the reply is finished.' };
  const branch = chatBranchName(colleagueId, sessionId);
  const path = joinPath(worktreesDir(workforceId), worktreeFolderName(colleagueId, sessionId));
  try {
    createWorktree({ repoDir: source, worktreeDir: path, branch });
  } catch (err) {
    return { ok: false, message: `Could not create the worktree: ${(err.stderr || err.message).toString().trim()}` };
  }
  store.setWorktree(colleagueId, sessionId, path, branch, source);
  return { ok: true, created: true, branch, path, repoPath: source };
}
