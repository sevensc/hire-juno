import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { cliSessionInfo, createHandovers, isSessionUuid, shellQuote, transferToTerminal } from '../chat/server/cliSession.js';

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
