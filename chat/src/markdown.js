// Renders a colleague's reply (CommonMark plus GFM tables and
// strikethrough) to HTML for a message bubble, using markdown-it.
//
// Safety rests on three settings, all deliberate:
//   - `html: false` — raw HTML in a reply is shown as text, never
//     interpreted. (The `commonmark` preset would switch it on, so this
//     uses the default preset.)
//   - markdown-it's own link check, which refuses javascript:, vbscript:,
//     file: and data: targets (data: only for a few image types, and
//     images are off, see next point).
//   - `image` is disabled: an image tag in a reply would make the browser
//     fetch an arbitrary address on its own. `![alt](url)` renders as a
//     plain link instead, opened by a deliberate click.
//
// `breaks: true` keeps the chat behaviour of the earlier hand-written
// renderer: a single line break inside a paragraph is a visible line
// break, not a space.
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
md.disable('image');

// Links open in a new tab, never in the chat page itself.
const defaultLinkOpen = md.renderer.rules.link_open
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

// "#" renders as <h3>, "######" stays <h6> — a full <h1> would dwarf a
// chat bubble.
function shiftedHeading(token) {
  const level = Number(token.tag.slice(1));
  return `h${Math.min(level + 2, 6)}`;
}
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  tokens[idx].tag = shiftedHeading(tokens[idx]);
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
  tokens[idx].tag = shiftedHeading(tokens[idx]);
  return self.renderToken(tokens, idx, options);
};

// A wide table scrolls inside the bubble instead of widening it.
md.renderer.rules.table_open = () => '<div class="table-scroll"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';

// markdown-it puts a newline after most tags. A message bubble keeps the
// line breaks of its text (white-space: pre-wrap, see styles.css), so
// those newlines would show up as blank lines between blocks. `>` never
// appears raw inside text or code (it is escaped to &gt;), so a newline
// right after one is always markup whitespace.
export function renderMarkdown(text) {
  return md.render(text).replace(/>\n/g, '>');
}
