import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bodyExcerpt, cleanRef, createGithubPreviews, createGithubSearch, githubOwnerOf, previewFrom, searchQuery } from '../chat/server/githubPreview.js';
import { githubRef, githubRefs, relativeTime } from '../chat/src/github-links.js';

test('GitHub links: only issues and pull requests, each once, a few at most', () => {
  assert.deepEqual(githubRef('https://github.com/acme/web-app/pull/12/files#diff-1'), { owner: 'acme', repo: 'web-app', kind: 'pull', number: 12, url: 'https://github.com/acme/web-app/pull/12' });
  assert.equal(githubRef('https://github.com/acme/web-app/issues/7').kind, 'issue');
  for (const href of ['https://github.com/acme/web-app', 'https://github.com/acme/web-app/blob/main/x.js', 'https://gitlab.com/acme/web-app/issues/1', 'https://github.com/acme/web-app/pull/abc', 'https://github.com/-bad/x/issues/1', 'javascript:alert(1)']) {
    assert.equal(githubRef(href), null, href);
  }
  const text = 'See https://github.com/acme/web-app/pull/12, and https://github.com/acme/web-app/pull/12/files and (https://github.com/acme/api/issues/3).';
  assert.deepEqual(githubRefs(text).map((r) => `${r.repo}#${r.number}`), ['web-app#12', 'api#3']);
  const many = [1, 2, 3, 4, 5].map((n) => `https://github.com/acme/a/issues/${n}`).join(' ');
  assert.equal(githubRefs(many).length, 3);
});

test('GitHub previews: requests are checked, data is shaped for the card', () => {
  assert.deepEqual(cleanRef({ owner: 'acme', repo: 'web.app', kind: 'pull', number: '5' }), { owner: 'acme', repo: 'web.app', kind: 'pull', number: 5 });
  for (const bad of [{ owner: 'acme', repo: '..', kind: 'pull', number: '5' }, { owner: 'a/b', repo: 'x', kind: 'pull', number: '5' }, { owner: 'acme', repo: 'x', kind: 'commit', number: '5' }, { owner: 'acme', repo: 'x', kind: 'issue', number: '0' }, { owner: 'acme', repo: 'x', kind: 'issue', number: '1.5' }]) {
    assert.equal(cleanRef(bad), null, JSON.stringify(bad));
  }
  assert.equal(bodyExcerpt('<!-- hidden -->\n## What\n\nFixes the **login** [page](https://x.y).\n\n```js\ncode()\n```\nDone'), 'Fixes the login page. Done');
  const ref = { owner: 'acme', repo: 'web', kind: 'pull', number: 9 };
  const issue = { title: 'Add search', state: 'open', user: { login: 'kim' }, labels: [{ name: 'feature', color: 'a2eeef' }, { name: 'odd', color: 'zz' }], comments: 2, updated_at: '2026-01-01T00:00:00Z', body: 'Adds search.', pull_request: {} };
  const pull = { merged: false, draft: true, additions: 30, deletions: 4, changed_files: 3, head: { ref: 'feat/search' }, base: { ref: 'main' } };
  const p = previewFrom(ref, issue, pull);
  assert.equal(p.kind, 'pull');
  assert.equal(p.state, 'draft');
  assert.deepEqual(p.labels, [{ name: 'feature', color: 'a2eeef' }, { name: 'odd', color: null }]);
  assert.equal(p.head, 'feat/search');
  assert.equal(previewFrom(ref, { ...issue, state: 'closed' }, { ...pull, merged: true }).state, 'merged');
  assert.equal(previewFrom({ ...ref, kind: 'issue' }, { ...issue, pull_request: undefined, state: 'closed', state_reason: 'not_planned' }).reason, 'not_planned');
});

test('GitHub previews come from `gh api`, are cached, and fail quietly', async () => {
  const calls = [];
  let clock = 0;
  const run = (cmd, args, opts, done) => {
    calls.push([cmd, ...args].join(' '));
    const path = args[args.length - 1];
    if (path.endsWith('/issues/1')) return done(null, JSON.stringify({ title: 'Bug', state: 'open', user: { login: 'ana' }, labels: [], comments: 0 }));
    if (path.endsWith('/issues/2')) return done(null, JSON.stringify({ title: 'PR', state: 'closed', labels: [], pull_request: { merged_at: 'x' } }));
    if (path.endsWith('/pulls/2')) return done(null, JSON.stringify({ merged: true, additions: 1, deletions: 2, changed_files: 1 }));
    return done(Object.assign(new Error('HTTP 404'), { code: 1 }));
  };
  const preview = createGithubPreviews({ run, now: () => clock });
  assert.equal((await preview({ owner: 'acme', repo: 'x', kind: 'issue', number: 1 })).title, 'Bug');
  assert.equal((await preview({ owner: 'acme', repo: 'x', kind: 'issue', number: 1 })).title, 'Bug');
  assert.equal(calls.length, 1, 'second request from the cache');
  const pr = await preview({ owner: 'acme', repo: 'x', kind: 'pull', number: 2 });
  assert.equal(pr.state, 'merged');
  assert.equal(pr.additions, 1);
  assert.deepEqual(await preview({ owner: 'acme', repo: 'x', kind: 'issue', number: 3 }), { error: 'not_found' });
  clock += 31000;
  await preview({ owner: 'acme', repo: 'x', kind: 'issue', number: 3 });
  assert.equal(calls.filter((c) => c.endsWith('/issues/3')).length, 2, 'a failure is asked again after a while');
  assert.ok(calls.every((c) => c.startsWith('gh api ')));
  const missing = createGithubPreviews({ run: (c, a, o, done) => done(Object.assign(new Error('spawn gh ENOENT'), { code: 'ENOENT' })) });
  assert.deepEqual(await missing({ owner: 'acme', repo: 'x', kind: 'issue', number: 1 }), { error: 'unavailable' });
});

test('relative times for the card', () => {
  const now = Date.parse('2026-01-10T12:00:00Z');
  assert.equal(relativeTime('2026-01-10T11:59:30Z', now), 'just now');
  assert.equal(relativeTime('2026-01-10T11:00:00Z', now), '1 h ago');
  assert.equal(relativeTime('2026-01-09T12:00:00Z', now), '1 day ago');
  assert.equal(relativeTime('nonsense', now), '');
});

test('GitHub search: the account of the repo, the kind, and results shaped for the list', async () => {
  assert.equal(githubOwnerOf('git@github.com:acme/web.git'), 'acme');
  assert.equal(githubOwnerOf('https://github.com/acme/web\n'), 'acme');
  assert.equal(githubOwnerOf('https://gitlab.com/acme/web.git'), null);
  assert.equal(searchQuery('  login   bug ', 'issue', 'acme'), 'login bug is:issue user:acme');
  assert.equal(searchQuery('flaky repo:other/x', 'pull', 'acme'), 'flaky repo:other/x is:pr');
  assert.equal(searchQuery('x', 'pull', null), 'x is:pr');
  const calls = [];
  const run = (cmd, args, opts, done) => {
    calls.push(args);
    done(null, JSON.stringify({ items: [
      { repository_url: 'https://api.github.com/repos/acme/web', number: 4, title: 'Fix', state: 'closed', html_url: 'https://github.com/acme/web/pull/4', pull_request: { merged_at: 'x' }, updated_at: 't' },
      { repository_url: 'https://api.github.com/repos/acme/web', number: 5, title: 'Bad', state: 'open', html_url: 'javascript:x' },
    ] }));
  };
  const search = createGithubSearch({ run });
  const found = await search('fix', 'pull', 'acme');
  assert.deepEqual(found.results, [{ owner: 'acme', repo: 'web', number: 4, kind: 'pull', title: 'Fix', state: 'merged', url: 'https://github.com/acme/web/pull/4', updatedAt: 't' }]);
  assert.ok(calls[0].includes('q=fix is:pr user:acme'));
  await search('fix', 'pull', 'acme');
  assert.equal(calls.length, 1, 'cached');
});
