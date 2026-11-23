import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const CHAT_BIN = join(dirname(fileURLToPath(import.meta.url)), '..', 'chat', 'bin', 'chat.js');

function makeWorkforce(root) {
  const dir = join(root, 'workforce');
  mkdirSync(join(dir, 'team', 'juno'), { recursive: true });
  writeFileSync(
    join(dir, 'team', 'juno', 'profile.md'),
    '---\nname: juno\nrole: HR\nstatus: active\nadapter: [claude-code]\n---\n\nBody.\n'
  );
  writeFileSync(join(dir, 'CONSTITUTION.md'), '---\nworkforce: sockettest\n---\n');
  return dir;
}

// Starts the CLI with its own HOME, so nothing here touches the real
// registry or chat history of whoever runs the tests.
function startChat(args, home) {
  const child = spawn(process.execPath, [CHAT_BIN, ...args], {
    env: { ...process.env, HOME: home },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`chat did not start:\n${output}`)), 15000);
    child.stdout.on('data', () => {
      if (output.includes('Chat listening on')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`chat exited with ${code}:\n${output}`));
    });
  });
  // Runs that are expected to fail are only awaited through `exited`.
  ready.catch(() => {});
  const exited = new Promise((resolve) => child.once('exit', (code) => resolve({ code, output })));
  return { child, ready, exited };
}

function get(socketPath, path) {
  return new Promise((resolve, reject) => {
    const req = request({ socketPath, path, method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.once('error', reject);
    req.end();
  });
}

test('--socket serves the chat from the root of a Unix socket, without a token, owner and group only', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-socket-'));
  const socketPath = join(root, 'chat.sock');
  const { child, ready, exited } = startChat(['--dir', makeWorkforce(root), '--socket', socketPath], root);
  try {
    await ready;
    assert.equal(lstatSync(socketPath).mode & 0o777, 0o660);

    const status = await get(socketPath, '/api/status');
    assert.equal(status.status, 200);
    assert.equal(JSON.parse(status.body).teamName, 'sockettest');

    const colleagues = JSON.parse((await get(socketPath, '/api/colleagues')).body);
    assert.deepEqual(colleagues.map((c) => c.id), ['juno']);

    const page = await get(socketPath, '/');
    assert.equal(page.status, 200);
    assert.match(page.body, /<html/i);

    // Nothing about a TCP address is written down for a socket server.
    assert.equal(existsSync(join(root, '.hire-juno', 'known-workforces.json')), false);
  } finally {
    child.kill('SIGTERM');
    await exited;
    rmSync(root, { recursive: true, force: true });
  }
});

test('--socket refuses to take over a socket another chat still listens on', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-socket-'));
  const socketPath = join(root, 'chat.sock');
  const dir = makeWorkforce(root);
  const first = startChat(['--dir', dir, '--socket', socketPath], root);
  try {
    await first.ready;
    const second = startChat(['--dir', dir, '--socket', socketPath], root);
    const { code, output } = await second.exited;
    assert.notEqual(code, 0);
    assert.match(output, /already listening/);
    assert.equal((await get(socketPath, '/api/status')).status, 200);
  } finally {
    first.child.kill('SIGTERM');
    await first.exited;
    rmSync(root, { recursive: true, force: true });
  }
});

test('--person and --context-file need --socket', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-socket-'));
  try {
    for (const extra of [['--person', 'ana'], ['--context-file', join(root, 'note.md')]]) {
      const { exited } = startChat(['--dir', makeWorkforce(root), ...extra], root);
      const { code, output } = await exited;
      assert.notEqual(code, 0);
      assert.match(output, /only apply together with --socket/);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('--socket cannot be combined with --lan or --port', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-socket-'));
  try {
    for (const extra of [['--lan'], ['--port', '7777']]) {
      const { exited } = startChat(['--dir', makeWorkforce(root), '--socket', join(root, 's.sock'), ...extra], root);
      const { code, output } = await exited;
      assert.notEqual(code, 0);
      assert.match(output, /cannot be combined/);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
