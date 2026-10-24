import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buildSystemPrompt } from '../chat/server/agentAdapter.js';

const MARKER = ':::mode hiring-process:start';

test('only Juno gets the hiring-process marker in her chat instructions', () => {
  const juno = buildSystemPrompt({ colleagueId: 'juno', ownProfile: 'You are Juno.' });
  const other = buildSystemPrompt({ colleagueId: 'nora', ownProfile: 'You are Nora.' });
  assert.ok(juno.includes(MARKER));
  assert.ok(juno.includes(':::mode hiring-process:end'));
  assert.equal(other.includes(MARKER), false);
  assert.ok(juno.startsWith('You are Juno.'));
});

test('the marker is out of Juno\'s personnel file, which has to work on any platform', () => {
  const profile = readFileSync(new URL('../team/juno/profile.md', import.meta.url), 'utf8');
  assert.equal(profile.includes(':::mode'), false);
});
