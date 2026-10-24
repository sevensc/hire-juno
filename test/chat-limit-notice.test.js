import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { limitFromEvent, limitFromResult, limitLogFields, resetsAtMs } from '../chat/server/adapters/limit.js';
import { LIMIT_LOG_MAX_LINES, writeLimitLog } from '../chat/server/limitLog.js';
import { limitNoticeText } from '../chat/src/limit-notice.js';

const event = (info) => ({ type: 'rate_limit_event', rate_limit_info: info });
const SECRET = 'SECRET-BODY';

test('rate_limit_event: rejected and warning are recognised, allowed is not', () => {
  assert.deepEqual(
    limitFromEvent(event({ status: 'rejected', resetsAt: 1_800_000_000, rateLimitType: 'five_hour' })),
    { status: 'rejected', resetsAt: 1_800_000_000_000, rateLimitType: 'five_hour', utilization: undefined },
  );
  assert.equal(limitFromEvent(event({ status: 'allowed_warning', utilization: 0.9 })).utilization, 0.9);
  assert.equal(limitFromEvent(event({ status: 'allowed' })), null);
  assert.equal(limitFromEvent({ type: 'assistant' }), null);
  assert.equal(limitFromEvent(event(undefined)), null);
});

test('resetsAt: seconds become milliseconds, milliseconds stay, junk is dropped', () => {
  assert.equal(resetsAtMs(1_800_000_000), 1_800_000_000_000);
  assert.equal(resetsAtMs(1_800_000_000_000), 1_800_000_000_000);
  assert.equal(resetsAtMs('x'), undefined);
  assert.equal(resetsAtMs(0), undefined);
});

test('result: a success-typed error with 429 and limit text is a limit, with the resets text', () => {
  const result = {
    type: 'result',
    subtype: 'success',
    is_error: true,
    api_error_status: 429,
    result: "You've hit your session limit · resets 11am (Europe/Berlin)",
  };
  assert.deepEqual(limitFromResult(result), { status: 'rejected', resetText: 'resets 11am (Europe/Berlin)' });
});

test('result: 429 without text, or limit text without a status, still counts', () => {
  assert.deepEqual(limitFromResult({ type: 'result', is_error: true, api_error_status: 429, result: 'x' }), {
    status: 'rejected',
    resetText: undefined,
  });
  for (const text of ['Usage limit reached', 'rate limit exceeded', 'Session limit hit']) {
    assert.equal(limitFromResult({ type: 'result', subtype: 'success', is_error: true, result: text }).status, 'rejected');
  }
});

test('result: everything else is left alone', () => {
  assert.equal(limitFromResult({ type: 'result', subtype: 'success', is_error: false, result: 'resets 11am' }), null);
  assert.equal(limitFromResult({ type: 'result', subtype: 'success', result: 'fine' }), null);
  assert.equal(limitFromResult({ type: 'result', subtype: 'success', is_error: true, api_error_status: 500, result: 'boom' }), null);
  assert.equal(limitFromResult({ type: 'result', subtype: 'error_max_turns', is_error: true, result: undefined }), null);
  assert.equal(limitFromResult({ type: 'assistant', is_error: true, api_error_status: 429 }), null);
});

test('log fields: structure only, the text is reduced to its length and the resets part', () => {
  const fields = limitLogFields(
    { type: 'result', subtype: 'success', is_error: true, api_error_status: 429, terminal_reason: 'api_error', result: `${SECRET} resets 11am` },
    0,
  );
  assert.equal(fields.textLength, `${SECRET} resets 11am`.length);
  assert.equal(fields.resetText, 'resets 11am');
  assert.equal(fields.api_error_status, 429);
  assert.equal(fields.terminal_reason, 'api_error');
  assert.equal(fields.at, '1970-01-01T00:00:00.000Z');
  assert.ok(!JSON.stringify(fields).includes(SECRET));
  const fromEvent = limitLogFields(event({ status: 'rejected', resetsAt: 5, rateLimitType: 'seven_day', utilization: 1 }));
  assert.equal(fromEvent.status, 'rejected');
  assert.equal(fromEvent.rateLimitType, 'seven_day');
  assert.ok(!('textLength' in fromEvent));
});

test('limit log: capped at 200 lines, oldest dropped; no file means console', () => {
  const dir = mkdtempSync(join(tmpdir(), 'limit-log-'));
  try {
    const file = join(dir, 'chat', 'limit-log.jsonl');
    for (let i = 0; i < LIMIT_LOG_MAX_LINES + 15; i++) writeLimitLog(file, { n: i });
    const lines = readFileSync(file, 'utf8').trim().split('\n');
    assert.equal(lines.length, 200);
    assert.equal(JSON.parse(lines[0]).n, 15);
    assert.equal(JSON.parse(lines.at(-1)).n, 214);
    const logged = [];
    writeLimitLog(null, { a: 1 }, { log: (m) => logged.push(m) });
    assert.deepEqual(logged, ['[limit] {"a":1}']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('notice text: reset time, reset text, warning', () => {
  const now = new Date(2026, 9, 24, 9, 0).getTime();
  const at = new Date(2026, 9, 24, 14, 30).getTime();
  assert.equal(limitNoticeText({ status: 'rejected', resetsAt: at }, { now, locale: 'en-GB' }).line, 'Usage limit reached. Resets at 14:30.');
  const tomorrow = new Date(2026, 9, 25, 14, 30).getTime();
  assert.match(limitNoticeText({ status: 'rejected', resetsAt: tomorrow }, { now, locale: 'en-GB' }).line, /Resets at \w+ 14:30\.$/);
  assert.equal(
    limitNoticeText({ status: 'rejected', resetText: 'resets 11am (Europe/Berlin)' }).line,
    'Usage limit reached. Resets 11am (Europe/Berlin).',
  );
  assert.equal(limitNoticeText({ status: 'rejected' }).line, 'Usage limit reached.');
  assert.deepEqual(limitNoticeText({ status: 'allowed_warning', utilization: 0.9 }), { line: null, warning: 'Usage at 90 %' });
});
