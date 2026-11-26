#!/usr/bin/env node
// hire-juno-room: the shared room for the people of a workforce on a
// server. See chat/room/server.js and chat/README.md.
//
//   hire-juno-room --socket <path> --db <path> --members <file.json>
import { resolve } from 'node:path';

import { runRoomServer } from '../room/server.js';

function flag(name) {
  const i = process.argv.indexOf(name);
  const value = i === -1 ? null : process.argv[i + 1];
  if (!value || value.startsWith('--')) {
    console.error(`${name} is required: hire-juno-room --socket <path> --db <path> --members <file.json>`);
    process.exit(1);
  }
  return resolve(value);
}

const socketPath = flag('--socket');
const dbPath = flag('--db');
const membersFile = flag('--members');

runRoomServer({ socketPath, dbPath, membersFile })
  .then(() => console.log(`Room listening on ${socketPath}.`))
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
