// Recognising a usage limit. Pure functions, no I/O.
//
// Two sources: the SDK's `rate_limit_event` message, and a `result` that ended
// on an API error. The SDK has no result subtype for the quota; an API error
// is typed as `subtype: 'success'` with `is_error: true` and the error text in
// `result` (read from the type declarations, not yet seen in a real case).
// So a result counts as a limit when it is an error and either carries HTTP
// 429 or its text sounds like one.

const LIMIT_TEXT = /session limit|usage limit|rate limit|\bresets\b/i;
const RESETS = /\bresets\b[^\n]*/i;

// The unit of `resetsAt` is not documented: a value below 1e12 is taken as
// Unix seconds, anything above as milliseconds (an assumption). Returns ms.
export function resetsAtMs(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined;
  return value < 1e12 ? value * 1000 : value;
}

// `rate_limit_event` with status allowed -> null (nothing to tell).
export function limitFromEvent(message) {
  if (message?.type !== 'rate_limit_event') return null;
  const info = message.rate_limit_info;
  if (!info || (info.status !== 'rejected' && info.status !== 'allowed_warning')) return null;
  return {
    status: info.status,
    resetsAt: resetsAtMs(info.resetsAt),
    rateLimitType: info.rateLimitType,
    utilization: typeof info.utilization === 'number' ? info.utilization : undefined,
  };
}

// An error result that looks like the quota -> a `rejected` notice, else null.
export function limitFromResult(message) {
  if (message?.type !== 'result' || message.is_error !== true) return null;
  const text = typeof message.result === 'string' ? message.result : '';
  if (message.api_error_status !== 429 && !LIMIT_TEXT.test(text)) return null;
  const resets = text.match(RESETS);
  return { status: 'rejected', resetText: resets ? resets[0].trim().slice(0, 80) : undefined };
}

// The fields kept for later reading of the real shape: structure only, never
// the text of a message. `source` is the message that was recognised.
export function limitLogFields(source, now = Date.now()) {
  const info = source?.rate_limit_info;
  const text = typeof source?.result === 'string' ? source.result : undefined;
  const entry = {
    at: new Date(now).toISOString(),
    messageType: source?.type,
    status: info?.status,
    resetsAt: info?.resetsAt,
    rateLimitType: info?.rateLimitType,
    utilization: info?.utilization,
    subtype: source?.subtype,
    is_error: source?.is_error,
    api_error_status: source?.api_error_status,
    terminal_reason: source?.terminal_reason,
    textLength: text?.length,
  };
  const resets = text?.match(RESETS);
  if (resets) entry.resetText = resets[0].trim().slice(0, 80);
  return Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined));
}
