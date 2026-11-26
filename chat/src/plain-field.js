// A plain-text, multi-line field on a contenteditable element, with the
// parts of the <textarea> interface the composer uses (value, disabled,
// placeholder, selectionStart, setSelectionRange, focus, events). Safari
// on the iPhone offers contact AutoFill above the keyboard for every form
// field and ignores autocomplete="off"; an editable element that is no form
// field does not get that bar.
//
// The content is kept as text only: line breaks are inserted as "\n" (the
// element uses white-space: pre-wrap), pasted text arrives without
// formatting.

function textNodesOf(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const out = [];
  while (walker.nextNode()) out.push(walker.currentNode);
  return out;
}

function insertText(text) {
  // execCommand keeps the browser's own undo history; the fallback edits
  // the selection directly where it is not available.
  if (document.execCommand && document.execCommand('insertText', false, text)) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function plainTextField(el) {
  el.setAttribute('contenteditable', 'true');
  el.setAttribute('role', 'textbox');
  el.setAttribute('aria-multiline', 'true');

  // Enter, Shift+Enter or the keyboard's return key, when the composer
  // does not take it as "send": a line break as text, not a <div>.
  el.addEventListener('beforeinput', (event) => {
    if (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak') {
      event.preventDefault();
      insertText('\n');
    }
  });
  // Text arrives as text; an image paste is left to the composer's own handler.
  el.addEventListener('paste', (event) => {
    const items = [...(event.clipboardData?.items || [])];
    if (items.some((item) => item.type.startsWith('image/'))) return;
    const text = event.clipboardData?.getData('text/plain');
    if (text == null) return;
    event.preventDefault();
    insertText(text);
  });

  const field = {
    get value() {
      // innerText also turns any <br>/<div> a browser added anyway into "\n".
      return el.innerText.replace(/\n$/, '');
    },
    set value(text) {
      el.textContent = text;
    },
    get disabled() {
      return el.getAttribute('contenteditable') !== 'true';
    },
    set disabled(off) {
      el.setAttribute('contenteditable', off ? 'false' : 'true');
      el.setAttribute('aria-disabled', off ? 'true' : 'false');
      el.classList.toggle('is-disabled', Boolean(off));
    },
    get placeholder() {
      return el.dataset.placeholder || '';
    },
    set placeholder(text) {
      el.dataset.placeholder = text;
      el.setAttribute('aria-placeholder', text);
    },
    // Caret position as an offset into `value`.
    get selectionStart() {
      const sel = window.getSelection();
      if (!sel.rangeCount || !el.contains(sel.focusNode)) return field.value.length;
      const range = document.createRange();
      range.setStart(el, 0);
      range.setEnd(sel.focusNode, sel.focusOffset);
      return range.toString().length;
    },
    setSelectionRange(start, end = start) {
      const nodes = textNodesOf(el);
      const place = (offset) => {
        let left = offset;
        for (const node of nodes) {
          if (left <= node.length) return [node, left];
          left -= node.length;
        }
        return nodes.length ? [nodes[nodes.length - 1], nodes[nodes.length - 1].length] : [el, 0];
      };
      const range = document.createRange();
      range.setStart(...place(start));
      range.setEnd(...place(end));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    },
    focus: () => el.focus(),
    blur: () => el.blur(),
    addEventListener: (...args) => el.addEventListener(...args),
    removeEventListener: (...args) => el.removeEventListener(...args),
    get style() {
      return el.style;
    },
    get scrollHeight() {
      return el.scrollHeight;
    },
    element: el,
  };
  return field;
}
