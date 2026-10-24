// The port the chat is served on. By default a workforce keeps the port it
// was first bound to (shared/chatSessions.js); `--port <n>` fixes one.

// Reads `--port <n>` or `--port=<n>` from an argument list. Returns the port
// as a number, or null when the flag is absent. Throws an Error with a plain
// message when the value is not a whole number from 1024 to 65535.
export function parsePortFlag(argv) {
  let raw = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') {
      raw = argv[i + 1] ?? '';
      break;
    }
    if (argv[i].startsWith('--port=')) {
      raw = argv[i].slice('--port='.length);
      break;
    }
  }
  if (raw === null) return null;
  const port = Number(raw);
  if (!/^\d+$/.test(raw) || port < 1024 || port > 65535) {
    throw new Error(`--port needs a whole number from 1024 to 65535, got "${raw}".`);
  }
  return port;
}

// The port to write to the remembered sessions, or null for "leave it".
//   - A port given with --port is remembered once it is bound.
//   - Without one, the first launch of a workforce remembers what it got.
//   - If the remembered port was taken and a free one was used instead, the
//     remembered port stays: the clash was temporary, and overwriting it made
//     the address change for good.
export function portToRemember({ bound, remembered, explicit }) {
  if (explicit) return bound === remembered ? null : bound;
  if (remembered == null) return bound;
  return null;
}
