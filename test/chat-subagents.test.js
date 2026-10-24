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

const PLACEHOLDER = 'This agent\'s report was delivered to you as a message from "abc" (its SubagentHandback call). Read it there; it is not repeated here.';
const handback = { type: 'tool_use', name: 'SubagentHandback', input: { message: 'The real report' } };

test('a placeholder report is replaced by the text of the SubagentHandback call', () => {
  const t = new SubagentTracker();
  assert.equal(t.rememberHandback('a', handback), 'The real report');
  assert.equal(t.resolveReport('a', PLACEHOLDER), 'The real report');
  assert.equal(t.resolveReport('a', 'A real report from the result'), 'A real report from the result');
});

test('without a handback the placeholder and any other report stay as they are', () => {
  const t = new SubagentTracker();
  assert.equal(t.rememberHandback('a', { type: 'tool_use', name: 'Read', input: { message: 'x' } }), undefined);
  assert.equal(t.rememberHandback('a', { type: 'tool_use', name: 'SubagentHandback', input: {} }), undefined);
  assert.equal(t.resolveReport('a', PLACEHOLDER), PLACEHOLDER);
  assert.equal(t.resolveReport('a', 'plain'), 'plain');
});

test('a background sub-agent notification with the placeholder ends with the handback text', () => {
  const t = new SubagentTracker();
  t.noteSystemMessage({ subtype: 'task_started', tool_use_id: 'a', is_backgrounded: true });
  t.rememberHandback('a', handback);
  assert.deepEqual(
    t.endFromNotification({ subtype: 'task_notification', tool_use_id: 'a', status: 'completed', summary: PLACEHOLDER }),
    { id: 'a', report: 'The real report' }
  );
});

test('a SendMessage to a sub-agent lands in that sub-agent\'s window, found through the agent id of its launch', () => {
  const t = new SubagentTracker();
  const send = { type: 'tool_use', id: 's1', name: 'SendMessage', input: { to: 'a123', message: 'Go on, Sven agreed.', summary: 'go on' } };
  assert.equal(t.messageTo(send), null); // launch not seen yet
  t.rememberLaunch('toolu_1', { isAsync: true, status: 'async_launched', agentId: 'a123' });
  assert.deepEqual(t.messageTo(send), { id: 'toolu_1', text: 'Go on, Sven agreed.' });
});

test('SendMessage to someone else, without text, or other tools are not sub-agent messages', () => {
  const t = new SubagentTracker();
  t.rememberLaunch('toolu_1', { agentId: 'a123' });
  assert.equal(t.messageTo({ type: 'tool_use', name: 'SendMessage', input: { to: 'researcher', message: 'hi' } }), null);
  assert.equal(t.messageTo({ type: 'tool_use', name: 'SendMessage', input: { to: 'a123', message: '  ' } }), null);
  assert.equal(t.messageTo({ type: 'tool_use', name: 'Bash', input: { to: 'a123', message: 'hi' } }), null);
  t.rememberLaunch('toolu_2', 'not an object');
  t.rememberLaunch('toolu_3', { agentId: 42 });
  t.rememberLaunch(undefined, { agentId: 'a999' });
  assert.equal(t.messageTo({ type: 'tool_use', name: 'SendMessage', input: { to: 'a999', message: 'hi' } }), null);
});
