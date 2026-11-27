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
const MAX_ARTIFACT = 1_000_000;
const ARTIFACT_KINDS = new Set(['transcript', 'document']);
const HISTORY = 200;
// Pictures in the room: the same types a chat accepts (server/store.js).
const ATTACHMENT_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Attachments sent with a post: [{ name, mimeType, data (base64) }], only
// pictures, a few at most; null when one of them is not acceptable.
export function cleanAttachments(list) {
  if (list == null) return [];
  if (!Array.isArray(list) || list.length > MAX_ATTACHMENTS) return null;
  const out = [];
  for (const a of list) {
    if (!a || !ATTACHMENT_TYPES.has(a.mimeType) || typeof a.data !== 'string') return null;
    const data = Buffer.from(a.data, 'base64');
    if (!data.length || data.length > MAX_ATTACHMENT_BYTES) return null;
    const name = typeof a.name === 'string' && a.name.trim() ? a.name.trim().slice(0, 200) : 'image';
    out.push({ name, mimeType: a.mimeType, data });
  }
  return out;
}

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
  // An artifact is a document kept in the room (a call transcript, for
  // instance); the conversation only carries a message pointing to it.
  db.exec(`CREATE TABLE IF NOT EXISTS room_artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
  for (const column of ['artifact TEXT', 'attachments TEXT']) {
    try {
      db.exec(`ALTER TABLE room_messages ADD COLUMN ${column}`);
    } catch (err) {
      if (!/duplicate column/i.test(err.message)) throw err;
    }
  }
  // Pictures posted in the room; a message lists theirs as [{id, name, mimeType}].
  db.exec(`CREATE TABLE IF NOT EXISTS room_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    data BLOB NOT NULL,
    created_at TEXT NOT NULL
  )`);
  const insertAttachment = db.prepare('INSERT INTO room_attachments (name, mime_type, data, created_at) VALUES (?, ?, ?, ?)');
  const attachmentById = db.prepare('SELECT * FROM room_attachments WHERE id = ?');
  const insert = db.prepare(
    'INSERT INTO room_messages (member_id, member_name, agent_id, agent_name, text, created_at, artifact, attachments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertArtifact = db.prepare(
    'INSERT INTO room_artifacts (member_id, member_name, kind, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const artifactById = db.prepare('SELECT * FROM room_artifacts WHERE id = ?');
  // Open questions of the team: what someone marked with ❓, until someone
  // marks it as done.
  db.exec(`CREATE TABLE IF NOT EXISTS room_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    source TEXT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    done_at TEXT,
    done_by TEXT
  )`);
  const openQuestions = db.prepare('SELECT * FROM room_questions WHERE done_at IS NULL ORDER BY id');
  const insertQuestion = db.prepare('INSERT INTO room_questions (member_id, member_name, source, text, created_at) VALUES (?, ?, ?, ?, ?)');
  const finishQuestion = db.prepare('UPDATE room_questions SET done_at = ?, done_by = ? WHERE id = ? AND done_at IS NULL');
  const recent = db.prepare('SELECT * FROM room_messages ORDER BY id DESC LIMIT ?');
  const toMessage = (row) => ({
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    agent: row.agent_id ? { id: row.agent_id, name: row.agent_name } : null,
    text: row.text,
    createdAt: row.created_at,
    artifact: row.artifact ? JSON.parse(row.artifact) : null,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
  });
  return {
    append({ member, agent, text, artifact = null, attachments = [] }) {
      const createdAt = new Date().toISOString();
      const ref = artifact ? JSON.stringify(artifact) : null;
      const stored = attachments.map((a) => ({
        id: Number(insertAttachment.run(a.name, a.mimeType, a.data, createdAt).lastInsertRowid),
        name: a.name,
        mimeType: a.mimeType,
      }));
      const list = stored.length ? JSON.stringify(stored) : null;
      const { lastInsertRowid } = insert.run(member.id, member.name, agent?.id ?? null, agent?.name ?? null, text, createdAt, ref, list);
      return toMessage({
        id: Number(lastInsertRowid), member_id: member.id, member_name: member.name,
        agent_id: agent?.id ?? null, agent_name: agent?.name ?? null, text, created_at: createdAt, artifact: ref, attachments: list,
      });
    },
    attachment(id) {
      const row = attachmentById.get(id);
      return row ? { id: row.id, name: row.name, mimeType: row.mime_type, data: row.data } : null;
    },
    addArtifact({ member, kind, title, content }) {
      const createdAt = new Date().toISOString();
      const { lastInsertRowid } = insertArtifact.run(member.id, member.name, kind, title, content, createdAt);
      return { id: Number(lastInsertRowid), kind, title };
    },
    questions() {
      return openQuestions.all().map((r) => ({ id: r.id, text: r.text, source: r.source, askedBy: r.member_name, createdAt: r.created_at }));
    },
    addQuestion({ member, text, source }) {
      insertQuestion.run(member.id, member.name, source || null, text, new Date().toISOString());
    },
    finishQuestion(id, member) {
      finishQuestion.run(new Date().toISOString(), member.name, id);
    },
    clear() {
      db.exec('DELETE FROM room_messages; DELETE FROM room_artifacts; DELETE FROM room_attachments;');
    },
    artifact(id) {
      const row = artifactById.get(id);
      return row
        ? { id: row.id, kind: row.kind, title: row.title, content: row.content, memberId: row.member_id, memberName: row.member_name, createdAt: row.created_at }
        : null;
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
      ws.member = member;
      clients.add(ws);
      ws.on('close', () => clients.delete(ws));
      send(ws, {
        type: 'welcome',
        you: { id: member.id, name: member.name },
        members: members.map(({ id, name }) => ({ id, name })),
        messages: store.recent(),
        questions: store.questions(),
      });
      ws.on('message', (raw) => {
        let payload;
        try {
          payload = JSON.parse(raw.toString('utf8'));
        } catch {
          return;
        }
        // Call signalling: relayed to the addressed member's connections (or
        // to every other connection for `to: '*'`), stamped with the sender,
        // never stored. The payload is opaque to the room.
        if (payload.type === 'signal') {
          const data = payload.data;
          if (!data || typeof data !== 'object' || JSON.stringify(data).length > 64000) return;
          const to = typeof payload.to === 'string' ? payload.to : null;
          if (!to) return;
          for (const client of clients) {
            if (client === ws) continue;
            if (to !== '*' && client.member?.id !== to) continue;
            send(client, { type: 'signal', from: member.id, data });
          }
          return;
        }
        if (payload.type === 'artifact') {
          const kind = ARTIFACT_KINDS.has(payload.kind) ? payload.kind : null;
          const title = typeof payload.title === 'string' ? payload.title.trim().slice(0, 200) : '';
          const content = typeof payload.content === 'string' ? payload.content : '';
          if (!kind || !title || !content || content.length > MAX_ARTIFACT) {
            send(ws, { type: 'post_failed', ref: payload.ref, message: 'Invalid artifact.' });
            return;
          }
          const artifact = store.addArtifact({ member, kind, title, content });
          const message = store.append({ member, agent: null, text: title, artifact });
          for (const client of clients) send(client, { type: 'message', message });
          return;
        }
        // Clears the whole conversation and its artifacts, for everyone.
        if (payload.type === 'clear') {
          store.clear();
          for (const client of clients) send(client, { type: 'cleared', by: member.id });
          return;
        }
        if (payload.type === 'question_add' || payload.type === 'question_done') {
          if (payload.type === 'question_add') {
            const text = typeof payload.text === 'string' ? payload.text.trim().slice(0, 2000) : '';
            const source = typeof payload.source === 'string' ? payload.source.slice(0, 80) : null;
            if (!text) return;
            store.addQuestion({ member, text, source });
          } else if (Number.isInteger(payload.id)) {
            store.finishQuestion(payload.id, member);
          }
          const questions = store.questions();
          for (const client of clients) send(client, { type: 'questions', questions });
          return;
        }
        if (payload.type === 'get_artifact') {
          const artifact = Number.isInteger(payload.id) ? store.artifact(payload.id) : null;
          send(ws, { type: 'artifact', ref: payload.ref, artifact });
          return;
        }
        if (payload.type === 'get_attachment') {
          const found = Number.isInteger(payload.id) ? store.attachment(payload.id) : null;
          const attachment = found ? { ...found, data: found.data.toString('base64') } : null;
          send(ws, { type: 'attachment', ref: payload.ref, attachment });
          return;
        }
        if (payload.type !== 'post') return;
        const text = typeof payload.text === 'string' ? payload.text.trim() : '';
        const attachments = cleanAttachments(payload.attachments);
        if (!attachments) {
          send(ws, { type: 'post_failed', ref: payload.ref, message: 'Only a few pictures (PNG, JPEG, GIF, WebP) up to 10 MB each.' });
          return;
        }
        if ((!text && !attachments.length) || text.length > MAX_TEXT) {
          send(ws, { type: 'post_failed', ref: payload.ref, message: 'Empty or too long.' });
          return;
        }
        const agent = cleanAgent(payload.agent);
        if (payload.agent && !agent) {
          send(ws, { type: 'post_failed', ref: payload.ref, message: 'Invalid agent label.' });
          return;
        }
        const message = store.append({ member, agent, text, attachments });
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
