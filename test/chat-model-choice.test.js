import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { validateModelChoice } from '../chat/server/modelChoice.js';
import { openStore } from '../chat/server/store.js';

const SUPPORTED = [
  { value: 'default', displayName: 'Default (recommended)' },
  { value: 'sonnet', displayName: 'Sonnet' },
  { value: 'haiku', displayName: 'Haiku' },
];

test('a model the SDK listed is accepted as it is', () => {
  assert.deepEqual(validateModelChoice('haiku', SUPPORTED), { ok: true, model: 'haiku' });
});

test('an empty value and the SDK\'s default entry both mean "no choice"', () => {
  for (const requested of [null, undefined, '', 'default']) {
    assert.deepEqual(validateModelChoice(requested, SUPPORTED), { ok: true, model: null });
  }
});

test('anything the SDK did not list is refused, including non-text', () => {
  assert.equal(validateModelChoice('gpt-x', SUPPORTED).ok, false);
  assert.equal(validateModelChoice({ value: 'haiku' }, SUPPORTED).ok, false);
  assert.equal(validateModelChoice('haiku', []).ok, false);
  assert.equal(validateModelChoice('haiku', undefined).ok, false);
});

test('a refused value is named in the message, cut to a sane length', () => {
  const result = validateModelChoice('x'.repeat(500), SUPPORTED);
  assert.equal(result.ok, false);
  assert.ok(result.message.length < 120);
});

test('the chosen model is stored per conversation and survives reopening the store', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-model-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    assert.equal(store.getModelChoice('juno', 'default'), null);
    store.setModelChoice('juno', 'default', 'haiku');
    store.setModelChoice('juno', 'sess-2', 'sonnet');
    assert.equal(store.getModelChoice('juno', 'default'), 'haiku');
    assert.equal(store.getModelChoice('juno', 'sess-2'), 'sonnet');
    store.setModelChoice('juno', 'default', 'opus[1m]'); // overwrite
    store.close();

    const reopened = openStore({ workforceId: 'acme', baseDir });
    assert.equal(reopened.getModelChoice('juno', 'default'), 'opus[1m]');
    reopened.setModelChoice('juno', 'default', null); // back to the default
    assert.equal(reopened.getModelChoice('juno', 'default'), null);
    assert.equal(reopened.getModelChoice('juno', 'sess-2'), 'sonnet');
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('a context reset does not forget the chosen model', () => {
  const store = openStore({}); // in-memory
  store.setModelChoice('juno', 'default', 'haiku');
  store.clearAdapterSession('juno', 'default');
  assert.equal(store.getModelChoice('juno', 'default'), 'haiku');
  store.close();
});
