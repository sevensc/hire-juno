import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  normalizeThemePreference,
  readThemePreference,
  writeThemePreference,
} from '../chat/src/theme.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data,
  };
}

function fakeDocument() {
  const attrs = { content: 'light dark' };
  const meta = { setAttribute: (k, v) => { attrs[k] = v; } };
  return {
    documentElement: { dataset: {} },
    querySelector: (sel) => (sel === 'meta[name="color-scheme"]' ? meta : null),
    metaContent: () => attrs.content,
  };
}

test('unknown or missing values fall back to system', () => {
  for (const v of [null, undefined, '', 'Dark', 'auto', 42]) {
    assert.equal(normalizeThemePreference(v), 'system');
  }
  for (const v of ['system', 'light', 'dark']) {
    assert.equal(normalizeThemePreference(v), v);
  }
});

test('write then read round-trips; system clears the stored value', () => {
  const storage = memoryStorage();
  assert.equal(readThemePreference(storage), 'system');
  writeThemePreference('dark', storage);
  assert.equal(storage.data.get(THEME_STORAGE_KEY), 'dark');
  assert.equal(readThemePreference(storage), 'dark');
  writeThemePreference('system', storage);
  assert.equal(storage.data.has(THEME_STORAGE_KEY), false);
  assert.equal(readThemePreference(storage), 'system');
});

test('blocked storage reads as system and does not throw on write', () => {
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); },
  };
  assert.equal(readThemePreference(blocked), 'system');
  assert.equal(writeThemePreference('light', blocked), 'light');
});

test('applyTheme pins light or dark and system removes the pin', () => {
  const doc = fakeDocument();
  applyTheme('dark', doc);
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.metaContent(), 'dark');
  applyTheme('light', doc);
  assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(doc.metaContent(), 'light');
  applyTheme('system', doc);
  assert.equal('theme' in doc.documentElement.dataset, false);
  assert.equal(doc.metaContent(), 'light dark');
  applyTheme('bogus', doc);
  assert.equal('theme' in doc.documentElement.dataset, false);
});
