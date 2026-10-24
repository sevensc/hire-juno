import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { ClaudeAdapter } from '../chat/server/adapters/claude.js';
import { SubagentTracker } from '../chat/server/adapters/subagents.js';
import { openStore } from '../chat/server/store.js';

function withDir(fn) {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-subs-'));
  try {
    return fn(baseDir);
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
}

function startThread(store, id = 'toolu_1', ownerId = 'sam', sessionId = 'default') {
  const created = store.createSubagentThread({ id, ownerId, sessionId, subagentType: 'general-purpose', description: 'Look it up' });
  if (created) store.appendMessage(`sub:${id}`, sessionId, 'you', 'The brief');
  return created;
}

test('a sub-agent window is stored with brief, trail and report, and survives reopening', () => {
  withDir((baseDir) => {
    const store = openStore({ workforceId: 'acme', baseDir });
    assert.equal(startThread(store), true);
    assert.deepEqual(store.listSubagentThreads().map((t) => t.status), ['running']);
    store.appendMessage('sub:toolu_1', 'default', 'colleague', 'The report', [{ kind: 'tool_use', name: 'Read', input: { file_path: 'a' } }]);
    store.finishSubagentThread('toolu_1');
    store.close();

    const reopened = openStore({ workforceId: 'acme', baseDir });
    const [thread] = reopened.listSubagentThreads();
    assert.equal(thread.id, 'toolu_1');
    assert.equal(thread.ownerId, 'sam');
    assert.equal(thread.sessionId, 'default');
    assert.equal(thread.subagentType, 'general-purpose');
    assert.equal(thread.description, 'Look it up');
    assert.equal(thread.status, 'done');
    // the client asks with whatever session it has; a window has none of its own
    for (const sessionId of ['default', undefined, 'whatever']) {
      const rows = reopened.getHistory('sub:toolu_1', sessionId);
      assert.deepEqual(rows.map((r) => [r.role, r.text]), [['you', 'The brief'], ['colleague', 'The report']]);
      assert.deepEqual(rows[1].trail, [{ kind: 'tool_use', name: 'Read', input: { file_path: 'a' } }]);
    }
    reopened.close();
  });
});

test('a repeated start does not store the brief twice', () => {
  const store = openStore({});
  assert.equal(startThread(store), true);
  assert.equal(startThread(store), false);
  assert.equal(store.getHistory('sub:toolu_1').length, 1);
});

test('sub-agent messages stay out of the main-thread preview and the search', () => {
  const store = openStore({});
  startThread(store);
  assert.equal(store.getLastMessages().size, 0);
  assert.deepEqual(store.searchMessages('brief'), []);
});

test('deleting a window removes its row and its messages, and nothing else', () => {
  const store = openStore({});
  startThread(store, 'a');
  startThread(store, 'b');
  store.appendMessage('sam', 'default', 'you', 'hello');
  store.deleteSubagentThread('a');
  assert.deepEqual(store.listSubagentThreads().map((t) => t.id), ['b']);
  assert.deepEqual(store.getHistory('sub:a'), []);
  assert.equal(store.getHistory('sub:b').length, 1);
  assert.equal(store.getHistory('sam').length, 1);
});

test('the windows of one conversation go with its reset or cleared chat', () => {
  const store = openStore({});
  startThread(store, 'a', 'sam', 'default');
  startThread(store, 'b', 'sam', 's2');
  startThread(store, 'c', 'ada', 'default');
  assert.deepEqual(store.deleteSubagentThreadsOf('sam', 'default'), ['a']);
  assert.deepEqual(store.listSubagentThreads().map((t) => t.id).sort(), ['b', 'c']);
  assert.deepEqual(store.getHistory('sub:a'), []);
  assert.deepEqual(store.deleteSubagentThreadsOf('sam', undefined), []);
});

test('a database from before the table existed opens and gets it', () => {
  withDir((baseDir) => {
    const store = openStore({ workforceId: 'old', baseDir });
    store.appendMessage('sam', 'default', 'you', 'kept');
    store.close();
    const reopened = openStore({ workforceId: 'old', baseDir });
    assert.deepEqual(reopened.listSubagentThreads(), []);
    assert.equal(reopened.getHistory('sam').length, 1);
    reopened.close();
  });
});

test('the adapter passes a sub-agent text block on as subagent_message, between its tool lines', () => {
  const adapter = Object.create(ClaudeAdapter.prototype);
  adapter._openSubagents = new Set();
  adapter._subagents = new SubagentTracker();
  const updates = [];
  adapter.onUpdate = (u) => updates.push(u);
  const assistant = (content) => ({ type: 'assistant', parent_tool_use_id: 't1', message: { content } });
  adapter._handleMessage(assistant([
    { type: 'text', text: 'Looking at it.' },
    { type: 'text', text: '   ' },
    { type: 'tool_use', name: 'Read', input: { file_path: 'a' } },
  ]));
  adapter._handleMessage(assistant([{ type: 'text', text: 'Found it.' }]));
  assert.deepEqual(updates.map((u) => [u.type, u.text ?? u.name]), [
    ['subagent_start', undefined],
    ['subagent_message', 'Looking at it.'],
    ['subagent_tool_use', 'Read'],
    ['subagent_message', 'Found it.'],
  ]);
  assert.ok(updates.every((u) => u.id === 't1'));
});
