#!/usr/bin/env node
// Copies the onnxruntime WebAssembly files that the transcript worker
// (chat/src/transcribe-worker.js) loads into chat/public/vendor/ort (not
// kept in git).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'chat', 'public', 'vendor');
const copy = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(root, 'node_modules', from), to);
};
for (const f of ['ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm', 'ort-wasm-simd-threaded.asyncify.mjs', 'ort-wasm-simd-threaded.asyncify.wasm', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  copy(join('onnxruntime-web', 'dist', f), join(out, 'ort', f));
}
console.log('Copied the transcription runtime to chat/public/vendor.');
