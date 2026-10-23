// Used when the chat server is replaced by another instance (workforce
// switch): the old one must not kill turns that are still running, so its
// adapters are closed only once none of them is mid-turn — or after
// `maxMs`, so a turn that never ends (e.g. a permission request no open tab
// can answer anymore) can't keep the process alive forever.
//
// Resolves with 'idle' or 'timeout'. `isBusy` is read on every poll, so it
// sees adapters created while waiting too.

export const DRAIN_MAX_MS = 15 * 60 * 1000;
const DRAIN_POLL_MS = 1000;

export function waitUntilIdle(isBusy, { maxMs = DRAIN_MAX_MS, pollMs = DRAIN_POLL_MS } = {}) {
  return new Promise((resolve) => {
    if (!isBusy()) {
      resolve('idle');
      return;
    }
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (!isBusy()) {
        clearInterval(timer);
        resolve('idle');
      } else if (Date.now() - startedAt >= maxMs) {
        clearInterval(timer);
        resolve('timeout');
      }
    }, pollMs);
  });
}
