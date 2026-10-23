import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ASK_UNLESS_AUTO_MODE } from '../chat/server/adapters/claude.js';

test('the tools that change things or reach out always ask unless Auto mode is on', () => {
  for (const tool of ['Bash', 'Edit', 'Write', 'WebFetch', 'WebSearch']) {
    assert.ok(ASK_UNLESS_AUTO_MODE.includes(tool), `${tool} should ask`);
  }
});

test('read-only tools are not on the list, so they keep not asking', () => {
  for (const tool of ['Read', 'Grep', 'Glob']) {
    assert.equal(ASK_UNLESS_AUTO_MODE.includes(tool), false);
  }
});
