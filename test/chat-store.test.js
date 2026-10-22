import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import DatabaseConstructor from 'better-sqlite3';

import { openStore } from '../chat/server/store.js';
import { resolveWorkforce } from '../chat/server/workforceId.js';

test('openStore persists messages to disk and reads them back in order', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-store-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    assert.equal(store.persisted, true);
    store.appendMessage('juno', 'default', 'you', 'hi');
    store.appendMessage('juno', 'default', 'colleague', 'hello back');
    assert.deepEqual(
      store.getHistory('juno', 'default').map((m) => [m.role, m.text]),
      [['you', 'hi'], ['colleague', 'hello back']]
    );
    store.close();

    // A second store over the same baseDir/workforceId picks up the
    // same file — this is the point of writing to disk at all.
    const reopened = openStore({ workforceId: 'acme', baseDir });
    assert.equal(reopened.getHistory('juno', 'default').length, 2);
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('openStore persists a message\'s trail and reads it back after reopening', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-store-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    const trail = [
      { kind: 'tool_use', name: 'Bash', input: { command: 'pwd' } },
      { kind: 'thinking', text: 'checking the working directory first' },
    ];
    store.appendMessage('nora', 'default', 'colleague', 'done', trail);
    store.appendMessage('nora', 'default', 'you', 'no trail on my own turns');
    assert.deepEqual(store.getHistory('nora', 'default').map((m) => m.trail), [trail, undefined]);
    store.close();

    // The actual point: a fresh process (server restart) still finds it.
    const reopened = openStore({ workforceId: 'acme', baseDir });
    assert.deepEqual(reopened.getHistory('nora', 'default')[0].trail, trail);
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('openStore treats an empty trail the same as no trail at all', () => {
  const store = openStore({ workforceId: null });
  store.appendMessage('nora', 'default', 'colleague', 'hi', []);
  assert.equal(store.getHistory('nora', 'default')[0].trail, undefined);
  store.close();
});

test('openStore persists channels and channel messages, in order', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-store-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    store.createChannel('c1', 'general', ['juno', 'nora']);
    assert.deepEqual(store.listChannels(), [{ id: 'c1', name: 'general', memberIds: ['juno', 'nora'] }]);

    store.appendChannelMessage('c1', 'you', 'hi both');
    store.appendChannelMessage('c1', 'juno', 'hey!');
    assert.deepEqual(
      store.getChannelHistory('c1').map((m) => [m.sender_id, m.text]),
      [['you', 'hi both'], ['juno', 'hey!']]
    );
    store.close();

    const reopened = openStore({ workforceId: 'acme', baseDir });
    assert.equal(reopened.listChannels().length, 1);
    assert.equal(reopened.getChannelHistory('c1').length, 2);
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('openStore falls back to an in-memory, non-persisted database without a workforce ID', () => {
  const store = openStore({ workforceId: null });
  assert.equal(store.persisted, false);
  store.appendMessage('juno', 'default', 'you', 'hi');
  assert.equal(store.getHistory('juno', 'default').length, 1);
  store.close();
});

test('openStore keeps two sessions with the same colleague completely separate', () => {
  const store = openStore({ workforceId: null });
  store.appendMessage('nora', 'default', 'you', 'topic one');
  store.createSession('s1', 'nora', 'Topic two');
  store.appendMessage('nora', 's1', 'you', 'topic two');
  assert.deepEqual(store.getHistory('nora', 'default').map((m) => m.text), ['topic one']);
  assert.deepEqual(store.getHistory('nora', 's1').map((m) => m.text), ['topic two']);
  store.close();
});

test('openStore falls back to DEFAULT_SESSION_ID when no session is given', () => {
  const store = openStore({ workforceId: null });
  store.appendMessage('nora', undefined, 'you', 'hi');
  assert.deepEqual(store.getHistory('nora').map((m) => m.text), ['hi']);
  store.close();
});

test('openStore persists sessions and lists them per colleague, oldest first', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-store-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    store.createSession('s1', 'nora', 'Refactor the auth module');
    store.createSession('s2', 'nora', 'Plan the release');
    store.createSession('s3', 'remy', 'Reisebuchung');
    assert.deepEqual(
      store.listSessions('nora').map((s) => [s.id, s.title]),
      [['s1', 'Refactor the auth module'], ['s2', 'Plan the release']]
    );
    store.close();

    const reopened = openStore({ workforceId: 'acme', baseDir });
    assert.equal(reopened.listSessions('nora').length, 2);
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('openStore reads a pre-sessions database (messages without a session_id column) as DEFAULT_SESSION_ID', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-store-'));
  try {
    // Simulates a chat.db written by the version of this module before
    // sessions existed — no session_id column at all, not even a
    // default-valued one.
    const dir = join(baseDir, 'acme', 'chat');
    mkdirSync(dir, { recursive: true });
    const legacy = new DatabaseConstructor(join(dir, 'chat.db'));
    legacy.exec(`
      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        colleague_id TEXT NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
    `);
    legacy.prepare('INSERT INTO messages (colleague_id, role, text) VALUES (?, ?, ?)').run('nora', 'you', 'from before sessions existed');
    legacy.close();

    const store = openStore({ workforceId: 'acme', baseDir });
    assert.deepEqual(store.getHistory('nora').map((m) => m.text), ['from before sessions existed']);
    store.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('openStore has no saved adapter session for a colleague that never had one', () => {
  const store = openStore({ workforceId: null });
  assert.equal(store.getAdapterSession('nora', 'default'), null);
  store.close();
});

test('openStore persists an adapter session and reads it back after reopening', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-store-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    store.saveAdapterSession('nora', 'default', 'sdk-session-1');
    assert.equal(store.getAdapterSession('nora', 'default'), 'sdk-session-1');
    store.close();

    // The actual point: a fresh process (server restart) still finds it.
    const reopened = openStore({ workforceId: 'acme', baseDir });
    assert.equal(reopened.getAdapterSession('nora', 'default'), 'sdk-session-1');
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('openStore overwrites an adapter session for the same (colleague, session) instead of duplicating it', () => {
  const store = openStore({ workforceId: null });
  store.saveAdapterSession('nora', 'default', 'sdk-session-1');
  store.saveAdapterSession('nora', 'default', 'sdk-session-2');
  assert.equal(store.getAdapterSession('nora', 'default'), 'sdk-session-2');
  store.close();
});

test('openStore keeps adapter sessions separate per (colleague, session)', () => {
  const store = openStore({ workforceId: null });
  store.saveAdapterSession('nora', 'default', 'sdk-session-main');
  store.saveAdapterSession('nora', 's1', 'sdk-session-topic-two');
  store.saveAdapterSession('remy', 'default', 'sdk-session-remy');
  assert.equal(store.getAdapterSession('nora', 'default'), 'sdk-session-main');
  assert.equal(store.getAdapterSession('nora', 's1'), 'sdk-session-topic-two');
  assert.equal(store.getAdapterSession('remy', 'default'), 'sdk-session-remy');
  store.close();
});

test('openStore falls back to DEFAULT_SESSION_ID for adapter sessions when no session is given', () => {
  const store = openStore({ workforceId: null });
  store.saveAdapterSession('nora', undefined, 'sdk-session-1');
  assert.equal(store.getAdapterSession('nora'), 'sdk-session-1');
  store.close();
});

test('resolveWorkforce reads the workforce id from CONSTITUTION.md\'s frontmatter, keyed to ~/.hire-juno', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-workforce-'));
  try {
    writeFileSync(join(dir, 'CONSTITUTION.md'), '---\nworkforce: acme\n---\n\n# Constitution\n');
    const workforce = resolveWorkforce(dir);
    assert.equal(workforce.id, 'acme');
    assert.match(workforce.baseDir, /\.hire-juno$/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveWorkforce also reads verfassung.md\'s "belegschaft" field, keyed to ~/.ki-belegschaft', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-workforce-'));
  try {
    writeFileSync(join(dir, 'verfassung.md'), '---\nbelegschaft: privat\n---\n\n# Verfassung\n');
    const workforce = resolveWorkforce(dir);
    assert.equal(workforce.id, 'privat');
    assert.match(workforce.baseDir, /\.ki-belegschaft$/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveWorkforce treats the unfilled placeholder as no ID', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-workforce-'));
  try {
    writeFileSync(join(dir, 'CONSTITUTION.md'), '---\nworkforce: <workforce-id>\n---\n\n# Constitution\n');
    assert.equal(resolveWorkforce(dir), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveWorkforce returns null when neither governance file exists', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-workforce-'));
  try {
    mkdirSync(dir, { recursive: true });
    assert.equal(resolveWorkforce(dir), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
