import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { PACKAGE_ROOT } from '../src/scaffold.js';

// Loading every shipped module is the only thing in this suite that
// touches the runtime dependencies at all. The other tests exercise
// substitute() and scaffold(), which import nothing but `node:*` — so
// without this file, a CI matrix over several Node versions proves
// nothing about the installer a user actually runs: `@clack/prompts`
// and `open` are never loaded, and a version floor that those packages
// don't support would pass green.
//
// It is deliberately a load test and not a behavior test. Importing is
// what catches the class of failure a version matrix exists for —
// syntax the runtime can't parse, a built-in that isn't there yet, a
// dependency whose own entry point throws on an older Node.

function collectModules(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collectModules(full));
    else if (entry.name.endsWith('.js')) found.push(full);
  }
  return found;
}

// chat/server sits alongside src/ for the same reason: it's the other
// place shipped code imports runtime dependencies (`ws`, `open`) that a
// pure node:* test never touches. chat/public isn't in here — that's
// browser code, not Node module code, and would just fail to import.
// shared/ is the small third tree src/install.js and chat/server/
// index.js both import from without importing each other (see
// shared/workforceRegistry.js's own comment on why it lives there) —
// shipped the same way (package.json's own "files"), so it gets the
// same load coverage.
const modules = [
  ...collectModules(join(PACKAGE_ROOT, 'src')),
  ...collectModules(join(PACKAGE_ROOT, 'chat', 'server')),
  ...collectModules(join(PACKAGE_ROOT, 'shared')),
];

test('there is something to load', () => {
  assert.ok(modules.length > 0, 'no modules found under src/ or chat/server/');
});

for (const file of modules) {
  const label = relative(PACKAGE_ROOT, file);
  test(`${label} loads on this Node version`, async () => {
    await assert.doesNotReject(() => import(pathToFileURL(file).href));
  });
}

// bin/cli.js and chat/bin/chat.js are deliberately not in here:
// importing either calls its run function and the process would sit
// waiting on a server/prompt instead of returning. They are two lines
// over src/install.js and chat/server/index.js, which this file does
// load.
