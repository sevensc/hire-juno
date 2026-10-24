import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ClaudeAdapter } from '../chat/server/adapters/claude.js';
import { openStore } from '../chat/server/store.js';
import { WaitingMessages } from '../chat/server/waiting.js';

const image = { name: 's.png', mimeType: 'image/png', data: Buffer.from('x').toString('base64') };
const texts = (store) => store.getHistory('nora', 'default').map((m) => m.text);

// An adapter without the SDK process behind it: a stand-in query object.
function fakeAdapter(session) {
  const a = Object.create(ClaudeAdapter.prototype);
  Object.assign(a, { _session: session, _queue: [], _notifyQueued: null, _pendingResolve: null, _resolvers: new Map(), _outstanding: 0, onIdle: null });
  return a;
}

test('sendMessage hands uuid and priority to the session', () => {
  const a = fakeAdapter({});
  a.sendMessage('hi', undefined, { uuid: 'u-1', priority: 'later' });
  a.sendMessage('plain');
  assert.equal(a._queue[0].uuid, 'u-1');
  assert.equal(a._queue[0].priority, 'later');
  assert.equal('uuid' in a._queue[1] || 'priority' in a._queue[1], false);
});

test('cancel: true undoes the bookkeeping and resolves the send, false changes nothing', async () => {
  const calls = [];
  const a = fakeAdapter({ cancelAsyncMessage: async (u) => { calls.push(u); return u === 'gone'; } });
  let idle = 0;
  a.onIdle = () => idle++;
  let resolved = false;
  a.sendMessage('x', undefined, { uuid: 'gone' }).then(() => { resolved = true; });
  a.sendMessage('y', undefined, { uuid: 'read' });
  assert.equal(a.busy, true);
  assert.equal(a.canCancel, true);
  assert.equal(await a.cancel('read'), false);
  assert.equal(a._outstanding, 2);
  assert.equal(await a.cancel('gone'), true);
  await Promise.resolve();
  assert.equal(resolved, true);
  assert.equal(a._outstanding, 1);
  assert.equal(idle, 0);
  assert.deepEqual(calls, ['read', 'gone']);
});

test('cancel: last outstanding message withdrawn leaves the adapter idle', async () => {
  const a = fakeAdapter({ cancelAsyncMessage: async () => true });
  let idle = 0;
  a.onIdle = () => idle++;
  a.sendMessage('x', undefined, { uuid: 'u' });
  await a.cancel('u');
  assert.equal(a.busy, false);
  assert.equal(idle, 1);
});

test('without the SDK method there is nothing to cancel', async () => {
  const a = fakeAdapter({});
  assert.equal(a.canCancel, false);
  assert.equal(await a.cancel('u'), false);
});

test('store.deleteMessage removes the row and its images only', () => {
  const store = openStore({});
  const keep = store.appendMessage('nora', 'default', 'you', 'keep', undefined, [image]);
  const gone = store.appendMessage('nora', 'default', 'you', 'gone', undefined, [image]);
  assert.equal(store.deleteMessage(gone), true);
  assert.equal(store.deleteMessage(gone), false);
  const rows = store.getHistory('nora', 'default');
  assert.deepEqual(rows.map((r) => r.id), [keep]);
  assert.equal(rows[0].attachments.length, 1);
  assert.equal(store.getAttachment(rows[0].attachments[0].id) !== undefined, true);
});

test('withdraw: success deletes the stored message, failure keeps it and ends the waiting', async () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  store.appendMessage('nora', 'default', 'you', 'first');
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'withdrawn', undefined, [image]), { uuid: 'a' });
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'read'), { uuid: 'b' });
  const adapter = { canCancel: true, cancel: async (u) => u === 'a' };
  assert.deepEqual(await waiting.withdraw('k', 'a', adapter), { cancelled: true });
  assert.deepEqual(texts(store), ['first', 'read']);
  assert.deepEqual(await waiting.withdraw('k', 'b', adapter), { cancelled: false });
  assert.deepEqual(texts(store), ['first', 'read']);
  assert.deepEqual(waiting.list('k'), []);
  assert.deepEqual(await waiting.withdraw('k', 'b', adapter), { cancelled: false });
});

test('withdraw: an adapter that fails or cannot cancel leaves the message waiting', async () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'x'), { uuid: 'a' });
  const broken = { canCancel: true, cancel: async () => { throw new Error('no'); } };
  assert.deepEqual(await waiting.withdraw('k', 'a', broken), { cancelled: false, error: true });
  assert.equal(waiting.list('k').length, 1);
  assert.equal(texts(store).length, 1);
});

test('withdraw uses the row id after a reply moved it', async () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  store.appendMessage('nora', 'default', 'you', 'one');
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'two', undefined), { uuid: 'a', kind: 'queue' });
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'three'), { uuid: 'b', kind: 'queue' });
  store.appendMessage('nora', 'default', 'colleague', 'reply one');
  waiting.afterReply('k'); // 'two' starts, 'three' keeps waiting under a new id
  assert.deepEqual(await waiting.withdraw('k', 'b', { canCancel: true, cancel: async () => true }), { cancelled: true });
  assert.deepEqual(texts(store), ['one', 'reply one', 'two']);
});

test('a queued message is never folded, a plain one is; live list names the waiting ones', () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'p'), { uuid: 'p' });
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'q'), { uuid: 'q', kind: 'queue' });
  assert.deepEqual(waiting.list('k').map((e) => [e.uuid, e.kind]), [['p', 'send'], ['q', 'queue']]);
  assert.equal(waiting.folded('k'), true);
  assert.deepEqual(waiting.list('k').map((e) => e.uuid), ['q']);
  assert.equal(waiting.folded('k'), false);
});
