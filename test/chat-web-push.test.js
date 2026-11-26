import assert from 'node:assert/strict';
import { createPublicKey, verify } from 'node:crypto';
import { test } from 'node:test';

import { encryptPayload, generateVapidKeys, vapidAuthorization } from '../chat/server/webPush.js';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanSubscription, createPusher } from '../chat/server/pushNotify.js';

// RFC 8291, Section 5 and Appendix A.
test('encryptPayload reproduces the RFC 8291 example message', () => {
  const plaintext = Buffer.from('V2hlbiBJIGdyb3cgdXAsIEkgd2FudCB0byBiZSBhIHdhdGVybWVsb24', 'base64url');
  const body = encryptPayload(plaintext, {
    p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
    auth: 'BTBZMqHH6r4Tts7J_aSIgg',
  }, {
    salt: Buffer.from('DGv6ra1nlYgDCS1FRnbzlw', 'base64url'),
    serverPrivateKey: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  });
  assert.equal(
    body.toString('base64url'),
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN'
  );
});

test('vapidAuthorization signs a JWT for the endpoint origin that the public key verifies', () => {
  const keys = generateVapidKeys();
  assert.equal(Buffer.from(keys.publicKey, 'base64url').length, 65);
  const header = vapidAuthorization('https://web.push.apple.com/abc', keys, 'https://example.org', 1000);
  const [, jwt, k] = header.match(/^vapid t=([^,]+), k=(.+)$/);
  assert.equal(k, keys.publicKey);
  const [h, p, s] = jwt.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(p, 'base64url')), { aud: 'https://web.push.apple.com', exp: 1000 + 12 * 3600, sub: 'https://example.org' });
  const raw = Buffer.from(keys.publicKey, 'base64url');
  const pub = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: raw.subarray(1, 33).toString('base64url'), y: raw.subarray(33).toString('base64url') }, format: 'jwk' });
  assert.ok(verify('sha256', Buffer.from(`${h}.${p}`), { key: pub, dsaEncoding: 'ieee-p1363' }, Buffer.from(s, 'base64url')));
});



const SUB = {
  endpoint: 'https://web.push.apple.com/QGx',
  keys: { p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', auth: 'BTBZMqHH6r4Tts7J_aSIgg' },
};

test('cleanSubscription keeps an https endpoint with well-formed keys only', () => {
  assert.deepEqual(cleanSubscription({ ...SUB, expirationTime: null }), SUB);
  assert.equal(cleanSubscription({ ...SUB, endpoint: 'http://x.example/1' }), null);
  assert.equal(cleanSubscription({ ...SUB, keys: { ...SUB.keys, auth: 'abc' } }), null);
  assert.equal(cleanSubscription(null), null);
});

test('the pusher keeps keys and subscriptions private and forgets devices the push service drops', async () => {
  const home = mkdtempSync(join(tmpdir(), 'hire-juno-push-'));
  const sent = [];
  let status = 201;
  try {
    const pusher = createPusher({ home, subject: 'https://example.org', send: async (sub, payload) => { sent.push([sub.endpoint, payload]); return status; } });
    assert.equal(statSync(join(home, '.hire-juno', 'vapid.json')).mode & 0o777, 0o600);
    const key = pusher.publicKey();
    assert.equal(createPusher({ home, subject: 'x', send: async () => 201 }).publicKey(), key);
    assert.equal(pusher.subscribe({ endpoint: 'nope' }), false);
    assert.equal(pusher.subscribe(SUB), true);
    assert.equal(pusher.subscribe(SUB), true);
    assert.equal(pusher.count(), 1);
    assert.equal(statSync(join(home, '.hire-juno', 'push-subscriptions.json')).mode & 0o777, 0o600);
    await pusher.notify({ title: 'T', body: 'B' });
    assert.deepEqual(sent, [[SUB.endpoint, { title: 'T', body: 'B' }]]);
    status = 410;
    await pusher.notify({ title: 'T', body: 'B' });
    assert.equal(pusher.count(), 0);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
