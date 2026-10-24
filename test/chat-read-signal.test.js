import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ClaudeAdapter } from '../chat/server/adapters/claude.js';
import { WaitingMessages } from '../chat/server/waiting.js';
import { openStore } from '../chat/server/store.js';

function adapter() {
  const a = Object.create(ClaudeAdapter.prototype);
  a._openSubagents = new Set();
  a._approvals = new Map();
  a.updates = [];
  a.onUpdate = (u) => a.updates.push(u);
  return a;
}

test('a replayed user message with a uuid is the "read" signal and nothing else', () => {
  const a = adapter();
  a._handleMessage({ type: 'user', isReplay: true, uuid: 'm-2', parent_tool_use_id: null, message: { content: 'text' } });
  a._handleMessage({ type: 'user', isReplay: true, uuid: 'm-3', parent_tool_use_id: null, message: { content: [{ type: 'text', text: 'with an image' }] } });
  assert.deepEqual(a.updates, [
    { type: 'message_read', uuid: 'm-2' },
    { type: 'message_read', uuid: 'm-3' },
  ]);
});

test('a replay without a uuid says nothing, and a tool result is still a tool result', () => {
  const a = adapter();
  a._handleMessage({ type: 'user', isReplay: true, parent_tool_use_id: null, message: { content: 'text' } });
  a._handleMessage({
    type: 'user',
    parent_tool_use_id: null,
    message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: 'ok' }] },
  });
  assert.deepEqual(a.updates.map((u) => u.type), ['tool_done']);
});

test('a message that was read stops waiting and is not moved behind the next reply', () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  store.appendMessage('nora', 'default', 'you', 'first');
  const id2 = store.appendMessage('nora', 'default', 'you', 'second');
  waiting.add('k', id2, { uuid: 'u2' });
  // the session reports it read (folded into the running turn)
  assert.ok(waiting.remove('k', 'u2'));
  store.appendMessage('nora', 'default', 'colleague', 'one reply to both');
  waiting.afterReply('k');
  assert.deepEqual(store.getHistory('nora', 'default').map((m) => m.text), ['first', 'second', 'one reply to both']);
  assert.equal(waiting.remove('k', 'u2'), undefined); // a second ack for it changes nothing
});
