import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openStore } from '../chat/server/store.js';
import { WaitingMessages } from '../chat/server/waiting.js';

const texts = (store) => store.getHistory('nora', 'default').map((m) => m.text);

test('a message folded into the running turn stays before the reply', () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  store.appendMessage('nora', 'default', 'you', 'first');
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'second'));
  assert.equal(waiting.folded('k'), true);
  store.appendMessage('nora', 'default', 'colleague', 'one reply to both');
  waiting.afterReply('k');
  assert.deepEqual(texts(store), ['first', 'second', 'one reply to both']);
});

test('a message that was not folded is moved behind the reply that ended the turn', () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  store.appendMessage('nora', 'default', 'you', 'first');
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'second'));
  store.appendMessage('nora', 'default', 'colleague', 'reply to first');
  waiting.afterReply('k');
  store.appendMessage('nora', 'default', 'colleague', 'reply to second');
  assert.deepEqual(texts(store), ['first', 'reply to first', 'second', 'reply to second']);
});

test('with two waiting, the oldest starts after the reply and the other can still be folded', () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  store.appendMessage('nora', 'default', 'you', 'one');
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'two'));
  waiting.add('k', store.appendMessage('nora', 'default', 'you', 'three'));
  store.appendMessage('nora', 'default', 'colleague', 'reply one');
  waiting.afterReply('k');
  assert.equal(waiting.folded('k'), true); // three joins the turn of two
  store.appendMessage('nora', 'default', 'colleague', 'reply two and three');
  waiting.afterReply('k');
  assert.deepEqual(texts(store), ['one', 'reply one', 'two', 'three', 'reply two and three']);
});

test('nothing waiting means nothing to fold or move, and conversations are separate', () => {
  const store = openStore({});
  const waiting = new WaitingMessages(store);
  assert.equal(waiting.folded('k'), false);
  waiting.afterReply('k');
  waiting.add('other', store.appendMessage('juno', 'default', 'you', 'x'));
  assert.equal(waiting.folded('k'), false);
  assert.equal(waiting.folded('other'), true);
});
