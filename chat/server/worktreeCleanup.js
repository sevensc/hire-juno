// Cleaning up a conversation's worktree when its work is done, by two
// fixed rules:
//   1. Its conversation is closed: removed if nothing would be lost (no
//      uncommitted changes, every commit on a remote branch); otherwise
//      the close waits for the person to confirm discarding it.
//   2. The pull request of its branch is merged or closed (and none is
//      open): removed if it has no uncommitted changes; with some, it
//      stays and is checked again next time.
// "Removed" means the worktree folder, its registration and its local
// branch; the repository (a clone or the person's own) stays.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

import { repoSlugOf } from './githubRepos.js';
import { discardWorktree, worktreeChanges } from './worktree.js';

// Removes one of a conversation's worktrees and forgets it.
export function removeConversationWorktree(store, worktree, colleagueId, sessionId) {
  if (worktree.repoPath && existsSync(worktree.repoPath)) discardWorktree(worktree.repoPath, worktree.path, worktree.branch);
  store.clearWorktree(colleagueId, sessionId, worktree.path);
}

// What closing a conversation does with its worktrees: { action: 'none' }
// (it has none), { action: 'removed', count }, or { action: 'confirm',
// dirty, unpushed, repos } when work would be lost in any of them (dirty:
// some have uncommitted changes, unpushed: commits not pushed in all,
// repos: the folders concerned); `discard` removes them anyway. All or
// none: the conversation is closed with all of them or not at all.
export function worktreeOnClose(store, colleagueId, sessionId, { discard = false } = {}) {
  const worktrees = store.getWorktrees(colleagueId, sessionId);
  if (!worktrees.length) return { action: 'none' };
  if (!discard) {
    let dirty = false;
    let unpushed = 0;
    const repos = [];
    for (const w of worktrees) {
      if (!existsSync(w.path)) continue;
      const changes = worktreeChanges(w.path, w.branch);
      if (changes.dirty || changes.unpushed) repos.push(w.path);
      dirty = dirty || changes.dirty;
      unpushed += changes.unpushed;
    }
    if (repos.length) return { action: 'confirm', dirty, unpushed, repos };
  }
  for (const w of worktrees) removeConversationWorktree(store, w, colleagueId, sessionId);
  return { action: 'removed', count: worktrees.length };
}

function originSlug(repoPath) {
  try {
    return repoSlugOf(execFileSync('git', ['-C', repoPath, 'remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }));
  } catch {
    return null;
  }
}

// Rule 2 for every worktree: asks GitHub about each branch's pull requests.
// `isBusy(colleagueId, sessionId)`: a turn is running there (left for the
// next check). `onRemoved({ colleagueId, sessionId, branch, pr })` after
// each removal. Returns the removals.
export async function cleanUpFinishedWorktrees({ store, repos, isBusy = () => false, onRemoved = () => {} }) {
  const removed = [];
  for (const w of store.listWorktrees()) {
    if (!w.repoPath || isBusy(w.colleagueId, w.sessionId)) continue;
    const slug = originSlug(w.repoPath);
    if (!slug) continue;
    let pulls;
    try {
      pulls = await repos.pullsOf(slug, w.branch);
    } catch {
      continue; // GitHub not reachable: next time
    }
    if (!pulls.length || pulls.some((p) => p.state === 'OPEN')) continue;
    if (existsSync(w.path) && worktreeChanges(w.path, w.branch).dirty) continue;
    const pr = pulls.find((p) => p.state === 'MERGED') || pulls[0];
    removeConversationWorktree(store, w, w.colleagueId, w.sessionId);
    const entry = { colleagueId: w.colleagueId, sessionId: w.sessionId, branch: w.branch, path: w.path, repo: slug, pr };
    removed.push(entry);
    onRemoved(entry);
  }
  return removed;
}
