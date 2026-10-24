import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WaitingMessages } from '../chat/server/waiting.js';
import { workforcesStatus } from '../chat/server/index.js';

test('WaitingMessages.count sums over all conversations', () => {
  const w = new WaitingMessages({});
  assert.equal(w.count(), 0);
  w.add('a', 1, { uuid: 'u1' });
  w.add('a', 2, { uuid: 'u2' });
  w.add('b', 3, { uuid: 'u3' });
  assert.equal(w.count(), 3);
  w.remove('a', 'u1');
  assert.equal(w.count(), 2);
});

test('workforcesStatus lists every running server, without url or token', () => {
  const servers = new Map([
    ['/x/one', { url: 'http://127.0.0.1:1/secret-one/', server: {}, closing: false, name: 'one', status: () => ({ waiting: 2, busy: true }) }],
    ['/x/two', { url: 'http://127.0.0.1:2/secret-two/', server: {}, closing: false, name: 'two', status: () => ({ waiting: 0, busy: false }) }],
    ['/x/gone', { url: 'http://127.0.0.1:3/secret-gone/', server: {}, closing: true, name: 'gone', status: () => ({ waiting: 5, busy: true }) }],
  ]);
  const result = workforcesStatus(servers);
  assert.deepEqual(result, [
    { path: '/x/one', name: 'one', waiting: 2, busy: true },
    { path: '/x/two', name: 'two', waiting: 0, busy: false },
  ]);
  assert.ok(!JSON.stringify(result).includes('secret'));
});
