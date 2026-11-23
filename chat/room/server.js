// The team room: one shared conversation for the people of a workforce,
// for a deployment where each person runs their own chat instance on a
// server (see chat/README.md, "Running behind a login proxy"). The
// instances connect here as clients; browsers never do. Each instance
// shows the room as a channel and posts for its own person, or for a
// colleague it ran on that person's behalf.
//
// Who a connection belongs to is decided by a per-person token: the
// members file holds each member's id, display name and the SHA-256 of
// their token, never the token itself. A connection can only ever post
// as its own member, either as the person or as an agent on their behalf.

import { createHash, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, lstatSync, readFileSync, unlinkSync } from 'node:fs';
import { createServer } from 'node:http';
import { connect as netConnect } from 'node:net';

import DatabaseConstructor from 'better-sqlite3';
import { WebSocketServer } from 'ws';

const MAX_TEXT = 20000;
const HISTORY = 200;

export function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

// Members file: [{ "id": "...", "name": "...", "tokenSha256": "<hex>" }].
export function readMembers(file) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error('members file must be a JSON array');
  return list.map((m) => {
    if (typeof m.id !== 'string' || !m.id || typeof m.tokenSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(m.tokenSha256)) {
      throw new Error('every member needs "id" and a hex "tokenSha256"');
    }
    return { id: m.id, name: typeof m.name === 'string' && m.name ? m.name : m.id, tokenSha256: m.tokenSha256 };
  });
}

export function memberForToken(members, token) {
  if (typeof token !== 'string' || !token) return null;
  const given = Buffer.from(hashToken(token), 'hex');
  for (const m of members) {
    const known = Buffer.from(m.tokenSha256, 'hex');
    if (known.length === given.length && timingSafeEqual(known, given)) return m;
  }
  return null;
}

export function openRoomStore(dbPath) {
  const db = new DatabaseConstructor(dbPath);
  db.exec(`CREATE TABLE IF NOT EXISTS room_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    agent_id TEXT,
    agent_name TEXT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
  const insert = db.prepare(
    'INSERT INTO room_messages (member_id, member_name, agent_id, agent_name, text, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const recent = db.prepare('SELECT * FROM room_messages ORDER BY id DESC LIMIT ?');
  const toMessage = (row) => ({
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    agent: row.agent_id ? { id: row.agent_id, name: row.agent_name } : null,
    text: row.text,
    createdAt: row.created_at,
  });
  return {
    append({ member, agent, text }) {
      const createdAt = new Date().toISOString();
      const { lastInsertRowid } = insert.run(member.id, member.name, agent?.id ?? null, agent?.name ?? null, text, createdAt);
      return toMessage({
        id: Number(lastInsertRowid), member_id: member.id, member_name: member.name,
        agent_id: agent?.id ?? null, agent_name: agent?.name ?? null, text, created_at: createdAt,
      });
    },
    recent(limit = HISTORY) {
      return recent.all(limit).reverse().map(toMessage);
    },
    close() {
      db.close();
    },
  };
}

// An agent label sent by an instance: a short id and display name, nothing else.
function cleanAgent(agent) {
  if (!agent) return null;
  const id = typeof agent.id === 'string' ? agent.id.slice(0, 64) : '';
  const name = typeof agent.name === 'string' ? agent.name.slice(0, 80) : '';
  if (!/^[A-Za-z0-9_.-]+$/.test(id) || !name.trim()) return null;
  return { id, name: name.trim() };
}

async function bindSocket(server, socketPath) {
  if (existsSync(socketPath)) {
    if (!lstatSync(socketPath).isSocket()) throw new Error(`${socketPath} exists and is not a socket.`);
    const alive = await new Promise((done) => {
      const probe = netConnect(socketPath);
      probe.once('connect', () => { probe.destroy(); done(true); });
      probe.once('error', () => done(false));
    });
    if (alive) throw new Error(`Another room is already listening on ${socketPath}.`);
    unlinkSync(socketPath);
  }
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(socketPath, () => {
      server.removeAllListeners('error');
      done();
    });
  });
  // Owner and group: the group is the one the chat instances' accounts share.
  chmodSync(socketPath, 0o660);
}

export async function runRoomServer({ socketPath, dbPath, membersFile }) {
  const store = openRoomStore(dbPath);
  const clients = new Set();
  const server = createServer((req, res) => res.writeHead(404).end());
  const wss = new WebSocketServer({ noServer: true });

  const send = (ws, payload) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  };

  server.on('upgrade', (req, socket, head) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    // Re-read on every connection, so adding a member needs no restart.
    let members;
    try {
      members = readMembers(membersFile);
    } catch (err) {
      console.error(`room: cannot read members: ${err.message}`);
      socket.destroy();
      return;
    }
    const member = memberForToken(members, token);
    if (!member || new URL(req.url, 'http://room').pathname !== '/ws') {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      clients.add(ws);
      ws.on('close', () => clients.delete(ws));
      send(ws, {
        type: 'welcome',
        you: { id: member.id, name: member.name },
        members: members.map(({ id, name }) => ({ id, name })),
        messages: store.recent(),
      });
      ws.on('message', (raw) => {
        let payload;
        try {
          payload = JSON.parse(raw.toString('utf8'));
        } catch {
          return;
        }
        if (payload.type !== 'post') return;
        const text = typeof payload.text === 'string' ? payload.text.trim() : '';
        if (!text || text.length > MAX_TEXT) {
          send(ws, { type: 'post_failed', ref: payload.ref, message: 'Empty or too long.' });
          return;
        }
        const agent = cleanAgent(payload.agent);
        if (payload.agent && !agent) {
          send(ws, { type: 'post_failed', ref: payload.ref, message: 'Invalid agent label.' });
          return;
        }
        const message = store.append({ member, agent, text });
        for (const client of clients) send(client, { type: 'message', message, ref: client === ws ? payload.ref : undefined });
      });
    });
  });

  await bindSocket(server, socketPath);
  server.on('close', () => {
    store.close();
    try { unlinkSync(socketPath); } catch { /* already gone */ }
  });
  return server;
}
