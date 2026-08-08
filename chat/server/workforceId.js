// The same fixed identifier CONSTITUTION.md §0 defines and the people-
// memory feature already keys off of (see docs/structure.md — memories
// live at `~/.hire-juno/<workforce-id>/<colleague>/people/<name>.md`).
// Chat history is exactly that kind of thing: it belongs outside the
// repo, keyed to the workforce, not to this folder's name. Reusing the
// identifier means one less concept for someone reading both features
// to reconcile.
//
// Two known layouts, mirroring roster.js's LAYOUTS (and for the same
// reason — the mitarbeiter/ layout is this repo's own naming before
// translation, not a guess at a third-party shape): a fresh hire-juno
// install's `CONSTITUTION.md`/`workforce:`/`~/.hire-juno/`, or the
// German-named `verfassung.md`/`belegschaft:`/`~/.ki-belegschaft/` —
// each with its own external storage root, so chat history for the
// second layout lands next to the people-memories that layout already
// keeps there instead of starting a second, unrelated root next to it.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LAYOUTS = [
  { file: 'CONSTITUTION.md', field: 'workforce', placeholder: '<workforce-id>', baseDirName: '.hire-juno' },
  { file: 'verfassung.md', field: 'belegschaft', placeholder: '<belegschaft-id>', baseDirName: '.ki-belegschaft' },
];

// Falls back to null rather than inventing an ID: a caller with neither
// governance file yet, or one still carrying its unfilled placeholder,
// has no real workforce to key storage to — guessing one would
// silently split history later once the real ID is set.
export function resolveWorkforce(targetDir) {
  for (const layout of LAYOUTS) {
    let raw;
    try {
      raw = readFileSync(join(targetDir, layout.file), 'utf8');
    } catch {
      continue;
    }
    const match = new RegExp(`^---\\n[\\s\\S]*?\\b${layout.field}:\\s*(\\S+)`).exec(raw);
    const id = match?.[1];
    if (!id || id === layout.placeholder) return null;
    return { id, baseDir: join(homedir(), layout.baseDirName) };
  }
  return null;
}
