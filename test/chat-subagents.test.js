import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SubagentTracker } from '../chat/server/adapters/subagents.js';

const agentCall = { type: 'tool_use', id: 'toolu_1', name: 'Agent', input: { description: 'd', prompt: 'Do the thing', run_in_background: true } };

test('the brief of a sub-agent is the prompt of the call that started it', () => {
  const t = new SubagentTracker();
  t.rememberToolUse(agentCall);
  t.rememberToolUse({ type: 'tool_use', id: 'toolu_2', name: 'Task', input: { prompt: 'Old name' } });
  t.rememberToolUse({ type: 'tool_use', id: 'toolu_3', name: 'Bash', input: { prompt: 'not an agent' } });
  assert.equal(t.brief('toolu_1'), 'Do the thing');
  assert.equal(t.brief('toolu_2'), 'Old name');
  assert.equal(t.brief('toolu_3'), undefined);
  assert.equal(t.brief('nope'), undefined);
});

test('a background sub-agent ends with its notification, not with its launch notice', () => {
  const t = new SubagentTracker();
  t.rememberToolUse(agentCall);
  t.noteSystemMessage({ subtype: 'task_started', tool_use_id: 'toolu_1', is_backgrounded: true });
  assert.equal(t.isBackground('toolu_1'), true);
  assert.deepEqual(
    t.endFromNotification({ subtype: 'task_notification', tool_use_id: 'toolu_1', status: 'completed', summary: 'SUBDONE' }),
    { id: 'toolu_1', report: 'SUBDONE' }
  );
  assert.equal(t.isBackground('toolu_1'), false);
  assert.equal(t.brief('toolu_1'), undefined);
});

test('a failed or stopped background sub-agent says so in its report', () => {
  const t = new SubagentTracker();
  t.noteSystemMessage({ subtype: 'task_started', tool_use_id: 'a', is_backgrounded: true });
  assert.deepEqual(t.endFromNotification({ subtype: 'task_notification', tool_use_id: 'a', status: 'failed', summary: 'no access' }), { id: 'a', report: '(failed) no access' });
});

test('a foreground sub-agent, other subtypes and unknown ids end nothing here', () => {
  const t = new SubagentTracker();
  t.noteSystemMessage({ subtype: 'task_started', tool_use_id: 'fg', is_backgrounded: false });
  assert.equal(t.endFromNotification({ subtype: 'task_notification', tool_use_id: 'fg', status: 'completed', summary: 'x' }), null);
  assert.equal(t.endFromNotification({ subtype: 'task_updated', tool_use_id: 'fg' }), null);
  assert.equal(t.endFromNotification({ subtype: 'task_notification', tool_use_id: 'other', status: 'completed', summary: 'x' }), null);
  assert.equal(t.endFromNotification({ subtype: 'task_notification', status: 'completed', summary: 'x' }), null);
});
