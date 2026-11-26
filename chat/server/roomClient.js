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

// `onWelcome({ you, members, messages })`, `onMessage(message)`,
// `onState(connected)`. Returns { post(text, agent?), close() }.
export function connectRoom({ socketPath, tokenFile, onWelcome, onMessage, onState }) {
  let ws = null;
  let closed = false;
  let delay = 1000;
  let timer = null;

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
      else if (payload.type === 'message') onMessage?.(payload.message);
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
    post(text, agent) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'post', text, ...(agent ? { agent } : {}) }));
      return true;
    },
    close() {
      closed = true;
      clearTimeout(timer);
      ws?.close();
    },
  };
}
