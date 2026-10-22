import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderMarkdown } from '../chat/src/markdown.js';

const TABLE = '| # | Title | Note |\n|---|---|---|\n| 527 | `.env` readable | today |\n| 261 | Backup | **later** |';

test('a pipe table renders as a table with header and body rows', () => {
  const html = renderMarkdown(TABLE);
  assert.match(html, /<table><thead><tr><th>#<\/th><th>Title<\/th><th>Note<\/th><\/tr><\/thead>/);
  assert.match(html, /<tr><td>527<\/td><td><code>\.env<\/code> readable<\/td><td>today<\/td><\/tr>/);
  assert.match(html, /<td><strong>later<\/strong><\/td>/);
  assert.equal(html.match(/<tr>/g).length, 3);
});

test('a table directly after a text line is not swallowed into the paragraph', () => {
  const html = renderMarkdown('Overview:\n' + TABLE + '\n\nOrder: first one.');
  assert.match(html, /^<p>Overview:<\/p><div class="table-scroll"><table>/);
  assert.match(html, /<\/table><\/div><p>Order: first one\.<\/p>$/);
});

test('delimiter colons set the column alignment', () => {
  const html = renderMarkdown('| a | b | c |\n|:--|:-:|--:|\n| 1 | 2 | 3 |');
  assert.match(html, /<th>a<\/th><th style="text-align:center">b<\/th><th style="text-align:right">c<\/th>/);
});

test('a short row is padded and an escaped pipe stays inside its cell', () => {
  const html = renderMarkdown('| a | b |\n|---|---|\n| x \\| y |');
  assert.match(html, /<td>x \| y<\/td><td><\/td>/);
});

test('cell content is escaped, never raw HTML', () => {
  const html = renderMarkdown('| a |\n|---|\n| <img src=x onerror=alert(1)> |');
  assert.ok(!html.includes('<img'));
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('pipes without a matching delimiter line stay a plain paragraph', () => {
  assert.equal(renderMarkdown('a | b\nc | d'), '<p>a | b<br>c | d</p>');
  assert.equal(renderMarkdown('| a | b |\n|---|\n| 1 | 2 |'), '<p>| a | b |<br>|---|<br>| 1 | 2 |</p>');
});

test('existing block rules are unchanged', () => {
  assert.equal(renderMarkdown('# Title\n\n- one\n- two\n\nplain **bold**'), '<h3>Title</h3><ul><li>one</li><li>two</li></ul><p>plain <strong>bold</strong></p>');
});
