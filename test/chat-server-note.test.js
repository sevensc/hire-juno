import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildServerNote, buildSystemPrompt } from '../chat/server/agentAdapter.js';

test('no server note outside a server', () => {
  assert.equal(buildServerNote(), '');
  assert.equal(buildServerNote({ server: false, person: 'ana', context: 'x' }), '');
});

test('the server note names the person and appends the deployment note', () => {
  const note = buildServerNote({ server: true, person: 'ana', context: '  Repos lie next to this one.\n' });
  assert.match(note, /# Working on a shared server/);
  assert.match(note, /The person you are talking to in this chat is ana\./);
  assert.match(note, /## About this server\n\nRepos lie next to this one\.$/);
});

test('without a person or a deployment note only the fixed text is added', () => {
  const note = buildServerNote({ server: true });
  assert.match(note, /# Working on a shared server/);
  assert.equal(note.includes('The person you are talking to'), false);
  assert.equal(note.includes('## About this server'), false);
});

test('the server note comes last in the system prompt, after the chat instructions', () => {
  const note = buildServerNote({ server: true, person: 'ana' });
  const prompt = buildSystemPrompt({ colleagueId: 'nora', ownProfile: 'You are Nora.', serverNote: note });
  assert.ok(prompt.startsWith('You are Nora.'));
  assert.ok(prompt.endsWith(note));
  assert.ok(prompt.indexOf('# Working through hire-juno') < prompt.indexOf('# Working on a shared server'));
});
