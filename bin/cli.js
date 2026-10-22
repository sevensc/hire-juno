#!/usr/bin/env node
import { resolve } from 'node:path';

import { run } from '../src/install.js';

// `hire-juno chat` needs no installer step at all — chat/ only reads
// team/ at runtime, it never writes into the target repo — so there
// is nothing to "retrofit". The gap was discoverability: a second,
// separately-named bin (hire-juno-chat) that npx's multi-bin syntax
// makes awkward to reach. A subcommand on the one bin people already
// know how to invoke is the fix, not a real install step.
if (process.argv[2] === 'chat') {
  const { runChatServer } = await import('../chat/server/index.js');
  const dirFlagIndex = process.argv.indexOf('--dir');
  const targetDir = dirFlagIndex !== -1 && process.argv[dirFlagIndex + 1]
    ? resolve(process.argv[dirFlagIndex + 1])
    : process.cwd();

  runChatServer({ targetDir }).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
} else {
  run().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
