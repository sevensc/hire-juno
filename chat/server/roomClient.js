// The chat instance's side of the team room (chat/room/server.js): one
// WebSocket over the room's Unix socket, authenticated with this person's
// room token, reconnecting with a growing delay when the room is away.

import { readFileSync } from 'node:fs';

import WebSocket from 'ws';

export function readRoomToken(file) {
  const token = readFileSync(file, 'utf8').trim();
  if (!token) throw new Error(`room token file ${file} is empty`);
  return token;
}

// `onCleared()`: the room's conversation was cleared by someone.
// `onWelcome({ you, members, messages })`, `onMessage(message)`,
// `onSignal(from, data)` (call signalling), `onState(connected)`,
// `onReactions(messageId, reactions)`.
// Returns { post(text, agent?), signal(to, data), close() }.
export function connectRoom({ socketPath, tokenFile, onWelcome, onMessage, onSignal, onState, onCleared, onQuestions, onReactions }) {
  let ws = null;
  let closed = false;
  let delay = 1000;
  let timer = null;
  let nextRef = 1;
  const waiting = new Map(); // ref -> resolve, for get_artifact and get_attachment

  const open = () => {
    if (closed) return;
    let token;
    try {
      token = readRoomToken(tokenFile);
    } catch (err) {
      console.error(`Team room: ${err.message}`);
      timer = setTimeout(open, 30000);
      return;
    }
    ws = new WebSocket(`ws+unix://${socketPath}:/ws`, { headers: { Authorization: `Bearer ${token}` } });
    ws.on('open', () => {
      delay = 1000;
      onState?.(true);
    });
    ws.on('message', (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString('utf8'));
      } catch {
        return;
      }
      if (payload.type === 'welcome') onWelcome?.(payload);
      else if (payload.type === 'message') {
        onMessage?.(payload.message);
        // The room's echo of an own post (postAndWait): after onMessage, so
        // the tabs have the message before whatever the caller does next.
        if (payload.ref != null && waiting.has(payload.ref)) {
          waiting.get(payload.ref)(true);
          waiting.delete(payload.ref);
        }
      }
      else if (payload.type === 'signal') onSignal?.(payload.from, payload.data);
      else if (payload.type === 'cleared') onCleared?.();
      else if (payload.type === 'questions') onQuestions?.(payload.questions);
      else if (payload.type === 'reactions') onReactions?.(payload.messageId, payload.reactions);
      else if (payload.type === 'artifact' && waiting.has(payload.ref)) {
        waiting.get(payload.ref)(payload.artifact);
        waiting.delete(payload.ref);
      } else if (payload.type === 'attachment' && waiting.has(payload.ref)) {
        waiting.get(payload.ref)(payload.attachment);
        waiting.delete(payload.ref);
      }
    });
    ws.on('error', () => {});
    ws.on('close', () => {
      onState?.(false);
      if (closed) return;
      timer = setTimeout(open, delay);
      delay = Math.min(delay * 2, 30000);
    });
  };
  open();

  return {
    // `attachments`: pictures as [{ name, mimeType, data (base64) }].
    post(text, agent, attachments = []) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'post', text, ...(agent ? { agent } : {}), ...(attachments.length ? { attachments } : {}) }));
      return true;
    },
    // Like post, but resolves once the room has the message and it went out
    // to this instance's tabs (true), or false when the room is away. After
    // a few seconds without an echo it resolves true all the same.
    // `replyTo`: the id of the room message this one answers.
    postAndWait(text, agent, attachments = [], replyTo = null) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return Promise.resolve(false);
      const ref = nextRef++;
      return new Promise((resolve) => {
        waiting.set(ref, resolve);
        ws.send(JSON.stringify({ type: 'post', ref, text, ...(agent ? { agent } : {}), ...(attachments.length ? { attachments } : {}), ...(Number.isInteger(replyTo) ? { replyTo } : {}) }));
        setTimeout(() => {
          if (waiting.delete(ref)) resolve(true);
        }, 5000);
      });
    },
    send(payload) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify(payload));
      return true;
    },
    clear() {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'clear' }));
      return true;
    },
    postArtifact(kind, title, content) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'artifact', kind, title, content }));
      return true;
    },
    // Resolves to the artifact, or null when unknown or the room is away.
    getArtifact(id) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return Promise.resolve(null);
      const ref = nextRef++;
      return new Promise((resolve) => {
        waiting.set(ref, resolve);
        ws.send(JSON.stringify({ type: 'get_artifact', id, ref }));
        setTimeout(() => {
          if (waiting.delete(ref)) resolve(null);
        }, 10000);
      });
    },
    // Resolves to { name, mimeType, data (base64) }, or null.
    getAttachment(id) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return Promise.resolve(null);
      const ref = nextRef++;
      return new Promise((resolve) => {
        waiting.set(ref, resolve);
        ws.send(JSON.stringify({ type: 'get_attachment', id, ref }));
        setTimeout(() => {
          if (waiting.delete(ref)) resolve(null);
        }, 15000);
      });
    },
    // Sets, changes or takes back this person's reaction to a room message.
    react(messageId, emoji) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'react', messageId, emoji }));
      return true;
    },
    signal(to, data) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'signal', to, data }));
      return true;
    },
    close() {
      closed = true;
      clearTimeout(timer);
      ws?.close();
    },
  };
}
