import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { openStore } from '../chat/server/store.js';

test('the last reported figures of a conversation survive reopening the store', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-stats-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    store.saveStats('nora', 'default', { model: 'sonnet', effort: 'high' });
    store.saveStats('nora', 'default', { model: 'sonnet', effort: 'high', inputTokens: 10, outputTokens: 5, totalTokens: 15, costUsd: 0.02 });
    store.saveStats('nora', 's2', { totalTokens: 7 });
    store.close();

    const reopened = openStore({ workforceId: 'acme', baseDir });
    const all = new Map(reopened.getAllStats().map(([c, s, stats]) => [`${c}::${s}`, stats]));
    assert.deepEqual(all.get('nora::default'), { model: 'sonnet', effort: 'high', inputTokens: 10, outputTokens: 5, totalTokens: 15, costUsd: 0.02 });
    assert.deepEqual(all.get('nora::s2'), { totalTokens: 7 });
    assert.equal(all.size, 2);
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('a conversation that never reported has no snapshot, and the default session id is filled in', () => {
  const store = openStore({});
  assert.deepEqual(store.getAllStats(), []);
  store.saveStats('juno', undefined, { model: 'haiku' });
  assert.deepEqual(store.getAllStats(), [['juno', 'default', { model: 'haiku' }]]);
});
