// Call transcripts, made on the device that runs them: every audio track in
// the call (own microphone and each participant's incoming audio) is cut
// into pieces at pauses and written down by a speech model in a worker
// (public/transcribe-worker.js). Each line keeps the speaker's name.

const RATE = 16000;
const MAX_SECONDS = 20;
const MIN_SECONDS = 2;
const PAUSE_SECONDS = 0.8;
const QUIET = 0.008; // RMS below this counts as silence

// Sentences Whisper tends to invent for silence or music (it learned from
// subtitled videos). A piece made only of these is dropped.
const INVENTED = [
  /danke (fürs|für's|für das) (zuschauen|zusehen|zuhören)/i, /vielen dank (fürs|für's|für das) (zuschauen|zusehen|zuhören)/i, /das war'?s( für heute)?/i,
  /bis zum nächsten mal/i, /untertitel/i, /amara\.org/i, /abonniert?/i, /tschüss/i, /^vielen dank\.?$/i,
];

export function cleanPiece(text) {
  const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  const kept = [];
  for (const s of sentences) {
    if (/^[[(].*[\])]$/.test(s)) continue;
    if (INVENTED.some((re) => re.test(s)) && s.length < 60) continue;
    if (kept[kept.length - 1] === s) continue; // the same sentence twice in a row
    kept.push(s);
  }
  return kept.join(' ');
}

export function createTranscriber({ language = 'german', onChange } = {}) {
  let worker = null;
  let ready = null;
  let device = null;
  let modelName = null;
  let progress = null;
  const lines = []; // { at, speaker, text }
  const sources = new Map(); // key -> { ctx, node, src }
  const queue = [];
  let busy = false;
  let nextId = 1;
  let startedAt = null;
  let stopping = false;
  let lastMs = null;

  const changed = () => onChange?.(state());
  function state() {
    return { running: Boolean(startedAt), device, model: modelName, progress, lines: lines.length, queued: queue.length + (busy ? 1 : 0), lastMs, ready: Boolean(device) };
  }

  function loadWorker() {
    if (ready) return ready;
    worker = new Worker(new URL('transcribe-worker.js', location.href), { type: 'module' });
    ready = new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        const msg = event.data;
        if (msg.type === 'progress') {
          progress = Math.round((msg.loaded / msg.total) * 100);
          changed();
        } else if (msg.type === 'ready') {
          device = msg.device;
          modelName = msg.model;
          progress = null;
          changed();
          resolve();
        } else if (msg.type === 'error' && !device) {
          reject(new Error(msg.message));
        } else {
          onResult(msg);
        }
      };
    });
    worker.postMessage({ type: 'load' });
    return ready;
  }

  const pending = new Map(); // id -> { at, speaker }
  function onResult(msg) {
    const meta = pending.get(msg.id);
    pending.delete(msg.id);
    busy = false;
    if (msg.type === 'text') {
      lastMs = msg.ms;
      const text = cleanPiece(msg.text);
      if (meta && text) {
        lines.push({ at: meta.at, speaker: meta.speaker, text });
      }
    }
    pump();
    changed();
  }

  function pump() {
    if (busy || !queue.length || !device) return;
    const piece = queue.shift();
    busy = true;
    const id = nextId++;
    pending.set(id, { at: piece.at, speaker: piece.speaker });
    worker.postMessage({ type: 'chunk', id, audio: piece.audio, language }, [piece.audio.buffer]);
  }

  function attach(key, stream, speaker) {
    if (sources.has(key) || !stream?.getAudioTracks().length) return;
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
    const node = ctx.createScriptProcessor(4096, 1, 1);
    const ratio = ctx.sampleRate / RATE;
    let buf = [];
    let quietFor = 0;
    let voiced = 0;
    let pieceStart = null;
    const flush = () => {
      const seconds = buf.length / RATE;
      if (seconds >= MIN_SECONDS && voiced > 0.4 * RATE) {
        queue.push({ audio: Float32Array.from(buf), speaker, at: pieceStart });
        pump();
        changed();
      }
      buf = [];
      voiced = 0;
      quietFor = 0;
      pieceStart = null;
    };
    node.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
      const rms = Math.sqrt(sum / input.length);
      const block = [];
      for (let i = 0; i < input.length / ratio; i++) block.push(input[Math.floor(i * ratio)]);
      if (rms >= QUIET) {
        if (pieceStart === null) pieceStart = Date.now();
        voiced += block.length;
        quietFor = 0;
      } else {
        quietFor += block.length / RATE;
      }
      if (pieceStart !== null) buf.push(...block);
      if (buf.length / RATE >= MAX_SECONDS || (pieceStart !== null && quietFor >= PAUSE_SECONDS)) flush();
    };
    src.connect(node);
    node.connect(ctx.destination);
    sources.set(key, { ctx, node, src, flush });
  }

  function detach(key) {
    const s = sources.get(key);
    if (!s) return;
    s.flush();
    s.src.disconnect();
    s.node.disconnect();
    s.ctx.close().catch(() => {});
    sources.delete(key);
  }

  return {
    state,
    async start() {
      await loadWorker();
      startedAt = Date.now();
      lines.length = 0;
      changed();
    },
    // Keeps the set of transcribed tracks equal to the call's participants.
    sync(participants) {
      if (!startedAt) return;
      const keys = new Set(participants.map((p) => p.key));
      for (const p of participants) attach(p.key, p.stream, p.name);
      for (const k of [...sources.keys()]) if (!keys.has(k)) detach(k);
    },
    // Stops listening, waits for the pieces still queued, returns the lines.
    async stop() {
      if (!startedAt || stopping) return null;
      stopping = true;
      for (const k of [...sources.keys()]) detach(k);
      for (let i = 0; i < 600 && (queue.length || busy); i++) await new Promise((r) => setTimeout(r, 200));
      const result = { startedAt, endedAt: Date.now(), model: modelName, lines: [...lines].sort((a, b) => a.at - b.at) };
      startedAt = null;
      stopping = false;
      changed();
      return result;
    },
  };
}

// The transcript as an artifact of the team room: a title for the card in
// the conversation and the full text as Markdown.
export function transcriptArtifact({ startedAt, endedAt, model, lines }) {
  const date = new Date(startedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const title = `Call transcript ${date}, ${time(startedAt)}–${time(endedAt)}`;
  const speakers = [...new Set(lines.map((l) => l.speaker))];
  const parts = [`# ${title}`, '', `Speakers: ${speakers.join(', ') || '–'}${model ? ` · Recognised with ${model} on the device that recorded it` : ''}`, ''];
  if (!lines.length) parts.push('Nothing was recognised.');
  let last = null;
  for (const line of lines) {
    if (line.speaker !== last) parts.push('', `**${line.speaker}** (${time(line.at)})`);
    parts.push(line.text);
    last = line.speaker;
  }
  return { title, content: parts.join('\n').trim() + '\n' };
}

// The transcript as one or more chat messages (the room takes up to 20000
// characters per message).
export function transcriptMessages({ startedAt, endedAt, model, lines }, max = 18000) {
  const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const head = `**Transcript of the call** (${time(startedAt)}–${time(endedAt)}${model ? `, ${model}` : ''})`;
  if (!lines.length) return [`${head}\n\nNothing was recognised.`];
  const body = [];
  let last = null;
  for (const line of lines) {
    body.push(line.speaker === last ? line.text : `\n**${line.speaker}:** ${line.text}`);
    last = line.speaker;
  }
  const out = [];
  let current = head;
  for (const part of body) {
    if ((current + ' ' + part).length > max) {
      out.push(current);
      current = '*(continued)*';
    }
    current += part.startsWith('\n') ? `\n${part}` : ` ${part}`;
  }
  out.push(current);
  return out;
}
