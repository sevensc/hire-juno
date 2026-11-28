import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { createGithubRepos, parseRepoSlug, repoSlugOf } from '../chat/server/githubRepos.js';
import { openStore } from '../chat/server/store.js';
import { cleanUpFinishedWorktrees, worktreeOnClose } from '../chat/server/worktreeCleanup.js';
import { createWorktree, worktreeChanges } from '../chat/server/worktree.js';

const git = (dir, ...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

// A "remote" repo with one commit, and a clone of it whose origin points
// to a GitHub-looking URL (the bare remote stays reachable via pushurl).
function setup() {
  const root = mkdtempSync(join(tmpdir(), 'wt-clean-'));
  const remote = join(root, 'remote.git');
  const seed = join(root, 'seed');
  git(root, 'init', '-q', '--bare', '-b', 'main', remote);
  git(root, 'init', '-q', '-b', 'main', seed);
  git(seed, 'config', 'user.email', 't@example.org');
  git(seed, 'config', 'user.name', 'T');
  writeFileSync(join(seed, 'a.txt'), 'a\n');
  git(seed, 'add', '.');
  git(seed, 'commit', '-q', '-m', 'one');
  git(seed, 'push', '-q', remote, 'main');
  const clone = join(root, 'clone');
  git(root, 'clone', '-q', remote, clone);
  git(clone, 'config', 'user.email', 't@example.org');
  git(clone, 'config', 'user.name', 'T');
  return { root, remote, clone };
}

test('worktree changes: dirty and unpushed, as git sees them', () => {
  const { root, clone } = setup();
  try {
    const wt = join(root, 'wt');
    createWorktree({ repoDir: clone, worktreeDir: wt, branch: 'chat/kim-1', start: 'origin/main' });
    assert.deepEqual(worktreeChanges(wt, 'chat/kim-1'), { dirty: false, unpushed: 0 });
    writeFileSync(join(wt, 'b.txt'), 'b\n');
    assert.equal(worktreeChanges(wt, 'chat/kim-1').dirty, true);
    git(wt, 'add', '.');
    git(wt, 'commit', '-q', '-m', 'two');
    assert.deepEqual(worktreeChanges(wt, 'chat/kim-1'), { dirty: false, unpushed: 1 });
    git(wt, 'push', '-q', 'origin', 'chat/kim-1');
    assert.deepEqual(worktreeChanges(wt, 'chat/kim-1'), { dirty: false, unpushed: 0 });
    assert.equal(worktreeChanges(join(root, 'nowhere'), 'x').unreadable, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('closing a conversation removes its worktree, unless work would be lost and it was not confirmed', () => {
  const { root, clone } = setup();
  try {
    const store = openStore();
    const wt = join(root, 'wt');
    createWorktree({ repoDir: clone, worktreeDir: wt, branch: 'chat/kim-1', start: 'origin/main' });
    store.setWorktree('kim', 's1', wt, 'chat/kim-1', clone);
    writeFileSync(join(wt, 'b.txt'), 'b\n');
    assert.deepEqual(worktreeOnClose(store, 'kim', 's1'), { action: 'confirm', dirty: true, unpushed: 0, repos: [wt] });
    assert.ok(existsSync(wt), 'kept');
    assert.deepEqual(worktreeOnClose(store, 'kim', 's1', { discard: true }), { action: 'removed', count: 1 });
    assert.equal(existsSync(wt), false);
    assert.equal(store.getWorktree('kim', 's1'), null);
    assert.equal(git(clone, 'branch', '--list', 'chat/kim-1').trim(), '', 'branch deleted');
    assert.deepEqual(worktreeOnClose(store, 'kim', 's1'), { action: 'none' });
    // Nothing to lose: removed without asking.
    const wt2 = join(root, 'wt2');
    createWorktree({ repoDir: clone, worktreeDir: wt2, branch: 'chat/kim-2', start: 'origin/main' });
    store.setWorktree('kim', 's2', wt2, 'chat/kim-2', clone);
    assert.equal(worktreeOnClose(store, 'kim', 's2').action, 'removed');
    assert.equal(existsSync(wt2), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a worktree whose pull request is merged or closed is removed; open, none, dirty or busy ones stay', async () => {
  const { root, clone } = setup();
  try {
    git(clone, 'remote', 'set-url', 'origin', 'https://github.com/acme/web.git');
    const store = openStore();
    const make = (sid, branch) => {
      const path = join(root, sid);
      createWorktree({ repoDir: clone, worktreeDir: path, branch, start: 'origin/main' });
      store.setWorktree('kim', sid, path, branch, clone);
      return path;
    };
    const merged = make('a', 'chat/kim-a');
    const open = make('b', 'chat/kim-b');
    const none = make('c', 'chat/kim-c');
    const dirty = make('d', 'chat/kim-d');
    const busy = make('e', 'chat/kim-e');
    writeFileSync(join(dirty, 'x.txt'), 'x\n');
    const prs = { 'chat/kim-a': [{ number: 1, state: 'CLOSED' }, { number: 2, state: 'MERGED' }], 'chat/kim-b': [{ number: 3, state: 'OPEN' }], 'chat/kim-c': [], 'chat/kim-d': [{ number: 4, state: 'MERGED' }], 'chat/kim-e': [{ number: 5, state: 'CLOSED' }] };
    const asked = [];
    const repos = { pullsOf: async (slug, branch) => { asked.push(slug); return prs[branch]; } };
    const told = [];
    const removed = await cleanUpFinishedWorktrees({ store, repos, isBusy: (c, s) => s === 'e', onRemoved: (r) => told.push(r) });
    assert.deepEqual(removed.map((r) => [r.sessionId, r.pr.number]), [['a', 2]]);
    assert.equal(told.length, 1);
    assert.equal(existsSync(merged), false);
    assert.ok(existsSync(open) && existsSync(none) && existsSync(dirty) && existsSync(busy));
    assert.ok(asked.every((s) => s === 'acme/web'));
    assert.deepEqual(store.listWorktrees().map((w) => w.sessionId).sort(), ['b', 'c', 'd', 'e']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('GitHub repositories: slugs checked, list from gh repo list, one clone then fetch', async () => {
  assert.deepEqual(parseRepoSlug('acme/web.git'), { owner: 'acme', name: 'web', slug: 'acme/web' });
  assert.equal(parseRepoSlug('acme/../x'), null);
  assert.equal(parseRepoSlug('-x/y'), null);
  assert.equal(repoSlugOf('git@github.com:acme/web.git'), 'acme/web');
  const calls = [];
  const run = (cmd, args, opts, done) => {
    calls.push([cmd, ...args].join(' '));
    if (args[0] === 'repo' && args[1] === 'list') return done(null, JSON.stringify([{ nameWithOwner: 'acme/old', isPrivate: false, pushedAt: '2026-01-01' }, { nameWithOwner: 'acme/new', isPrivate: true, description: 'New', defaultBranchRef: { name: 'main' }, pushedAt: '2026-02-01' }]));
    if (args.includes('symbolic-ref')) return done(null, 'origin/main\n');
    return done(null, '');
  };
  const repos = createGithubRepos({ run });
  assert.deepEqual((await repos.list('acme')).map((r) => [r.slug, r.private]), [['acme/new', true], ['acme/old', false]]);
  const base = mkdtempSync(join(tmpdir(), 'repos-'));
  try {
    const first = await repos.ensureClone('wf', parseRepoSlug('acme/new'), base);
    assert.equal(first.start, 'origin/main');
    assert.ok(calls.some((c) => c.startsWith('gh repo clone acme/new ')));
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('file tools are free inside the conversation\'s worktrees only', async () => {
  const { worktreeToolAllowed } = await import('../chat/server/useWorktree.js');
  const { mkdirSync, symlinkSync } = await import('node:fs');
  const root = mkdtempSync(join(tmpdir(), 'wt-free-'));
  try {
    const a = join(root, 'a');
    const b = join(root, 'b');
    const outside = join(root, 'outside');
    for (const d of [a, b, outside]) mkdirSync(d);
    symlinkSync(outside, join(a, 'escape'));
    const trees = [a, b];
    assert.equal(worktreeToolAllowed(trees, 'Edit', { file_path: join(a, 'x.js') }), true);
    assert.equal(worktreeToolAllowed(trees, 'Write', { file_path: join(b, 'new', 'deep', 'y.js') }), true, 'not yet existing');
    assert.equal(worktreeToolAllowed(trees, 'Grep', { path: b }), true);
    assert.equal(worktreeToolAllowed(trees, 'Edit', { file_path: join(outside, 'x.js') }), false);
    assert.equal(worktreeToolAllowed(trees, 'Edit', { file_path: join(a, 'escape', 'x.js') }), false, 'symlink out');
    assert.equal(worktreeToolAllowed(trees, 'Edit', { file_path: join(a, '..', 'outside', 'x.js') }), false);
    assert.equal(worktreeToolAllowed(trees, 'Edit', { file_path: 'relative/x.js' }), false);
    assert.equal(worktreeToolAllowed(trees, 'Bash', { command: `rm -rf ${a}` }), false, 'shell commands are not covered');
    assert.equal(worktreeToolAllowed([], 'Edit', { file_path: join(a, 'x.js') }), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('several worktrees in one conversation: closing checks all, discarding removes all', () => {
  const one = setup();
  const two = setup();
  try {
    const store = openStore();
    const w1 = join(one.root, 'w1');
    const w2 = join(two.root, 'w2');
    createWorktree({ repoDir: one.clone, worktreeDir: w1, branch: 'chat/kim-1', start: 'origin/main' });
    createWorktree({ repoDir: two.clone, worktreeDir: w2, branch: 'chat/kim-1', start: 'origin/main' });
    store.setWorktree('kim', 's1', w1, 'chat/kim-1', one.clone);
    store.setWorktree('kim', 's1', w2, 'chat/kim-1', two.clone);
    assert.equal(store.getWorktrees('kim', 's1').length, 2);
    writeFileSync(join(w2, 'b.txt'), 'b\n');
    assert.deepEqual(worktreeOnClose(store, 'kim', 's1'), { action: 'confirm', dirty: true, unpushed: 0, repos: [w2] });
    assert.ok(existsSync(w1) && existsSync(w2), 'both kept');
    assert.deepEqual(worktreeOnClose(store, 'kim', 's1', { discard: true }), { action: 'removed', count: 2 });
    assert.ok(!existsSync(w1) && !existsSync(w2));
    assert.deepEqual(store.getWorktrees('kim', 's1'), []);
  } finally {
    rmSync(one.root, { recursive: true, force: true });
    rmSync(two.root, { recursive: true, force: true });
  }
});

test('a database with one worktree per conversation is rebuilt for several, rows kept', async () => {
  const { default: Database } = await import('better-sqlite3');
  const { mkdirSync } = await import('node:fs');
  const dir = mkdtempSync(join(tmpdir(), 'wt-old-db-'));
  try {
    mkdirSync(join(dir, 'acme', 'chat'), { recursive: true });
    const old = new Database(join(dir, 'acme', 'chat', 'chat.db'));
    old.exec(`CREATE TABLE conversation_worktrees (
      colleague_id TEXT NOT NULL, session_id TEXT NOT NULL DEFAULT 'default', path TEXT NOT NULL, branch TEXT NOT NULL,
      repo_path TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), PRIMARY KEY (colleague_id, session_id))`);
    old.prepare('INSERT INTO conversation_worktrees (colleague_id, session_id, path, branch, repo_path) VALUES (?, ?, ?, ?, ?)').run('kim', 's1', '/w/a', 'chat/a', '/r/one');
    old.close();
    const store = openStore({ workforceId: 'acme', baseDir: dir });
    assert.deepEqual(store.getWorktrees('kim', 's1'), [{ path: '/w/a', branch: 'chat/a', repoPath: '/r/one' }]);
    store.setWorktree('kim', 's1', '/w/b', 'chat/a', '/r/two');
    assert.equal(store.getWorktrees('kim', 's1').length, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('conversation mode: local by default, remote stored; remote without repositories locks writing and running', async () => {
  const { createAdapter, REMOTE_LOCKED_TOOLS } = await import('../chat/server/agentAdapter.js');
  const store = openStore();
  assert.equal(store.getConversationMode('kim', 's1'), 'local');
  store.setConversationMode('kim', 's1', 'remote');
  assert.equal(store.getConversationMode('kim', 's1'), 'remote');
  store.setConversationMode('kim', 's1', 'nonsense');
  assert.equal(store.getConversationMode('kim', 's1'), 'local');
  assert.deepEqual(REMOTE_LOCKED_TOOLS.filter((t) => ['Write', 'Edit', 'Bash'].includes(t)), ['Write', 'Edit', 'Bash']);
  assert.ok(!REMOTE_LOCKED_TOOLS.includes('Read'));
  const dir = mkdtempSync(join(tmpdir(), 'mode-'));
  try {
    const colleague = { id: 'kim', name: 'Kim', adapter: ['claude'] };
    const locked = createAdapter(colleague, { targetDir: dir, remoteLocked: true });
    assert.match(locked.systemPrompt, /none are picked for it yet/);
    locked.close?.();
    const free = createAdapter(colleague, { targetDir: dir });
    assert.doesNotMatch(free.systemPrompt, /none are picked/);
    free.close?.();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
