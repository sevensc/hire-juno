#!/usr/bin/env node
import { resolve } from 'node:path';

import { runChatServer } from '../server/index.js';
import { findLayout } from '../server/roster.js';
import { getActiveWorkforce } from '../../shared/workforceRegistry.js';
import { parsePortFlag } from '../../shared/portFlag.js';

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

// `--port <n>` fixes the port (see shared/portFlag.js); without it the
// workforce keeps the port it was first served on.
let port = null;
try {
  port = parsePortFlag(process.argv);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

// `--socket <path>` serves the chat on a Unix domain socket instead of a
// TCP port, for running behind an authenticating reverse proxy on a
// server (see chat/README.md, "Running behind a login proxy"). Who may
// connect is then decided by the socket file's owner and group alone, so
// it excludes the two flags that widen or fix a TCP listener.
const socketFlagIndex = process.argv.indexOf('--socket');
let socketPath = null;
if (socketFlagIndex !== -1) {
  const value = process.argv[socketFlagIndex + 1];
  if (!value || value.startsWith('--')) {
    console.error('--socket needs a path, e.g. --socket /run/hire-juno/chat.sock');
    process.exit(1);
  }
  if (lan || port) {
    console.error('--socket cannot be combined with --lan or --port: the socket replaces the TCP listener.');
    process.exit(1);
  }
  socketPath = resolve(value);
}

// `--person <name>` and `--context-file <path>` describe a socket server to
// the colleagues: who this instance belongs to, and a note about the server
// itself. They mean nothing on a personal machine, so they need --socket.
function flagValue(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return null;
  const value = process.argv[i + 1];
  if (!value || value.startsWith('--')) {
    console.error(`${name} needs a value.`);
    process.exit(1);
  }
  return value;
}
const person = flagValue('--person');
const contextFlag = flagValue('--context-file');
if ((person || contextFlag) && !socketPath) {
  console.error('--person and --context-file only apply together with --socket.');
  process.exit(1);
}
const contextFile = contextFlag ? resolve(contextFlag) : null;

// `--room-socket <path> --room-token-file <path>`: connect to a team room
// (hire-juno-room) and show it as the channel #team. Socket servers only.
const roomSocket = flagValue('--room-socket');
const roomTokenFile = flagValue('--room-token-file');
if ((roomSocket || roomTokenFile) && !(roomSocket && roomTokenFile && socketPath)) {
  console.error('--room-socket and --room-token-file go together, and only with --socket.');
  process.exit(1);
}
const room = roomSocket ? { socketPath: resolve(roomSocket), tokenFile: resolve(roomTokenFile) } : null;

// `--turn-url <host:port> --turn-secret-file <path>`: a TURN server for
// video calls in the team room. Only together with the room.
const turnUrl = flagValue('--turn-url');
const turnSecretFile = flagValue('--turn-secret-file');
if ((turnUrl || turnSecretFile) && !(turnUrl && turnSecretFile && room)) {
  console.error('--turn-url and --turn-secret-file go together, and only with --room-socket.');
  process.exit(1);
}
const turn = turnUrl ? { url: turnUrl, secretFile: resolve(turnSecretFile) } : null;

runChatServer({ targetDir, lan, port, socketPath, person: person || '', contextFile, room, turn, openBrowser: !socketPath }).catch((err) => {
  if (port) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  console.error(err);
  process.exitCode = 1;
});
