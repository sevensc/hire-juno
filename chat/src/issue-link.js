// The "Report an issue" link in the settings dialog: a plain URL that
// opens GitHub's "New issue" page with a technical, neutral template.
// Nothing from a conversation goes in (no paths, names, messages); the
// page stays editable on GitHub before anything is submitted.

export const ISSUE_URL = 'https://github.com/sevensc/hire-juno/issues/new';

// Order matters: Edge and Opera also say "Chrome", Chrome also says "Safari".
const BROWSERS = [
  ['Edge', /\b(?:Edg|EdgA|EdgiOS)\/(\d+)/],
  ['Opera', /\bOPR\/(\d+)/],
  ['Firefox', /\b(?:Firefox|FxiOS)\/(\d+)/],
  ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
  ['Safari', /\bVersion\/(\d+)[^]*\bSafari\//],
];

// Pure: a short browser name + major version from a userAgent string.
export function browserFromUserAgent(ua = '') {
  for (const [name, re] of BROWSERS) {
    const m = re.exec(ua);
    if (m) return `${name} ${m[1]}`;
  }
  return 'unknown';
}

// Pure: the OS family only, no version.
export function osFamilyFromUserAgent(ua = '') {
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux|X11/.test(ua)) return 'Linux';
  return 'unknown';
}

export function buildIssueUrl({ version, userAgent } = {}) {
  const url = new URL(ISSUE_URL);
  const body = [
    '### What happened',
    '',
    '',
    '### What you expected',
    '',
    '',
    '### Environment',
    '',
    `- hire-juno: ${version || 'unknown'}`,
    `- Browser: ${browserFromUserAgent(userAgent)}`,
    `- OS: ${osFamilyFromUserAgent(userAgent)}`,
    '',
  ].join('\n');
  url.searchParams.set('body', body);
  return url.toString();
}
