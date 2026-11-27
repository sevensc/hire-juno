import assert from 'node:assert/strict';
import { test } from 'node:test';

import { REACTIONS, reactionHint } from '../chat/server/reactions.js';

test('every reaction has an emoji and an instruction; unknown keys give none', () => {
  assert.deepEqual(Object.keys(REACTIONS), ['yes', 'no', 'knowledge', 'question']);
  for (const r of Object.values(REACTIONS)) {
    assert.ok(r.emoji);
    assert.ok(r.hint.length > 40);
  }
  assert.match(reactionHint('yes'), /only means yes to a yes-or-no question/);
  assert.equal(reactionHint('nope'), '');
  assert.equal(reactionHint(undefined), '');
});
