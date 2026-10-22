// The registry the workforce switcher reads has to fill itself in on
// its own, not wait for someone to paste a path into a text field.
// Two writers, both best-effort/non-fatal (see their own call sites):
// src/install.js registers a repo the moment `npx hire-juno` finishes
// scaffolding it, and chat/server/index.js registers whatever
// `--dir` it's pointed at on every launch — between the two, every
// workforce that ever runs the installer or the chat ends up listed
// here without anyone typing a path, new installs and already-existing
// repos alike.
//
// Lives at a fixed location outside either workforceId.js layout's own
// storage root (~/.hire-juno/ for a fresh install, ~/.ki-belegschaft/
// for the German-named one — see that file's own comment): this list
// itself isn't one workforce's data, it's the registry *of* workforces,
// so it doesn't belong inside either one's root. And at the repo root
// rather than under chat/server/ or src/ specifically — both the
// installer and the chat server write to it, and neither tree imports
// the other (see this file's own two callers), so it sits in a third,
// neutral place instead of making one tree depend on the other's
// internals just to reach this.
//
// Deliberately just paths, nothing else duplicated: name/id shown for
// each entry is resolved live every time (resolveWorkforce/findLayout),
// the same way readRoster already re-reads the roster fresh on every
// request instead of caching it — a workforce renamed or re-hired-into
// after being added here shows up correctly without this file ever
// needing an update of its own.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';

import { findLayout } from '../chat/server/roster.js';
import { resolveWorkforce } from '../chat/server/workforceId.js';

// Overridable for tests only — there is one real registry per machine
// and it is the file that decides which workforce the next launch
// opens, so a test run must never be able to touch the actual one.
// Same shape as openStore's own `baseDir` parameter (see
// chat/server/store.js), for the same reason and so there is one habit
// here rather than two. Nothing in the shipped call paths passes it.
const REGISTRY_PATH = resolve(homedir(), '.hire-juno', 'known-workforces.json');

function readRegistry(registryPath = REGISTRY_PATH) {
  try {
    const raw = JSON.parse(readFileSync(registryPath, 'utf8'));
    return {
      paths: Array.isArray(raw.paths) ? raw.paths : [],
      // Absent in every file written before this field existed — an
      // older registry stays perfectly readable and just has no
      // remembered active workforce until the next launch sets one.
      active: typeof raw.active === 'string' ? raw.active : null,
    };
  } catch {
    return { paths: [], active: null }; // missing file or unreadable JSON — no workforces registered yet, not an error
  }
}

function readRegisteredPaths(registryPath) {
  return readRegistry(registryPath).paths;
}

function writeRegistry({ paths, active }, registryPath = REGISTRY_PATH) {
  mkdirSync(dirname(registryPath), { recursive: true });
  writeFileSync(registryPath, JSON.stringify({ paths, active }, null, 2));
}

function writeRegisteredPaths(paths, registryPath) {
  writeRegistry({ paths, active: readRegistry(registryPath).active }, registryPath);
}

// "active" therefore outlives the process that set it:
// it's a property of the registry, not of one running server, so the
// next launch opens the workforce last switched to rather than whatever
// folder the terminal happened to be standing in. Which of the two wins
// when they disagree is decided in chat/bin/chat.js, not here — this
// only remembers.
export function setActiveWorkforce(path, { registryPath } = {}) {
  const resolvedPath = resolve(path);
  const { paths } = readRegistry(registryPath);
  if (!paths.includes(resolvedPath)) paths.push(resolvedPath);
  writeRegistry({ paths, active: resolvedPath }, registryPath);
  return resolvedPath;
}

// `null` when nothing has ever been switched to, when the remembered
// folder has since been deleted, or when it no longer looks like a
// workforce at all — every caller would have to check all three anyway,
// so a stale pointer never leaves this module.
export function getActiveWorkforce({ registryPath } = {}) {
  const { active } = readRegistry(registryPath);
  if (!active || !existsSync(active) || !findLayout(active)) return null;
  return active;
}

function describeWorkforce(path) {
  return {
    path,
    // What the switcher shows under the name. The full path is the
    // honest answer to "which of my two repos called staff is this",
    // but at sidebar width an absolute path under the home folder is
    // mostly the same twenty characters on every row; `~` buys that
    // back. Done here and not in the browser because only this side
    // knows the home directory.
    displayPath: path.startsWith(homedir() + '/') ? `~${path.slice(homedir().length)}` : path,
    // Falls back to the folder's own name when there's no
    // CONSTITUTION.md/verfassung.md yet (or it still carries the
    // unfilled placeholder — see resolveWorkforce) — still something
    // recognizable to click on the switcher instead of a raw path.
    name: resolveWorkforce(path)?.id || basename(path),
    hasTeam: Boolean(findLayout(path)),
  };
}

// `targetDir` (whichever workforce *this* running server instance is
// currently serving) always appears in the result, current:true —
// even one that failed to register itself for some reason, so
// switching away and back always works and the switcher never has to
// special-case "the one I'm already in".
export function listWorkforces(targetDir, { registryPath } = {}) {
  const current = resolve(targetDir);
  const paths = readRegisteredPaths(registryPath);
  if (!paths.includes(current)) paths.push(current);
  return paths.map((path) => ({ ...describeWorkforce(path), current: path === current }));
}

// Throws with a message meant to reach a human as-is — a chat client
// (see index.js's 'add_workforce' handler) or a console.error at the
// end of an install (see install.js's own call site); nothing this
// small needs a separate error-code layer. Both call sites treat a
// throw here as non-fatal to whatever they were already doing.
export function addWorkforce(path, { registryPath } = {}) {
  const resolvedPath = resolve(path);
  if (!existsSync(resolvedPath)) {
    throw new Error(`No such folder: ${resolvedPath}`);
  }
  if (!findLayout(resolvedPath)) {
    throw new Error(`No team/ or mitarbeiter/ folder in ${resolvedPath} — not a workforce repo.`);
  }
  const paths = readRegisteredPaths(registryPath);
  if (!paths.includes(resolvedPath)) {
    paths.push(resolvedPath);
    writeRegisteredPaths(paths, registryPath);
  }
  return describeWorkforce(resolvedPath);
}

export function removeWorkforce(path, { registryPath } = {}) {
  const resolvedPath = resolve(path);
  const { paths, active } = readRegistry(registryPath);
  writeRegistry({
    paths: paths.filter((p) => p !== resolvedPath),
    // Taking a workforce off the list has to take the "open this one on
    // the next launch" pointer with it when it's the same one —
    // otherwise removing it from the switcher is exactly the thing that
    // makes it come back by itself next time.
    active: active === resolvedPath ? null : active,
  }, registryPath);
}
