// Reads the *installed* team, not this repo's own — hire-juno-chat runs
// inside whatever repo the installer already wrote a personnel-file
// tree into. One colleague = one folder with a personnel file in it;
// the human-facing roster card (`team/roster.md`) is prose and
// deliberately not parsed here, so a colleague still shows up even the
// day they're hired and before anyone has written their card.
//
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Two known layouts, tried in this order:
//   - `team/<id>/profile.md`      — every fresh hire-juno install
//   - `mitarbeiter/<id>/akte.md`  — the German-named layout this
//     repo's own English naming was translated from in the first
//     place. Real
//     compatibility case, not a guess at an arbitrary third-party
//     shape.
// Not a general "any layout" parser — exactly these two, named.
const LAYOUTS = [
  { teamDir: 'team', file: 'profile.md', roleKey: 'role' },
  { teamDir: 'mitarbeiter', file: 'akte.md', roleKey: 'rolle' },
];

// Exported for workforceRegistry.js's own validation when adding a new
// workforce path (see its addWorkforce) — "does this folder actually
// have a team to talk to" is exactly this same layout check, not a
// second guess at what counts as a valid workforce root.
export function findLayout(targetDir) {
  for (const layout of LAYOUTS) {
    try {
      readdirSync(join(targetDir, layout.teamDir));
      return layout;
    } catch {
      continue;
    }
  }
  return null;
}

// Strips the frontmatter block, nothing else. hr/profile-template.md is
// explicit that the body is "the DNA, word for word — it has to work as
// a system prompt on any platform", so this is deliberately the entire
// body, unmodified — no reformatting, no summarizing.
function stripFrontmatter(raw) {
  const match = /^---\n[\s\S]*?\n---\n?/.exec(raw);
  return (match ? raw.slice(match[0].length) : raw).trim();
}

// The system prompt for a colleague's agent session, straight from
// their own personnel file. Returns null if there's no team/ or
// mitarbeiter/ tree, or no personnel file for this colleague in it.
export function readProfileBody(targetDir, colleagueId) {
  const layout = findLayout(targetDir);
  if (!layout) return null;
  try {
    const raw = readFileSync(join(targetDir, layout.teamDir, colleagueId, layout.file), 'utf8');
    return stripFrontmatter(raw);
  } catch {
    return null;
  }
}

// The photo convention docs/structure.md already documents for Juno
// (`team/juno/juno.png` — folder name and file name match); the same
// convention carries over to the mitarbeiter/ layout. Returns the
// absolute path or null; never guesses at other extensions, since
// there's exactly one documented convention to check.
export function resolveAvatarPath(targetDir, colleagueId) {
  const layout = findLayout(targetDir);
  if (!layout) return null;
  const path = join(targetDir, layout.teamDir, colleagueId, `${colleagueId}.png`);
  try {
    return statSync(path).isFile() ? path : null;
  } catch {
    return null;
  }
}

function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      fields[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    } else {
      fields[key] = value;
    }
  }
  return fields;
}

// One card per colleague, built from their own personnel file — never
// from team/roster.md, which is prose meant for humans skimming, not a
// second source of truth to keep in sync.
export function readRoster(targetDir) {
  const layout = findLayout(targetDir);
  if (!layout) return [];
  const teamDir = join(targetDir, layout.teamDir);
  let entries;
  try {
    entries = readdirSync(teamDir);
  } catch {
    return [];
  }

  const colleagues = [];
  for (const entry of entries) {
    const profilePath = join(teamDir, entry, layout.file);
    let stat;
    try {
      stat = statSync(profilePath);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    const raw = readFileSync(profilePath, 'utf8');
    const fields = parseFrontmatter(raw);
    colleagues.push({
      id: entry,
      name: fields.name || entry,
      role: fields[layout.roleKey] || fields.role || '',
      status: fields.status || 'unknown',
      adapter: Array.isArray(fields.adapter) ? fields.adapter : [],
      hasAvatar: resolveAvatarPath(targetDir, entry) !== null,
    });
  }
  return colleagues;
}

// The colleague's card from the roster file (team/roster.md, or
// mitarbeiter/steckbriefe.md in the German layout): the "## Name — ..."
// section whose name matches. Labelled lines ("**Role:** ...") become
// fields, the rest the text; image lines and placeholders are left out.
const ROSTER_FILES = { team: 'roster.md', mitarbeiter: 'steckbriefe.md' };
const SKIPPED_FIELDS = /^(image|bild)$/i;

export function readRosterCard(targetDir, colleague) {
  const layout = findLayout(targetDir);
  const file = layout && ROSTER_FILES[layout.teamDir];
  if (!file) return null;
  let raw;
  try {
    raw = readFileSync(join(targetDir, layout.teamDir, file), 'utf8');
  } catch {
    return null;
  }
  const wanted = [colleague.id, colleague.name].filter(Boolean).map((n) => String(n).toLowerCase());
  for (const section of raw.split(/^## /m).slice(1)) {
    const [headingLine, ...rest] = section.split('\n');
    const heading = headingLine.trim();
    const name = heading.split(/\s+[—–-]\s+|\s+/)[0].toLowerCase();
    if (!wanted.includes(name)) continue;
    const fields = [];
    const paragraphs = [];
    for (const block of rest.join('\n').split(/\n\s*\n/)) {
      const lines = block.split('\n').map((l) => l.trim()).filter((l) => l && l !== '---');
      if (!lines.length) continue;
      if (lines.every((l) => /^\*\(.*\)\*$/.test(l))) continue;
      if (/^\*\*[^*]+:\*\*/.test(lines[0])) {
        let current = null;
        for (const line of lines) {
          const m = /^\*\*([^*]+):\*\*\s*(.*)$/.exec(line);
          if (m) {
            current = SKIPPED_FIELDS.test(m[1].trim()) ? null : { label: m[1].trim(), value: m[2].trim() };
            if (current) fields.push(current);
          } else if (current) {
            current.value = `${current.value} ${line}`.trim();
          }
        }
        continue;
      }
      paragraphs.push(lines.join(' '));
    }
    // Plain text for the card: no Markdown emphasis or code marks.
    const plain = (t) => t.replace(/`/g, '').replace(/\*\*([^*]+)\*\*/g, '$1');
    return {
      heading,
      fields: fields.map((f) => ({ label: f.label, value: plain(f.value) })),
      text: plain(paragraphs.join('\n\n')),
    };
  }
  return null;
}
