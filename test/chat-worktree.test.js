import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  chatBranchName,
  createWorktree,
  currentBranch,
  gitRoot,
  listWorktrees,
  removeWorktree,
  resolveGitDir,
  worktreeFolderName,
  worktreesDir,
} from '../chat/server/worktree.js';

function makeRepo() {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'hire-juno-worktree-')));
  const repo = join(base, 'repo');
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', ...args], { cwd: repo });
  execFileSync('git', ['-c', 'init.defaultBranch=main', 'init', '-q', repo]);
  writeFileSync(join(repo, 'a.txt'), 'a\n');
  git('add', '.');
  git('commit', '-q', '-m', 'init');
  return { base, repo, git };
}

test('gitRoot and currentBranch describe a repo, and say null outside one', () => {
  const { base, repo } = makeRepo();
  try {
    assert.equal(gitRoot(repo), repo);
    assert.equal(currentBranch(repo), 'main');
    const plain = join(base, 'plain');
    execFileSync('mkdir', [plain]);
    assert.equal(gitRoot(plain), null);
    assert.equal(currentBranch(plain), null);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('a detached HEAD has no branch', () => {
  const { base, repo, git } = makeRepo();
  try {
    git('checkout', '-q', '--detach');
    assert.equal(currentBranch(repo), null);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('createWorktree gives a folder on a new branch, apart from the main one', () => {
  const { base, repo } = makeRepo();
  try {
    const dir = join(base, 'wt1');
    const made = createWorktree({ repoDir: repo, worktreeDir: dir, branch: 'chat/nora-1' });
    assert.deepEqual(made, { path: dir, branch: 'chat/nora-1' });
    assert.equal(currentBranch(dir), 'chat/nora-1');
    assert.equal(currentBranch(repo), 'main');
    assert.equal(existsSync(join(dir, 'a.txt')), true);
    assert.deepEqual(
      listWorktrees(repo).map((w) => [w.path, w.branch]),
      [[repo, 'main'], [dir, 'chat/nora-1']]
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('createWorktree fails with git\'s message when the branch already exists', () => {
  const { base, repo } = makeRepo();
  try {
    createWorktree({ repoDir: repo, worktreeDir: join(base, 'wt1'), branch: 'chat/x' });
    assert.throws(() => createWorktree({ repoDir: repo, worktreeDir: join(base, 'wt2'), branch: 'chat/x' }), /chat\/x/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('removeWorktree deletes the folder, even with changes, and keeps the branch', () => {
  const { base, repo } = makeRepo();
  try {
    const dir = join(base, 'wt1');
    createWorktree({ repoDir: repo, worktreeDir: dir, branch: 'chat/x' });
    writeFileSync(join(dir, 'new.txt'), 'x');
    removeWorktree(repo, dir);
    assert.equal(existsSync(dir), false);
    assert.deepEqual(listWorktrees(repo).map((w) => w.path), [repo]);
    assert.match(execFileSync('git', ['branch', '--list', 'chat/x'], { cwd: repo, encoding: 'utf8' }), /chat\/x/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('chatBranchName always yields a plain ref name', () => {
  assert.equal(chatBranchName('Nora', 'a1b2c3d4-e5f6-7890'), 'chat/nora-a1b2c3d4-e5f');
  assert.equal(chatBranchName('mila ü/..', '  '), 'chat/mila-x');
});

test('worktreesDir and worktreeFolderName place a conversation next to the chat history', () => {
  assert.equal(worktreesDir('acme', '/base'), '/base/acme/worktrees');
  assert.equal(worktreeFolderName('Nora', 'a1b2c3d4-e5f6-7890'), 'nora-a1b2c3d4-e5f');
});

test('the store remembers which worktree a conversation works in', async () => {
  const { openStore } = await import('../chat/server/store.js');
  const store = openStore({});
  assert.equal(store.getWorktree('nora', 'default'), null);
  store.setWorktree('nora', 'default', '/w/nora', 'chat/nora-default');
  assert.deepEqual(store.getWorktree('nora', 'default'), { path: '/w/nora', branch: 'chat/nora-default' });
  assert.equal(store.getWorktree('nora', 's2'), null);
  assert.equal(store.getWorktree('juno', 'default'), null);
});

test('resolveGitDir reads the conversation worktree, else the workforce folder', () => {
  const { base, repo } = makeRepo();
  try {
    const dir = join(base, 'wt');
    createWorktree({ repoDir: repo, worktreeDir: dir, branch: 'chat/y' });
    // no worktree for this conversation (channels, subagent threads, not opted in)
    assert.deepEqual(resolveGitDir(repo, null), { dir: repo, isWorktree: false });
    assert.deepEqual(resolveGitDir(repo, undefined), { dir: repo, isWorktree: false });
    // worktree present
    assert.deepEqual(resolveGitDir(repo, { path: dir, branch: 'chat/y' }), { dir, isWorktree: true });
    // worktree recorded but its folder is gone
    removeWorktree(repo, dir);
    assert.deepEqual(resolveGitDir(repo, { path: dir, branch: 'chat/y' }), { dir: repo, isWorktree: false });
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
