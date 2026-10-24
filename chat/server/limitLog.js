// Keeps the structured fields of recognised usage limits (see
// adapters/limit.js) as JSON Lines, so the real shape of a limit case can be
// read later. Capped; the oldest lines fall away. Never holds message text.

import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const LIMIT_LOG_MAX_LINES = 200;

// `file` null (a workforce without an id): the line goes to the console.
export function writeLimitLog(file, entry, { max = LIMIT_LOG_MAX_LINES, log = console.log } = {}) {
  const line = JSON.stringify(entry);
  if (!file) {
    log(`[limit] ${line}`);
    return;
  }
  try {
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, `${line}\n`);
    const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
    if (lines.length > max) writeFileSync(file, `${lines.slice(-max).join('\n')}\n`);
  } catch (err) {
    log(`[limit] could not write the limit log: ${err.code || 'error'}`);
  }
}
