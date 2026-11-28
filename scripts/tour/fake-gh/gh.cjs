// (run through fake-gh/gh, a shell wrapper; .cjs because the repo is ESM)
// A stand-in for the GitHub CLI for the feature tour: the made-up
// organisation "sample-studio" with three repositories, a few issues and
// pull requests, labels, a project board and search. Nothing goes to the
// network. Changes (close, labels, assignees, board column) are kept in
// $TOUR_STATE (a JSON file). `gh repo clone` clones the local repositories
// under $TOUR_BARE (made by scripts/tour/setup.mjs).
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const stateFile = process.env.TOUR_STATE || path.join(__dirname, 'state.json');
const now = Date.now();
const ago = (minutes) => new Date(now - minutes * 60000).toISOString();

const LABELS = [
  { name: 'bug', color: 'd73a4a', description: 'Something does not work' },
  { name: 'feature', color: 'a2eeef', description: 'New functionality' },
  { name: 'design', color: 'c5a3ff', description: 'Needs a design review' },
  { name: 'docs', color: '0075ca', description: 'Documentation' },
];
const REPOS = [
  { nameWithOwner: 'sample-studio/website', description: 'The studio website', isPrivate: false, defaultBranchRef: { name: 'main' }, pushedAt: ago(12) },
  { nameWithOwner: 'sample-studio/mobile-app', description: 'The studio app', isPrivate: true, defaultBranchRef: { name: 'main' }, pushedAt: ago(90) },
  { nameWithOwner: 'sample-studio/brand-kit', description: 'Logos, colours, icons', isPrivate: false, defaultBranchRef: { name: 'main' }, pushedAt: ago(600) },
];
const ITEMS = [
  { repo: 'website', number: 12, title: 'Contact form drops the last line of a message', state: 'open', labels: ['bug'], assignees: ['robin'], user: 'jo', comments: 3, updated: 40, body: 'A message with several lines arrives without its last line. Seen in Safari and Firefox.', status: 'opt-progress' },
  { repo: 'website', number: 18, pull: true, title: 'Fix line breaks in the contact form', state: 'open', labels: ['bug'], assignees: ['robin'], reviewers: ['robin'], user: 'robin', comments: 1, updated: 15, body: 'Keeps every line of a message and adds a test for it. Fixes #12.', additions: 24, deletions: 6, files: 2, head: 'fix/contact-form-lines', status: 'opt-progress' },
  { repo: 'website', number: 9, pull: true, title: 'New pricing page', state: 'closed', merged: true, labels: ['feature'], assignees: [], user: 'robin', comments: 4, updated: 2900, body: 'Three plans, monthly and yearly.', additions: 310, deletions: 40, files: 7, head: 'feat/pricing', status: 'opt-done' },
  { repo: 'mobile-app', number: 7, title: 'Dark mode for the settings screen', state: 'open', labels: ['feature', 'design'], assignees: ['robin'], user: 'jo', comments: 2, updated: 200, body: 'The settings screen still ignores the dark mode of the phone.', status: 'opt-todo' },
  { repo: 'brand-kit', number: 3, title: 'Review the new icon set', state: 'open', labels: ['design'], assignees: ['jo'], user: 'jo', comments: 0, updated: 300, body: 'Twelve new icons for the app; please check stroke widths and corners.', status: 'opt-todo' },
];

function load() {
  try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return {}; }
}
const state = load();
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state));
const key = (it) => `${it.repo}#${it.number}`;
const live = (it) => ({ ...it, ...(state[key(it)] || {}) });
const find = (repo, number) => ITEMS.find((it) => it.repo === repo && it.number === Number(number));
const issueJson = (raw) => {
  const it = live(raw);
  return {
    number: it.number, title: it.title, state: it.state, state_reason: it.state === 'closed' && !it.pull ? 'completed' : null,
    user: { login: it.user }, assignees: it.assignees.map((login) => ({ login })),
    labels: it.labels.map((n) => LABELS.find((l) => l.name === n) || { name: n }), comments: it.comments,
    updated_at: ago(it.updated), body: it.body, html_url: `https://github.com/sample-studio/${it.repo}/${it.pull ? 'pull' : 'issues'}/${it.number}`,
    repository_url: `https://api.github.com/repos/sample-studio/${it.repo}`,
    ...(it.pull ? { pull_request: { merged_at: it.merged ? ago(it.updated) : null } } : {}),
  };
};
const out = (o) => process.stdout.write(JSON.stringify(o));
const fail = (msg) => { process.stderr.write(`gh: ${msg}\n`); process.exit(1); };

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
const fields = [];
for (let i = 0; i < args.length; i++) if (args[i] === '-f' || args[i] === '-F') fields.push(args[i + 1]);
const field = (name) => fields.find((f) => f.startsWith(`${name}=`))?.slice(name.length + 1);

if (args[0] === 'repo' && args[1] === 'list') { out(REPOS); process.exit(0); }
if (args[0] === 'repo' && args[1] === 'clone') {
  const slug = args[2];
  const dir = args[3];
  const name = slug.split('/')[1];
  execFileSync('git', ['clone', '--quiet', `https://github.com/${slug}.git`, dir], { stdio: 'inherit' });
  process.exit(0);
}
if (args[0] === 'pr' && args[1] === 'list') { out([]); process.exit(0); }
if (args[0] !== 'api') fail('not supported in the tour');

const method = flag('-X') || 'GET';
const target = args.find((a, i) => i > 0 && !a.startsWith('-') && !['-X', '-H', '-f', '-F', '--jq'].includes(args[i - 1]));
const me = process.env.TOUR_USER || 'robin';
if (target === 'user') { process.stdout.write(args.includes('--jq') ? `${me}\n` : JSON.stringify({ login: me })); process.exit(0); }

let m;
if ((m = target.match(/^repos\/sample-studio\/([^/]+)\/(issues|pulls)\/(\d+)$/))) {
  const it = find(m[1], m[3]);
  if (!it) fail('Not Found (HTTP 404)');
  if (method === 'PATCH') {
    const s = (state[key(it)] ||= {});
    if (field('state')) s.state = field('state');
    s.updated = 0;
    save();
  }
  if (m[2] === 'pulls') {
    const l = live(it);
    out({ merged: Boolean(l.merged), draft: false, additions: l.additions, deletions: l.deletions, changed_files: l.files, head: { ref: l.head }, base: { ref: 'main' } });
  } else out(issueJson(it));
  process.exit(0);
}
if ((m = target.match(/^repos\/sample-studio\/([^/]+)\/labels/))) { out(LABELS); process.exit(0); }
if ((m = target.match(/^repos\/sample-studio\/([^/]+)\/assignees/))) { out([{ login: 'robin' }, { login: 'jo' }]); process.exit(0); }
if ((m = target.match(/^repos\/sample-studio\/([^/]+)\/issues\/(\d+)\/(labels|assignees)$/))) {
  const it = find(m[1], m[2]);
  if (!it) fail('Not Found (HTTP 404)');
  const s = (state[key(it)] ||= {});
  const values = fields.filter((f) => f.startsWith(`${m[3]}[]=`)).map((f) => f.split('=')[1]);
  if (m[3] === 'labels') s.labels = method === 'DELETE' ? [] : values;
  else {
    const current = live(it).assignees;
    s.assignees = method === 'DELETE' ? current.filter((a) => !values.includes(a)) : [...new Set([...current, ...values])];
  }
  s.updated = 0;
  save();
  out(issueJson(it));
  process.exit(0);
}
if (target === 'search/issues') {
  const q = (field('q') || '').toLowerCase();
  const words = q.split(/\s+/).filter((w) => w && !w.includes(':'));
  const wantPr = q.includes('is:pr');
  const openOnly = q.includes('is:open');
  const assignee = (q.match(/assignee:(\S+)/) || [])[1];
  const reviewer = (q.match(/review-requested:(\S+)/) || [])[1];
  const items = ITEMS.map(live).filter((it) => Boolean(it.pull) === wantPr
    && (!openOnly || it.state === 'open')
    && (!assignee || it.assignees.includes(assignee))
    && (!reviewer || (it.reviewers || []).includes(reviewer))
    && words.every((w) => `${it.title} ${it.body}`.toLowerCase().includes(w)))
    .sort((a, b) => a.updated - b.updated)
    .map((it) => ({ ...issueJson(it), draft: false }));
  out({ items });
  process.exit(0);
}
if (target === 'graphql') {
  const query = field('query') || '';
  if (query.includes('mutation')) {
    const it = ITEMS.find((x) => `PVTI_${x.repo}_${x.number}` === field('item'));
    if (it) { (state[key(it)] ||= {}).status = field('option'); save(); }
    out({ data: {} });
    process.exit(0);
  }
  const it = find(field('repo'), field('number'));
  const nodes = it ? [{ id: `PVTI_${it.repo}_${it.number}`, project: { id: 'PVT_studio', title: 'Studio board', field: { id: 'PVTSSF_status', options: [
    { id: 'opt-todo', name: 'Todo' }, { id: 'opt-progress', name: 'In progress' }, { id: 'opt-review', name: 'In review' }, { id: 'opt-done', name: 'Done' },
  ] } }, fieldValueByName: { optionId: live(it).status } }] : [];
  out({ data: { repository: { issueOrPullRequest: { projectItems: { nodes } } } } });
  process.exit(0);
}
fail('Not Found (HTTP 404)');
