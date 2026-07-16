// Dev-only helper: takes the hand-generated Juno ASCII art (pasted into
// src/juno-ascii.js as JUNO_OPEN) and derives the extra frames for the
// terminal intro animation — curl sway (left side) and a one-eye wink
// + smile — by editing the grid in place, not by redrawing anything.
// Not shipped, not run at install time; rerun with
// `node scripts/animate-juno-ascii.mjs` after the base art changes and
// paste the printed arrays into src/juno-ascii.js.
//
// Why edit the grid instead of re-rendering from the source PNG: at
// 100x55 characters the small decorative spiral at the tip of the left
// curl isn't resolved as its own shape — it reads as part of the
// smooth head silhouette (checked by rendering the PNG straight, see
// scripts/render-juno-ascii.mjs; the outline lines up with this grid
// cell-for-cell but the curl detail itself is gone below this
// resolution). "Curl sway" here is a gentle horizontal shift of that
// lower-left contour, the closest thing this resolution actually
// resolves — flagged here so nobody goes looking for a separate curl
// shape in the grid and wonders why it isn't there.

import { readFileSync } from 'node:fs';

const SOURCE_PATH = new URL('../src/juno-ascii.js', import.meta.url);

const RAMP = ['.', ':', ';', '+', 'x']; // brightest to darkest
function lighten(ch) {
  const i = RAMP.indexOf(ch);
  return i <= 0 ? ch : RAMP[i - 1];
}
function darken(ch) {
  const i = RAMP.indexOf(ch);
  return i === -1 || i === RAMP.length - 1 ? ch : RAMP[i + 1];
}

function extractGrid(source) {
  const match = source.match(/const JUNO_OPEN = \[([\s\S]*?)\];/);
  if (!match) throw new Error('JUNO_OPEN not found — has the array been renamed?');
  return match[1]
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/,$/, ''));
}

// Right eye and mouth boxes, found by scanning the grid for the small
// bright (low-density) pockets nested inside the darker face oval —
// see the PR discussion for the row/col trace. The lower-left contour
// used for the curl sway.
const RIGHT_EYE_BOX = { r0: 27, r1: 30, c0: 52, c1: 59 };
const MOUTH_BOX = { r0: 36, r1: 38, c0: 39, c1: 61 };
const CURL_BOX = { r0: 36, r1: 47, c0: 10, c1: 33 };

function cloneGrid(grid) {
  return grid.slice();
}

function closeEye(grid) {
  const out = cloneGrid(grid);
  for (let r = RIGHT_EYE_BOX.r0; r <= RIGHT_EYE_BOX.r1; r++) {
    const chars = out[r].split('');
    for (let c = RIGHT_EYE_BOX.c0; c <= RIGHT_EYE_BOX.c1; c++) {
      chars[c] = darken(darken(chars[c])); // two steps darker: pocket -> filled
    }
    out[r] = chars.join('');
  }
  return out;
}

// Widens the mouth's bright pocket by lightening the darker characters
// immediately flanking it on both sides, one row at a time — a bigger
// grin without redrawing the smile curve from scratch.
function widenSmile(grid) {
  const out = cloneGrid(grid);
  for (let r = MOUTH_BOX.r0; r <= MOUTH_BOX.r1; r++) {
    const chars = out[r].split('');
    for (let c = MOUTH_BOX.c0; c <= MOUTH_BOX.c1; c++) {
      const isBright = '.:;'.includes(chars[c]);
      const leftBright = c > 0 && '.:;'.includes(chars[c - 1]);
      const rightBright = c < chars.length - 1 && '.:;'.includes(chars[c + 1]);
      if (!isBright && (leftBright || rightBright)) chars[c] = lighten(chars[c]);
    }
    out[r] = chars.join('');
  }
  return out;
}

// Shifts each row's slice of the curl box sideways, more at the tip
// (higher row) than the root (lower row) — a pendulum lean rather than
// a rigid slab move. `direction` is -1 (toward center) or 1 (away).
function swayCurl(grid, direction) {
  const out = cloneGrid(grid);
  const span = CURL_BOX.r1 - CURL_BOX.r0;
  for (let r = CURL_BOX.r0; r <= CURL_BOX.r1; r++) {
    const lean = Math.round((3 * direction * (r - CURL_BOX.r0)) / span);
    if (lean === 0) continue;
    const line = out[r];
    const before = line.slice(0, CURL_BOX.c0);
    const box = line.slice(CURL_BOX.c0, CURL_BOX.c1 + 1);
    const after = line.slice(CURL_BOX.c1 + 1);
    const width = box.length;
    let shifted;
    if (lean > 0) {
      shifted = '.'.repeat(lean) + box.slice(0, width - lean);
    } else {
      shifted = box.slice(-lean) + '.'.repeat(-lean);
    }
    out[r] = before + shifted + after;
  }
  return out;
}

function printArray(name, rows) {
  console.log(`const ${name} = [`);
  for (const line of rows) console.log(`  ${JSON.stringify(line)},`);
  console.log('];\n');
}

const source = readFileSync(SOURCE_PATH, 'utf8');
const base = extractGrid(source);

const curlIn = swayCurl(base, -1);
const curlOut = swayCurl(base, 1);
const winkSmile = widenSmile(widenSmile(closeEye(base)));

printArray('JUNO_OPEN', base);
printArray('JUNO_CURL_IN', curlIn);
printArray('JUNO_CURL_OUT', curlOut);
printArray('JUNO_WINK', winkSmile);
