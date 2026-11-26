import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import WebSocket from 'ws';

import { hashToken, memberForToken, runRoomServer } from '../chat/room/server.js';
import { roomContextLines, roomMentions, roomRow } from '../chat/server/room.js';

const CHAT_BIN = join(dirname(fileURLToPath(import.meta.url)), '..', 'chat', 'bin', 'chat.js');

function setupRoom(root) {
  const members = [
    { id: 'ana', name: 'Ana', token: 'token-ana-' + 'x'.repeat(30) },
    { id: 'ben', name: 'Ben', token: 'token-ben-' + 'y'.repeat(30) },
  ];
  const membersFile = join(root, 'members.json');
  writeFileSync(membersFile, JSON.stringify(members.map(({ id, name, token }) => ({ id, name, tokenSha256: hashToken(token) }))));
  return { members, membersFile, socketPath: join(root, 'room.sock'), dbPath: join(root, 'room.db') };
}

function client(socketPath, token) {
  const ws = new WebSocket(`ws+unix://${socketPath}:/ws`, { headers: { Authorization: `Bearer ${token}` } });
  const inbox = [];
  const waiters = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    inbox.push(msg);
    for (const w of [...waiters]) if (w.match(msg)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(msg); }
  });
  const next = (match) => {
    const found = inbox.find(match);
    if (found) { inbox.splice(inbox.indexOf(found), 1); return Promise.resolve(found); }
    return new Promise((resolve) => waiters.push({ match: (m) => { if (match(m)) { const i = inbox.indexOf(m); if (i !== -1) inbox.splice(i, 1); return true; } return false; }, resolve }));
  };
  return { ws, next, opened: new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); ws.once('unexpected-response', (_, res) => reject(new Error(String(res.statusCode)))); }) };
}

test('room helpers: explicit @names only, rows per sender kind, context lines', () => {
  const roster = [{ id: 'rami', name: 'Rami' }, { id: 'vera', name: 'Vera' }];
  assert.deepEqual(roomMentions('@Rami and @vera, also @rami again', roster), ['rami', 'vera']);
  assert.deepEqual(roomMentions('@all please look', roster), []);
  const known = new Set(['rami']);
  const human = { memberId: 'ben', memberName: 'Ben', agent: null, text: 'hi', createdAt: 't' };
  assert.deepEqual(roomRow(human, 'ana', known), { text: 'hi', created_at: 't', attachments: null, sender_id: 'human:ben', sender_name: 'Ben' });
  assert.equal(roomRow({ ...human, memberId: 'ana' }, 'ana', known).sender_id, 'you');
  const agent = { ...human, agent: { id: 'rami', name: 'Rami' } };
  assert.equal(roomRow(agent, 'ana', known).sender_id, 'rami');
  assert.equal(roomRow(agent, 'ana', known).sender_name, 'Rami · for Ben');
  assert.equal(roomRow({ ...agent, memberId: 'ana' }, 'ana', known).sender_name, 'Rami');
  assert.equal(roomRow({ ...agent, agent: { id: 'zed', name: 'Zed' } }, 'ana', known).sender_id, 'agent:zed');
  assert.equal(roomContextLines([human, agent]), '[Team room] Ben: hi\n[Team room] Rami (for Ben): hi');
});

test('the room only lets members in, by token, and posts are always labelled with the token\'s member', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-room-'));
  const cfg = setupRoom(root);
  const server = await runRoomServer(cfg);
  try {
    assert.equal(memberForToken([], 'x'), null);
    const stranger = client(cfg.socketPath, 'wrong-token');
    await assert.rejects(stranger.opened, /401/);

    const ana = client(cfg.socketPath, cfg.members[0].token);
    const ben = client(cfg.socketPath, cfg.members[1].token);
    await Promise.all([ana.opened, ben.opened]);
    const welcome = await ana.next((m) => m.type === 'welcome');
    assert.deepEqual(welcome.you, { id: 'ana', name: 'Ana' });
    assert.deepEqual(welcome.members.map((m) => m.id), ['ana', 'ben']);
    await ben.next((m) => m.type === 'welcome');

    ana.ws.send(JSON.stringify({ type: 'post', text: 'Hallo', memberId: 'ben' }));
    const seenByBen = await ben.next((m) => m.type === 'message');
    assert.equal(seenByBen.message.memberId, 'ana');
    assert.equal(seenByBen.message.text, 'Hallo');
    await ana.next((m) => m.type === 'message');

    ben.ws.send(JSON.stringify({ type: 'post', text: 'Antwort', agent: { id: 'rami', name: 'Rami' } }));
    const agentPost = await ana.next((m) => m.type === 'message');
    assert.deepEqual(agentPost.message.agent, { id: 'rami', name: 'Rami' });
    assert.equal(agentPost.message.memberId, 'ben');

    ben.ws.send(JSON.stringify({ type: 'post', text: 'x', agent: { id: 'bad id!', name: 'X' } }));
    assert.equal((await ben.next((m) => m.type === 'post_failed')).message, 'Invalid agent label.');

    // History survives a reconnect.
    const again = client(cfg.socketPath, cfg.members[1].token);
    await again.opened;
    const history = await again.next((m) => m.type === 'welcome');
    assert.deepEqual(history.messages.map((m) => m.text), ['Hallo', 'Antwort']);
    for (const c of [ana, ben, again]) c.ws.close();
  } finally {
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});

function get(socketPath, path) {
  return new Promise((resolve, reject) => {
    const req = request({ socketPath, path }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.once('error', reject);
    req.end();
  });
}

test('a chat instance shows the room as #team and posts for its own person', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-room-'));
  const cfg = setupRoom(root);
  const server = await runRoomServer(cfg);
  const dir = join(root, 'workforce');
  mkdirSync(join(dir, 'team', 'rami'), { recursive: true });
  writeFileSync(join(dir, 'team', 'rami', 'profile.md'), '---\nname: Rami\nrole: Dev\nstatus: active\nadapter: [claude-code]\n---\n\nBody.\n');
  writeFileSync(join(dir, 'CONSTITUTION.md'), '---\nworkforce: roomtest\n---\n');
  const tokenFile = join(root, 'ana.token');
  writeFileSync(tokenFile, cfg.members[0].token + '\n');
  const chatSocket = join(root, 'chat.sock');
  const child = spawn(process.execPath, [CHAT_BIN, '--dir', dir, '--socket', chatSocket, '--person', 'Ana',
    '--room-socket', cfg.socketPath, '--room-token-file', tokenFile], { env: { ...process.env, HOME: root }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  try {
    for (let i = 0; i < 100 && !output.includes('Chat listening on'); i++) await new Promise((r) => setTimeout(r, 100));
    assert.match(output, /Chat listening on/);

    const ben = client(cfg.socketPath, cfg.members[1].token);
    await ben.opened;
    await ben.next((m) => m.type === 'welcome');
    ben.ws.send(JSON.stringify({ type: 'post', text: 'Von Ben' }));
    await ben.next((m) => m.type === 'message');

    let channels = [];
    for (let i = 0; i < 50; i++) {
      channels = await get(chatSocket, '/api/channels');
      if (channels[0]?.room?.connected) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.equal(channels[0].id, 'team-room');
    assert.deepEqual(channels[0].room.members.map((m) => m.name), ['Ana', 'Ben']);

    const tab = new WebSocket(`ws+unix://${chatSocket}:/ws`);
    await new Promise((resolve, reject) => { tab.once('open', resolve); tab.once('error', reject); });
    const echo = new Promise((resolve) => tab.on('message', (raw) => {
      const u = JSON.parse(raw);
      if (u.type === 'channel_message' && u.channelId === 'team-room') resolve(u);
    }));
    tab.send(JSON.stringify({ type: 'channel_message', channelId: 'team-room', text: 'Von Ana', attachments: [] }));
    assert.deepEqual(await echo, { channelId: 'team-room', type: 'channel_message', senderId: 'you', senderName: null, text: 'Von Ana' });
    const fromAna = await ben.next((m) => m.type === 'message');
    assert.equal(fromAna.message.memberId, 'ana');
    tab.close();

    const history = await get(chatSocket, '/api/channel-history?channelId=team-room');
    assert.deepEqual(history.map((r) => [r.sender_id, r.text]), [['human:ben', 'Von Ben'], ['you', 'Von Ana']]);
    ben.ws.close();
  } finally {
    child.kill('SIGTERM');
    await exited;
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});
