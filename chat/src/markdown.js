// A small, safe-by-construction markdown-lite renderer, so colleagues'
// replies don't show literal "**bold**" markup. No dependency pulled in for this deliberately vanilla frontend
// (see the file header): escape first, then apply a handful of block/
// inline rules for what colleagues actually produce (bold, italic,
// inline code, fenced code, links, headings, lists, pipe tables). Not
// a full CommonMark implementation — edge cases (nested emphasis,
// etc.) are expected to fall back to looking like plain text rather
// than rendering wrong.
export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}

// Pipe tables ("| a | b |" over "|---|---|"). A table needs a header
// line, directly followed by a delimiter line with the same number of
// cells — anything less stays a plain paragraph, which is also what the
// old renderer did with every table.
function splitTableRow(line) {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  return row.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, '|').trim());
}

function tableAlignments(delimiterLine) {
  if (!delimiterLine.includes('|')) return null;
  const cells = splitTableRow(delimiterLine);
  if (!cells.every((cell) => /^:?-+:?$/.test(cell))) return null;
  return cells.map((cell) => {
    if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
    if (cell.endsWith(':')) return 'right';
    return null;
  });
}

function isTableStart(lines, i) {
  if (i + 1 >= lines.length || !lines[i].includes('|')) return false;
  const alignments = tableAlignments(lines[i + 1]);
  return alignments !== null && alignments.length === splitTableRow(lines[i]).length;
}

function renderTable(lines, i) {
  const header = splitTableRow(lines[i]);
  const alignments = tableAlignments(lines[i + 1]);
  const cell = (tag, text, col) =>
    `<${tag}${alignments[col] ? ` style="text-align:${alignments[col]}"` : ''}>${renderInlineMarkdown(text ?? '')}</${tag}>`;
  let html = `<div class="table-scroll"><table><thead><tr>${header.map((text, col) => cell('th', text, col)).join('')}</tr></thead><tbody>`;
  let next = i + 2;
  while (next < lines.length && lines[next].trim() !== '' && lines[next].includes('|')) {
    const row = splitTableRow(lines[next]);
    html += `<tr>${header.map((_, col) => cell('td', row[col], col)).join('')}</tr>`;
    next++;
  }
  html += '</tbody></table></div>';
  return { html, next };
}

export function renderMarkdown(text) {
  const lines = text.split('\n');
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip the closing fence, if there was one
      html += `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`;
      continue;
    }
    if (isTableStart(lines, i)) {
      const table = renderTable(lines, i);
      html += table.html;
      i = table.next;
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 2, 6); // '#' -> h3 — a full h1 would dwarf a chat bubble
      html += `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
      i++;
      continue;
    }
    if (/^\s*[*-]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[*-]\s+/.test(lines[i])) {
        items.push(`<li>${renderInlineMarkdown(lines[i].replace(/^\s*[*-]\s+/, ''))}</li>`);
        i++;
      }
      html += `<ul>${items.join('')}</ul>`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${renderInlineMarkdown(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      html += `<ol>${items.join('')}</ol>`;
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('```') &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*[*-]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !isTableStart(lines, i)
    ) {
      paraLines.push(renderInlineMarkdown(lines[i]));
      i++;
    }
    html += `<p>${paraLines.join('<br>')}</p>`;
  }
  return html;
}
