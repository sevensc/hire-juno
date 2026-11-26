// Speech recognition for call transcripts, on this device only: a Whisper
// model run by transformers.js in the browser. The audio never leaves the
// device; only the model files are downloaded once.
import { env, pipeline } from '@huggingface/transformers';

env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = new URL('./vendor/ort/', self.location.href).href;

let recognize = null;

// With a graphics card the browser can use (WebGPU), the large model; else
// the small one, which still keeps up on the processor.
async function load() {
  const adapter = self.navigator.gpu ? await self.navigator.gpu.requestAdapter().catch(() => null) : null;
  const device = adapter ? 'webgpu' : 'wasm';
  const half = Boolean(adapter?.features?.has('shader-f16'));
  const model = adapter ? 'onnx-community/whisper-large-v3-turbo' : 'onnx-community/whisper-small';
  const dtype = adapter
    ? { encoder_model: half ? 'q4f16' : 'q4', decoder_model_merged: half ? 'q4f16' : 'q4' }
    : 'q8';
  recognize = await pipeline('automatic-speech-recognition', model, {
    device,
    dtype,
    progress_callback: (p) => {
      if (p.status === 'progress' && p.total) self.postMessage({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total });
    },
  });
  return { device, model: model.split('/').pop() };
}

self.onmessage = async (event) => {
  const { type, id, audio, language } = event.data;
  try {
    if (type === 'load') {
      const { device, model } = await load();
      self.postMessage({ type: 'ready', device, model });
    } else if (type === 'chunk') {
      const started = performance.now();
      const out = await recognize(audio, { language, task: 'transcribe' });
      self.postMessage({ type: 'text', id, text: (out.text || '').trim(), ms: Math.round(performance.now() - started) });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id, message: err.message });
  }
};
