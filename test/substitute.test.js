import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { CONTENT_FILES } from '../src/content-manifest.js';
import { PACKAGE_ROOT } from '../src/scaffold.js';
import { buildSubstitutions, CO_OWNERS_PLACEHOLDER, substitute } from '../src/substitute.js';

const ANSWERS = {
  workforceId: 'acme',
  company: 'Acme',
  supervisor: 'Robin',
  toolLabel: 'Claude Code',
  hiredDate: '2026-01-01',
  useCase: 'a small startup',
  language: 'English',
};

function read(rel) {
  return readFileSync(join(PACKAGE_ROOT, rel), 'utf8');
}

test('substitute replaces literally, never as a regex', () => {
  // String.replace would read `$&` in a replacement value as "the whole
  // match" and quietly duplicate it. split/join must not.
  const out = substitute('Hello <company>.', { '<company>': 'A$&B$1C' });
  assert.equal(out, 'Hello A$&B$1C.');
});

test('substitute leaves unknown placeholders alone', () => {
  const out = substitute('<company> and <role>', { '<company>': 'Acme' });
  assert.equal(out, 'Acme and <role>');
});

// This is the fragile one: the placeholder spans two lines in
// CONSTITUTION.md, so the exact string — including where the newline
// falls — has to match the file byte for byte. Reflow that paragraph
// and the substitution silently stops working, leaving an example with
// invented founder names in someone's own constitution.
test('the two-line co-owners placeholder still matches CONSTITUTION.md', () => {
  const source = read('CONSTITUTION.md');
  assert.ok(
    source.includes(CO_OWNERS_PLACEHOLDER),
    'CO_OWNERS_PLACEHOLDER no longer appears verbatim in CONSTITUTION.md — did the paragraph get reflowed?'
  );
  const out = substitute(source, buildSubstitutions(ANSWERS));
  assert.ok(!out.includes('Anna'), 'example founder names survived substitution');
  assert.ok(out.includes('decided by Robin.'));
});

test('every substitution key actually occurs in the shipped content', () => {
  const corpus = CONTENT_FILES.map(read).join('\n');
  for (const key of Object.keys(buildSubstitutions(ANSWERS))) {
    assert.ok(
      corpus.includes(key),
      `substitution key ${JSON.stringify(key.slice(0, 40))} matches nothing that gets scaffolded — dead entry`
    );
  }
});

test('no angle-bracket placeholder the installer knows about survives scaffolding', () => {
  const values = buildSubstitutions(ANSWERS);
  for (const rel of CONTENT_FILES) {
    const out = substitute(read(rel), values);
    for (const key of Object.keys(values)) {
      assert.ok(!out.includes(key), `${rel} still contains ${key} after substitution`);
    }
  }
});
