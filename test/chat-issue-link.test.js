import assert from 'node:assert/strict';
import { test } from 'node:test';

import { browserFromUserAgent, buildIssueUrl, osFamilyFromUserAgent } from '../chat/src/issue-link.js';

const CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0';
const EDGE_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0';

test('browser and OS family from a userAgent', () => {
  assert.equal(browserFromUserAgent(CHROME_MAC), 'Chrome 130');
  assert.equal(osFamilyFromUserAgent(CHROME_MAC), 'macOS');
  assert.equal(browserFromUserAgent(SAFARI_IOS), 'Safari 18');
  assert.equal(osFamilyFromUserAgent(SAFARI_IOS), 'iOS');
  assert.equal(browserFromUserAgent(FIREFOX_LINUX), 'Firefox 131');
  assert.equal(osFamilyFromUserAgent(FIREFOX_LINUX), 'Linux');
  assert.equal(browserFromUserAgent(EDGE_WIN), 'Edge 130');
  assert.equal(osFamilyFromUserAgent(EDGE_WIN), 'Windows');
  assert.equal(browserFromUserAgent(''), 'unknown');
  assert.equal(osFamilyFromUserAgent(undefined), 'unknown');
});

test('the issue URL targets the repo and encodes the body', () => {
  const raw = buildIssueUrl({ version: '1.2.3', userAgent: CHROME_MAC });
  const url = new URL(raw);
  assert.equal(url.origin + url.pathname, 'https://github.com/sevensc/hire-juno/issues/new');
  assert.deepEqual([...url.searchParams.keys()].sort(), ['body']);
  assert.ok(!raw.includes('\n') && !raw.includes(' '), 'newlines and spaces are percent-encoded');
  const body = url.searchParams.get('body');
  for (const h of ['### What happened', '### What you expected', '### Environment']) assert.ok(body.includes(h));
  assert.ok(body.includes('- hire-juno: 1.2.3'));
  assert.ok(body.includes('- Browser: Chrome 130'));
  assert.ok(body.includes('- OS: macOS'));
});

test('missing version or userAgent fall back to "unknown"', () => {
  const body = new URL(buildIssueUrl()).searchParams.get('body');
  assert.ok(body.includes('- hire-juno: unknown'));
  assert.ok(body.includes('- Browser: unknown'));
  assert.ok(body.includes('- OS: unknown'));
});

test('no paths, user names or full userAgent leak into the URL', () => {
  const decoded = decodeURIComponent(buildIssueUrl({ version: '0.1.0', userAgent: CHROME_MAC }));
  for (const bad of ['/Users/', '/home/', 'C:\\', 'Mozilla', 'AppleWebKit', '10_15_7', 'token', 'localhost']) {
    assert.ok(!decoded.includes(bad), `contains ${bad}`);
  }
});
