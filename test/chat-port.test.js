import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parsePortFlag, portToRemember } from '../shared/portFlag.js';

test('--port is read as a number, in both spellings, and absent means null', () => {
  assert.equal(parsePortFlag(['node', 'cli', 'chat', '--port', '7777']), 7777);
  assert.equal(parsePortFlag(['node', 'cli', 'chat', '--dir', 'x', '--port=8123']), 8123);
  assert.equal(parsePortFlag(['node', 'cli', 'chat', '--dir', 'x']), null);
});

test('a port that is not a whole number from 1024 to 65535 is refused with a plain message', () => {
  for (const bad of ['', 'abc', '80', '70000', '77.5', '-5']) {
    assert.throws(() => parsePortFlag(['chat', '--port', bad]), /--port needs a whole number from 1024 to 65535/);
  }
  assert.throws(() => parsePortFlag(['chat', '--port']), /--port needs/);
});

test('which port is written down after binding', () => {
  // given with --port: remembered, unless it already is
  assert.equal(portToRemember({ bound: 7777, remembered: 5000, explicit: 7777 }), 7777);
  assert.equal(portToRemember({ bound: 7777, remembered: 7777, explicit: 7777 }), null);
  // first launch of a workforce: remember what it got
  assert.equal(portToRemember({ bound: 53211, remembered: null, explicit: null }), 53211);
  // the usual launch: nothing to write
  assert.equal(portToRemember({ bound: 7777, remembered: 7777, explicit: null }), null);
  // the remembered port was taken and a free one was used: keep the remembered one
  assert.equal(portToRemember({ bound: 53211, remembered: 7777, explicit: null }), null);
});
