// What the chat says when the usage limit is reached (server: a
// `limit_notice` update, see server/adapters/limit.js). Pure, so the wording
// and the time format can be tested.

function formatTime(ms, now, locale) {
  const date = new Date(ms);
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  // Not today: say the day too, a bare clock time would read as the wrong day.
  if (date.toDateString() === new Date(now).toDateString()) return time;
  return `${date.toLocaleDateString(locale, { weekday: 'short' })} ${time}`;
}

// -> { line, warning }: `line` is the system line of a rejected limit,
// `warning` the quiet header text of an allowed_warning. One of them is null.
export function limitNoticeText(update, { now = Date.now(), locale } = {}) {
  if (update.status === 'allowed_warning') {
    const util = update.utilization;
    // The unit of `utilization` is not documented: up to 1 is read as a fraction.
    const percent = typeof util === 'number' ? Math.round(util <= 1 ? util * 100 : util) : null;
    return { line: null, warning: percent === null ? 'Usage limit close' : `Usage at ${percent} %` };
  }
  let line = 'Usage limit reached.';
  if (typeof update.resetsAt === 'number') line += ` Resets at ${formatTime(update.resetsAt, now, locale)}.`;
  else if (update.resetText) line += ` ${update.resetText.replace(/^resets\b/i, 'Resets').replace(/\.?$/, '.')}`;
  return { line, warning: null };
}
