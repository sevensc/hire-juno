// Short-lived TURN credentials (the "TURN REST API" scheme that TURN
// servers such as coturn accept with a shared secret): the username is
// "<expiry>:<name>", the password the base64 HMAC-SHA1 of it.

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function turnCredentials(secret, name, { ttlSeconds = 6 * 3600, now = Math.floor(Date.now() / 1000) } = {}) {
  const username = `${now + ttlSeconds}:${String(name).replace(/[^A-Za-z0-9_.-]/g, '')}`;
  const credential = createHmac('sha1', secret).update(username).digest('base64');
  return { username, credential };
}

// `turn`: { url: 'host:port', secretFile }. The secret is read on every
// call, so a rotated secret applies without a restart.
export function turnIceServers(turn, name, options) {
  const secret = readFileSync(turn.secretFile, 'utf8').trim();
  const { username, credential } = turnCredentials(secret, name, options);
  return [
    { urls: [`stun:${turn.url}`] },
    { urls: [`turn:${turn.url}?transport=udp`, `turn:${turn.url}?transport=tcp`], username, credential },
  ];
}
