// What the chat can do with an issue or pull request from its preview card:
// close or reopen it, set its labels and assignees, and move it to another
// column (the "Status" field) of a GitHub project board it is on. Every
// call goes through the GitHub CLI with the person's own token if they
// set one (githubAccount.js), so GitHub shows them as the one who did it;
// without a token, as whatever `gh` is signed in with on this machine.

import { execFile } from 'node:child_process';

const NAME = /^[^\n\r]{1,100}$/;
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NODE_ID = /^[A-Za-z0-9_=-]{1,100}$/;

// GitHub's own message from a failed `gh api` call, short.
export function ghError(stderr, err) {
  const text = String(stderr || err?.message || '').trim();
  const m = text.match(/gh: (.+?)(?: \(HTTP \d+\))?$/m) || text.match(/"message":\s*"([^"]+)"/);
  const message = (m ? m[1] : text.split('\n').pop() || 'GitHub did not accept that.').slice(0, 200);
  if (/Resource not accessible|Must have admin|403|insufficient|scope/i.test(text)) return `${message} (this GitHub account may not have the right permission)`;
  return message;
}

const STATUS_QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    issueOrPullRequest(number: $number) {
      ... on Issue { projectItems(first: 10) { nodes { ...item } } }
      ... on PullRequest { projectItems(first: 10) { nodes { ...item } } }
    }
  }
}
fragment item on ProjectV2Item {
  id
  project { id title field(name: "Status") { ... on ProjectV2SingleSelectField { id options { id name } } } }
  fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { optionId } }
}`;

const MOVE_MUTATION = `mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
  updateProjectV2ItemFieldValue(input: { projectId: $project, itemId: $item, fieldId: $field, value: { singleSelectOptionId: $option } }) { projectV2Item { id } }
}`;

// `run`: execFile, replaceable in tests; `env()`: the environment for `gh`.
export function createGithubActions({ run = execFile, env = () => undefined } = {}) {
  // fields: [[flag, 'key=value'], ...] as gh api takes them (-f raw, -F typed).
  const api = (method, path, fields = []) => new Promise((resolve, reject) => {
    const args = ['api', '-X', method, path, '-H', 'Accept: application/vnd.github+json', ...fields.flat()];
    run('gh', args, { env: env(), timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(ghError(stderr, err)));
      try {
        resolve(stdout && stdout.trim() ? JSON.parse(stdout) : null);
      } catch {
        resolve(null);
      }
    });
  });
  const issuePath = (ref) => `repos/${ref.owner}/${ref.repo}/issues/${ref.number}`;

  return {
    // state: 'closed' | 'open'; an issue can be closed as 'not_planned'.
    async setState(ref, state, reason = null) {
      if (state !== 'closed' && state !== 'open') throw new Error('Unknown state.');
      const fields = [['-f', `state=${state}`]];
      if (state === 'closed' && ref.kind === 'issue' && (reason === 'completed' || reason === 'not_planned')) fields.push(['-f', `state_reason=${reason}`]);
      await api('PATCH', issuePath(ref), fields);
    },

    async labelOptions(ref) {
      const list = await api('GET', `repos/${ref.owner}/${ref.repo}/labels?per_page=100`);
      return (list || []).map((l) => ({ name: String(l.name || ''), color: /^[0-9a-f]{6}$/i.test(l.color || '') ? l.color : null, description: String(l.description || '').slice(0, 120) }));
    },

    async setLabels(ref, names) {
      const clean = [...new Set((names || []).filter((n) => typeof n === 'string' && NAME.test(n)))].slice(0, 50);
      if (!clean.length) await api('DELETE', `${issuePath(ref)}/labels`);
      else await api('PUT', `${issuePath(ref)}/labels`, clean.map((n) => ['-f', `labels[]=${n}`]));
    },

    async assigneeOptions(ref) {
      const list = await api('GET', `repos/${ref.owner}/${ref.repo}/assignees?per_page=100`);
      return (list || []).map((u) => String(u.login || '')).filter((l) => LOGIN.test(l));
    },

    // Makes the assignees exactly `logins`, adding and removing as needed.
    async setAssignees(ref, logins, current) {
      const want = [...new Set((logins || []).filter((l) => typeof l === 'string' && LOGIN.test(l)))].slice(0, 10);
      const have = (current || []).filter((l) => LOGIN.test(l));
      const add = want.filter((l) => !have.includes(l));
      const remove = have.filter((l) => !want.includes(l));
      if (add.length) await api('POST', `${issuePath(ref)}/assignees`, add.map((l) => ['-f', `assignees[]=${l}`]));
      if (remove.length) await api('DELETE', `${issuePath(ref)}/assignees`, remove.map((l) => ['-f', `assignees[]=${l}`]));
    },

    // The project boards it is on, each with its "Status" column choices and
    // the current one: [{ itemId, projectId, title, fieldId, options, current }].
    async boards(ref) {
      const data = await api('POST', 'graphql', [['-f', `query=${STATUS_QUERY}`], ['-f', `owner=${ref.owner}`], ['-f', `repo=${ref.repo}`], ['-F', `number=${ref.number}`]]);
      const nodes = data?.data?.repository?.issueOrPullRequest?.projectItems?.nodes || [];
      return nodes
        .filter((n) => n?.project?.field?.id)
        .map((n) => ({
          itemId: n.id,
          projectId: n.project.id,
          title: String(n.project.title || ''),
          fieldId: n.project.field.id,
          options: (n.project.field.options || []).map((o) => ({ id: o.id, name: String(o.name || '') })),
          current: n.fieldValueByName?.optionId || null,
        }));
    },

    async move({ projectId, itemId, fieldId, optionId }) {
      if (![projectId, itemId, fieldId, optionId].every((v) => typeof v === 'string' && NODE_ID.test(v))) throw new Error('Unknown board column.');
      await api('POST', 'graphql', [['-f', `query=${MOVE_MUTATION}`], ['-f', `project=${projectId}`], ['-f', `item=${itemId}`], ['-f', `field=${fieldId}`], ['-f', `option=${optionId}`]]);
    },
  };
}
