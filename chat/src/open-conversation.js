// Which conversation was open before the page was reloaded — remembered
// in the browser's localStorage (per origin, and every workforce has its
// own port, so one workforce's choice never leaks into another's) and
// re-validated against the roster on the way back in: a colleague, channel
// or session that is gone since falls through to "nothing to restore".
//
// Subagent threads ("sub:…") are never remembered: they only exist while
// the page that registered them is alive.

const STORAGE_KEY = 'hire-juno-chat:open-conversation';

export function rememberOpenConversation(value, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage blocked or full — the chat works the same, it just opens on
    // the first colleague after a reload, like before.
  }
}

export function recallOpenConversation(storage = globalThis.localStorage) {
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

// Pure: decides what to reopen. `saved` is whatever recallOpenConversation
// returned — untrusted, it may be null, from an older shape, or stale.
// Returns { channelId } | { colleagueId, sessionId } | null.
export function pickConversationToRestore(saved, { colleagueIds, channelIds, sessionIdsByColleague, defaultSessionId }) {
  if (!saved || typeof saved !== 'object') return null;
  if (typeof saved.channelId === 'string') {
    return channelIds.includes(saved.channelId) ? { channelId: saved.channelId } : null;
  }
  if (typeof saved.colleagueId === 'string' && colleagueIds.includes(saved.colleagueId)) {
    const sessionId = typeof saved.sessionId === 'string' ? saved.sessionId : defaultSessionId;
    const known = sessionId === defaultSessionId || (sessionIdsByColleague[saved.colleagueId] ?? []).includes(sessionId);
    // A vanished extra session still leaves the colleague herself to open.
    return { colleagueId: saved.colleagueId, sessionId: known ? sessionId : defaultSessionId };
  }
  return null;
}
