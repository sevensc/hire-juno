import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isStaleResumeError, STALE_RESUME_MESSAGE } from '../chat/server/adapters/staleResume.js';

test('the CLI message for a vanished session is recognised, with or without the id and case', () => {
  assert.equal(isStaleResumeError('Claude Code returned an error result: No conversation found with session ID: 11111111-2222-4333-8444-555555555555'), true);
  assert.equal(isStaleResumeError('no conversation found with session id'), true);
});

test('other errors are not mistaken for it', () => {
  for (const text of ['rate limit', 'error_during_execution', '', null, undefined, 42]) {
    assert.equal(isStaleResumeError(text), false);
  }
});

test('the notice tells the user to send the message again', () => {
  assert.match(STALE_RESUME_MESSAGE, /send your last message again/);
});
