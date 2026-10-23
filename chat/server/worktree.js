// Thin wrappers around the git commands the chat needs to give a
// conversation its own worktree and branch: find out whether a folder is
// a git repo and which branch it is on, create a worktree on a new branch,
// list and remove worktrees. Nothing here is wired into the server yet;
// every function takes the folder it should act on, runs `git` with an
// argument list (no shell) and never touches anything outside the repo's
// own `.git` and the worktree folder it is given.
//
// Flags used (`git worktree add -h`, `git worktree remove -h`,
// `git worktree list -h`, git 2.50): `add -b <new-branch> <path> [<commit-ish>]`,
// `remove [-f] <worktree>`, `list --porcelain`.

import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

function git(dir, args) {
  return execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

// The top-level folder of the repo `dir` belongs to, or null when it is
// not inside one (or `git` is missing).
export function gitRoot(dir) {
  try {
    return git(dir, ['rev-parse', '--show-toplevel']).trim() || null;
  } catch {
    return null;
  }
}

// The branch checked out in `dir`, or null for a detached HEAD or when
// `dir` is not a repo.
export function currentBranch(dir) {
  try {
    const branch = git(dir, ['symbolic-ref', '--short', '-q', 'HEAD']).trim();
    return branch || null;
  } catch {
    return null;
  }
}

// Where a workforce's conversation worktrees live: next to its chat
// history under ~/.hire-juno/<workforce-id>/, outside the repo, so they
// never show up in the repo's own status.
export function worktreesDir(workforceId, baseDir = join(homedir(), '.hire-juno')) {
  return join(baseDir, workforceId, 'worktrees');
}

// The folder name of one conversation's worktree inside worktreesDir().
export function worktreeFolderName(colleagueId, conversationId) {
  return chatBranchName(colleagueId, conversationId).slice('chat/'.length);
}

// A branch name for a conversation: `chat/<colleague>-<id>`, with anything
// outside letters, digits and dashes in the parts replaced by a dash, so
// the result is always a valid ref name.
export function chatBranchName(colleagueId, conversationId) {
  const part = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
  return `chat/${part(colleagueId)}-${part(conversationId).slice(0, 12)}`;
}

// Creates `branch` from the current HEAD of `repoDir` and checks it out in
// a new worktree at `worktreeDir` (which must not exist yet). Throws with
// git's own message when that fails, e.g. the branch already exists.
export function createWorktree({ repoDir, worktreeDir, branch }) {
  git(repoDir, ['worktree', 'add', '-b', branch, worktreeDir, 'HEAD']);
  return { path: worktreeDir, branch };
}

// Every worktree of the repo as { path, branch|null, head }; the first one
// is the main working tree.
export function listWorktrees(repoDir) {
  const out = git(repoDir, ['worktree', 'list', '--porcelain']);
  return out
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const entry = { path: null, branch: null, head: null };
      for (const line of block.split('\n')) {
        if (line.startsWith('worktree ')) entry.path = line.slice('worktree '.length);
        else if (line.startsWith('HEAD ')) entry.head = line.slice('HEAD '.length);
        else if (line.startsWith('branch ')) entry.branch = line.slice('branch '.length).replace(/^refs\/heads\//, '');
      }
      return entry;
    });
}

// Removes the worktree folder and its registration. Uncommitted changes in
// it are discarded (`--force`), so callers decide when that is acceptable.
// The branch stays, with whatever was committed on it.
export function removeWorktree(repoDir, worktreeDir) {
  git(repoDir, ['worktree', 'remove', '--force', worktreeDir]);
}
