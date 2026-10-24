import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ClaudeAdapter } from '../chat/server/adapters/claude.js';
import { createPermissions, VIA_ALLOW_ALL, VIA_ALWAYS_ALLOW } from '../chat/server/permissions.js';

const ONE = 'alex::default';
const OTHER = 'alex::s2';
const MEMBER = 'alex::chan-1';

test('nothing is allowed ahead of time at first', () => {
  const p = createPermissions();
  assert.equal(p.decide(ONE, 'Bash'), null);
  assert.deepEqual(p.snapshot(), []);
});

test('allow all tools covers every tool, for that conversation only', () => {
  const p = createPermissions();
  p.setAllowAll(ONE, true);
  assert.equal(p.decide(ONE, 'Bash'), VIA_ALLOW_ALL);
  assert.equal(p.decide(ONE, 'mcp__x__y'), VIA_ALLOW_ALL);
  assert.equal(p.decide(OTHER, 'Bash'), null);
});

test('always allow covers one tool, for that conversation only', () => {
  const p = createPermissions();
  p.setAlwaysAllow(ONE, 'Bash', true);
  assert.equal(p.decide(ONE, 'Bash'), VIA_ALWAYS_ALLOW);
  assert.equal(p.decide(ONE, 'Edit'), null);
  assert.equal(p.decide(OTHER, 'Bash'), null);
});

test('a channel member has her own state, apart from her 1:1 sessions', () => {
  const p = createPermissions();
  p.setAllowAll(MEMBER, true);
  assert.equal(p.decide(MEMBER, 'Bash'), VIA_ALLOW_ALL);
  assert.equal(p.decide(ONE, 'Bash'), null);
});

test('turning allow all tools off keeps the single always-allow entries', () => {
  const p = createPermissions();
  p.setAllowAll(ONE, true);
  p.setAlwaysAllow(ONE, 'WebFetch', true);
  p.setAllowAll(ONE, false);
  assert.equal(p.decide(ONE, 'Bash'), null);
  assert.equal(p.decide(ONE, 'WebFetch'), VIA_ALWAYS_ALLOW);
});

test('revoking asks again and drops the entry from the state', () => {
  const p = createPermissions();
  p.setAlwaysAllow(ONE, 'Bash', true);
  p.setAlwaysAllow(ONE, 'Bash', false);
  assert.equal(p.decide(ONE, 'Bash'), null);
  assert.deepEqual(p.snapshot(), []);
  assert.deepEqual(p.stateFor(ONE), { key: ONE, allowAll: false, tools: [] });
});

test('snapshot lists every conversation with something set', () => {
  const p = createPermissions();
  p.setAllowAll(ONE, true);
  p.setAlwaysAllow(OTHER, 'Edit', true);
  p.setAlwaysAllow(OTHER, 'Bash', true);
  const byKey = Object.fromEntries(p.snapshot().map((s) => [s.key, s]));
  assert.deepEqual(byKey[ONE], { key: ONE, allowAll: true, tools: [] });
  assert.deepEqual(byKey[OTHER], { key: OTHER, allowAll: false, tools: ['Bash', 'Edit'] });
});

test('a bad tool name is ignored', () => {
  const p = createPermissions();
  p.setAlwaysAllow(ONE, '', true);
  p.setAlwaysAllow(ONE, undefined, true);
  assert.deepEqual(p.snapshot(), []);
});

test('a new instance, as after a server restart, starts empty', () => {
  const before = createPermissions();
  before.setAllowAll(ONE, true);
  before.setAlwaysAllow(ONE, 'Bash', true);
  const after = createPermissions();
  assert.equal(after.decide(ONE, 'Bash'), null);
  assert.deepEqual(after.snapshot(), []);
});

test('an automatically answered request is recorded with its source', async () => {
  const p = createPermissions();
  p.setAlwaysAllow(ONE, 'Bash', true);
  const a = Object.create(ClaudeAdapter.prototype);
  a._approvals = new Map();
  a.onPermissionRequest = async (request) => {
    const via = p.decide(ONE, request.toolName);
    return via ? { allow: true, via } : { allow: false };
  };
  const result = await a._handlePermission('Bash', {}, { toolUseID: 't1' });
  assert.deepEqual(result, { behavior: 'allow' });
  assert.equal(a._approvals.get('t1'), 'always allow');
});
