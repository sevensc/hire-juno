// Which way a message goes out. "queue" only means something while the
// colleague's turn runs; without one there is nothing to queue behind, so
// it is a plain send.
export function pickSendKind({ typing, requested }) {
  return typing && requested === 'queue' ? 'queue' : 'send';
}

// Arrow-key movement inside the send menu (wraps around). Returns the new
// index, or null for a key the menu does not move on.
export function nextMenuIndex(current, key, count) {
  if (count <= 0) return null;
  if (key === 'ArrowDown') return (current + 1) % count;
  if (key === 'ArrowUp') return (current - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}
