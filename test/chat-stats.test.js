import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { recordStats, resolveCustomLogo } from '../chat/server/index.js';

test('recordStats stores model/effort from a session_info update', () => {
  const stats = new Map();
  recordStats(stats, 'nora', { type: 'session_info', model: 'claude-sonnet-5', effort: 'high' });
  assert.deepEqual(stats.get('nora'), { model: 'claude-sonnet-5', effort: 'high' });
});

test('recordStats stores token counts from a usage update', () => {
  const stats = new Map();
  recordStats(stats, 'nora', {
    type: 'usage',
    inputTokens: 100,
    outputTokens: 40,
    totalTokens: 140,
    costUsd: 0.01,
  });
  assert.deepEqual(stats.get('nora'), { inputTokens: 100, outputTokens: 40, totalTokens: 140, costUsd: 0.01 });
});

test('recordStats merges session_info and usage into the same entry rather than overwriting it', () => {
  const stats = new Map();
  recordStats(stats, 'nora', { type: 'session_info', model: 'claude-sonnet-5', effort: 'high' });
  recordStats(stats, 'nora', { type: 'usage', inputTokens: 100, outputTokens: 40, totalTokens: 140, costUsd: 0.01 });
  assert.deepEqual(stats.get('nora'), {
    model: 'claude-sonnet-5',
    effort: 'high',
    inputTokens: 100,
    outputTokens: 40,
    totalTokens: 140,
    costUsd: 0.01,
  });
});

test('recordStats keeps each colleague in her own entry', () => {
  const stats = new Map();
  recordStats(stats, 'nora', { type: 'session_info', model: 'claude-sonnet-5', effort: 'high' });
  recordStats(stats, 'remy', { type: 'session_info', model: 'claude-opus-4-7', effort: null });
  assert.equal(stats.get('nora').model, 'claude-sonnet-5');
  assert.equal(stats.get('remy').model, 'claude-opus-4-7');
});

test('recordStats ignores update types it does not know about', () => {
  const stats = new Map();
  recordStats(stats, 'nora', { type: 'delta', text: 'hi' });
  assert.equal(stats.has('nora'), false);
});

test('a later usage update overwrites the previous token counts (cumulative totals, not additive)', () => {
  const stats = new Map();
  recordStats(stats, 'nora', { type: 'usage', inputTokens: 100, outputTokens: 40, totalTokens: 140, costUsd: 0.01 });
  recordStats(stats, 'nora', { type: 'usage', inputTokens: 250, outputTokens: 90, totalTokens: 340, costUsd: 0.03 });
  assert.deepEqual(stats.get('nora'), { inputTokens: 250, outputTokens: 90, totalTokens: 340, costUsd: 0.03 });
});

test('resolveCustomLogo finds a logo.png at the target repo root', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-logo-'));
  try {
    writeFileSync(join(dir, 'logo.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    assert.equal(resolveCustomLogo(dir), join(dir, 'logo.png'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveCustomLogo returns null when there is no logo.png', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-logo-'));
  try {
    assert.equal(resolveCustomLogo(dir), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
