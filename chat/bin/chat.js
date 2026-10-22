#!/usr/bin/env node
import { resolve } from 'node:path';

import { runChatServer } from '../server/index.js';
import { findLayout } from '../server/roster.js';
import { getActiveWorkforce } from '../../shared/workforceRegistry.js';

// Which workforce a bare `hire-juno-chat` opens, in order:
//
//   1. an explicit --dir — you said it on this launch, nothing should
//      second-guess that;
//   2. the current directory, when it actually is a workforce — you're
//      standing in the repo you want to chat with, the original and
//      still most common case;
//   3. the one last switched to in the app (see workforceRegistry's
//      setActiveWorkforce) — switching in the app only makes
//      sense if the choice survives the process that made it;
//   4. the current directory anyway — not a workforce, nothing
//      remembered, so let the server report the missing team/ folder
//      exactly as it always has rather than invent a target here.
//
// Deliberately in that order and not "remembered wins": starting the
// chat while standing inside a workforce and landing in a different one
// would be the kind of surprise no flag asked for. The remembered one
// only steps in where the old code had nothing better to offer either.
const dirFlagIndex = process.argv.indexOf('--dir');
const explicitDir = dirFlagIndex !== -1 && process.argv[dirFlagIndex + 1]
  ? resolve(process.argv[dirFlagIndex + 1])
  : null;
const cwd = process.cwd();
const targetDir = explicitDir
  || (findLayout(cwd) ? cwd : null)
  || getActiveWorkforce()
  || cwd;

// Off by default on purpose — see runChatServer's own comment on what
// changes once this is on. It is meant for the local network only, not
// public internet exposure; an explicit flag instead of a
// config default means nobody else running this same binary gets their
// server opened up to their network without asking for it.
const lan = process.argv.includes('--lan');

runChatServer({ targetDir, lan }).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
