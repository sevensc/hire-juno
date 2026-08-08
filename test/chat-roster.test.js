import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { readProfileBody, readRoster, resolveAvatarPath } from '../chat/server/roster.js';

function writeProfile(dir, name, frontmatter) {
  const colleagueDir = join(dir, 'team', name);
  mkdirSync(colleagueDir, { recursive: true });
  writeFileSync(join(colleagueDir, 'profile.md'), `---\n${frontmatter}\n---\n\nBody.\n`);
}

test('readRoster reads one card per colleague folder with a profile.md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeProfile(
      dir,
      'juno',
      'name: juno\nrole: HR\nstatus: active\nadapter: [claude-code]'
    );
    const roster = readRoster(dir);
    assert.deepEqual(roster, [
      { id: 'juno', name: 'juno', role: 'HR', status: 'active', adapter: ['claude-code'], hasAvatar: false },
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readRoster skips folders under team/ that have no profile.md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    mkdirSync(join(dir, 'team', 'not-a-colleague'), { recursive: true });
    assert.deepEqual(readRoster(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readRoster returns an empty list when there is no team/ directory at all', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    assert.deepEqual(readRoster(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readProfileBody returns the body only, frontmatter stripped', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeProfile(dir, 'juno', 'name: juno\nrole: HR');
    assert.equal(readProfileBody(dir, 'juno'), 'Body.');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readProfileBody returns null when the colleague has no profile.md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    assert.equal(readProfileBody(dir, 'nobody'), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readRoster reports hasAvatar true when team/<id>/<id>.png exists', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeProfile(dir, 'juno', 'name: juno\nrole: HR');
    writeFileSync(join(dir, 'team', 'juno', 'juno.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    assert.equal(readRoster(dir)[0].hasAvatar, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveAvatarPath returns null when there is no <id>.png', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeProfile(dir, 'juno', 'name: juno\nrole: HR');
    assert.equal(resolveAvatarPath(dir, 'juno'), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function writeAkte(dir, name, frontmatter) {
  const colleagueDir = join(dir, 'mitarbeiter', name);
  mkdirSync(colleagueDir, { recursive: true });
  writeFileSync(join(colleagueDir, 'akte.md'), `---\n${frontmatter}\n---\n\nBody.\n`);
}

test('readRoster also reads the mitarbeiter/<id>/akte.md layout, role from "rolle"', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeAkte(dir, 'nora', 'name: nora\nrolle: Senior-Entwicklerin\nstatus: probezeit\nadapter: [claude-code]');
    assert.deepEqual(readRoster(dir), [
      { id: 'nora', name: 'nora', role: 'Senior-Entwicklerin', status: 'probezeit', adapter: ['claude-code'], hasAvatar: false },
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readRoster prefers the team/ layout over mitarbeiter/ when both exist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeProfile(dir, 'juno', 'name: juno\nrole: HR');
    writeAkte(dir, 'nora', 'name: nora\nrolle: Senior-Entwicklerin');
    assert.deepEqual(readRoster(dir).map((c) => c.id), ['juno']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readProfileBody reads the akte.md body too', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hire-juno-chat-'));
  try {
    writeAkte(dir, 'nora', 'name: nora\nrolle: Senior-Entwicklerin');
    assert.equal(readProfileBody(dir, 'nora'), 'Body.');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
