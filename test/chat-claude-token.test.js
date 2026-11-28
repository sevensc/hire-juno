import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { TOKEN_ENV, loadToken, removeToken, saveToken, tokenFile, validToken } from '../chat/server/claudeToken.js';

const SAMPLE = 'sk-ant-oat01-' + 'a'.repeat(40);

test('validToken accepts one printable line and trims it', () => {
  assert.equal(validToken(`  ${SAMPLE}\n`), SAMPLE);
  for (const bad of [undefined, '', 'short', 'two words here and more text to be long', 'x'.repeat(501)]) {
    assert.equal(validToken(bad), null);
  }
});

test('validToken takes off copied quotes and a Bearer prefix, and refuses what is not a setup-token token', () => {
  assert.equal(validToken(`"${SAMPLE}"`), SAMPLE);
  assert.equal(validToken(`'${SAMPLE}'`), SAMPLE);
  assert.equal(validToken(`Bearer ${SAMPLE}`), SAMPLE);
  assert.equal(validToken('x'.repeat(92)), null, 'another kind of key');
  assert.equal(validToken('sk-ant-oat01-abc'), null, 'cut off');
  assert.equal(validToken(`${SAMPLE.slice(0, 30)}\n${SAMPLE.slice(30)}`), null, 'broken over two lines');
});

test('a saved token that is not a setup-token token is not loaded', () => {
  const home = mkdtempSync(join(tmpdir(), 'hire-juno-token-bad-'));
  try {
    saveToken(SAMPLE, { env: {}, home });
    writeFileSync(tokenFile(home), 'x'.repeat(92) + '\n');
    const env = {};
    assert.equal(loadToken({ env, home }), false);
    assert.equal(env[TOKEN_ENV], undefined);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('saveToken writes the token for the account only and puts it into the environment', () => {
  const home = mkdtempSync(join(tmpdir(), 'hire-juno-token-'));
  const env = {};
  try {
    saveToken(SAMPLE, { env, home });
    assert.equal(env[TOKEN_ENV], SAMPLE);
    assert.equal(readFileSync(tokenFile(home), 'utf8'), SAMPLE + '\n');
    assert.equal(statSync(tokenFile(home)).mode & 0o777, 0o600);
    assert.throws(() => saveToken('not a token', { env, home }), /claude setup-token/);
    assert.equal(env[TOKEN_ENV], SAMPLE);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('loadToken reads a saved token, but an environment that has one already wins', () => {
  const home = mkdtempSync(join(tmpdir(), 'hire-juno-token-'));
  try {
    assert.equal(loadToken({ env: {}, home }), false);
    saveToken(SAMPLE, { env: {}, home });
    const env = {};
    assert.equal(loadToken({ env, home }), true);
    assert.equal(env[TOKEN_ENV], SAMPLE);
    const preset = { [TOKEN_ENV]: 'from-service-manager' };
    assert.equal(loadToken({ env: preset, home }), true);
    assert.equal(preset[TOKEN_ENV], 'from-service-manager');
    removeToken({ env, home });
    assert.equal(env[TOKEN_ENV], undefined);
    assert.equal(loadToken({ env: {}, home }), false);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
