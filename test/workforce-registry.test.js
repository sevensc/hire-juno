import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  addWorkforce,
  getActiveWorkforce,
  listWorkforces,
  removeWorkforce,
  setActiveWorkforce,
} from '../shared/workforceRegistry.js';

// Every call here passes an explicit `registryPath` into a temp dir.
// The real registry (~/.hire-juno/known-workforces.json) is the file
// that decides which workforce the next `hire-juno-chat` opens — a test
// run has no business writing to it, and a missing `registryPath` in
// one of these calls would do exactly that silently.
function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-registry-'));
  return {
    dir,
    registryPath: join(dir, 'known-workforces.json'),
    // A folder that passes addWorkforce's own "is this a workforce"
    // check — findLayout wants a team/ or mitarbeiter/ in it.
    workforce(name, layout = 'team') {
      const path = join(dir, name);
      mkdirSync(join(path, layout, 'someone'), { recursive: true });
      writeFileSync(join(path, layout, 'someone', 'profile.md'), '---\nname: someone\n---\n');
      return path;
    },
    cleanup() {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

test('setActiveWorkforce remembers the workforce across processes', () => {
  const s = sandbox();
  try {
    const path = s.workforce('first');
    setActiveWorkforce(path, { registryPath: s.registryPath });
    // Read back off disk, not out of a cache: the whole point of the
    // field is that the *next* process sees it.
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), path);
  } finally {
    s.cleanup();
  }
});

test('setActiveWorkforce registers a workforce that was not on the list yet', () => {
  const s = sandbox();
  try {
    const path = s.workforce('first');
    setActiveWorkforce(path, { registryPath: s.registryPath });
    const listed = listWorkforces(path, { registryPath: s.registryPath });
    assert.deepEqual(listed.map((w) => w.path), [path]);
  } finally {
    s.cleanup();
  }
});

test('getActiveWorkforce returns null when the remembered folder is gone', () => {
  const s = sandbox();
  try {
    const path = s.workforce('first');
    setActiveWorkforce(path, { registryPath: s.registryPath });
    rmSync(path, { recursive: true, force: true });
    // A stale pointer must never leave the module — the caller would
    // otherwise start a server against a folder that isn't there.
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), null);
  } finally {
    s.cleanup();
  }
});

test('getActiveWorkforce returns null when the folder is no longer a workforce', () => {
  const s = sandbox();
  try {
    const path = s.workforce('first');
    setActiveWorkforce(path, { registryPath: s.registryPath });
    rmSync(join(path, 'team'), { recursive: true, force: true });
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), null);
  } finally {
    s.cleanup();
  }
});

test('removing the active workforce clears the pointer to it', () => {
  const s = sandbox();
  try {
    const path = s.workforce('first');
    setActiveWorkforce(path, { registryPath: s.registryPath });
    removeWorkforce(path, { registryPath: s.registryPath });
    // Otherwise taking it off the switcher is the very thing that makes
    // it come back on the next launch.
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), null);
  } finally {
    s.cleanup();
  }
});

test('removing a different workforce leaves the active one alone', () => {
  const s = sandbox();
  try {
    const active = s.workforce('first');
    const other = s.workforce('second', 'mitarbeiter');
    addWorkforce(other, { registryPath: s.registryPath });
    setActiveWorkforce(active, { registryPath: s.registryPath });
    removeWorkforce(other, { registryPath: s.registryPath });
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), active);
  } finally {
    s.cleanup();
  }
});

test('a registry written before "active" existed still reads', () => {
  const s = sandbox();
  try {
    const path = s.workforce('first');
    // The shape registries had before "active" existed.
    writeFileSync(s.registryPath, JSON.stringify({ paths: [path] }, null, 2));
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), null);
    assert.deepEqual(
      listWorkforces(path, { registryPath: s.registryPath }).map((w) => w.path),
      [path]
    );
  } finally {
    s.cleanup();
  }
});

test('adding a workforce does not disturb the remembered active one', () => {
  const s = sandbox();
  try {
    const active = s.workforce('first');
    setActiveWorkforce(active, { registryPath: s.registryPath });
    addWorkforce(s.workforce('second'), { registryPath: s.registryPath });
    assert.equal(getActiveWorkforce({ registryPath: s.registryPath }), active);
    // And the field survives in the file itself, not only in what the
    // getter happens to reconstruct.
    assert.equal(JSON.parse(readFileSync(s.registryPath, 'utf8')).active, active);
  } finally {
    s.cleanup();
  }
});

test('addWorkforce still refuses a folder that is not a workforce', () => {
  const s = sandbox();
  try {
    const notAWorkforce = join(s.dir, 'empty');
    mkdirSync(notAWorkforce, { recursive: true });
    assert.throws(
      () => addWorkforce(notAWorkforce, { registryPath: s.registryPath }),
      /not a workforce repo/
    );
  } finally {
    s.cleanup();
  }
});
