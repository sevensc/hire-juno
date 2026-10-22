import assert from 'node:assert/strict';
import { test } from 'node:test';

import { extractMentions, extractVocativeAddresses } from '../chat/server/mentions.js';

test('extractMentions finds member ids mentioned with @, case-insensitively', () => {
  assert.deepEqual(
    extractMentions('Kannst du @Nora und @remy fragen?', ['nora', 'remy', 'ada'], 'you'),
    ['nora', 'remy']
  );
});

test('extractMentions ignores mentions of people who are not channel members', () => {
  assert.deepEqual(extractMentions('@nobody hi', ['nora', 'remy'], 'you'), []);
});

test('extractMentions excludes the sender mentioning herself', () => {
  assert.deepEqual(extractMentions('@nora thinking out loud', ['nora', 'remy'], 'nora'), []);
});

test('extractMentions de-duplicates repeated mentions of the same member', () => {
  assert.deepEqual(extractMentions('@nora @nora are you there @nora', ['nora'], 'you'), ['nora']);
});

test('extractMentions returns an empty array when there are no @ mentions at all', () => {
  assert.deepEqual(extractMentions('just a normal message', ['nora'], 'you'), []);
});

test('extractMentions expands @all to every other member', () => {
  assert.deepEqual(extractMentions('@all please chime in', ['nora', 'remy', 'ada'], 'you'), ['nora', 'remy', 'ada']);
});

test('extractMentions expands @everyone the same way as @all', () => {
  assert.deepEqual(extractMentions('@everyone please chime in', ['nora', 'remy', 'ada'], 'you'), ['nora', 'remy', 'ada']);
});

test('extractMentions excludes the sender herself from an @all expansion', () => {
  assert.deepEqual(extractMentions('@all please chime in', ['nora', 'remy', 'ada'], 'nora'), ['remy', 'ada']);
});

test('extractMentions treats @all alongside specific @names as just @all (no duplicate dispatch)', () => {
  assert.deepEqual(extractMentions('@nora @all', ['nora', 'remy', 'ada'], 'you'), ['nora', 'remy', 'ada']);
});

const NAMES = new Map([['rami', 'rami'], ['noran', 'noran'], ['jo', 'jo']]);

test('extractVocativeAddresses recognizes a plain name addressed at the start of a paragraph, em-dash style', () => {
  assert.deepEqual(
    extractVocativeAddresses('Rami — du hattest architektonischen Blick angeboten, genau jetzt wär der Moment.', NAMES, ['rami', 'noran'], 'noran'),
    ['rami']
  );
});

test('extractVocativeAddresses also recognizes comma and colon as the address punctuation', () => {
  assert.deepEqual(extractVocativeAddresses('Rami, kannst du kurz schauen?', NAMES, ['rami', 'noran'], 'noran'), ['rami']);
  assert.deepEqual(extractVocativeAddresses('Rami: kurze Frage.', NAMES, ['rami', 'noran'], 'noran'), ['rami']);
});

test('extractVocativeAddresses ignores a name mentioned in passing, mid-sentence', () => {
  assert.deepEqual(extractVocativeAddresses('Das hat schon Rami geprüft, alles gut.', NAMES, ['rami', 'noran'], 'noran'), []);
});

test('extractVocativeAddresses ignores a name at line start with no address punctuation after it', () => {
  assert.deepEqual(extractVocativeAddresses('Rami ist gerade nicht online.', NAMES, ['rami', 'noran'], 'noran'), []);
});

test('extractVocativeAddresses ignores someone who is not a channel member', () => {
  assert.deepEqual(extractVocativeAddresses('Jo — kurze Frage.', NAMES, ['rami', 'noran'], 'noran'), []);
});

test('extractVocativeAddresses excludes the sender addressing herself', () => {
  assert.deepEqual(extractVocativeAddresses('Rami — nur laut gedacht.', NAMES, ['rami', 'noran'], 'rami'), []);
});

test('extractVocativeAddresses is case-insensitive and matches across multiple paragraphs, de-duplicated', () => {
  assert.deepEqual(
    extractVocativeAddresses('RAMI — erster Absatz.\n\nrami, zweiter Absatz auch an dich.', NAMES, ['rami', 'noran'], 'noran'),
    ['rami']
  );
});
