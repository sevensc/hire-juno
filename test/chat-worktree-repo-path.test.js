import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import Database from 'better-sqlite3';

import { worktreeToolResult } from '../chat/server/adapters/claude.js';
import { createAdapter } from '../chat/server/agentAdapter.js';
import { openStore } from '../chat/server/store.js';
import { activateWorktree, checkRepoPath, worktreeIsStartRepo } from '../chat/server/useWorktree.js';

function initRepo(dir, file) {
  execFileSync('git', ['-c', 'init.defaultBranch=main', 'init', '-q', dir]);
  writeFileSync(join(dir, file), 'x\n');
  execFileSync('git', ['add', '.'], { cwd: dir });
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-q', '-m', 'init'], {
    cwd: dir,
  });
}

// A start folder repo, a second repo, a plain folder, and a HOME of its own.
function setup() {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'hire-juno-repo-path-')));
  const repo = join(base, 'repo');
  const other = join(base, 'other');
  const plain = join(base, 'plain');
  initRepo(repo, 'a.txt');
  initRepo(other, 'b.txt');
  mkdirSync(plain);
  const oldHome = process.env.HOME;
  process.env.HOME = join(base, 'home');
  const rows = new Map();
  const store = {
    getWorktree: (c, s) => rows.get(`${c}::${s}`) ?? null,
    setWorktree: (c, s, path, branch, repoPath = null) => rows.set(`${c}::${s}`, { path, branch, repoPath }),
  };
  const done = () => {
    process.env.HOME = oldHome;
    rmSync(base, { recursive: true, force: true });
  };
  return { base, repo, other, plain, store, rows, done };
}

test('checkRepoPath accepts the top folder of a repo, also through a symlink', () => {
  const { base, repo, done } = setup();
  try {
    assert.deepEqual(checkRepoPath(repo), { ok: true, repoDir: repo });
    symlinkSync(repo, join(base, 'link'));
    assert.deepEqual(checkRepoPath(join(base, 'link')), { ok: true, repoDir: repo });
  } finally {
    done();
  }
});

test('checkRepoPath rejects what cannot be a repo to branch from', () => {
  const { base, repo, plain, done } = setup();
  try {
    assert.match(checkRepoPath('relative/dir').message, /absolute/);
    assert.match(checkRepoPath(undefined).message, /absolute/);
    assert.match(checkRepoPath(join(base, 'nope')).message, /does not exist/);
    assert.match(checkRepoPath(join(repo, 'a.txt')).message, /not a folder/);
    assert.match(checkRepoPath(plain).message, /not a git repository/);
    mkdirSync(join(repo, 'sub'));
    assert.match(checkRepoPath(join(repo, 'sub')).message, /inside the git repository repo, not its top/);
    const home = join(base, 'home');
    const kb = join(home, '.ki-belegschaft');
    mkdirSync(kb, { recursive: true });
    initRepo(join(kb, 'x'), 'k.txt');
    assert.match(checkRepoPath(join(kb, 'x'), { home }).message, /colleagues' own folder/);
    assert.match(checkRepoPath(kb, { home }).message, /colleagues' own folder/);
    symlinkSync(join(kb, 'x'), join(base, 'sneaky'));
    assert.match(checkRepoPath(join(base, 'sneaky'), { home }).message, /colleagues' own folder/);
  } finally {
    done();
  }
});

test('activateWorktree with repoPath branches from that repo and saves it', () => {
  const { repo, other, store, rows, done } = setup();
  try {
    const result = activateWorktree({
      store, workforceId: 'wf1', repoDir: repo, repoPath: other, colleagueId: 'mila', sessionId: 's1',
    });
    assert.equal(result.ok, true);
    assert.equal(result.repoPath, other);
    assert.ok(existsSync(join(result.path, 'b.txt')));
    assert.equal(rows.get('mila::s1').repoPath, other);
    const listed = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd: other, encoding: 'utf8' });
    assert.ok(listed.includes(`worktree ${result.path}`));
    assert.equal(worktreeIsStartRepo(result.repoPath, repo), false);
  } finally {
    done();
  }
});

test('activateWorktree with a bad repoPath fails and saves nothing', () => {
  const { repo, plain, store, rows, done } = setup();
  try {
    const args = { store, workforceId: 'wf1', repoDir: repo, colleagueId: 'mila', sessionId: 's1' };
    assert.match(activateWorktree({ ...args, repoPath: '/etc' }).message, /not a git repository/);
    assert.match(activateWorktree({ ...args, repoPath: plain }).message, /not a git repository/);
    assert.match(activateWorktree({ ...args, repoPath: 'rel' }).message, /absolute/);
    assert.equal(rows.size, 0);
  } finally {
    done();
  }
});

test('with repoPath the workforce folder need not be a repo', () => {
  const { other, plain, store, done } = setup();
  try {
    const result = activateWorktree({
      store, workforceId: 'wf1', repoDir: plain, repoPath: other, colleagueId: 'mila', sessionId: 's1',
    });
    assert.equal(result.ok, true);
  } finally {
    done();
  }
});

test("a worktree is the working directory only for the workforce folder's own repo", () => {
  const { repo, other, done } = setup();
  try {
    assert.equal(worktreeIsStartRepo(repo, repo), true);
    mkdirSync(join(repo, 'sub'));
    assert.equal(worktreeIsStartRepo(repo, join(repo, 'sub')), true);
    assert.equal(worktreeIsStartRepo(null, repo), true); // saved before repo_path existed
    assert.equal(worktreeIsStartRepo(other, repo), false);
  } finally {
    done();
  }
});

test('the tool result says her working directory stays for another repo', () => {
  const text = worktreeToolResult({
    ok: true, created: true, branch: 'chat/x-1', path: '/w/x-1', cwdIsWorktree: false,
  }).content[0].text;
  assert.match(text, /stays where it is/);
  assert.match(text, /\/w\/x-1 by absolute path/);
  assert.doesNotMatch(text, /next turn/);
});

test('the system prompt names the worktree of another repo and keeps cwd', () => {
  const { repo, done } = setup();
  try {
    const colleague = { id: 'mila', name: 'Mila', adapter: ['claude'] };
    const adapter = createAdapter(colleague, {
      targetDir: repo, cwd: repo, worktree: { path: '/w/x-1', branch: 'chat/mila-s1' },
    });
    assert.equal(adapter.cwd, repo);
    assert.match(adapter.systemPrompt, /\/w\/x-1/);
  } finally {
    done();
  }
});

test('the store keeps repo_path with the worktree, null when none is given', () => {
  const store = openStore({});
  store.setWorktree('mila', 's1', '/w/a', 'chat/a', '/r/one');
  store.setWorktree('mila', 's2', '/w/b', 'chat/b');
  assert.deepEqual(store.getWorktree('mila', 's1'), { path: '/w/a', branch: 'chat/a', repoPath: '/r/one' });
  assert.equal(store.getWorktree('mila', 's2').repoPath, null);
  store.setWorktree('mila', 's1', '/w/c', 'chat/c', '/r/two'); // still one row per conversation
  assert.equal(store.getWorktree('mila', 's1').repoPath, '/r/two');
});

test('a database from before repo_path gets the column and keeps its rows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-old-db-'));
  try {
    mkdirSync(join(dir, 'acme', 'chat'), { recursive: true });
    const old = new Database(join(dir, 'acme', 'chat', 'chat.db'));
    old.exec(`CREATE TABLE conversation_worktrees (
      colleague_id TEXT NOT NULL, session_id TEXT NOT NULL DEFAULT 'default', path TEXT NOT NULL,
      branch TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (colleague_id, session_id))`);
    old.prepare('INSERT INTO conversation_worktrees (colleague_id, session_id, path, branch) VALUES (?, ?, ?, ?)').run(
      'mila', 's1', '/w/a', 'chat/a'
    );
    old.close();
    const store = openStore({ workforceId: 'acme', baseDir: dir });
    assert.deepEqual(store.getWorktree('mila', 's1'), { path: '/w/a', branch: 'chat/a', repoPath: null });
    store.setWorktree('mila', 's2', '/w/b', 'chat/b', '/r');
    assert.equal(store.getWorktree('mila', 's2').repoPath, '/r');
    store.close?.();
    openStore({ workforceId: 'acme', baseDir: dir }).close?.(); // reopening is fine
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
