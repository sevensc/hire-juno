import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { PACKAGE_ROOT, scaffold } from '../src/scaffold.js';
import { buildSubstitutions } from '../src/substitute.js';

// `docs/structure.md` lists, file by file, what the installer writes
// into someone else's repo. Back when that list was a section of the
// README it was wrong: it omitted Juno's personnel file — the single
// most important file in the repo — along with her journal and her
// memory, and it quoted a file count one too high. A reader has no way
// to notice any of that. The manifest is the truth; the prose only
// claims to match it.
//
// So the block is fenced by HTML comments and compared against what
// scaffold() actually writes. Adding a file to the manifest without
// mentioning it here now fails, and so does the reverse.

const START = '<!-- scaffolded-files:start -->';
const END = '<!-- scaffolded-files:end -->';

// Reads the tree back into paths: two spaces per level, a trailing
// slash marks a directory, anything after the first word is prose.
function parseTree(block) {
  const dirs = [];
  const files = [];
  for (const line of block.split('\n')) {
    if (!line.trim() || line.trim().startsWith('```')) continue;
    const depth = (line.length - line.trimStart().length) / 2;
    assert.ok(Number.isInteger(depth), `odd indentation in the structure block: ${line}`);
    const name = line.trim().split(/\s+/)[0];
    if (name.endsWith('/')) {
      dirs.length = depth;
      dirs.push(name.slice(0, -1));
    } else {
      files.push([...dirs.slice(0, depth), name].join('/'));
    }
  }
  return files;
}

function documentedFiles() {
  const doc = readFileSync(join(PACKAGE_ROOT, 'docs/structure.md'), 'utf8');
  const start = doc.indexOf(START);
  const end = doc.indexOf(END);
  assert.ok(start !== -1 && end > start, 'the structure block markers are gone from docs/structure.md');
  return parseTree(doc.slice(start + START.length, end));
}

function scaffoldedFiles() {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-structure-'));
  try {
    const { written } = scaffold({
      targetDir: dir,
      toolValue: 'claude-code',
      substitutions: buildSubstitutions({
        workforceId: 'test',
        company: 'Test',
        supervisor: 'Test',
        toolLabel: 'Claude Code',
        hiredDate: '2026-01-01',
        useCase: 'testing',
        language: 'English',
      }),
    });
    return written;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('the structure doc lists exactly the files the installer writes', () => {
  const documented = documentedFiles();
  const written = scaffoldedFiles();

  const missing = written.filter((f) => !documented.includes(f));
  const invented = documented.filter((f) => !written.includes(f));

  assert.deepEqual(missing, [], 'scaffolded but not listed in docs/structure.md');
  assert.deepEqual(invented, [], 'listed in docs/structure.md but never scaffolded');
});

test('the file count the structure doc quotes is the count it lists', () => {
  // Whitespace-normalized: the sentence is hard-wrapped in the source,
  // so the phrase can have a newline in the middle of it.
  const doc = readFileSync(join(PACKAGE_ROOT, 'docs/structure.md'), 'utf8').replace(/\s+/g, ' ');
  const written = scaffoldedFiles();
  assert.match(
    doc,
    new RegExp(`\\b${written.length} files with Claude Code selected\\b`),
    `docs/structure.md should say "${written.length} files with Claude Code selected"`
  );
});
