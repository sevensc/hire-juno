import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { worktreeServer, worktreeToolResult } from '../chat/server/adapters/claude.js';
import { activateWorktree, canOfferWorktree } from '../chat/server/useWorktree.js';

// A repo, plus a HOME of its own so worktrees land in a temp folder, not in
// the real ~/.hire-juno.
function setup() {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'hire-juno-use-worktree-')));
  const repo = join(base, 'repo');
  execFileSync('git', ['-c', 'init.defaultBranch=main', 'init', '-q', repo]);
  writeFileSync(join(repo, 'a.txt'), 'a\n');
  execFileSync('git', ['add', '.'], { cwd: repo });
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-q', '-m', 'init'], {
    cwd: repo,
  });
  const home = join(base, 'home');
  const oldHome = process.env.HOME;
  process.env.HOME = home;
  const rows = new Map();
  const store = {
    getWorktree: (c, s) => rows.get(`${c}::${s}`) ?? null,
    setWorktree: (c, s, path, branch) => rows.set(`${c}::${s}`, { path, branch }),
  };
  const done = () => {
    process.env.HOME = oldHome;
    rmSync(base, { recursive: true, force: true });
  };
  return { base, repo, store, rows, done };
}

test('activateWorktree creates the worktree, saves it and reports it', () => {
  const { repo, store, rows, done } = setup();
  try {
    const result = activateWorktree({ store, workforceId: 'wf1', repoDir: repo, colleagueId: 'mila', sessionId: 's1' });
    assert.equal(result.ok, true);
    assert.equal(result.created, true);
    assert.match(result.branch, /^chat\/mila-s1$/);
    assert.ok(existsSync(join(result.path, 'a.txt')));
    assert.deepEqual(rows.get('mila::s1'), { path: result.path, branch: result.branch });
  } finally {
    done();
  }
});

test('activateWorktree returns the existing worktree without creating another', () => {
  const { repo, store, done } = setup();
  try {
    const args = { store, workforceId: 'wf1', repoDir: repo, colleagueId: 'mila', sessionId: 's1' };
    const first = activateWorktree(args);
    const again = activateWorktree({ ...args, busy: true });
    assert.deepEqual(again, { ok: true, created: false, branch: first.branch, path: first.path });
  } finally {
    done();
  }
});

test('activateWorktree says why it cannot', () => {
  const { base, repo, store, rows, done } = setup();
  try {
    const args = { store, workforceId: 'wf1', repoDir: repo, colleagueId: 'mila', sessionId: 's1' };
    assert.match(activateWorktree({ ...args, workforceId: undefined }).message, /workforce id/);
    const plain = join(base, 'plain');
    execFileSync('mkdir', [plain]);
    assert.match(activateWorktree({ ...args, repoDir: plain }).message, /not a git repository/);
    assert.match(activateWorktree({ ...args, busy: true }).message, /still answering/);
    assert.equal(rows.size, 0);
  } finally {
    done();
  }
});

test('the tool is offered only for a git repo with a workforce id and no worktree yet', () => {
  const { base, repo, done } = setup();
  try {
    assert.equal(canOfferWorktree({ workforceId: 'wf1', repoDir: repo, existing: null }), true);
    assert.equal(canOfferWorktree({ workforceId: undefined, repoDir: repo, existing: null }), false);
    assert.equal(canOfferWorktree({ workforceId: 'wf1', repoDir: repo, existing: { path: 'x', branch: 'y' } }), false);
    const plain = join(base, 'plain');
    execFileSync('mkdir', [plain]);
    assert.equal(canOfferWorktree({ workforceId: 'wf1', repoDir: plain, existing: null }), false);
  } finally {
    done();
  }
});

test('the tool result names path and branch, and says to work there by absolute path', () => {
  const created = worktreeToolResult({ ok: true, created: true, branch: 'chat/x-1', path: '/w/x-1' });
  assert.equal(created.isError, undefined);
  assert.match(created.content[0].text, /chat\/x-1/);
  assert.match(created.content[0].text, /\/w\/x-1 by absolute path/);
  assert.match(created.content[0].text, /next turn/);
  const existing = worktreeToolResult({ ok: true, created: false, branch: 'chat/x-1', path: '/w/x-1' });
  assert.match(existing.content[0].text, /already has a worktree/);
  const failed = worktreeToolResult({ ok: false, message: 'nope' });
  assert.equal(failed.isError, true);
  assert.equal(failed.content[0].text, 'nope');
});

test('worktreeServer is an in-process MCP server named juno', () => {
  const server = worktreeServer(() => ({ ok: false, message: 'x' }));
  assert.equal(server.type, 'sdk');
  assert.equal(server.name, 'juno');
});
