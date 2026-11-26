// Push notifications for a chat served with --socket: the VAPID keys and
// the person's subscriptions (one per device) live in ~/.hire-juno of the
// account this chat runs as, readable by that account only.

import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { generateVapidKeys, sendPush } from './webPush.js';

function writePrivate(file, data) {
  writeFileSync(file + '.new', JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  chmodSync(file + '.new', 0o600);
  renameSync(file + '.new', file);
}

// A subscription as the browser's PushSubscription.toJSON() gives it,
// reduced to what sending needs; null when it does not look like one.
export function cleanSubscription(sub) {
  try {
    const endpoint = new URL(sub?.endpoint);
    const { p256dh, auth } = sub.keys || {};
    if (endpoint.protocol !== 'https:') return null;
    if (typeof p256dh !== 'string' || Buffer.from(p256dh, 'base64url').length !== 65) return null;
    if (typeof auth !== 'string' || Buffer.from(auth, 'base64url').length !== 16) return null;
    return { endpoint: endpoint.href, keys: { p256dh, auth } };
  } catch {
    return null;
  }
}

export function createPusher({ home = homedir(), subject, send = sendPush } = {}) {
  const dir = join(home, '.hire-juno');
  const keyFile = join(dir, 'vapid.json');
  const subFile = join(dir, 'push-subscriptions.json');
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  let keys = existsSync(keyFile) ? JSON.parse(readFileSync(keyFile, 'utf8')) : null;
  if (!keys) {
    keys = generateVapidKeys();
    writePrivate(keyFile, keys);
  }
  let subs = existsSync(subFile) ? JSON.parse(readFileSync(subFile, 'utf8')) : [];

  return {
    publicKey: () => keys.publicKey,
    count: () => subs.length,
    subscribe(raw) {
      const sub = cleanSubscription(raw);
      if (!sub) return false;
      subs = [...subs.filter((s) => s.endpoint !== sub.endpoint), sub];
      writePrivate(subFile, subs);
      return true;
    },
    unsubscribe(endpoint) {
      subs = subs.filter((s) => s.endpoint !== endpoint);
      writePrivate(subFile, subs);
    },
    // Sends { title, body } to every device; forgets the ones the push
    // service reports as gone (404, 410).
    async notify(payload) {
      const gone = [];
      await Promise.all(subs.map(async (sub) => {
        try {
          const status = await send(sub, payload, { keys, subject });
          if (status === 404 || status === 410) gone.push(sub.endpoint);
          else if (status < 300) console.log(`Push delivered to ${new URL(sub.endpoint).host} (HTTP ${status})`);
          else if (status >= 400) console.error(`Push to ${new URL(sub.endpoint).host} failed: HTTP ${status}`);
        } catch (err) {
          console.error(`Push failed: ${err.message}`);
        }
      }));
      if (gone.length) {
        subs = subs.filter((s) => !gone.includes(s.endpoint));
        writePrivate(subFile, subs);
      }
    },
  };
}
