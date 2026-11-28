import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { buildMedia, linksIn } from '../chat/server/media.js';
import { openStore } from '../chat/server/store.js';

test('links in a text: web addresses only, each once, without trailing punctuation', () => {
  assert.deepEqual(linksIn('See https://a.example/x, and (https://b.example/y). Again https://a.example/x! ftp://c.example'), ['https://a.example/x', 'https://b.example/y']);
  assert.deepEqual(linksIn('none here'), []);
});

test('shared media: pictures, links and documents, newest first, with where and who', () => {
  const stored = {
    pictures: [{ id: 5, name: 'a.png', colleagueId: 'kim', sessionId: 'default', sender: 'you', createdAt: '2026-01-02T00:00:00Z' }],
    linkMessages: [
      { colleagueId: 'kim', sessionId: 'default', sender: 'colleague', text: 'PR: https://github.com/acme/web/pull/1', createdAt: '2026-01-03T00:00:00Z' },
      { colleagueId: 'kim', sessionId: 'default', sender: 'you', text: 'old https://github.com/acme/web/pull/1', createdAt: '2026-01-01T00:00:00Z' },
    ],
  };
  const roomMessages = [
    { memberId: 'ben', memberName: 'Ben', agent: null, text: 'pic', createdAt: '2026-01-04T00:00:00Z', attachments: [{ id: 9, name: 'r.png' }] },
    { memberId: 'ben', memberName: 'Ben', agent: null, text: 'Call transcript', createdAt: '2026-01-05T00:00:00Z', artifact: { id: 3, kind: 'transcript', title: 'Call transcript' } },
    { memberId: 'ana', memberName: 'Ana', agent: null, text: 'look https://example.org/doc', createdAt: '2026-01-06T00:00:00Z' },
  ];
  const where = (item) => (item.channelId === 'team-room' ? '#team' : item.colleagueId);
  const who = (item) => item.memberName || item.sender;
  const media = buildMedia({ stored, roomMessages, where, who });
  assert.deepEqual(media.pictures.map((p) => [p.url, p.where]), [['api/room-attachment?id=9', '#team'], ['api/attachment?id=5', 'kim']]);
  assert.deepEqual(media.links.map((l) => [l.url, l.createdAt]), [['https://example.org/doc', '2026-01-06T00:00:00Z'], ['https://github.com/acme/web/pull/1', '2026-01-03T00:00:00Z']]);
  assert.deepEqual(media.docs, [{ id: 3, kind: 'transcript', title: 'Call transcript', createdAt: '2026-01-05T00:00:00Z', where: '#team', who: 'Ben' }]);
});

test('the store lists pictures and link messages of one conversation or of all', () => {
  const dir = mkdtempSync(join(tmpdir(), 'media-store-'));
  try {
    const store = openStore();
    const img = { name: 'x.png', mimeType: 'image/png', data: Buffer.from('png').toString('base64') };
    store.appendMessage('kim', 'default', 'you', 'look', undefined, [img]);
    store.appendMessage('kim', 'default', 'colleague', 'see https://a.example', undefined, []);
    store.appendMessage('ida', 'default', 'you', 'other https://b.example', undefined, []);
    store.createChannel('c1', 'ops', ['kim']);
    store.appendChannelMessage('c1', 'you', 'pic', [img]);
    const kim = store.media({ colleagueId: 'kim', sessionId: 'default' });
    assert.equal(kim.pictures.length, 1);
    assert.deepEqual(kim.linkMessages.map((m) => m.text), ['see https://a.example']);
    const all = store.media({ all: true });
    assert.equal(all.pictures.length, 2);
    assert.equal(all.linkMessages.length, 2);
    assert.equal(store.media({ channelId: 'c1' }).pictures[0].channelId, 'c1');
    store.close?.();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
