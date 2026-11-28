// Previews of GitHub issues and pull requests linked in a conversation.
// The chat asks with owner, repo, kind and number; the data comes from the
// GitHub CLI (`gh api`), so whatever account `gh` is signed in with decides
// which repositories can be previewed, private ones included. Without `gh`,
// or without access, there is simply no preview.

import { execFile } from 'node:child_process';

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;
const OK_TTL_MS = 2 * 60 * 1000;
const FAIL_TTL_MS = 30 * 1000;
const BODY_EXCERPT = 240;

// A request's parameters, checked: { owner, repo, kind, number } or null.
export function cleanRef({ owner, repo, kind, number }) {
  const n = Number(number);
  if (typeof owner !== 'string' || !OWNER.test(owner)) return null;
  if (typeof repo !== 'string' || !REPO.test(repo) || repo === '.' || repo === '..') return null;
  if (kind !== 'issue' && kind !== 'pull') return null;
  if (!Number.isInteger(n) || n < 1 || n > 1e9) return null;
  return { owner, repo, kind, number: n };
}

// The start of an issue or PR description as plain text on one line.
export function bodyExcerpt(body) {
  return String(body || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s.*$/gm, ' ')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BODY_EXCERPT);
}

// What the chat shows, from the API's issue (and, for a PR, pull) object.
export function previewFrom(ref, issue, pull = null) {
  const isPull = Boolean(pull || issue.pull_request);
  const merged = Boolean(pull?.merged || issue.pull_request?.merged_at);
  const state = merged ? 'merged' : pull?.draft && issue.state === 'open' ? 'draft' : issue.state === 'open' ? 'open' : 'closed';
  return {
    owner: ref.owner,
    repo: ref.repo,
    number: ref.number,
    kind: isPull ? 'pull' : 'issue',
    title: String(issue.title || ''),
    state,
    reason: issue.state_reason || null,
    author: issue.user?.login || null,
    labels: (issue.labels || []).slice(0, 6).map((l) => ({ name: String(l.name || ''), color: /^[0-9a-f]{6}$/i.test(l.color || '') ? l.color : null })),
    comments: Number(issue.comments) || 0,
    updatedAt: issue.updated_at || null,
    body: bodyExcerpt(issue.body),
    ...(pull
      ? {
          additions: Number(pull.additions) || 0,
          deletions: Number(pull.deletions) || 0,
          changedFiles: Number(pull.changed_files) || 0,
          head: pull.head?.ref || null,
          base: pull.base?.ref || null,
        }
      : {}),
  };
}

function ghApi(path, run) {
  return new Promise((resolve, reject) => {
    run('gh', ['api', '-H', 'Accept: application/vnd.github+json', path], { timeout: 10000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

// `run`: execFile, replaceable in tests. Returns preview(ref) resolving to
// a preview or { error: 'unavailable' | 'not_found' }.
export function createGithubPreviews({ run = execFile, now = () => Date.now() } = {}) {
  const cache = new Map(); // key -> { at, ttl, value: Promise }
  return function preview(ref) {
    const key = `${ref.owner}/${ref.repo}#${ref.number}`.toLowerCase();
    const hit = cache.get(key);
    if (hit && now() - hit.at < hit.ttl) return hit.value;
    const entry = { at: now(), ttl: OK_TTL_MS, value: null };
    entry.value = (async () => {
      const base = `repos/${ref.owner}/${ref.repo}`;
      try {
        // The issues endpoint answers for PRs too; a PR then also gets its
        // pull request data (merged, draft, size, branches).
        const issue = await ghApi(`${base}/issues/${ref.number}`, run);
        const pull = issue.pull_request ? await ghApi(`${base}/pulls/${ref.number}`, run).catch(() => null) : null;
        return previewFrom(ref, issue, pull);
      } catch (err) {
        entry.ttl = FAIL_TTL_MS;
        if (err.code === 'ENOENT') return { error: 'unavailable' };
        return { error: 'not_found' };
      }
    })();
    cache.set(key, entry);
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return entry.value;
  };
}

// The GitHub account (user or organisation) a repo's `origin` points to,
// e.g. "acme" for git@github.com:acme/web.git, or null.
export function githubOwnerOf(remoteUrl) {
  const m = String(remoteUrl || '').trim().match(/github\.com[:/]([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/[A-Za-z0-9._-]+?(?:\.git)?\/?$/);
  return m ? m[1] : null;
}

// The search text sent to GitHub: the words typed, the kind, and the
// account to search in unless the words already name a repo, user or org.
export function searchQuery(words, kind, owner) {
  const text = String(words || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const scoped = /(?:^|\s)(?:repo|user|org):\S+/i.test(text);
  return [text, kind === 'pull' ? 'is:pr' : 'is:issue', !scoped && owner ? `user:${owner}` : ''].filter(Boolean).join(' ');
}

// search(words, kind, owner) resolving to { results: [...] } (newest
// activity first, at most eight) or { error }.
export function createGithubSearch({ run = execFile, now = () => Date.now() } = {}) {
  const cache = new Map();
  return function search(words, kind, owner) {
    const q = searchQuery(words, kind, owner);
    const hit = cache.get(q);
    if (hit && now() - hit.at < 30000) return hit.value;
    const value = new Promise((resolve) => {
      run('gh', ['api', '-X', 'GET', 'search/issues', '-f', `q=${q}`, '-f', 'sort=updated', '-f', 'per_page=8'], { timeout: 10000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => {
        if (err) return resolve({ error: err.code === 'ENOENT' ? 'unavailable' : 'failed' });
        try {
          const data = JSON.parse(stdout);
          resolve({
            results: (data.items || []).map((item) => {
              const [repoOwner, repo] = String(item.repository_url || '').split('/').slice(-2);
              const isPull = Boolean(item.pull_request);
              return {
                owner: repoOwner,
                repo,
                number: item.number,
                kind: isPull ? 'pull' : 'issue',
                title: String(item.title || ''),
                state: isPull && item.pull_request?.merged_at ? 'merged' : item.draft && item.state === 'open' ? 'draft' : item.state,
                url: item.html_url,
                updatedAt: item.updated_at || null,
              };
            }).filter((r) => r.owner && r.repo && Number.isInteger(r.number) && /^https:\/\/github\.com\//.test(r.url || '')),
          });
        } catch {
          resolve({ error: 'failed' });
        }
      });
    });
    cache.set(q, { at: now(), value });
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    return value;
  };
}
