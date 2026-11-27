import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { readRosterCard } from '../chat/server/roster.js';

function withRoster(dirName, file, text, fn) {
  const base = mkdtempSync(join(tmpdir(), 'roster-card-'));
  try {
    mkdirSync(join(base, dirName, 'una'), { recursive: true });
    writeFileSync(join(base, dirName, file), text);
    fn(base);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

const ROSTER = `# Workforce roster

Intro.

---

## Juno — HR

**Role:** hiring

Someone else.

---

## Una — Research

**Image:** \`team/una/una.png\`
**Role:** finds sources,
checks them
**Status:** \`probation\`

*(no picture yet)*

Curious and thorough.
Cites everything.

Second paragraph.
`;

test('reads her card: fields without the image line, text without placeholders', () => {
  withRoster('team', 'roster.md', ROSTER, (base) => {
    assert.deepEqual(readRosterCard(base, { id: 'una', name: 'Una' }), {
      heading: 'Una — Research',
      fields: [
        { label: 'Role', value: 'finds sources, checks them' },
        { label: 'Status', value: 'probation' },
      ],
      text: 'Curious and thorough. Cites everything.\n\nSecond paragraph.',
    });
  });
});

test('finds the German roster file and answers null without a card', () => {
  withRoster('mitarbeiter', 'steckbriefe.md', ROSTER.replace('**Image:**', '**Bild:**'), (base) => {
    assert.equal(readRosterCard(base, { id: 'una', name: 'una' }).fields[0].label, 'Role');
    assert.equal(readRosterCard(base, { id: 'nobody', name: 'Nobody' }), null);
  });
});
