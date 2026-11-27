import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  adoptCliSession,
  cliProjectDir,
  cliSessionInfo,
  createHandovers,
  isSessionUuid,
  listCliSessions,
  shellQuote,
  transferToTerminal,
} from '../chat/server/cliSession.js';

const ID = '5b3f2c1a-8d4e-4f6b-9a7c-2e1d0f9b8a6c';

test('builds the resume and fork commands', () => {
  const info = cliSessionInfo({ sdkSessionId: ID, cwd: '/work/repo' });
  assert.deepEqual(info, {
    available: true,
    sessionId: ID,
    cwd: '/work/repo',
    resumeCommand: `cd '/work/repo' && claude --resume ${ID}`,
    forkCommand: `cd '/work/repo' && claude --resume ${ID} --fork-session`,
  });
});

test('quotes paths with spaces and single quotes so the shell sees one word', () => {
  assert.equal(shellQuote("/work/it's here"), `'/work/it'\\''s here'`);
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'cli-session-')));
  try {
    const dir = join(base, "my repo's $HOME");
    mkdirSync(dir);
    const { resumeCommand } = cliSessionInfo({ sdkSessionId: ID, cwd: dir });
    // The command's own `cd ... &&` part, with `claude ...` swapped for pwd.
    const out = execFileSync('sh', ['-c', resumeCommand.replace(/claude .*$/, 'pwd')], { encoding: 'utf8' }).trim();
    assert.equal(out, dir);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('only a uuid counts as a session id', () => {
  assert.ok(isSessionUuid(ID));
  for (const bad of ['', 'abc', `${ID}; rm -rf /`, `${ID} `, "x' && echo hi", null, undefined, 42]) {
    assert.equal(isSessionUuid(bad), false, String(bad));
    assert.equal(cliSessionInfo({ sdkSessionId: bad, cwd: '/work/repo' }).available, false);
  }
});

test('not available without a saved session or a folder', () => {
  const off = { available: false, sessionId: null, cwd: null, resumeCommand: null, forkCommand: null };
  assert.deepEqual(cliSessionInfo({ sdkSessionId: null, cwd: '/work/repo' }), off);
  assert.deepEqual(cliSessionInfo({ sdkSessionId: ID, cwd: '' }), off);
});

test('handing over closes the adapter and marks the conversation', () => {
  const handovers = createHandovers();
  let closed = 0;
  const adapter = { busy: false, close: () => closed++ };
  assert.deepEqual(transferToTerminal({ handovers, key: 'a::default', adapter }), { ok: true });
  assert.equal(closed, 1);
  assert.ok(handovers.has('a::default'));
  assert.equal(handovers.has('a::other'), false);
  handovers.remove('a::default');
  assert.equal(handovers.has('a::default'), false);
});

test('handing over is refused while she answers, and without an adapter it still marks', () => {
  const handovers = createHandovers();
  let closed = 0;
  const result = transferToTerminal({ handovers, key: 'a::default', adapter: { busy: true, close: () => closed++ } });
  assert.equal(result.ok, false);
  assert.match(result.message, /still answering/);
  assert.equal(closed, 0);
  assert.equal(handovers.has('a::default'), false);
  assert.deepEqual(transferToTerminal({ handovers, key: 'a::default', adapter: undefined }), { ok: true });
  assert.ok(handovers.has('a::default'));
});

const OTHER = '7c1e9a2b-3d4f-4a5b-8c6d-9e0f1a2b3c4d';
const SDK = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';

function writeSession(dir, id, lines, mtimeSeconds) {
  const file = join(dir, `${id}.jsonl`);
  writeFileSync(file, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  utimesSync(file, mtimeSeconds, mtimeSeconds);
}

function withProjects(fn) {
  const configDir = realpathSync(mkdtempSync(join(tmpdir(), 'cli-config-')));
  try {
    const cwd = '/work/my.repo';
    const dir = cliProjectDir(cwd, configDir);
    mkdirSync(dir, { recursive: true });
    fn({ configDir, cwd, dir });
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}

test('the project folder replaces every non-alphanumeric character with a dash', () => {
  assert.equal(cliProjectDir('/Users/a/.x/my_repo', '/cfg'), join('/cfg', 'projects', '-Users-a--x-my-repo'));
});

test('lists terminal sessions newest first, without sdk sessions and excluded ids', () => {
  withProjects(({ configDir, cwd, dir }) => {
    const user = (text, extra = {}) => ({ type: 'user', entrypoint: 'cli', message: { role: 'user', content: text }, ...extra });
    writeSession(dir, ID, [
      { type: 'agent-setting', agentSetting: 'juno' },
      user('<command-name>/clear</command-name>'),
      user('caveat', { isMeta: true }),
      user('Look at the onboarding flow'),
      { type: 'last-prompt', lastPrompt: 'Ready to ship?' },
    ], 2000);
    writeSession(dir, OTHER, [user([{ type: 'text', text: 'Older one' }])], 1000);
    writeSession(dir, SDK, [{ type: 'user', entrypoint: 'sdk-ts', message: { role: 'user', content: 'From the chat' } }], 3000);
    writeFileSync(join(dir, 'not-a-session.jsonl'), '{}\n');

    const sessions = listCliSessions({ cwd, configDir });
    assert.deepEqual(sessions.map((s) => s.id), [ID, OTHER]);
    assert.equal(sessions[0].agent, 'juno');
    assert.equal(sessions[0].firstPrompt, 'Look at the onboarding flow');
    assert.equal(sessions[0].lastPrompt, 'Ready to ship?');
    assert.equal(sessions[1].lastPrompt, 'Older one');

    assert.deepEqual(listCliSessions({ cwd, configDir, exclude: [ID] }).map((s) => s.id), [OTHER]);
    assert.deepEqual(listCliSessions({ cwd, configDir, limit: 1 }).map((s) => s.id), [ID]);
    assert.deepEqual(listCliSessions({ cwd: '/elsewhere', configDir }), []);
  });
});

test('taking over saves the id, closes the running adapter and ends a handover', () => {
  const saved = [];
  const store = { saveAdapterSession: (...args) => saved.push(args) };
  const handovers = createHandovers();
  handovers.add('juno::default');
  let closed = 0;
  const adapters = new Map([['juno::default', { busy: false, close: () => closed++ }]]);
  const base = { store, handovers, adapters, key: 'juno::default', colleagueId: 'juno', sessionId: 'default', offered: [{ id: ID }] };

  assert.equal(adoptCliSession({ ...base, sdkSessionId: OTHER }).ok, false, 'not offered');
  assert.equal(adoptCliSession({ ...base, sdkSessionId: 'x; rm -rf /' }).ok, false, 'not a uuid');
  assert.deepEqual(saved, []);

  assert.deepEqual(adoptCliSession({ ...base, sdkSessionId: ID }), { ok: true });
  assert.deepEqual(saved, [['juno', 'default', ID]]);
  assert.equal(closed, 1);
  assert.equal(adapters.has('juno::default'), false);
  assert.equal(handovers.has('juno::default'), false);
});

test('taking over is refused while she is answering', () => {
  const saved = [];
  const adapters = new Map([['juno::default', { busy: true, close: () => {} }]]);
  const result = adoptCliSession({
    store: { saveAdapterSession: (...args) => saved.push(args) },
    handovers: createHandovers(),
    adapters,
    key: 'juno::default',
    colleagueId: 'juno',
    sessionId: 'default',
    sdkSessionId: ID,
    offered: [{ id: ID }],
  });
  assert.equal(result.ok, false);
  assert.deepEqual(saved, []);
  assert.ok(adapters.has('juno::default'));
});
