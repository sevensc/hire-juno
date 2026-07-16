// Dev-only generator for Juno's terminal ASCII art. Not shipped, not run
// at install time — this produces the frame arrays pasted into
// src/juno-ascii.js, same as every other hand-authored graphic in this
// repo (see the SVGs in src/web/server.js). Rerun with
// `node scripts/render-juno-frames.mjs` after the icon changes and paste
// the printed output back in.
//
// Small and in color, not a big monochrome density map: each character
// cell renders two vertically-stacked pixel samples via the upper-half-
// block character (▀, foreground = top sample, background = bottom
// sample) — the standard terminal-image trick that doubles vertical
// resolution per cell and happens to match a monospace cell's own ~1:2
// width:height ratio, so a square source image comes out square on
// screen at COLS = 2 * ROWS.
//
// The wink/smile/curl edits happen on the actual pixel buffer before
// downsampling — closing an eye, dilating the mouth, shifting the curl —
// using regions found by flood-filling the real PNG (see findFeatures
// below), not guessed from the downsampled grid. That was the mistake
// last round: editing a coarse text-density dump by eye put the
// "wink" and "smile" in roughly-plausible but wrong cells.

import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ICON_PATH = fileURLToPath(new URL('../src/web/assets/juno-icon.png', import.meta.url));
const COLS = 40;
const ROWS = 20; // 40x40 sample grid via half-blocks, see header
const BG = [254, 253, 253]; // page background the icon sits on, for edge blending

function loadImage() {
  const png = PNG.sync.read(readFileSync(ICON_PATH));
  return { width: png.width, height: png.height, data: Uint8ClampedArray.from(png.data) };
}

function luminance(r, g, b) {
  return 0.3 * r + 0.59 * g + 0.11 * b;
}

function pixelAt({ width, data }, x, y) {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

function setPixel({ width, data }, x, y, [r, g, b]) {
  const i = (y * width + x) * 4;
  data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
}

// Flood-fills the bright (non-purple) region of the icon, restricted to
// inside the circle so the page background never joins in, and returns
// every connected component with its member pixels — used once, at
// generation time, to locate the eyes/mouth/curl precisely instead of
// guessing.
function findFeatures(img) {
  const { width: W, height: H } = img;
  // Circle geometry from the purple (dark) pixels' own extent.
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [r, g, b] = pixelAt(img, x, y);
    if (luminance(r, g, b) <= 200) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const R = Math.min(maxX - minX, maxY - minY) / 2 - 8;
  const inCircle = (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= R * R;

  const visited = new Uint8Array(W * H);
  const comps = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (visited[idx] || !inCircle(x, y)) continue;
      const [r, g, b] = pixelAt(img, x, y);
      if (luminance(r, g, b) <= 200) { visited[idx] = 1; continue; }
      // BFS this bright component.
      const pixels = [];
      const stack = [[x, y]];
      visited[idx] = 1;
      let bMinX = x, bMaxX = x, bMinY = y, bMaxY = y;
      while (stack.length) {
        const [cx2, cy2] = stack.pop();
        pixels.push([cx2, cy2]);
        if (cx2 < bMinX) bMinX = cx2; if (cx2 > bMaxX) bMaxX = cx2;
        if (cy2 < bMinY) bMinY = cy2; if (cy2 > bMaxY) bMaxY = cy2;
        for (const [nx, ny] of [[cx2 - 1, cy2], [cx2 + 1, cy2], [cx2, cy2 - 1], [cx2, cy2 + 1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const nidx = ny * W + nx;
          if (visited[nidx] || !inCircle(nx, ny)) continue;
          const [nr, ng, nb] = pixelAt(img, nx, ny);
          if (luminance(nr, ng, nb) > 200) { visited[nidx] = 1; stack.push([nx, ny]); }
        }
      }
      comps.push({ pixels, minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY });
    }
  }
  comps.sort((a, b) => b.pixels.length - a.pixels.length);
  // Component 0 is the hair mass (by far the largest); the next three,
  // sorted left-to-right by center X, are left eye / right eye / mouth
  // — verified against a visual crop of the source PNG, not assumed.
  const [hair, ...small] = comps;
  // The curl isn't its own connected component (it's part of the same
  // hair mass) — located instead by cropping the source PNG and
  // looking at it directly (src/web/assets/juno-icon.png, roughly
  // x:355-500 y:715-945), then selecting the hair pixels inside that
  // box. Manual, but grounded in the actual image, not the downsampled
  // grid.
  const CURL_BOX = { minX: 355, maxX: 500, minY: 715, maxY: 945 };
  const curlPixels = hair.pixels.filter(
    ([x, y]) => x >= CURL_BOX.minX && x <= CURL_BOX.maxX && y >= CURL_BOX.minY && y <= CURL_BOX.maxY
  );
  const curl = { pixels: curlPixels, ...CURL_BOX };

  const bySize = small.filter((c) => c.pixels.length > 200).slice(0, 3);
  // Mouth is the lowest of the three (largest average Y); the other two
  // are the eyes, told apart by X (smaller = image-left = the viewer's
  // left, larger = image-right).
  const byLowest = [...bySize].sort(
    (a, b) => (b.minY + b.maxY) - (a.minY + a.maxY)
  );
  const mouth = byLowest[0];
  const [leftEye, rightEye] = byLowest.slice(1).sort((a, b) => a.minX - b.minX);
  return { hair, leftEye, rightEye, mouth, curl, cx, cy, R };
}

function fillPixels(img, pixels, color) {
  for (const [x, y] of pixels) setPixel(img, x, y, color);
}

function dilate(pixels, radius) {
  const set = new Set(pixels.map(([x, y]) => `${x},${y}`));
  const out = [];
  for (const [x, y] of pixels) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const key = `${x + dx},${y + dy}`;
        if (!set.has(key)) { set.add(key); out.push([x + dx, y + dy]); }
      }
    }
  }
  return out;
}

function shiftFeature(img, feature, dx, purple) {
  // Erase the feature at its original spot, redraw its pixels offset by
  // dx — a rigid translation of the curl, not a redraw.
  fillPixels(img, feature.pixels, purple);
  const shifted = feature.pixels.map(([x, y]) => [x + dx, y]);
  fillPixels(img, shifted, [255, 255, 255]);
}

function clonePixels(img) {
  return { ...img, data: Uint8ClampedArray.from(img.data) };
}

function downsample(img) {
  const { width: W, height: H, data } = img;
  const rows = [];
  for (let row = 0; row < ROWS; row++) {
    const cells = [];
    for (let half = 0; half < 2; half++) {
      const sampleRow = row * 2 + half;
      const y0 = Math.floor((sampleRow / (ROWS * 2)) * H);
      const y1 = Math.floor(((sampleRow + 1) / (ROWS * 2)) * H);
      for (let col = 0; col < COLS; col++) {
        const x0 = Math.floor((col / COLS) * W);
        const x1 = Math.floor(((col + 1) / COLS) * W);
        let sr = 0, sg = 0, sb = 0, count = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          sr += data[i]; sg += data[i + 1]; sb += data[i + 2];
          count++;
        }
        const color = count ? [Math.round(sr / count), Math.round(sg / count), Math.round(sb / count)] : BG;
        (cells[col] ??= [])[half] = color;
      }
    }
    rows.push(cells);
  }
  return rows; // rows[row][col] = [topColor, bottomColor]
}

function ansiLine(cells) {
  let out = '';
  for (const [top, bottom] of cells) {
    out += `\x1b[38;2;${top[0]};${top[1]};${top[2]}m\x1b[48;2;${bottom[0]};${bottom[1]};${bottom[2]}m▀`;
  }
  return out + '\x1b[0m';
}

// Plain-character fallback for NO_COLOR / non-TTY output: same grid,
// collapsed to a five-level brightness ramp with no escape codes.
const RAMP = ' .:+#';
function plainLine(cells) {
  let out = '';
  for (const [top, bottom] of cells) {
    const lum = (luminance(...top) + luminance(...bottom)) / 2;
    const bucket = Math.min(RAMP.length - 1, Math.floor(((255 - lum) / 256) * RAMP.length));
    out += RAMP[bucket];
  }
  return out;
}

function frameToLines(rows) {
  return rows.map((cells) => ({ ansi: ansiLine(cells), plain: plainLine(cells) }));
}

// --- Build the frames ---
const base = loadImage();
const features = findFeatures(base);
const purple = pixelAt(base, Math.round(features.cx), Math.round(features.cy)).slice(0, 3);

const neutral = clonePixels(base);

const winkSmile = clonePixels(base);
fillPixels(winkSmile, features.rightEye.pixels, purple); // close one eye
fillPixels(winkSmile, dilate(features.mouth.pixels, 10), [255, 255, 255]); // wider grin

const curlOut = clonePixels(base);
shiftFeature(curlOut, features.curl ?? features.mouth, 18, purple);
const curlIn = clonePixels(base);
shiftFeature(curlIn, features.curl ?? features.mouth, -18, purple);

function printFrame(name, img) {
  const lines = frameToLines(downsample(img));
  console.log(`const ${name}_ANSI = [`);
  for (const l of lines) console.log(`  ${JSON.stringify(l.ansi)},`);
  console.log('];');
  console.log(`const ${name}_PLAIN = [`);
  for (const l of lines) console.log(`  ${JSON.stringify(l.plain)},`);
  console.log('];\n');
}

console.log('// eye/mouth boxes found:', JSON.stringify({
  leftEye: [features.leftEye.minX, features.leftEye.minY, features.leftEye.maxX, features.leftEye.maxY],
  rightEye: [features.rightEye.minX, features.rightEye.minY, features.rightEye.maxX, features.rightEye.maxY],
  mouth: [features.mouth.minX, features.mouth.minY, features.mouth.maxX, features.mouth.maxY],
  purple,
}));

printFrame('JUNO_NEUTRAL', neutral);
printFrame('JUNO_WINK', winkSmile);
printFrame('JUNO_CURL_OUT', curlOut);
printFrame('JUNO_CURL_IN', curlIn);

// A quick visual proof, upscaled nearest-neighbor, so the result can be
// eyeballed as an actual image before it's pasted into source.
function exportPreview(img, outPath, scale = 8) {
  const rows = downsample(img);
  const w = COLS * scale, h = ROWS * 2 * scale;
  const png = new PNG({ width: w, height: h });
  for (let row = 0; row < ROWS; row++) {
    for (let half = 0; half < 2; half++) {
      const color = rows[row].map((c) => c[half]);
      for (let col = 0; col < COLS; col++) {
        for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
          const px = col * scale + sx;
          const py = (row * 2 + half) * scale + sy;
          const i = (py * w + px) * 4;
          png.data[i] = color[col][0]; png.data[i + 1] = color[col][1]; png.data[i + 2] = color[col][2]; png.data[i + 3] = 255;
        }
      }
    }
  }
  writeFileSync(outPath, PNG.sync.write(png));
}

exportPreview(neutral, '/tmp/preview-neutral.png');
exportPreview(winkSmile, '/tmp/preview-wink.png');
exportPreview(curlOut, '/tmp/preview-curl-out.png');
exportPreview(curlIn, '/tmp/preview-curl-in.png');
