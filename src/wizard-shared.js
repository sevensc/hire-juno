// Bits both wizard paths need — the terminal path (prompts.js, plain
// Node) and the browser path (web/server.js renders these into the
// page, since browser JS can't read the host process's env vars).
// Kept dependency-free on purpose: importing this from web/server.js
// must not drag @clack/prompts into the browser-side bundle.

// Turns a free-typed team name into the workforce ID slug the
// constitution actually needs (lowercase, hyphens, nothing else) —
// the wizard used to ask for this separately; now it's derived so
// there's one naming question instead of two.
export function slugify(name) {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents after decomposing
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'workforce';
}

// Best-effort default for "which tool do you use" — only claims what's
// actually checked against a real, currently-running session
// (`CLAUDECODE=1` is set by Claude Code itself; verified by inspecting
// `process.env` inside an actual Claude Code run, not assumed from
// docs). No other tool sets anything we've confirmed the same way, so
// this doesn't guess at Cursor/Windsurf — it either finds Claude Code
// or leaves the choice to the first entry in the tool list.
export function detectTool(tools) {
  if (process.env.CLAUDECODE === '1') {
    const claudeCode = tools.find((t) => t.value === 'claude-code');
    if (claudeCode) return claudeCode.value;
  }
  return tools[0]?.value ?? null;
}

// Short, low-effort acknowledgements after each answer — not meant to
// be clever, just a beat of "got it" before the next question. Same
// list on both sides so the wizard feels like one voice regardless of
// which path you took.
export const AFFIRMATIONS = [
  'Good choice.',
  'Noted.',
  'Got it.',
  'Nice.',
  'Locked in.',
  'On it.',
];

export function pickAffirmation() {
  return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
}

// What the workforce is for — asked once, up front, and dropped
// straight into Juno's own personnel file ("<company> is being set up
// as <use-case>") so she has that context from her very first
// conversation instead of guessing it from the company name. `other`
// has no canned phrase — the free-text answer is used verbatim.
export const USE_CASES = [
  { value: 'personal', label: 'Personal project', phrase: 'a personal project' },
  { value: 'startup', label: 'Small startup', phrase: 'a small startup' },
  { value: 'organization', label: 'Organization / company', phrase: 'an organization' },
  { value: 'other', label: 'Something else', phrase: null },
];
