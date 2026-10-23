import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TextBlockSeparator } from '../chat/server/adapters/textBlocks.js';

const textStart = { type: 'content_block_start', content_block: { type: 'text' } };

test('the first text block of a turn gets no separator, later ones a blank line', () => {
  const s = new TextBlockSeparator();
  assert.equal(s.separatorFor(textStart), '');
  assert.equal(s.separatorFor(textStart), '\n\n');
  assert.equal(s.separatorFor(textStart), '\n\n');
});

test('other events and block types never count', () => {
  const s = new TextBlockSeparator();
  for (const e of [
    { type: 'content_block_start', content_block: { type: 'thinking' } },
    { type: 'content_block_start', content_block: { type: 'tool_use' } },
    { type: 'content_block_delta', delta: { type: 'text_delta', text: 'x' } },
    undefined,
  ]) {
    assert.equal(s.separatorFor(e), '');
  }
  assert.equal(s.separatorFor(textStart), '');
});

test('a new turn starts without a separator again', () => {
  const s = new TextBlockSeparator();
  s.separatorFor(textStart);
  s.reset();
  assert.equal(s.separatorFor(textStart), '');
});
