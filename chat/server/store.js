// Chat history, kept the same way the people-memory feature already
// keeps its own state: physically outside the repo, under
// ~/.hire-juno/<workforce-id>/ — never committed, never even
// gitignored-and-therefore-forgettable, just not there. See
// workforceId.js for where <workforce-id> comes from.
//
// better-sqlite3 over the newer built-in `node:sqlite`: as of this
// writing node:sqlite is a release candidate only from Node 25.7.0 —
// on the Node 22.5–22.12 range this repo's own `engines.node: ">=22"`
// still allows, it sits behind the `--experimental-sqlite` flag, which
// an npx-launched CLI has no reliable way to set for the user
// (https://nodejs.org/api/sqlite.html). A synchronous
// native dependency with prebuilt binaries for the common platforms is
// the safer bet for something meant to "just work" after `npx`.

import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import DatabaseConstructor from 'better-sqlite3';

// The id every message/adapter uses before the human ever starts a
// second, parallel conversation with the same colleague — existing
// rows from before `sessions` existed are implicitly this one, so
// nothing about a pre-upgrade chat.db needs to change to keep working.
export const DEFAULT_SESSION_ID = 'default';

// The only attachment types the chat accepts (see agentAdapter.js) — also
// the only ones ever stored or served back, so a client can't get e.g.
// text/html served from the chat's own origin.
export const ATTACHMENT_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    colleague_id TEXT NOT NULL,
    session_id TEXT NOT NULL DEFAULT 'default',
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    -- JSON array of {kind:'tool_use', name, input} | {kind:'thinking', text}
    -- — the reply's trail (see chat/src/app.js's TrailBox), same shape the
    -- live socket updates already carry, just collected server-side (see
    -- bindAdapter's pendingTrails/pendingThinking) and stored alongside
    -- the finished reply instead of only relayed and then dropped. NULL
    -- for a message that had no trail (a plain "you" turn, a colleague's
    -- reply with no tool calls or thinking) — not an empty JSON array, so
    -- a legacy row (this column didn't exist before) reads back exactly
    -- the same way.
    trail TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- Images sent along with a message, kept apart from the message rows so
  -- reading a history never drags the bytes along: the history only lists
  -- {id, name, mimeType}, the bytes come from one request per image
  -- (api/attachment). "kind" says which table "message_id" points into
  -- ('message' or 'channel_message'); removed together with that history.
  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    message_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    data BLOB NOT NULL
  );

  -- A conversation that works in its own git worktree, on its own branch
  -- (see worktree.js). A row only exists once the worktree has been
  -- created; no row means the conversation works in the workforce folder.
  CREATE TABLE IF NOT EXISTS conversation_worktrees (
    colleague_id TEXT NOT NULL,
    session_id TEXT NOT NULL DEFAULT 'default',
    path TEXT NOT NULL,
    branch TEXT NOT NULL,
    -- The git repo the worktree belongs to (NULL: saved before this column
    -- existed, which always meant the workforce folder's repo).
    repo_path TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY (colleague_id, session_id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    colleague_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    member_ids TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS channel_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- The Claude Agent SDK's OWN session id (its resumable transcript,
  -- ~/.claude/projects/.../<sdk_session_id>.jsonl) for one (colleague,
  -- our own session_id) adapter — distinct from this table's own
  -- session_id column, which is hire-juno's parallel-conversation concept
  -- (see the messages table). Without this, a server restart made a
  -- colleague a stranger to her own chat history: a fresh ClaudeAdapter
  -- meant a fresh query() with no resume option, even though the
  -- transcript was sitting right there in "messages" (the colleague
  -- would reply without any context mid-conversation right after a
  -- restart). One row per (colleague_id, session_id); overwritten
  -- every time the adapter (re-)learns its session_id from the SDK's own
  -- 'init' system message (see adapters/claude.js).
  CREATE TABLE IF NOT EXISTS adapter_sessions (
    colleague_id TEXT NOT NULL,
    session_id TEXT NOT NULL DEFAULT 'default',
    sdk_session_id TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY (colleague_id, session_id)
  );

  -- The model picked for one conversation in its settings dialog (the
  -- SDK's own model value, e.g. 'sonnet'). A row only exists while a
  -- choice is set — no row means "the default". Deliberately not removed
  -- by a context reset: that clears what a colleague remembers, not how
  -- she was set up.
  -- The last model/effort and token/cost figures reported for a
  -- conversation's session, so the header still shows them after a server
  -- restart. A snapshot, not a ledger: it is replaced whenever the adapter
  -- reports again, and the adapter counts from zero after a restart.
  CREATE TABLE IF NOT EXISTS conversation_stats (
    colleague_id TEXT NOT NULL,
    session_id TEXT NOT NULL DEFAULT 'default',
    model TEXT,
    effort TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd REAL,
    PRIMARY KEY (colleague_id, session_id)
  );

  CREATE TABLE IF NOT EXISTS model_choices (
    colleague_id TEXT NOT NULL,
    session_id TEXT NOT NULL DEFAULT 'default',
    model TEXT NOT NULL,
    PRIMARY KEY (colleague_id, session_id)
  );
`;

// No workforce ID (CONSTITUTION.md missing or still carrying its
// placeholder) falls back to an in-memory database rather than
// refusing to start: the chat still works for the session, it just
// doesn't survive a restart — and guessing a folder name instead would
// risk silently splitting history later once the real ID is set.
export function openStore({ workforceId, baseDir = join(homedir(), '.hire-juno') } = {}) {
  const db = workforceId
    ? (() => {
        const dir = join(baseDir, workforceId, 'chat');
        mkdirSync(dir, { recursive: true });
        return new DatabaseConstructor(join(dir, 'chat.db'));
      })()
    : new DatabaseConstructor(':memory:');

  db.exec(SCHEMA);
  // A pre-existing chat.db from before sessions existed has `messages`
  // without the column at all — CREATE TABLE IF NOT EXISTS above only
  // covers a brand-new database. The default on the ALTER matches the
  // one on CREATE TABLE, so a fresh DB's redundant ALTER just fails
  // with "duplicate column" (caught, ignored) and an upgraded DB's old
  // rows read back as DEFAULT_SESSION_ID exactly like new ones written
  // without an explicit session.
  try {
    db.exec("ALTER TABLE messages ADD COLUMN session_id TEXT NOT NULL DEFAULT 'default'");
  } catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err;
  }
  // Same upgrade path, same reasoning, for the trail column — a database
  // from before it existed just gets it added, defaulting to NULL (no
  // trail) for every row already there, exactly like a message that
  // genuinely had none.
  try {
    db.exec('ALTER TABLE messages ADD COLUMN trail TEXT');
  } catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err;
  }

  // Same again for the repo a conversation's worktree belongs to.
  try {
    db.exec('ALTER TABLE conversation_worktrees ADD COLUMN repo_path TEXT');
  } catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err;
  }

  const insertStmt = db.prepare(
    'INSERT INTO messages (colleague_id, session_id, role, text, trail) VALUES (?, ?, ?, ?, ?)'
  );
  const historyStmt = db.prepare(
    'SELECT id, role, text, trail, created_at FROM messages WHERE colleague_id = ? AND session_id = ? ORDER BY id ASC'
  );
  // One row per colleague's *main* thread only (session_id = 'default')
  // — the sidebar preview is about "what's the latest in this
  // colleague's DM", not about parallel sessions or subagent panels,
  // which never hit this table the same way (see selectColleague's own
  // comment on subagent threads having no server-side history at all).
  const lastMessagesStmt = db.prepare(
    `SELECT colleague_id, role, text, created_at FROM messages
     WHERE session_id = ? AND id IN (
       SELECT MAX(id) FROM messages WHERE session_id = ? GROUP BY colleague_id
     )`
  );
  const insertAttachmentStmt = db.prepare(
    'INSERT INTO attachments (kind, message_id, name, mime_type, data) VALUES (?, ?, ?, ?, ?)'
  );
  const messageAttachmentsStmt = db.prepare(
    `SELECT id, message_id, name, mime_type FROM attachments
     WHERE kind = 'message' AND message_id IN (
       SELECT id FROM messages WHERE colleague_id = ? AND session_id = ?
     )`
  );
  const channelAttachmentsStmt = db.prepare(
    `SELECT id, message_id, name, mime_type FROM attachments
     WHERE kind = 'channel_message' AND message_id IN (
       SELECT id FROM channel_messages WHERE channel_id = ?
     )`
  );
  const getAttachmentStmt = db.prepare('SELECT mime_type, data FROM attachments WHERE id = ?');
  const deleteMessageAttachmentsStmt = db.prepare(
    `DELETE FROM attachments WHERE kind = 'message' AND message_id IN (
       SELECT id FROM messages WHERE colleague_id = ? AND session_id = ?
     )`
  );
  const deleteChannelAttachmentsStmt = db.prepare(
    `DELETE FROM attachments WHERE kind = 'channel_message' AND message_id IN (
       SELECT id FROM channel_messages WHERE channel_id = ?
     )`
  );
  const getWorktreeStmt = db.prepare(
    'SELECT path, branch, repo_path AS repoPath FROM conversation_worktrees WHERE colleague_id = ? AND session_id = ?'
  );
  const setWorktreeStmt = db.prepare(
    `INSERT INTO conversation_worktrees (colleague_id, session_id, path, branch, repo_path) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(colleague_id, session_id) DO UPDATE SET path = excluded.path, branch = excluded.branch, repo_path = excluded.repo_path`
  );
  const insertSessionStmt = db.prepare('INSERT INTO sessions (id, colleague_id, title) VALUES (?, ?, ?)');
  const listSessionsStmt = db.prepare(
    'SELECT id, colleague_id, title, created_at FROM sessions WHERE colleague_id = ? ORDER BY created_at ASC'
  );
  const insertChannelStmt = db.prepare(
    'INSERT OR REPLACE INTO channels (id, name, member_ids) VALUES (?, ?, ?)'
  );
  const listChannelsStmt = db.prepare('SELECT id, name, member_ids FROM channels ORDER BY created_at ASC');
  const insertChannelMessageStmt = db.prepare(
    'INSERT INTO channel_messages (channel_id, sender_id, text) VALUES (?, ?, ?)'
  );
  const channelHistoryStmt = db.prepare(
    'SELECT id, sender_id, text, created_at FROM channel_messages WHERE channel_id = ? ORDER BY id ASC'
  );
  const saveAdapterSessionStmt = db.prepare(
    `INSERT INTO adapter_sessions (colleague_id, session_id, sdk_session_id, updated_at)
     VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
     ON CONFLICT(colleague_id, session_id) DO UPDATE SET sdk_session_id = excluded.sdk_session_id, updated_at = excluded.updated_at`
  );
  const getAdapterSessionStmt = db.prepare(
    'SELECT sdk_session_id FROM adapter_sessions WHERE colleague_id = ? AND session_id = ?'
  );
  const saveStatsStmt = db.prepare(
    `INSERT INTO conversation_stats
       (colleague_id, session_id, model, effort, input_tokens, output_tokens, total_tokens, cost_usd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(colleague_id, session_id) DO UPDATE SET
       model = excluded.model, effort = excluded.effort, input_tokens = excluded.input_tokens,
       output_tokens = excluded.output_tokens, total_tokens = excluded.total_tokens, cost_usd = excluded.cost_usd`
  );
  const allStatsStmt = db.prepare('SELECT * FROM conversation_stats');
  const getModelChoiceStmt = db.prepare('SELECT model FROM model_choices WHERE colleague_id = ? AND session_id = ?');
  const setModelChoiceStmt = db.prepare(
    `INSERT INTO model_choices (colleague_id, session_id, model) VALUES (?, ?, ?)
     ON CONFLICT(colleague_id, session_id) DO UPDATE SET model = excluded.model`
  );
  const deleteModelChoiceStmt = db.prepare('DELETE FROM model_choices WHERE colleague_id = ? AND session_id = ?');
  const deleteMessagesStmt = db.prepare('DELETE FROM messages WHERE colleague_id = ? AND session_id = ?');
  const deleteAdapterSessionStmt = db.prepare(
    'DELETE FROM adapter_sessions WHERE colleague_id = ? AND session_id = ?'
  );
  const deleteChannelMessagesStmt = db.prepare('DELETE FROM channel_messages WHERE channel_id = ?');
  // `%`/`_` are LIKE wildcards — escaped in the JS helper below so a
  // literal search for e.g. "50% done" doesn't silently turn into a
  // wildcard match. ESCAPE '\' names the escape character for SQLite;
  // without it a `\%` in the pattern would be read as a literal
  // backslash followed by the wildcard, not an escaped percent sign.
  const searchMessagesStmt = db.prepare(
    `SELECT colleague_id, role, text, created_at FROM messages
     WHERE session_id = ? AND text LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT 50`
  );
  const searchChannelMessagesStmt = db.prepare(
    `SELECT channel_id, sender_id, text, created_at FROM channel_messages
     WHERE text LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT 50`
  );

  const maxMessageIdStmt = db.prepare('SELECT MAX(id) AS id FROM messages');
  const moveMessageStmt = db.prepare('UPDATE messages SET id = ? WHERE id = ?');
  const moveAttachmentsStmt = db.prepare(
    "UPDATE attachments SET message_id = ? WHERE kind = 'message' AND message_id = ?"
  );
  const moveToEndTx = db.transaction((ids) =>
    ids.map((oldId) => {
      const newId = maxMessageIdStmt.get().id + 1;
      moveMessageStmt.run(newId, oldId);
      moveAttachmentsStmt.run(newId, oldId);
      return newId;
    })
  );

  // Stores the valid images of one message (see ATTACHMENT_MIME_TYPES);
  // anything else in the list is skipped, not stored.
  function saveAttachments(kind, messageId, attachments) {
    for (const a of Array.isArray(attachments) ? attachments : []) {
      if (!a || !ATTACHMENT_MIME_TYPES.includes(a.mimeType) || typeof a.data !== 'string' || !a.data) continue;
      insertAttachmentStmt.run(
        kind,
        messageId,
        String(a.name || 'image').slice(0, 200),
        a.mimeType,
        Buffer.from(a.data, 'base64')
      );
    }
  }

  // message_id -> [{id, name, mimeType}] for one history.
  function groupAttachments(rows) {
    const byMessage = new Map();
    for (const r of rows) {
      if (!byMessage.has(r.message_id)) byMessage.set(r.message_id, []);
      byMessage.get(r.message_id).push({ id: r.id, name: r.name, mimeType: r.mime_type });
    }
    return byMessage;
  }

  return {
    persisted: Boolean(workforceId),
    // `trail` (optional): the same [{kind:'tool_use'|'thinking', ...}]
    // shape TrailBox renders (see chat/src/app.js and the messages
    // table's own comment above) — stored as JSON, `null` when omitted or
    // empty so a plain message keeps reading back exactly as before this
    // column existed.
    // `attachments` (optional): [{name, mimeType, data}] as sent by the
    // client (data is base64) — only images, see saveAttachments.
    appendMessage(colleagueId, sessionId, role, text, trail, attachments) {
      const { lastInsertRowid } = insertStmt.run(
        colleagueId,
        sessionId || DEFAULT_SESSION_ID,
        role,
        text,
        trail?.length ? JSON.stringify(trail) : null
      );
      saveAttachments('message', lastInsertRowid, attachments);
      return Number(lastInsertRowid);
    },
    // Puts the given messages behind everything stored so far, in the
    // order given, and returns their new ids. For a message that arrived
    // while the colleague was still answering an earlier one: it is saved
    // on arrival, but belongs after that earlier reply, which is stored
    // later. History is ordered by id, so the row takes a new, higher one
    // (its images follow).
    moveToEnd(ids) {
      return moveToEndTx(ids);
    },
    getHistory(colleagueId, sessionId) {
      const sid = sessionId || DEFAULT_SESSION_ID;
      const attachments = groupAttachments(messageAttachmentsStmt.all(colleagueId, sid));
      return historyStmt.all(colleagueId, sid).map((row) => ({
        ...row,
        trail: row.trail ? JSON.parse(row.trail) : undefined,
        attachments: attachments.get(row.id),
      }));
    },
    // colleagueId -> {role, text, createdAt} for the sidebar preview —
    // one query for every colleague at once (the roster route needs
    // all of them together), not N+1 per-colleague lookups.
    getLastMessages() {
      const map = new Map();
      for (const row of lastMessagesStmt.all(DEFAULT_SESSION_ID, DEFAULT_SESSION_ID)) {
        map.set(row.colleague_id, { role: row.role, text: row.text, createdAt: row.created_at });
      }
      return map;
    },
    // A session is just an alternate, independent conversation with the
    // same colleague, for running two topics side by side rather than
    // one thread mixing both. `DEFAULT_SESSION_ID`
    // itself is never created through here — it exists implicitly the
    // moment a colleague does — so this only ever holds the *extra*
    // ones.
    createSession(id, colleagueId, title) {
      insertSessionStmt.run(id, colleagueId, title);
    },
    listSessions(colleagueId) {
      return listSessionsStmt.all(colleagueId).map((row) => ({
        id: row.id,
        colleagueId: row.colleague_id,
        title: row.title,
        createdAt: row.created_at,
      }));
    },
    // Channels are structural (who's in the group), not chat noise —
    // worth persisting even under the same "text only, nothing fancy"
    // rule the rest of this store follows: it's still just text and an
    // id list, no tool-use/thinking richness to leave out.
    createChannel(id, name, memberIds) {
      insertChannelStmt.run(id, name, JSON.stringify(memberIds));
    },
    listChannels() {
      return listChannelsStmt.all().map((row) => ({
        id: row.id,
        name: row.name,
        memberIds: JSON.parse(row.member_ids),
      }));
    },
    appendChannelMessage(channelId, senderId, text, attachments) {
      const { lastInsertRowid } = insertChannelMessageStmt.run(channelId, senderId, text);
      saveAttachments('channel_message', lastInsertRowid, attachments);
    },
    getChannelHistory(channelId) {
      const attachments = groupAttachments(channelAttachmentsStmt.all(channelId));
      return channelHistoryStmt.all(channelId).map((row) => ({ ...row, attachments: attachments.get(row.id) }));
    },
    // The bytes of one stored image, or null.
    getAttachment(id) {
      const row = getAttachmentStmt.get(id);
      return row ? { mimeType: row.mime_type, data: row.data } : null;
    },
    // See the adapter_sessions table comment above — the SDK's own
    // resumable session id for one (colleague, our session) adapter.
    // The model chosen for this conversation, or null for "the default".
    // The worktree this conversation works in, {path, branch, repoPath}
    // (repoPath null for rows from before it was saved), or null.
    getWorktree(colleagueId, sessionId) {
      return getWorktreeStmt.get(colleagueId, sessionId || DEFAULT_SESSION_ID) ?? null;
    },
    setWorktree(colleagueId, sessionId, path, branch, repoPath = null) {
      setWorktreeStmt.run(colleagueId, sessionId || DEFAULT_SESSION_ID, path, branch, repoPath);
    },
    // `stats` is the object index.js keeps per conversation: {model, effort,
    // inputTokens, outputTokens, totalTokens, costUsd}, any of them may be unset.
    saveStats(colleagueId, sessionId, stats) {
      saveStatsStmt.run(
        colleagueId,
        sessionId || DEFAULT_SESSION_ID,
        stats.model ?? null,
        stats.effort ?? null,
        stats.inputTokens ?? null,
        stats.outputTokens ?? null,
        stats.totalTokens ?? null,
        stats.costUsd ?? null
      );
    },
    // [[colleagueId, sessionId, stats], ...] for every conversation with a
    // snapshot; fields that were never reported are left out of `stats`.
    getAllStats() {
      return allStatsStmt.all().map((row) => {
        const stats = {};
        if (row.model != null) stats.model = row.model;
        if (row.effort != null) stats.effort = row.effort;
        if (row.input_tokens != null) stats.inputTokens = row.input_tokens;
        if (row.output_tokens != null) stats.outputTokens = row.output_tokens;
        if (row.total_tokens != null) stats.totalTokens = row.total_tokens;
        if (row.cost_usd != null) stats.costUsd = row.cost_usd;
        return [row.colleague_id, row.session_id, stats];
      });
    },
    getModelChoice(colleagueId, sessionId) {
      return getModelChoiceStmt.get(colleagueId, sessionId || DEFAULT_SESSION_ID)?.model ?? null;
    },
    // null/empty clears the choice.
    setModelChoice(colleagueId, sessionId, model) {
      const sid = sessionId || DEFAULT_SESSION_ID;
      if (model) setModelChoiceStmt.run(colleagueId, sid, model);
      else deleteModelChoiceStmt.run(colleagueId, sid);
    },
    saveAdapterSession(colleagueId, sessionId, sdkSessionId) {
      saveAdapterSessionStmt.run(colleagueId, sessionId || DEFAULT_SESSION_ID, sdkSessionId);
    },
    getAdapterSession(colleagueId, sessionId) {
      return getAdapterSessionStmt.get(colleagueId, sessionId || DEFAULT_SESSION_ID)?.sdk_session_id ?? null;
    },
    // The SDK-side counterpart to closing the in-memory adapter (see
    // index.js's 'reset_context' handler, which does both together
    // now): without this, the *next* message would call
    // getAdapterSession() again, fetch the exact same sdk_session_id,
    // and resume right back into whatever this reset was trying to
    // leave behind (e.g. a session stuck on a turn that hung forever
    // would otherwise be resumed again on the very next try). Message history is untouched; only
    // clearHistory below also removes that.
    clearAdapterSession(colleagueId, sessionId) {
      deleteAdapterSessionStmt.run(colleagueId, sessionId || DEFAULT_SESSION_ID);
    },
    // "Chat leeren" — deliberately more than resetContext's own
    // adapter-drop above: this removes the persisted rows too, so
    // there's nothing left to scroll back through, not just nothing
    // left for the colleague to remember. Also drops the adapter_sessions
    // row for the same (colleague, session) — leaving it behind would
    // let a later reply silently resume the SDK session whose transcript
    // was just deleted.
    clearHistory(colleagueId, sessionId) {
      const sid = sessionId || DEFAULT_SESSION_ID;
      deleteMessageAttachmentsStmt.run(colleagueId, sid);
      deleteMessagesStmt.run(colleagueId, sid);
      deleteAdapterSessionStmt.run(colleagueId, sid);
    },
    clearChannelHistory(channelId) {
      deleteChannelAttachmentsStmt.run(channelId);
      deleteChannelMessagesStmt.run(channelId);
    },
    // Main-thread messages only (session_id = 'default'), same scope as
    // getLastMessages above — parallel sessions and subagent panels
    // aren't what "search everything" means here.
    searchMessages(query) {
      const like = `%${escapeLike(query)}%`;
      return searchMessagesStmt.all(DEFAULT_SESSION_ID, like).map((row) => ({
        colleagueId: row.colleague_id,
        role: row.role,
        text: row.text,
        createdAt: row.created_at,
      }));
    },
    searchChannelMessages(query) {
      const like = `%${escapeLike(query)}%`;
      return searchChannelMessagesStmt.all(like).map((row) => ({
        channelId: row.channel_id,
        senderId: row.sender_id,
        text: row.text,
        createdAt: row.created_at,
      }));
    },
    close() {
      db.close();
    },
  };
}

function escapeLike(text) {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}
