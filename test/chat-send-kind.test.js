import assert from 'node:assert/strict';
import { test } from 'node:test';

import { nextMenuIndex, pickSendKind } from '../chat/src/send-kind.js';

test('queue only counts while a turn runs', () => {
  assert.equal(pickSendKind({ typing: true, requested: 'queue' }), 'queue');
  assert.equal(pickSendKind({ typing: false, requested: 'queue' }), 'send');
});

test('everything else is a plain send', () => {
  assert.equal(pickSendKind({ typing: true, requested: 'send' }), 'send');
  assert.equal(pickSendKind({ typing: true, requested: undefined }), 'send');
});

test('menu arrows wrap, Home/End jump, other keys do nothing', () => {
  assert.equal(nextMenuIndex(0, 'ArrowDown', 2), 1);
  assert.equal(nextMenuIndex(1, 'ArrowDown', 2), 0);
  assert.equal(nextMenuIndex(0, 'ArrowUp', 2), 1);
  assert.equal(nextMenuIndex(1, 'Home', 2), 0);
  assert.equal(nextMenuIndex(0, 'End', 2), 1);
  assert.equal(nextMenuIndex(0, 'a', 2), null);
  assert.equal(nextMenuIndex(0, 'ArrowDown', 0), null);
});
