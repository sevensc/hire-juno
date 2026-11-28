import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { createGithubAccount, validGithubToken, validLogin } from '../chat/server/githubAccount.js';
import { createGithubAssigned } from '../chat/server/githubPreview.js';

const GOOD = 'github_pat_' + 'A'.repeat(40);

test('GitHub account: own token checked with GitHub, kept private, used only for the chat\'s gh calls', async () => {
  const home = mkdtempSync(join(tmpdir(), 'gh-account-'));
  try {
    const calls = [];
    const run = (cmd, args, opts, done) => {
      calls.push(opts.env?.GH_TOKEN || null);
      if (opts.env?.GH_TOKEN === GOOD) return done(null, 'kim\n');
      if (opts.env?.GH_TOKEN) return done(new Error('401'));
      return done(new Error('no plain gh login here'));
    };
    const account = createGithubAccount({ home, run, baseEnv: { PATH: '/bin' } });
    assert.deepEqual(await account.account(), { login: null, source: null, token: false });
    assert.equal(account.env().GH_TOKEN, undefined);
    await assert.rejects(account.setToken('short'), /does not look like/);
    await assert.rejects(account.setToken('ghp_' + 'B'.repeat(36)), /did not accept/);
    assert.equal(await account.setToken(GOOD), 'kim');
    assert.deepEqual(await account.account(), { login: 'kim', source: 'token', token: true });
    assert.equal(account.env().GH_TOKEN, GOOD);
    const file = join(home, '.hire-juno', 'github-token');
    assert.equal(readFileSync(file, 'utf8').trim(), GOOD);
    assert.equal(statSync(file).mode & 0o777, 0o600);
    // A new instance (restart) reads it back.
    assert.equal((await createGithubAccount({ home, run, baseEnv: {} }).account()).login, 'kim');
    account.removeToken();
    assert.deepEqual(await account.account(), { login: 'kim', source: 'entered', token: false });
    assert.equal(account.setLogin('@ana-b'), 'ana-b');
    assert.throws(() => account.setLogin('not a name'), /not a GitHub username/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
  assert.equal(validGithubToken(' ' + GOOD + '\n'), GOOD);
  assert.equal(validGithubToken('has spaces in it but long enough'), null);
  assert.equal(validLogin('-bad'), null);
});

test('assigned to me: issues, pull requests and review requests of one login', async () => {
  const queries = [];
  const run = (cmd, args, opts, done) => {
    const q = args.find((a) => a.startsWith('q=')).slice(2);
    queries.push(q);
    done(null, JSON.stringify({ items: [{ repository_url: 'https://api.github.com/repos/acme/web', number: q.includes('review') ? 3 : 1, title: 'T', state: 'open', html_url: 'https://github.com/acme/web/issues/1' }] }));
  };
  const assigned = createGithubAssigned({ run });
  const lists = await assigned('kim');
  assert.deepEqual(queries.sort(), ['is:open is:issue assignee:kim', 'is:open is:pr assignee:kim', 'is:open is:pr review-requested:kim']);
  assert.equal(lists.issues.length, 1);
  assert.equal(lists.reviews[0].number, 3);
});

test('the GitHub name from the sign-in comes before an entered one, after the token', async () => {
  const home = mkdtempSync(join(tmpdir(), 'gh-signin-'));
  try {
    const run = (cmd, args, opts, done) => (opts.env?.GH_TOKEN === GOOD ? done(null, 'kim\n') : done(new Error('no')));
    const account = createGithubAccount({ home, run, baseEnv: {} });
    account.setLogin('typed-name');
    assert.equal(account.noteSignIn('not a login!'), false);
    assert.equal(account.noteSignIn('Ana-B'), true);
    assert.equal(account.noteSignIn('Ana-B'), false, 'unchanged');
    assert.deepEqual(await account.account(), { login: 'Ana-B', source: 'sign-in', token: false });
    await account.setToken(GOOD);
    assert.deepEqual(await account.account(), { login: 'kim', source: 'token', token: true });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
