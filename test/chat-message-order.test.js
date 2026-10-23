import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openStore } from '../chat/server/store.js';

const image = { name: 'a.png', mimeType: 'image/png', data: Buffer.from('x').toString('base64') };

test('a message saved while a reply was running can be moved behind that reply', () => {
  const store = openStore({});
  store.appendMessage('nora', 'default', 'you', 'first');
  const waiting = store.appendMessage('nora', 'default', 'you', 'second', undefined, [image]);
  store.appendMessage('nora', 'default', 'colleague', 'reply to first');
  store.moveToEnd([waiting]);
  const history = store.getHistory('nora', 'default');
  assert.deepEqual(history.map((m) => m.text), ['first', 'reply to first', 'second']);
  assert.equal(history[2].attachments.length, 1);
  assert.notEqual(store.getAttachment(history[2].attachments[0].id), null);
});

test('several waiting messages keep their order, and later rows come after them', () => {
  const store = openStore({});
  store.appendMessage('nora', 'default', 'you', 'one');
  const two = store.appendMessage('nora', 'default', 'you', 'two');
  const three = store.appendMessage('nora', 'default', 'you', 'three');
  store.appendMessage('nora', 'default', 'colleague', 'reply one');
  const [newTwo, newThree] = store.moveToEnd([two, three]);
  assert.ok(newTwo < newThree);
  store.moveToEnd([newThree]);
  store.appendMessage('nora', 'default', 'colleague', 'reply two');
  assert.deepEqual(
    store.getHistory('nora', 'default').map((m) => m.text),
    ['one', 'reply one', 'two', 'three', 'reply two']
  );
});

test('other conversations are untouched', () => {
  const store = openStore({});
  const a = store.appendMessage('nora', 'default', 'you', 'a');
  store.appendMessage('juno', 'default', 'you', 'j');
  store.moveToEnd([a]);
  assert.deepEqual(store.getHistory('juno', 'default').map((m) => m.text), ['j']);
  assert.deepEqual(store.getHistory('nora', 'default').map((m) => m.text), ['a']);
});
