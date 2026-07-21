import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { BINARY_FILES, CONTENT_FILES } from '../src/content-manifest.js';
import { findCollisions, PACKAGE_ROOT, scaffold } from '../src/scaffold.js';
import { buildSubstitutions } from '../src/substitute.js';
import { TOOLS } from '../src/tools.js';

const SUBSTITUTIONS = buildSubstitutions({
  workforceId: 'acme',
  company: 'Acme',
  supervisor: 'Robin',
  toolLabel: 'Claude Code',
  hiredDate: '2026-01-01',
  useCase: 'a small startup',
  language: 'English',
});

function inTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-test-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('scaffolding into an empty folder writes every manifest file', () => {
  inTempDir((dir) => {
    const { written } = scaffold({ targetDir: dir, toolValue: 'claude-code', substitutions: SUBSTITUTIONS });
    assert.equal(written.length, CONTENT_FILES.length + BINARY_FILES.length + 4);
    for (const rel of written) {
      assert.ok(readFileSync(join(dir, rel)).length > 0, `${rel} was written empty`);
    }
  });
});

test('a tool without an adapter still gets all the content', () => {
  inTempDir((dir) => {
    const { written } = scaffold({ targetDir: dir, toolValue: 'other', substitutions: SUBSTITUTIONS });
    assert.equal(written.length, CONTENT_FILES.length + BINARY_FILES.length);
    assert.ok(!written.some((rel) => rel.startsWith('.claude/')));
  });
});

// The photo goes through a separate byte-for-byte path on purpose:
// running the UTF-8 text pipeline over a PNG corrupts it.
test('the binary asset comes out byte-identical', () => {
  inTempDir((dir) => {
    scaffold({ targetDir: dir, toolValue: 'other', substitutions: SUBSTITUTIONS });
    for (const rel of BINARY_FILES) {
      assert.deepEqual(readFileSync(join(dir, rel)), readFileSync(join(PACKAGE_ROOT, rel)));
    }
  });
});

test("the template's own governance files never land in a user's repo", () => {
  inTempDir((dir) => {
    const { written } = scaffold({ targetDir: dir, toolValue: 'claude-code', substitutions: SUBSTITUTIONS });
    for (const rel of ['LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'README.md']) {
      assert.ok(!written.includes(rel), `${rel} was scaffolded into the target repo`);
    }
  });
});

test('collisions are reported before anything is overwritten', () => {
  inTempDir((dir) => {
    assert.deepEqual(findCollisions(dir, 'claude-code'), []);
    scaffold({ targetDir: dir, toolValue: 'claude-code', substitutions: SUBSTITUTIONS });
    const collisions = findCollisions(dir, 'claude-code');
    assert.equal(collisions.length, CONTENT_FILES.length + BINARY_FILES.length + 4);
  });
});

test('every file the manifest and the adapters name is actually present in the package', () => {
  const adapters = TOOLS.flatMap((tool) => tool.adapters ?? []);
  for (const rel of [...CONTENT_FILES, ...BINARY_FILES, ...adapters]) {
    assert.ok(readFileSync(join(PACKAGE_ROOT, rel)).length > 0, `${rel} is missing or empty in the package`);
  }
});
