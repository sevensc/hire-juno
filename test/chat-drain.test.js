import assert from 'node:assert/strict';
import { test } from 'node:test';

import { waitUntilIdle } from '../chat/server/drain.js';

test('resolves immediately when nothing is busy', async () => {
  assert.equal(await waitUntilIdle(() => false, { pollMs: 5 }), 'idle');
});

test('waits for a running turn to finish', async () => {
  let busy = true;
  setTimeout(() => { busy = false; }, 30);
  assert.equal(await waitUntilIdle(() => busy, { pollMs: 5, maxMs: 2000 }), 'idle');
});

test('gives up after the cap when a turn never ends', async () => {
  assert.equal(await waitUntilIdle(() => true, { pollMs: 5, maxMs: 40 }), 'timeout');
});
