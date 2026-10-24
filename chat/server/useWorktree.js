// Giving a conversation its own git worktree: the checks, the creation and
// the saving, shared by the settings button (the `use_worktree` WebSocket
// message in server/index.js) and the `use_worktree` tool a colleague can
// call herself (adapters/claude.js). Replacing the running adapter is left
// to the caller: the button does it at once, the tool only after the turn.

import { join as joinPath } from 'node:path';

import { chatBranchName, createWorktree, gitRoot, worktreeFolderName, worktreesDir } from './worktree.js';

// Whether a conversation could get a worktree: a workforce id to keep it
// under, a git repo to branch from, and none yet. Decides if the tool is
// offered at all.
export function canOfferWorktree({ workforceId, repoDir, existing }) {
  return Boolean(workforceId) && !existing && Boolean(gitRoot(repoDir));
}

// Returns { ok: true, created, branch, path } (created is false when the
// conversation already had one) or { ok: false, message }.
// `busy`: the conversation's adapter is mid-turn; the button refuses then,
// the tool (which runs inside the turn) passes false.
export function activateWorktree({ store, workforceId, repoDir, colleagueId, sessionId, busy = false }) {
  const existing = store.getWorktree(colleagueId, sessionId);
  if (existing) return { ok: true, created: false, branch: existing.branch, path: existing.path };
  if (!workforceId) {
    return { ok: false, message: 'A worktree needs a workforce id to be stored under, and this workforce has none yet.' };
  }
  if (!gitRoot(repoDir)) return { ok: false, message: 'This folder is not a git repository.' };
  if (busy) return { ok: false, message: 'She is still answering. Try again once the reply is finished.' };
  const branch = chatBranchName(colleagueId, sessionId);
  const path = joinPath(worktreesDir(workforceId), worktreeFolderName(colleagueId, sessionId));
  try {
    createWorktree({ repoDir, worktreeDir: path, branch });
  } catch (err) {
    return { ok: false, message: `Could not create the worktree: ${(err.stderr || err.message).toString().trim()}` };
  }
  store.setWorktree(colleagueId, sessionId, path, branch);
  return { ok: true, created: true, branch, path };
}
