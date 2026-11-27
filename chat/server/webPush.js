// Web Push without a third-party library: message encryption as in
// RFC 8291 (aes128gcm, RFC 8188) and the VAPID authorization of RFC 8292,
// both on node:crypto. Used by a chat served with --socket to tell a
// person's phone about a new message while no tab of the chat is open.

import { createCipheriv, createECDH, createHmac, generateKeyPairSync, createPrivateKey, randomBytes, sign } from 'node:crypto';

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const fromB64u = (s) => Buffer.from(s, 'base64url');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();

// A new VAPID key pair: { publicKey, privateKey } as base64url (the public
// key uncompressed, 65 bytes, as browsers expect it).
export function generateVapidKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const pub = publicKey.export({ format: 'jwk' });
  const priv = privateKey.export({ format: 'jwk' });
  return {
    publicKey: b64u(Buffer.concat([Buffer.from([4]), fromB64u(pub.x), fromB64u(pub.y)])),
    privateKey: priv.d,
  };
}

function vapidPrivateKey({ publicKey, privateKey }) {
  const raw = fromB64u(publicKey);
  return createPrivateKey({
    key: { kty: 'EC', crv: 'P-256', d: privateKey, x: b64u(raw.subarray(1, 33)), y: b64u(raw.subarray(33, 65)) },
    format: 'jwk',
  });
}

// The Authorization header for a push service endpoint (RFC 8292).
export function vapidAuthorization(endpoint, keys, subject, now = Math.floor(Date.now() / 1000)) {
  const header = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = b64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: now + 12 * 3600, sub: subject }));
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), { key: vapidPrivateKey(keys), dsaEncoding: 'ieee-p1363' });
  return `vapid t=${header}.${payload}.${b64u(signature)}, k=${keys.publicKey}`;
}

// Encrypts `plaintext` for one subscription (keys.p256dh, keys.auth) as a
// single aes128gcm record. `salt` and `serverPrivateKey` are only passed
// by tests, to reproduce the RFC's example.
export function encryptPayload(plaintext, { p256dh, auth }, { salt = randomBytes(16), serverPrivateKey } = {}) {
  const uaPublic = fromB64u(p256dh);
  const authSecret = fromB64u(auth);
  const ecdh = createECDH('prime256v1');
  if (serverPrivateKey) ecdh.setPrivateKey(fromB64u(serverPrivateKey));
  else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const ecdhSecret = ecdh.computeSecret(uaPublic);

  const prkKey = hmac(authSecret, ecdhSecret);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic, Buffer.from([1])]);
  const ikm = hmac(prkKey, keyInfo);
  const prk = hmac(salt, ikm);
  const cek = hmac(prk, Buffer.from('Content-Encoding: aes128gcm\0\x01')).subarray(0, 16);
  const nonce = hmac(prk, Buffer.from('Content-Encoding: nonce\0\x01')).subarray(0, 12);

  const cipher = createCipheriv('aes-128-gcm', cek, nonce);
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(plaintext), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096);
  return Buffer.concat([salt, recordSize, Buffer.from([asPublic.length]), asPublic, body]);
}

// Sends one notification. Resolves to the push service's HTTP status;
// 404 and 410 mean the subscription is gone and should be forgotten.
export async function sendPush(subscription, payload, { keys, subject, ttl = 86400 }) {
  const body = encryptPayload(JSON.stringify(payload), subscription.keys);
  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      Authorization: vapidAuthorization(subscription.endpoint, keys, subject),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(ttl),
      Urgency: 'high',
    },
    body,
  });
  return res.status;
}
