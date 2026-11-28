import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { ScriptedAdapter, loadScript, pickRule } from '../chat/server/adapters/scripted.js';

test('the scripted colleague plays the matching rule, once where asked, with real paths and permission checks', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'scripted-'));
  try {
    const file = join(dir, 'script.json');
    writeFileSync(file, JSON.stringify({
      speed: 20,
      rules: [
        { colleague: 'kim', match: 'hello', once: true, steps: [{ think: 'hm' }, { tool: { name: 'Edit', input: { file_path: 'WORKTREE/web/a.txt' } }, ask: true }, { say: 'Hi there' }] },
        { match: 'hello', steps: [{ say: 'Hello again' }] },
      ],
      fallback: 'Noted.',
    }));
    const script = loadScript(file);
    assert.equal(pickRule(script, 'kim', 'Hello!').index, 0);
    assert.equal(pickRule(script, 'kim', 'Hello!', new Set([0])).index, 1);
    assert.equal(pickRule(script, 'kim', 'something else'), null);
    const adapter = new ScriptedAdapter({ id: 'kim', name: 'Kim' }, { scriptFile: file, cwd: dir, worktrees: [{ path: '/w/kim-1--acme-web', branch: 'chat/kim-1' }] });
    const updates = [];
    const asked = [];
    adapter.onUpdate = (u) => updates.push(u);
    adapter.onPermissionRequest = async (request) => { asked.push(request); return { allow: true, via: 'own worktree' }; };
    await adapter.sendMessage('hello');
    assert.equal(asked[0].input.file_path, '/w/kim-1--acme-web/a.txt');
    assert.deepEqual(updates.filter((u) => u.type === 'tool_done').map((u) => u.approval), ['own worktree']);
    assert.ok(updates.some((u) => u.type === 'thinking_delta'));
    assert.equal(updates.filter((u) => u.type === 'message').pop().text, 'Hi there');
    await adapter.sendMessage('hello');
    assert.equal(updates.filter((u) => u.type === 'message').pop().text, 'Hello again', 'the once-rule is used up');
    await adapter.sendMessage('anything');
    assert.equal(updates.filter((u) => u.type === 'message').pop().text, 'Noted.');
    assert.equal(adapter.busy, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
