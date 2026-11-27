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
import { mentionsPerson, personHandle, roomContextLines, roomMentions, roomRow, shouldNotify } from '../chat/server/room.js';

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
  const roster = [{ id: 'kim', name: 'Kim' }, { id: 'ida', name: 'Ida' }];
  assert.deepEqual(roomMentions('@Kim and @ida, also @kim again', roster), ['kim', 'ida']);
  assert.deepEqual(roomMentions('@all please look', roster), []);
  const known = new Set(['kim']);
  const human = { memberId: 'ben', memberName: 'Ben', agent: null, text: 'hi', createdAt: 't' };
  assert.deepEqual(roomRow(human, 'ana', known), { room_id: null, text: 'hi', created_at: 't', attachments: null, artifact: null, reply_to: null, reactions: [], sender_id: 'human:ben', sender_name: 'Ben' });
  assert.equal(roomRow({ ...human, memberId: 'ana' }, 'ana', known).sender_id, 'you');
  const agent = { ...human, agent: { id: 'kim', name: 'Kim' } };
  assert.equal(roomRow(agent, 'ana', known).sender_id, 'kim');
  assert.equal(roomRow(agent, 'ana', known).sender_name, 'Kim · for Ben');
  assert.equal(roomRow({ ...agent, memberId: 'ana' }, 'ana', known).sender_name, 'Kim');
  assert.equal(roomRow({ ...agent, agent: { id: 'zed', name: 'Zed' } }, 'ana', known).sender_id, 'agent:zed');
  assert.equal(roomContextLines([human, agent]), '[Team room] Ben: hi\n[Team room] Kim (for Ben): hi');
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

    ben.ws.send(JSON.stringify({ type: 'post', text: 'Antwort', agent: { id: 'kim', name: 'Kim' } }));
    const agentPost = await ana.next((m) => m.type === 'message');
    assert.deepEqual(agentPost.message.agent, { id: 'kim', name: 'Kim' });
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
  mkdirSync(join(dir, 'team', 'kim'), { recursive: true });
  writeFileSync(join(dir, 'team', 'kim', 'profile.md'), '---\nname: Kim\nrole: Dev\nstatus: active\nadapter: [claude-code]\n---\n\nBody.\n');
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
  const openSockets = [];
  try {
    for (let i = 0; i < 100 && !output.includes('Chat listening on'); i++) await new Promise((r) => setTimeout(r, 100));
    assert.match(output, /Chat listening on/);

    const ben = client(cfg.socketPath, cfg.members[1].token);
    openSockets.push(ben.ws);
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
    assert.deepEqual(await echo, { channelId: 'team-room', type: 'channel_message', senderId: 'you', senderName: null, text: 'Von Ana', artifact: null, roomId: 2, replyTo: null, reactions: [], notify: false });
    const fromAna = await ben.next((m) => m.type === 'message');
    assert.equal(fromAna.message.memberId, 'ana');
    tab.close();

    // A call signal from one of Ana's tabs reaches her other tab too (phone and laptop).
    const tab1 = new WebSocket(`ws+unix://${chatSocket}:/ws`);
    const tab2 = new WebSocket(`ws+unix://${chatSocket}:/ws`);
    await Promise.all([tab1, tab2].map((t) => new Promise((resolve, reject) => { t.once('open', resolve); t.once('error', reject); })));
    const onOtherTab = new Promise((resolve) => tab2.on('message', (raw) => {
      const u = JSON.parse(raw);
      if (u.type === 'call_signal') resolve(u);
    }));
    tab1.send(JSON.stringify({ type: 'call_signal', to: '*', data: { kind: 'join', tab: 'p1' } }));
    assert.deepEqual(await onOtherTab, { type: 'call_signal', from: 'ana', data: { kind: 'join', tab: 'p1' } });
    const atBen = await ben.next((m) => m.type === 'signal');
    assert.deepEqual(atBen, { type: 'signal', from: 'ana', data: { kind: 'join', tab: 'p1' } });
    tab1.close();
    tab2.close();

    // A reply from a tab points to the room message; a reaction comes back to every tab.
    const tab3 = new WebSocket(`ws+unix://${chatSocket}:/ws`);
    await new Promise((resolve, reject) => { tab3.once('open', resolve); tab3.once('error', reject); });
    const tabUpdates = [];
    const tabNext = (pred) => new Promise((resolve) => {
      const found = tabUpdates.find(pred);
      if (found) return resolve(found);
      tab3.on('message', (raw) => {
        const u = JSON.parse(raw);
        if (pred(u)) resolve(u);
      });
    });
    const replyEcho = tabNext((u) => u.type === 'channel_message' && u.text === 'Gern');
    tab3.send(JSON.stringify({ type: 'channel_message', channelId: 'team-room', text: 'Gern', replyTo: 1, attachments: [] }));
    const reply = await replyEcho;
    assert.deepEqual(reply.replyTo, { id: 1, name: 'Ben', excerpt: 'Von Ben', mine: false, agent: false });
    const atBenReply = await ben.next((m) => m.type === 'message' && m.message.text === 'Gern');
    assert.equal(atBenReply.message.replyTo.memberId, 'ben');
    const reacted = tabNext((u) => u.type === 'room_reactions');
    tab3.send(JSON.stringify({ type: 'room_react', roomId: 1, emoji: '❤️' }));
    assert.deepEqual(await reacted, { type: 'room_reactions', channelId: 'team-room', roomId: 1, reactions: [{ emoji: '❤️', members: [{ id: 'ana', name: 'Ana' }] }] });
    tab3.close();

    const history = await get(chatSocket, '/api/channel-history?channelId=team-room');
    assert.deepEqual(history.map((r) => [r.sender_id, r.text]), [['human:ben', 'Von Ben'], ['you', 'Von Ana'], ['you', 'Gern']]);
    assert.deepEqual(history[0].reactions, [{ emoji: '❤️', members: [{ id: 'ana', name: 'Ana' }] }]);
    assert.equal(history[2].reply_to.id, 1);
    ben.ws.close();
  } finally {
    child.kill('SIGTERM');
    await exited;
    for (const ws of openSockets) ws.terminate();
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});

test('people are mentioned by their handle, which never brings in a colleague', () => {
  assert.equal(personHandle('Jürgen Müller-Lüdenscheidt'), 'jurgenmuller-ludenscheidt');
  assert.equal(mentionsPerson('Kannst du mal schauen, @Lena?', 'Lena'), true);
  assert.equal(mentionsPerson('@lenai meinte etwas anderes', 'Lena'), false);
  assert.deepEqual(roomMentions('@lena und @kim', [{ id: 'kim', name: 'Kim' }]), ['kim']);
});

test('team notifications follow the person\'s choice', () => {
  const you = { id: 'ana', name: 'Ana' };
  const fromBen = { memberId: 'ben', memberName: 'Ben', agent: null, text: 'Hallo' };
  const toAna = { ...fromBen, text: '@ana schau mal' };
  const replyToAna = { ...fromBen, text: '> **Ana:** Frage\n\nAntwort' };
  const ramiForAna = { memberId: 'ana', memberName: 'Ana', agent: { id: 'kim', name: 'Kim' }, text: 'Fertig' };
  const ramiForBen = { ...ramiForAna, memberId: 'ben', memberName: 'Ben' };
  const own = { memberId: 'ana', memberName: 'Ana', agent: null, text: 'Ich' };
  const all = [fromBen, toAna, replyToAna, ramiForAna, ramiForBen];
  const pick = (mode) => all.filter((m) => shouldNotify(mode, m, you));
  assert.equal(shouldNotify('all', own, you), false);
  assert.deepEqual(pick('all'), all);
  assert.deepEqual(pick('mentions'), [toAna, replyToAna]);
  assert.deepEqual(pick('people'), [fromBen, toAna, replyToAna]);
  assert.deepEqual(pick('mine'), [ramiForAna]);
});

test('pictures in the room: kept with the message, fetched by id, only images and only a few', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-room-'));
  const cfg = setupRoom(root);
  const server = await runRoomServer(cfg);
  try {
    const ana = client(cfg.socketPath, cfg.members[0].token);
    const ben = client(cfg.socketPath, cfg.members[1].token);
    await Promise.all([ana.opened, ben.opened]);
    await Promise.all([ana.next((m) => m.type === 'welcome'), ben.next((m) => m.type === 'welcome')]);

    const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex').toString('base64');
    // A picture without text is a message too.
    ana.ws.send(JSON.stringify({ type: 'post', text: '', attachments: [{ name: 'shot.png', mimeType: 'image/png', data: png }] }));
    const seen = (await ben.next((m) => m.type === 'message')).message;
    assert.equal(seen.text, '');
    assert.equal(seen.attachments.length, 1);
    const { id, name, mimeType, data } = seen.attachments[0];
    assert.deepEqual({ name, mimeType, data }, { name: 'shot.png', mimeType: 'image/png', data: undefined });

    ben.ws.send(JSON.stringify({ type: 'get_attachment', id, ref: 7 }));
    const got = await ben.next((m) => m.type === 'attachment');
    assert.equal(got.ref, 7);
    assert.equal(got.attachment.data, png);
    assert.equal(got.attachment.mimeType, 'image/png');

    const row = roomRow(seen, 'ben', new Set());
    assert.equal(row.attachments[0].url, `api/room-attachment?id=${id}`);
    assert.equal(roomRow({ ...seen, attachments: [] }, 'ben', new Set()).attachments, null);

    ana.ws.send(JSON.stringify({ type: 'post', text: 'x', attachments: [{ name: 'a.svg', mimeType: 'image/svg+xml', data: png }] }));
    assert.match((await ana.next((m) => m.type === 'post_failed')).message, /pictures/);
    const many = Array.from({ length: 5 }, () => ({ name: 'p.png', mimeType: 'image/png', data: png }));
    ana.ws.send(JSON.stringify({ type: 'post', text: 'x', attachments: many }));
    assert.match((await ana.next((m) => m.type === 'post_failed')).message, /pictures/);

    // History carries the list, not the bytes.
    const again = client(cfg.socketPath, cfg.members[1].token);
    await again.opened;
    const history = await again.next((m) => m.type === 'welcome');
    assert.deepEqual(history.messages.at(-1).attachments, [{ id, name: 'shot.png', mimeType: 'image/png' }]);
    for (const c of [ana, ben, again]) c.ws.close();
  } finally {
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});

test('postAndWait resolves only after the room\'s echo reached onMessage', async () => {
  const root = mkdtempSync(join(tmpdir(), 'hire-juno-room-'));
  const cfg = setupRoom(root);
  const server = await runRoomServer(cfg);
  const { connectRoom } = await import('../chat/server/roomClient.js');
  const tokenFile = join(root, 'ana.token');
  writeFileSync(tokenFile, cfg.members[0].token + '\n');
  const seen = [];
  let ready;
  const welcomed = new Promise((r) => { ready = r; });
  const conn = connectRoom({ socketPath: cfg.socketPath, tokenFile, onWelcome: () => ready(), onMessage: (m) => seen.push(m.text) });
  try {
    await welcomed;
    assert.equal(await conn.postAndWait('Frage an @kim'), true);
    assert.deepEqual(seen, ['Frage an @kim']);
  } finally {
    conn.close();
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});

test('room replies keep what they answer; reactions are one per person, the same again takes it back', async () => {
  const root = mkdtempSync(join(tmpdir(), 'room-react-'));
  const { members, membersFile, socketPath, dbPath } = setupRoom(root);
  const server = await runRoomServer({ socketPath, dbPath, membersFile });
  const ana = client(socketPath, members[0].token);
  const ben = client(socketPath, members[1].token);
  try {
    await Promise.all([ana.opened, ben.opened]);
    await ana.next((m) => m.type === 'welcome');
    await ben.next((m) => m.type === 'welcome');
    ana.ws.send(JSON.stringify({ type: 'post', text: '> **Kim:** old quote\n\nShall we ship it today?' }));
    const first = (await ben.next((m) => m.type === 'message')).message;
    ben.ws.send(JSON.stringify({ type: 'post', text: 'Yes', replyTo: first.id }));
    const reply = (await ana.next((m) => m.type === 'message' && m.message.text === 'Yes')).message;
    assert.deepEqual(reply.replyTo, { id: first.id, memberId: 'ana', memberName: 'Ana', agent: null, excerpt: 'Shall we ship it today?' });
    // An unknown id is no reply, the message still goes out.
    ben.ws.send(JSON.stringify({ type: 'post', text: 'Lost', replyTo: 999 }));
    assert.equal((await ana.next((m) => m.type === 'message' && m.message.text === 'Lost')).message.replyTo, null);
    // The person who was answered is told in "mentions" mode.
    assert.equal(shouldNotify('mentions', reply, { id: 'ana', name: 'Ana' }), true);
    assert.equal(shouldNotify('mentions', reply, { id: 'cem', name: 'Cem' }), false);

    const reactions = () => ana.next((m) => m.type === 'reactions');
    ana.ws.send(JSON.stringify({ type: 'react', messageId: first.id, emoji: '👍' }));
    assert.deepEqual((await reactions()).reactions, [{ emoji: '👍', members: [{ id: 'ana', name: 'Ana' }] }]);
    ben.ws.send(JSON.stringify({ type: 'react', messageId: first.id, emoji: '👍' }));
    assert.deepEqual((await reactions()).reactions, [{ emoji: '👍', members: [{ id: 'ana', name: 'Ana' }, { id: 'ben', name: 'Ben' }] }]);
    // Another emoji replaces the person's own; the same one again takes it back.
    ben.ws.send(JSON.stringify({ type: 'react', messageId: first.id, emoji: '😂' }));
    assert.deepEqual((await reactions()).reactions, [{ emoji: '👍', members: [{ id: 'ana', name: 'Ana' }] }, { emoji: '😂', members: [{ id: 'ben', name: 'Ben' }] }]);
    ana.ws.send(JSON.stringify({ type: 'react', messageId: first.id, emoji: '👍' }));
    assert.deepEqual((await reactions()).reactions, [{ emoji: '😂', members: [{ id: 'ben', name: 'Ben' }] }]);
    // No text, no unknown message: nothing happens.
    ana.ws.send(JSON.stringify({ type: 'react', messageId: first.id, emoji: 'ok' }));
    ana.ws.send(JSON.stringify({ type: 'react', messageId: 999, emoji: '👍' }));
    ana.ws.send(JSON.stringify({ type: 'react', messageId: reply.id, emoji: '🙏' }));
    const last = await reactions();
    assert.equal(last.messageId, reply.id);

    // A new connection gets replies and reactions with the history.
    const cem = client(socketPath, members[0].token);
    await cem.opened;
    const welcome = await cem.next((m) => m.type === 'welcome');
    const byId = new Map(welcome.messages.map((m) => [m.id, m]));
    assert.deepEqual(byId.get(first.id).reactions, [{ emoji: '😂', members: [{ id: 'ben', name: 'Ben' }] }]);
    assert.equal(byId.get(reply.id).replyTo.id, first.id);
    assert.match(roomContextLines([byId.get(reply.id)]), /^\[Team room\] Ben \(replying to Ana: "Shall we ship it today\?"\): Yes$/);
    cem.ws.close();
  } finally {
    ana.ws.close();
    ben.ws.close();
    server.close();
    rmSync(root, { recursive: true, force: true });
  }
});
