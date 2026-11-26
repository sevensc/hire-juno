import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanPiece, transcriptArtifact, transcriptMessages } from '../chat/src/transcribe.js';

test('invented closing phrases, bracketed noise and repeats are dropped, real speech stays', () => {
  assert.equal(cleanPiece('Test, test. Das war\'s. Das war\'s. Danke fürs Zuschauen.'), 'Test, test.');
  assert.equal(cleanPiece('[Musik]'), '');
  assert.equal(cleanPiece('Danke fürs Zusehen! und Test iPhone.'), 'und Test iPhone.');
  assert.equal(cleanPiece('Wir treffen uns am Donnerstag. Wir treffen uns am Donnerstag.'), 'Wir treffen uns am Donnerstag.');
  assert.equal(cleanPiece('Das war\'s mit dem ersten Punkt der Tagesordnung, jetzt kommen wir zum Budget.'), 'Das war\'s mit dem ersten Punkt der Tagesordnung, jetzt kommen wir zum Budget.');
});

test('the transcript groups lines by speaker and names the model', () => {
  const at = Date.UTC(2026, 0, 1, 10, 0);
  const [msg] = transcriptMessages({ startedAt: at, endedAt: at + 60000, model: 'whisper-small', lines: [
    { at, speaker: 'Ana', text: 'Hallo.' }, { at: at + 1, speaker: 'Ana', text: 'Wie geht es?' }, { at: at + 2, speaker: 'Ben', text: 'Gut.' },
  ] });
  assert.match(msg, /^\*\*Transcript of the call\*\* \(.+, whisper-small\)/);
  assert.match(msg, /\*\*Ana:\*\* Hallo\. Wie geht es\?\n\n\*\*Ben:\*\* Gut\./);
});

test('the transcript artifact has a title for the card and the text grouped by speaker', () => {
  const at = Date.UTC(2026, 0, 1, 10, 0);
  const { title, content } = transcriptArtifact({ startedAt: at, endedAt: at + 60000, model: 'whisper-small', lines: [
    { at, speaker: 'Ana', text: 'Hallo.' }, { at: at + 1, speaker: 'Ben', text: 'Gut.' },
  ] });
  assert.match(title, /^Call transcript /);
  assert.ok(content.startsWith(`# ${title}`));
  assert.match(content, /Speakers: Ana, Ben/);
  assert.match(content, /\*\*Ana\*\* \(.+\)\nHallo\.\n\n\*\*Ben\*\* \(.+\)\nGut\./);
});
