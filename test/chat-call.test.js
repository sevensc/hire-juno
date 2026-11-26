import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import WebSocket from 'ws';

import { hashToken, runRoomServer } from '../chat/room/server.js';
import { turnCredentials, turnIceServers } from '../chat/server/turn.js';

test('TURN credentials follow the shared-secret scheme and expire', () => {
  const { username, credential } = turnCredentials('s3cret', 'ana!', { ttlSeconds: 60, now: 1000 });
  assert.equal(username, '1060:ana');
  assert.equal(credential, createHmac('sha1', 's3cret').update('1060:ana').digest('base64'));
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-turn-'));
  try {
    writeFileSync(join(root, 'secret'), 's3cret\n');
    const servers = turnIceServers({ url: 'turn.example:3478', secretFile: join(root, 'secret') }, 'ana', { ttlSeconds: 60, now: 1000 });
    assert.deepEqual(servers[0], { urls: ['stun:turn.example:3478'] });
    assert.deepEqual(servers[1].urls, ['turn:turn.example:3478?transport=udp', 'turn:turn.example:3478?transport=tcp']);
    assert.equal(servers[1].username, '1060:ana');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the room relays call signals to the addressed member only, stamped with the sender, and stores nothing', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-room-'));
  const tokens = { ana: 'tok-ana-' + 'a'.repeat(30), ben: 'tok-ben-' + 'b'.repeat(30), cem: 'tok-cem-' + 'c'.repeat(30) };
  const membersFile = join(root, 'members.json');
  writeFileSync(membersFile, JSON.stringify(Object.entries(tokens).map(([id, t]) => ({ id, name: id, tokenSha256: hashToken(t) }))));
  const socketPath = join(root, 'room.sock');
  const server = await runRoomServer({ socketPath, dbPath: join(root, 'room.db'), membersFile });
  const connect = async (id) => {
    const ws = new WebSocket(`ws+unix://${socketPath}:/ws`, { headers: { Authorization: `Bearer ${tokens[id]}` } });
    const got = [];
    ws.on('message', (raw) => got.push(JSON.parse(raw)));
    await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
    return { ws, got };
  };
  try {
    const [ana, ben, cem] = [await connect('ana'), await connect('ben'), await connect('cem')];
    ana.ws.send(JSON.stringify({ type: 'signal', to: 'ben', data: { kind: 'offer', tab: 't1' } }));
    ana.ws.send(JSON.stringify({ type: 'signal', to: '*', data: { kind: 'join', tab: 't1' } }));
    await new Promise((r) => setTimeout(r, 200));
    const signals = (c) => c.got.filter((m) => m.type === 'signal');
    assert.deepEqual(signals(ben), [{ type: 'signal', from: 'ana', data: { kind: 'offer', tab: 't1' } }, { type: 'signal', from: 'ana', data: { kind: 'join', tab: 't1' } }]);
    assert.deepEqual(signals(cem), [{ type: 'signal', from: 'ana', data: { kind: 'join', tab: 't1' } }]);
    assert.deepEqual(signals(ana), []);
    const fresh = await connect('cem');
    await new Promise((r) => setTimeout(r, 100));
    assert.deepEqual(fresh.got.find((m) => m.type === 'welcome').messages, []);
    for (const c of [ana, ben, cem, fresh]) c.ws.close();
  } finally {
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});
