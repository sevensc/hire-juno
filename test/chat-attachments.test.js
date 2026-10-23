import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { openStore } from '../chat/server/store.js';

const PNG = Buffer.from('not-really-a-png');
const image = { name: 'shot.png', mimeType: 'image/png', data: PNG.toString('base64') };

test('an image sent with a message is still there after reopening the store', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'hire-juno-attachments-'));
  try {
    const store = openStore({ workforceId: 'acme', baseDir });
    store.appendMessage('nora', 'default', 'you', 'look', undefined, [image]);
    store.appendMessage('nora', 'default', 'colleague', 'nice');
    store.close();

    const reopened = openStore({ workforceId: 'acme', baseDir });
    const [first, second] = reopened.getHistory('nora', 'default');
    assert.equal(first.attachments.length, 1);
    assert.deepEqual(
      { name: first.attachments[0].name, mimeType: first.attachments[0].mimeType },
      { name: 'shot.png', mimeType: 'image/png' }
    );
    assert.equal(second.attachments, undefined);
    assert.deepEqual(reopened.getAttachment(first.attachments[0].id).data, PNG);
    reopened.close();
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});

test('channel messages keep their images too', () => {
  const store = openStore({});
  store.appendChannelMessage('c1', 'you', 'look', [image]);
  store.appendChannelMessage('c1', 'nora', 'nice');
  const [first, second] = store.getChannelHistory('c1');
  assert.equal(first.attachments.length, 1);
  assert.equal(second.attachments, undefined);
  assert.equal(store.getAttachment(first.attachments[0].id).mimeType, 'image/png');
});

test('only images are stored, nothing else is kept or served', () => {
  const store = openStore({});
  store.appendMessage('nora', 'default', 'you', 'hi', undefined, [
    { name: 'x.html', mimeType: 'text/html', data: Buffer.from('<script>').toString('base64') },
    { name: 'empty.png', mimeType: 'image/png', data: '' },
    null,
  ]);
  assert.equal(store.getHistory('nora', 'default')[0].attachments, undefined);
});

test('clearing a history removes its images, not those of other histories', () => {
  const store = openStore({});
  store.appendMessage('nora', 'default', 'you', 'a', undefined, [image]);
  store.appendMessage('juno', 'default', 'you', 'b', undefined, [image]);
  const nora = store.getHistory('nora', 'default')[0].attachments[0].id;
  const juno = store.getHistory('juno', 'default')[0].attachments[0].id;
  store.clearHistory('nora', 'default');
  assert.equal(store.getAttachment(nora), null);
  assert.notEqual(store.getAttachment(juno), null);

  store.appendChannelMessage('c1', 'you', 'a', [image]);
  const channel = store.getChannelHistory('c1')[0].attachments[0].id;
  store.clearChannelHistory('c1');
  assert.equal(store.getAttachment(channel), null);
});
