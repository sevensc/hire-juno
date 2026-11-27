import assert from 'node:assert/strict';
import { test } from 'node:test';

import { youtubeEmbedUrl, youtubeId, youtubeStart, youtubeVideos } from '../chat/src/youtube.js';

test('youtubeId knows the usual YouTube addresses and nothing else', () => {
  assert.equal(youtubeId('https://m.youtube.com/watch?v=W4m_8ovS0RY&ra=m'), 'W4m_8ovS0RY');
  assert.equal(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://youtu.be/dQw4w9WgXcQ?si=abc'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://music.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeId('https://www.youtube.com/channel/UCabc'), null);
  assert.equal(youtubeId('https://evil.example/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(youtubeId('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ"><script>'), null);
  assert.equal(youtubeId('javascript:alert(1)'), null);
});

test('start time and embed address', () => {
  assert.equal(youtubeStart('https://youtu.be/dQw4w9WgXcQ?t=90'), 90);
  assert.equal(youtubeStart('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s'), 90);
  assert.equal(youtubeStart('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 0);
  assert.equal(youtubeEmbedUrl({ id: 'dQw4w9WgXcQ', start: 90 }), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1&rel=0&start=90');
});

test('youtubeVideos finds each video once, a few at most', () => {
  const text = 'schau mal https://m.youtube.com/watch?v=W4m_8ovS0RY&ra=m und https://youtu.be/W4m_8ovS0RY nochmal, dazu https://example.com';
  assert.deepEqual(youtubeVideos(text), [{ id: 'W4m_8ovS0RY', start: 0 }]);
  const many = ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc', 'ddddddddddd'].map((id) => `https://youtu.be/${id}`).join(' ');
  assert.equal(youtubeVideos(many).length, 3);
  assert.deepEqual(youtubeVideos(''), []);
});
