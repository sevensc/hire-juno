import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pickConversationToRestore, recallOpenConversation, rememberOpenConversation } from '../chat/src/open-conversation.js';

const roster = {
  colleagueIds: ['nora', 'remy'],
  channelIds: ['c1'],
  sessionIdsByColleague: { nora: ['s-2'], remy: [] },
  defaultSessionId: 'default',
};

test('reopens the extra session that was open', () => {
  assert.deepEqual(pickConversationToRestore({ colleagueId: 'nora', sessionId: 's-2' }, roster), { colleagueId: 'nora', sessionId: 's-2' });
});

test('reopens a colleague\'s default conversation', () => {
  assert.deepEqual(pickConversationToRestore({ colleagueId: 'remy', sessionId: 'default' }, roster), { colleagueId: 'remy', sessionId: 'default' });
});

test('reopens a channel', () => {
  assert.deepEqual(pickConversationToRestore({ channelId: 'c1' }, roster), { channelId: 'c1' });
});

test('a session that no longer exists falls back to the colleague\'s default conversation', () => {
  assert.deepEqual(pickConversationToRestore({ colleagueId: 'nora', sessionId: 'gone' }, roster), { colleagueId: 'nora', sessionId: 'default' });
});

test('a colleague or channel that no longer exists restores nothing', () => {
  assert.equal(pickConversationToRestore({ colleagueId: 'ghost', sessionId: 'default' }, roster), null);
  assert.equal(pickConversationToRestore({ channelId: 'gone' }, roster), null);
});

test('missing, malformed or foreign values restore nothing', () => {
  for (const saved of [null, undefined, 'x', 42, {}, { colleagueId: 7 }, { channelId: {} }]) {
    assert.equal(pickConversationToRestore(saved, roster), null);
  }
});

test('remember and recall round-trip through the given storage', () => {
  const data = new Map();
  const storage = { setItem: (k, v) => data.set(k, v), getItem: (k) => data.get(k) ?? null };
  rememberOpenConversation({ colleagueId: 'nora', sessionId: 's-2' }, storage);
  assert.deepEqual(recallOpenConversation(storage), { colleagueId: 'nora', sessionId: 's-2' });
});

test('a storage that throws or holds garbage never breaks the chat', () => {
  const broken = { setItem() { throw new Error('quota'); }, getItem() { throw new Error('blocked'); } };
  assert.doesNotThrow(() => rememberOpenConversation({ channelId: 'c1' }, broken));
  assert.equal(recallOpenConversation(broken), null);
  assert.equal(recallOpenConversation({ getItem: () => '{not json' }), null);
});
