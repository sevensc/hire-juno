import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createGithubActions, ghError } from '../chat/server/githubActions.js';

function recorder(answers = {}) {
  const calls = [];
  const run = (cmd, args, opts, done) => {
    calls.push({ args, env: opts.env });
    const path = args[3];
    const answer = answers[`${args[2]} ${path}`];
    if (answer instanceof Error) return done(answer, '', answer.stderr || '');
    done(null, answer === undefined ? '' : JSON.stringify(answer), '');
  };
  return { run, calls };
}

const ref = { owner: 'acme', repo: 'web', kind: 'issue', number: 7 };

test('card actions call the right GitHub endpoints with the person\'s environment', async () => {
  const { run, calls } = recorder({ 'GET repos/acme/web/labels?per_page=100': [{ name: 'bug', color: 'd73a4a' }], 'GET repos/acme/web/assignees?per_page=100': [{ login: 'kim' }, { login: 'bad name' }] });
  const actions = createGithubActions({ run, env: () => ({ GH_TOKEN: 'own' }) });
  await actions.setState(ref, 'closed', 'not_planned');
  assert.deepEqual(calls[0].args.slice(1, 4), ['-X', 'PATCH', 'repos/acme/web/issues/7']);
  assert.ok(calls[0].args.includes('state=closed') && calls[0].args.includes('state_reason=not_planned'));
  assert.equal(calls[0].env.GH_TOKEN, 'own');
  await actions.setState({ ...ref, kind: 'pull' }, 'closed', 'not_planned');
  assert.ok(!calls[1].args.some((a) => a.startsWith('state_reason')), 'a PR has no close reason');
  await assert.rejects(actions.setState(ref, 'merged'), /Unknown state/);
  await actions.setLabels(ref, ['bug', 'bug', 'ui']);
  assert.deepEqual(calls[2].args.filter((a) => a.startsWith('labels[]=')), ['labels[]=bug', 'labels[]=ui']);
  await actions.setLabels(ref, []);
  assert.deepEqual(calls[3].args.slice(1, 4), ['-X', 'DELETE', 'repos/acme/web/issues/7/labels']);
  await actions.setAssignees(ref, ['kim', 'ben'], ['ben', 'ana']);
  assert.deepEqual(calls[4].args.slice(1, 4), ['-X', 'POST', 'repos/acme/web/issues/7/assignees']);
  assert.deepEqual(calls[4].args.filter((a) => a.startsWith('assignees[]=')), ['assignees[]=kim']);
  assert.deepEqual(calls[5].args.slice(1, 4), ['-X', 'DELETE', 'repos/acme/web/issues/7/assignees']);
  assert.deepEqual(calls[5].args.filter((a) => a.startsWith('assignees[]=')), ['assignees[]=ana']);
  assert.deepEqual(await actions.labelOptions(ref), [{ name: 'bug', color: 'd73a4a', description: '' }]);
  assert.deepEqual(await actions.assigneeOptions(ref), ['kim']);
  await assert.rejects(actions.move({ projectId: 'P', itemId: 'I', fieldId: 'F', optionId: 'bad id!' }), /Unknown board column/);
});

test('board columns come from the item\'s projects; GitHub errors are short and say when it is a permission', async () => {
  const nodes = [{ id: 'PVTI_1', project: { id: 'PVT_1', title: 'Board', field: { id: 'F1', options: [{ id: 'o1', name: 'Todo' }] } }, fieldValueByName: { optionId: 'o1' } }, { id: 'PVTI_2', project: { id: 'PVT_2', title: 'No status', field: null } }];
  const { run } = recorder({ 'POST graphql': { data: { repository: { issueOrPullRequest: { projectItems: { nodes } } } } } });
  const boards = await createGithubActions({ run }).boards(ref);
  assert.deepEqual(boards, [{ itemId: 'PVTI_1', projectId: 'PVT_1', title: 'Board', fieldId: 'F1', options: [{ id: 'o1', name: 'Todo' }], current: 'o1' }]);
  assert.equal(ghError('gh: Resource not accessible by integration (HTTP 403)'), 'Resource not accessible by integration (this GitHub account may not have the right permission)');
  assert.equal(ghError('gh: Validation Failed (HTTP 422)'), 'Validation Failed');
});
