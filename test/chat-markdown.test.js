import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderMarkdown } from '../chat/src/markdown.js';

const TABLE = '| # | Title | Note |\n|---|---|---|\n| 527 | `.env` readable | today |\n| 261 | Backup | **later** |';

test('a pipe table renders as a table inside a scroll wrapper', () => {
  const html = renderMarkdown(TABLE);
  assert.match(html, /^<div class="table-scroll"><table>/);
  assert.match(html, /<th>#<\/th>\s*<th>Title<\/th>\s*<th>Note<\/th>/);
  assert.match(html, /<td><code>\.env<\/code> readable<\/td>/);
  assert.match(html, /<td><strong>later<\/strong><\/td>/);
  assert.equal(html.match(/<tr>/g).length, 3);
});

test('a table directly after a text line is not swallowed into the paragraph', () => {
  const html = renderMarkdown('Overview:\n' + TABLE + '\n\nOrder: first one.');
  assert.match(html, /<p>Overview:<\/p>\s*<div class="table-scroll"><table>/);
  assert.match(html, /<\/table><\/div>\s*<p>Order: first one\.<\/p>/);
});

test('delimiter colons set the column alignment', () => {
  const html = renderMarkdown('| a | b | c |\n|:--|:-:|--:|\n| 1 | 2 | 3 |');
  assert.match(html, /<th style="text-align:center">b<\/th>/);
  assert.match(html, /<th style="text-align:right">c<\/th>/);
});

test('nested lists keep their nesting and numbered lists keep their start', () => {
  const nested = renderMarkdown('- a\n  - b\n    - c\n- d');
  assert.equal(nested.match(/<ul>/g).length, 3);
  assert.match(renderMarkdown('3. a\n4. b'), /<ol start="3">/);
});

test('blockquote, rule, strikethrough, tilde fence with language', () => {
  assert.match(renderMarkdown('> quoted'), /<blockquote>/);
  assert.match(renderMarkdown('a\n\n---\n\nb'), /<hr>/);
  assert.match(renderMarkdown('~~gone~~'), /<s>gone<\/s>/);
  assert.match(renderMarkdown('~~~js\nconst a = 1;\n~~~'), /<pre><code class="language-js">const a = 1;/);
});

test('headings are shifted down two levels and capped at h6', () => {
  const html = renderMarkdown('# a\n#### d\n###### f');
  assert.match(html, /<h3>a<\/h3>/);
  assert.match(html, /<h6>d<\/h6>/);
  assert.match(html, /<h6>f<\/h6>/);
  assert.ok(!/<h1|<h2/.test(html));
});

test('a single line break stays a visible line break', () => {
  assert.match(renderMarkdown('one\ntwo'), /one<br>\s*two/);
});

test('links open in a new tab, bare URLs become links', () => {
  assert.match(renderMarkdown('[t](https://example.com/a)'), /<a href="https:\/\/example\.com\/a" target="_blank" rel="noopener noreferrer">t<\/a>/);
  assert.match(renderMarkdown('see https://example.com/x now'), /<a href="https:\/\/example\.com\/x" target="_blank"/);
});

test('raw HTML is shown as text, never interpreted', () => {
  const html = renderMarkdown('<b>x</b> <script>alert(1)</script> <img src=x onerror=alert(1)>');
  assert.ok(!/<b>|<script|<img/.test(html));
  assert.match(html, /&lt;script&gt;/);
});

test('script-capable link targets are not turned into links', () => {
  for (const target of ['javascript:alert(1)', 'vbscript:x', 'data:text/html,x', 'file:///etc/passwd']) {
    assert.ok(!/<a /.test(renderMarkdown(`[x](${target})`)), target);
  }
});

test('an image never becomes an image element', () => {
  const html = renderMarkdown('![alt](https://example.com/i.png)');
  assert.ok(!/<img/.test(html));
});

test('inline basics and fenced code still render as before', () => {
  assert.equal(renderMarkdown('a **b** *c* `d`').trim(), '<p>a <strong>b</strong> <em>c</em> <code>d</code></p>');
  assert.match(renderMarkdown('```\ncode\n```'), /<pre><code>code\n<\/code><\/pre>/);
});
