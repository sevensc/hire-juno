// GitHub issue and pull request links in a message, so it can show a
// preview card under the text: https://github.com/<owner>/<repo>/issues/<n>
// or /pull/<n> (also with /files, /commits and the like after it, or an
// anchor). Anything else on github.com stays a plain link.

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;

export function githubRef(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  if (host !== 'github.com' && host !== 'www.github.com') return null;
  const [owner, repo, section, number] = url.pathname.split('/').filter(Boolean);
  if (!OWNER.test(owner || '') || !REPO.test(repo || '') || repo === '.' || repo === '..') return null;
  const kind = section === 'issues' ? 'issue' : section === 'pull' ? 'pull' : null;
  if (!kind || !/^\d{1,9}$/.test(number || '')) return null;
  return { owner, repo, kind, number: Number(number), url: `https://github.com/${owner}/${repo}/${section}/${number}` };
}

// The issues and PRs linked in a text, in order, each once, at most `max`.
export function githubRefs(text, max = 3) {
  const out = [];
  for (const match of String(text || '').matchAll(/https?:\/\/[^\s<>()"'\]]+/g)) {
    const ref = githubRef(match[0].replace(/[.,;:!?]+$/, ''));
    const key = ref && `${ref.owner}/${ref.repo}#${ref.number}`.toLowerCase();
    if (ref && !out.some((r) => `${r.owner}/${r.repo}#${r.number}`.toLowerCase() === key)) out.push(ref);
    if (out.length >= max) break;
  }
  return out;
}

// "just now", "5 min ago", "3 h ago", "2 days ago", else the date.
export function relativeTime(iso, now = Date.now()) {
  const t = Date.parse(iso || '');
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 30 * 86400) {
    const d = Math.floor(s / 86400);
    return `${d} ${d === 1 ? 'day' : 'days'} ago`;
  }
  return new Date(t).toLocaleDateString();
}
