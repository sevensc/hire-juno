// The Claude CLI refuses to resume a session whose transcript it no longer
// has ("No conversation found with session ID: …"). The chat remembers the
// session id of every colleague (store.js, adapter_sessions); once the CLI
// has dropped the transcript behind it, every later message would fail the
// same way until the pointer is cleared by hand (a context reset).
export const STALE_RESUME_MESSAGE =
  'The saved conversation behind this session no longer exists, so it starts fresh from here. Please send your last message again.';

export function isStaleResumeError(text) {
  return typeof text === 'string' && /No conversation found with session ID/i.test(text);
}
