// The browser setup path. Same mechanism gh CLI's "auth login --web" uses:
// a local HTTP server bound to 127.0.0.1 only, a random one-time token in
// the URL so nothing else on the machine can hit it by guessing a port,
// the default browser opened via `open`, and a plain POST back when the
// form is submitted — no WebSocket, because unlike a live-updating
// dashboard this is a single one-shot form.
//
// It collects exactly the same answers shape the terminal path collects
// (see prompts.js) and hands them to the same scaffold()/substitute()
// logic in install.js — this is a second door into the same house, not
// a rebuild of it. One question per step here too, same order as the
// terminal: team name, folder, supervisor, tool, git.

import { randomBytes } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join as joinPath, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import open from 'open';

import { t } from '../i18n.js';
import { readSourceFile } from '../scaffold.js';
import { buildSubstitutions } from '../substitute.js';
import { TOOLS } from '../tools.js';
import { AFFIRMATIONS, detectTool, slugify, USE_CASES } from '../wizard-shared.js';

// Set once, from install.js, before this server ever starts — the
// language question happens in the terminal before terminal-vs-browser
// is even chosen (see prompts.js askLanguage), so by the time this
// module renders anything, the choice already exists. Only used to
// fill the live preview with the real value instead of a placeholder;
// the actual substitution into the written files happens in
// install.js, from the same source.
let RESOLVED_LANGUAGE = '<language>';

const PREVIEW_FILES = {
  constitution: 'CONSTITUTION.md',
  profile: 'team/juno/profile.md',
};
// 17, not the old 12 — profile.md's use-case sentence (the new
// question added alongside the folder browser) sits just past the
// front matter, at line 16; the old cutoff showed the substituted
// front matter and nothing of the actual prose.
const PREVIEW_LINES = 17;

// Juno's icon, read once at module load and served from memory — the
// terminal path gets the color half-block version of the same mark
// (src/juno-ascii.js) since it can't play video.
const JUNO_ICON_PATH = fileURLToPath(new URL('./assets/juno-icon.png', import.meta.url));
const JUNO_ICON = readFileSync(JUNO_ICON_PATH);

// The header video. Lives in team/juno/ (shipped as part
// of "team/juno" in package.json already) rather than under
// src/web/assets/ with the icon — it's Juno's, not this wizard's, the
// wizard just plays it.
const JUNO_VIDEO_PATH = fileURLToPath(new URL('../../team/juno/juno.mp4', import.meta.url));
const JUNO_VIDEO = readFileSync(JUNO_VIDEO_PATH);

function today() {
  return new Date().toISOString().slice(0, 10);
}

function renderPreview(fields) {
  const workforceId = fields.company ? slugify(fields.company) : '<workforce-id>';
  const substitutions = buildSubstitutions({
    workforceId,
    company: fields.company || '<company>',
    supervisor: fields.supervisor || '<supervisor>',
    toolLabel:
      TOOLS.find((t) => t.value === fields.toolValue)?.label || '<your-tool>',
    hiredDate: today(),
    useCase: fields.useCase || '<use-case>',
    language: RESOLVED_LANGUAGE,
  });

  const out = {};
  for (const [key, rel] of Object.entries(PREVIEW_FILES)) {
    const raw = readSourceFile(rel);
    const substituted = raw
      .split('\n')
      .map((line) => {
        let out = line;
        for (const [k, v] of Object.entries(substitutions)) {
          out = out.split(k).join(v);
        }
        return out;
      })
      .slice(0, PREVIEW_LINES)
      .join('\n');
    out[key] = substituted;
  }
  return { ...out, workforceId };
}

// Lists only subdirectories of `dirPath` — the folder-picker popup's
// data source. Real filesystem access, unlike a browser-native
// directory input: a File System Access / webkitdirectory picker
// hands back a FileList or an opaque handle, never an absolute path
// Node could write into, so this is the server (which does have a real
// fs) doing the browsing instead of the browser.
function listSubdirectories(dirPath) {
  const resolved = resolvePath(dirPath);
  const stat = statSync(resolved);
  if (!stat.isDirectory()) throw new Error('Not a directory.');
  const entries = readdirSync(resolved, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));
  const parent = dirname(resolved);
  return { path: resolved, parent: parent === resolved ? null : parent, entries };
}

// Creates one new subdirectory inside `parentPath` — "New folder"
// inside the browse popup. `name` is a single path segment, not a
// path: reject anything containing a separator or a `.`/`..` component
// so this can only ever add one folder exactly where it says it will,
// never write somewhere else in the tree via a crafted name.
function createSubdirectory(parentPath, name) {
  if (!name || /[\\/]/.test(name) || name === '.' || name === '..') {
    throw new Error('Invalid folder name.');
  }
  const parentResolved = resolvePath(parentPath);
  const target = joinPath(parentResolved, name);
  mkdirSync(target);
  return listSubdirectories(target);
}

function renderPage(token) {
  const detectedTool = detectTool(TOOLS);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hire-juno setup</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #fafaf9;
    --surface: #ffffff;
    --border: #dfdedb;
    --text: #131412;
    --muted: #6d6f6a;
    --accent: #7f69cc;
    --accent-contrast: #fbfaff;
    --code-bg: #f2f2f0;
    --error: #b3261e;
    --radius: 6px;
    --shadow: 0 1px 0 rgba(0,0,0,0.03);
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0b0c0b;
      --surface: #141614;
      --border: #2a2c29;
      --text: #eceeec;
      --muted: #8b8d87;
      --accent: #9788e0;
      --accent-contrast: #17121f;
      --code-bg: #101210;
      --error: #ff6b60;
      --shadow: 0 1px 0 rgba(0,0,0,0.4);
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
    background: var(--bg); color: var(--text);
    margin: 0; padding: 2.5rem 1.5rem 4rem;
    line-height: 1.55;
  }
  .wrap { max-width: 640px; margin: 0 auto; animation: rise 0.4s ease-out; }
  @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) {
    .wrap, .flash, button svg.spin, .step-panel { animation: none !important; }
  }

  header {
    display: flex; align-items: center; gap: 1rem; margin-bottom: 0.4rem;
    border-bottom: 1px solid var(--border); padding-bottom: 1.1rem;
  }
  header video {
    width: 108px; height: 60px; border-radius: 3px;
    display: block; object-fit: cover; border: 1px solid var(--border);
    background: var(--surface);
  }
  h1 {
    font-size: 1.1rem; margin: 0; letter-spacing: -0.01em; font-weight: 650;
  }
  .subtitle { color: var(--muted); margin: 0.6rem 0 2rem; max-width: 62ch; font-size: 0.9rem; }

  .stepper {
    display: flex; align-items: center; gap: 0.4rem;
    margin-bottom: 2rem; font-size: 0.7rem; color: var(--muted);
    font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.06em;
  }
  .stepper .seg { display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; }
  .stepper .dot {
    width: 18px; height: 18px; border-radius: 3px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 600; border: 1px solid var(--border);
    color: var(--muted);
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .stepper .seg.active { color: var(--text); }
  .stepper .seg.active .dot { background: var(--accent); color: var(--accent-contrast); border-color: var(--accent); }
  .stepper .seg.done .dot { border-color: var(--accent); color: var(--accent); background: transparent; }
  .stepper .line { flex: 1; height: 1px; background: var(--border); min-width: 0.6rem; }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; align-items: start; }
  @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 1.5rem;
  }
  .step-panel { animation: rise 0.25s ease-out; }

  .step-title { font-size: 1.1rem; margin: 0 0 1.1rem; }
  .field { margin-top: 0.9rem; }
  .field:first-child { margin-top: 0; }
  label { display: block; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.3rem; }
  .field-hint { font-size: 0.78rem; color: var(--muted); margin-top: 0.4rem; min-height: 1em; }
  input, select {
    width: 100%; padding: 0.55rem 0.65rem; font-size: 0.95rem;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--surface); color: var(--text);
    font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus-visible, select:focus-visible {
    outline: none; border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent);
  }
  input.error, select.error {
    border-color: var(--error);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--error) 16%, transparent);
  }
  .field-row { display: flex; gap: 0.5rem; }
  .field-row input { flex: 1; }
  button.browse {
    font-family: var(--mono); font-size: 0.8rem; font-weight: 600;
    padding: 0 0.9rem; border-radius: var(--radius); border: 1px solid var(--border);
    background: var(--surface); color: var(--text); cursor: pointer;
  }
  button.browse:hover { border-color: var(--accent); color: var(--accent); }

  .choice-row { display: flex; gap: 0.6rem; }
  button.choice {
    flex: 1; font-family: inherit; font-size: 0.92rem; font-weight: 600;
    padding: 0.6rem; border-radius: var(--radius); border: 1px solid var(--border);
    background: var(--surface); color: var(--text); cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  button.choice.selected { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface)); color: var(--accent); }

  .step-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 1.6rem; }
  button.next, button.back, button#submit {
    font-family: inherit; font-size: 0.9rem; font-weight: 600;
    border-radius: var(--radius); cursor: pointer; padding: 0.6rem 1.2rem;
    transition: filter 0.15s, transform 0.05s;
  }
  button.next, button#submit { background: var(--accent); color: var(--accent-contrast); border: 1px solid var(--accent); }
  button.back { background: transparent; color: var(--text); border: 1px solid var(--border); font-weight: 600; }
  button.next:hover, button#submit:hover:not(:disabled) { filter: brightness(1.08); }
  button.next:active, button#submit:active:not(:disabled), button.back:active { transform: scale(0.99); }
  button#submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  button#submit:disabled { cursor: default; opacity: 0.75; }
  button svg.spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .affirmation {
    font-size: 0.85rem; color: var(--accent); font-weight: 600;
    opacity: 0; transition: opacity 0.15s; margin-top: 0.7rem; min-height: 1.2em;
  }
  .affirmation.show { opacity: 1; }

  #status { margin-top: 0.85rem; font-size: 0.88rem; min-height: 1.2em; }
  #status.error { color: var(--error); }
  #status.ok { color: var(--accent); font-weight: 600; }

  .file-card + .file-card { margin-top: 1.25rem; }
  @media (min-width: 821px) { .file-card + .file-card { margin-top: 0; } }
  .file-tab {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--border);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.82rem; color: var(--muted);
  }
  .file-tab svg { flex-shrink: 0; opacity: 0.7; }
  pre {
    margin: 0; background: var(--code-bg); padding: 0.9rem 1rem;
    border-radius: 0 0 var(--radius) var(--radius);
    font-size: 0.78rem; line-height: 1.6; overflow-x: auto; white-space: pre-wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  pre .dim { color: var(--muted); }
  pre .heading { color: var(--accent); font-weight: 700; }
  pre mark {
    background: color-mix(in srgb, var(--accent) 28%, transparent);
    color: inherit; border-radius: 3px; padding: 0 0.15em;
  }
  @keyframes flash-bg {
    0% { background: color-mix(in srgb, var(--accent) 20%, var(--code-bg)); }
    100% { background: var(--code-bg); }
  }
  .flash { animation: flash-bg 0.6s ease-out; }

  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    z-index: 10;
  }
  .modal-backdrop[hidden] { display: none; }
  .modal {
    background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow);
    width: 100%; max-width: 480px; max-height: 70vh; display: flex; flex-direction: column;
    border: 1px solid var(--border);
  }
  .modal-header {
    padding: 1rem 1.2rem; border-bottom: 1px solid var(--border);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.82rem; color: var(--muted); word-break: break-all;
  }
  .modal-list { overflow-y: auto; flex: 1; padding: 0.4rem; }
  .modal-list button {
    display: block; width: 100%; text-align: left; padding: 0.5rem 0.7rem;
    border: none; background: none; border-radius: var(--radius); cursor: pointer;
    font-family: inherit; font-size: 0.9rem; color: var(--text);
  }
  .modal-list button:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }
  .modal-new-folder { display: flex; gap: 0.5rem; padding: 0 1.2rem 0.9rem; }
  .modal-new-folder input { flex: 1; }
  .modal-footer { display: flex; justify-content: space-between; gap: 0.6rem; padding: 1rem 1.2rem; border-top: 1px solid var(--border); }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <video
      id="juno-video"
      src="/${token}/juno.mp4"
      poster="/${token}/juno-icon.png"
      loop muted playsinline
      aria-label="Juno"
    ></video>
    <h1>${t('Set up your AI workforce')}</h1>
  </header>
  <script>
    // autoplay lives here instead of as a static attribute so
    // prefers-reduced-motion is actually honored — the poster frame
    // stands in for anyone who has that set.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.getElementById('juno-video').play().catch(() => {});
    }
  </script>
  <p class="subtitle">${t("A handful of quick questions, one at a time. The last step shows exactly what's about to be written, with your own input highlighted, before anything touches disk.")}</p>

  <div class="stepper">
    <div class="seg active" data-seg-step="1"><span class="dot">1</span> ${t('Team')}</div>
    <div class="line"></div>
    <div class="seg" data-seg-step="2"><span class="dot">2</span> ${t('Use case')}</div>
    <div class="line"></div>
    <div class="seg" data-seg-step="3"><span class="dot">3</span> ${t('Folder')}</div>
    <div class="line"></div>
    <div class="seg" data-seg-step="4"><span class="dot">4</span> ${t('Supervisor')}</div>
    <div class="line"></div>
    <div class="seg" data-seg-step="5"><span class="dot">5</span> ${t('Tool')}</div>
    <div class="line"></div>
    <div class="seg" data-seg-step="6"><span class="dot">6</span> ${t('Git')}</div>
    <div class="line"></div>
    <div class="seg" data-seg-step="7"><span class="dot">7</span> ${t('Review')}</div>
  </div>

  <div class="step-panel card" data-step="1">
    <h2 class="step-title">${t('What should your team be called?')}</h2>
    <div class="field">
      <label for="company">${t('Team (or company / project) name')}</label>
      <input id="company" placeholder="Acme Corporation" />
      <div class="field-hint" id="slug-preview">&nbsp;</div>
    </div>
    <div class="affirmation" id="affirmation-1"></div>
    <div class="step-actions">
      <span></span>
      <button class="next" data-next>${t('Continue')}</button>
    </div>
  </div>

  <div class="step-panel card" data-step="2" hidden>
    <h2 class="step-title">${t('What is this workforce for?')}</h2>
    <div class="field">
      <div class="choice-row" id="use-case-choices"></div>
    </div>
    <div class="field" id="use-case-other-field" hidden>
      <label for="useCaseOther">${t('Describe it in a few words')}</label>
      <input id="useCaseOther" placeholder="a freelance design studio" />
    </div>
    <div class="affirmation" id="affirmation-2"></div>
    <div class="step-actions">
      <button class="back" data-back>${t('Back')}</button>
      <button class="next" data-next>${t('Continue')}</button>
    </div>
  </div>

  <div class="step-panel card" data-step="3" hidden>
    <h2 class="step-title">${t('Where should your team live?')}</h2>
    <div class="field">
      <label for="targetDir">${t('Folder')}</label>
      <div class="field-row">
        <input id="targetDir" value="." />
        <button type="button" class="browse" data-browse>${t('Browse…')}</button>
      </div>
    </div>
    <div class="affirmation" id="affirmation-3"></div>
    <div class="step-actions">
      <button class="back" data-back>${t('Back')}</button>
      <button class="next" data-next>${t('Continue')}</button>
    </div>
  </div>

  <div class="step-panel card" data-step="4" hidden>
    <h2 class="step-title">${t("Who will be Juno's supervisor?")}</h2>
    <div class="field">
      <label for="supervisor">${t("Supervisor's name")}</label>
      <input id="supervisor" />
      <div class="field-hint">${t('The person Juno reports to.')}</div>
    </div>
    <div class="affirmation" id="affirmation-4"></div>
    <div class="step-actions">
      <button class="back" data-back>${t('Back')}</button>
      <button class="next" data-next>${t('Continue')}</button>
    </div>
  </div>

  <div class="step-panel card" data-step="5" hidden>
    <h2 class="step-title">${t('Which tool do you use?')}</h2>
    <div class="field">
      <label for="toolValue">${t('Tool')}</label>
      <select id="toolValue"></select>
      <div class="field-hint" id="tool-detected-hint">&nbsp;</div>
    </div>
    <div class="affirmation" id="affirmation-5"></div>
    <div class="step-actions">
      <button class="back" data-back>${t('Back')}</button>
      <button class="next" data-next>${t('Continue')}</button>
    </div>
  </div>

  <div class="step-panel card" data-step="6" hidden>
    <h2 class="step-title">${t('Initialize a git repository here?')}</h2>
    <div class="field">
      <div class="choice-row">
        <button type="button" class="choice selected" data-git-choice="yes">${t('Yes')}</button>
        <button type="button" class="choice" data-git-choice="no">${t('No')}</button>
      </div>
    </div>
    <div class="field" id="remote-field">
      <label for="remoteUrl">${t('Remote URL to add as "origin"')} <span style="font-weight:400;color:var(--muted)">${t('(optional)')}</span></label>
      <input id="remoteUrl" placeholder="git@github.com:you/repo.git" />
    </div>
    <div class="affirmation" id="affirmation-6"></div>
    <div class="step-actions">
      <button class="back" data-back>${t('Back')}</button>
      <button class="next" data-next>${t('Continue')}</button>
    </div>
  </div>

  <div class="step-panel" data-step="7" hidden>
    <h2 class="step-title">${t('Review')}</h2>
    <p class="field-hint" style="margin:-0.5rem 0 1.1rem">${t('Your input, highlighted in the actual files about to be written.')}</p>
    <div class="grid">
      <div class="file-card card" style="padding:0">
        <div class="file-tab">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 1h7l3 3v11H3V1z" stroke="currentColor" stroke-width="1.2"/></svg>
          CONSTITUTION.md
        </div>
        <pre id="preview-constitution"></pre>
      </div>
      <div class="file-card card" style="padding:0">
        <div class="file-tab">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 1h7l3 3v11H3V1z" stroke="currentColor" stroke-width="1.2"/></svg>
          team/juno/profile.md
        </div>
        <pre id="preview-profile"></pre>
      </div>
    </div>
    <div class="step-actions">
      <button class="back" data-back>${t('Back')}</button>
      <button id="submit"><span id="submit-label">${t('Write the files')}</span></button>
    </div>
    <div id="status"></div>
  </div>
</div>

<div class="modal-backdrop" id="dir-modal" hidden>
  <div class="modal">
    <div class="modal-header" id="dir-modal-path"></div>
    <div class="modal-list" id="dir-modal-list"></div>
    <div class="modal-new-folder">
      <input id="new-folder-name" placeholder="new-folder-name" />
      <button type="button" class="browse" data-dir-create>${t('New folder')}</button>
    </div>
    <div class="modal-footer">
      <button type="button" class="back" data-dir-cancel>${t('Cancel')}</button>
      <button type="button" class="next" data-dir-choose>${t('Use this folder')}</button>
    </div>
  </div>
</div>

<script>
const TOKEN = ${JSON.stringify(token)};
const DETECTED_TOOL = ${JSON.stringify(detectedTool)};
// Pre-translated server-side (one t() implementation, src/i18n.js) —
// client JS can't read the Node-side language state, so anything it
// needs at runtime is baked in here instead of re-derived in the
// browser.
const AFFIRMATIONS = ${JSON.stringify(AFFIRMATIONS.map((a) => t(a)))};
const USE_CASES = ${JSON.stringify(USE_CASES.map((c) => ({ ...c, label: t(c.label) })))};
const T = {
  manualWiring: ${JSON.stringify(t('manual wiring for now'))},
  preSelected: ${JSON.stringify(t('Pre-selected: looks like you are running this from {tool}.'))},
  workforceIdHint: ${JSON.stringify(t('Workforce ID: {id} (derived, used internally)'))},
  couldNotCreate: ${JSON.stringify(t('Could not create that folder: {error}'))},
  writing: ${JSON.stringify(t('Writing…'))},
  written: ${JSON.stringify(t('Written'))},
  checkTerminal: ${JSON.stringify(t('Check your terminal — this tab can be closed.'))},
  writeTheFiles: ${JSON.stringify(t('Write the files'))},
};
function fill(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) out = out.split('{' + k + '}').join(v);
  return out;
}
const fields = ['company', 'targetDir', 'supervisor', 'toolValue', 'remoteUrl'];
let gitChoice = 'yes';
let useCaseChoice = USE_CASES[0].value;

function pickAffirmation() {
  return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
}

function resolvedUseCase() {
  const picked = USE_CASES.find((c) => c.value === useCaseChoice);
  return picked.phrase || document.getElementById('useCaseOther').value.trim();
}

function renderUseCaseChoices() {
  const row = document.getElementById('use-case-choices');
  const otherField = document.getElementById('use-case-other-field');
  row.innerHTML = '';
  USE_CASES.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (i === 0 ? ' selected' : '');
    btn.textContent = c.label;
    btn.dataset.useCase = c.value;
    btn.addEventListener('click', () => {
      useCaseChoice = c.value;
      Array.from(row.children).forEach((b) => b.classList.toggle('selected', b === btn));
      otherField.hidden = Boolean(c.phrase);
    });
    row.appendChild(btn);
  });
  otherField.hidden = Boolean(USE_CASES[0].phrase);
}

async function loadTools() {
  const res = await fetch('/' + TOKEN + '/tools');
  const tools = await res.json();
  const select = document.getElementById('toolValue');
  select.innerHTML = tools
    .map((t) => '<option value="' + t.value + '">' + t.label +
      (t.hasAdapter ? '' : ' (' + T.manualWiring + ')') + '</option>')
    .join('');
  if (DETECTED_TOOL) {
    select.value = DETECTED_TOOL;
    const label = tools.find((t) => t.value === DETECTED_TOOL)?.label;
    if (label) {
      document.getElementById('tool-detected-hint').textContent = fill(T.preSelected, { tool: label });
    }
  }
}

function currentValues() {
  const values = {};
  for (const id of fields) values[id] = document.getElementById(id).value;
  values.gitInit = gitChoice === 'yes';
  if (!values.gitInit) values.remoteUrl = '';
  values.useCase = resolvedUseCase();
  return values;
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function highlight(text, values) {
  let html = escapeHtml(text)
    .split('\\n')
    .map((line) => {
      if (line.trim() === '---') return '<span class="dim">---</span>';
      if (/^#{1,3} /.test(line)) return '<span class="heading">' + line + '</span>';
      return line;
    })
    .join('\\n');
  for (const v of values) {
    if (!v) continue;
    const escapedValue = escapeHtml(v);
    const pattern = escapedValue.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
    html = html.replace(new RegExp(pattern, 'g'), '<mark>' + escapedValue + '</mark>');
  }
  return html;
}

function paintPreview(id, text, values) {
  const el = document.getElementById(id);
  el.innerHTML = highlight(text, values);
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

async function renderPreview() {
  const values = currentValues();
  const res = await fetch('/' + TOKEN + '/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  const data = await res.json();
  const marks = [data.workforceId, values.company, values.supervisor, values.useCase];
  paintPreview('preview-constitution', data.constitution, marks);
  paintPreview('preview-profile', data.profile, marks);
}

// Live workforce-ID preview under the team-name field — one slugify
// implementation (server-side, src/wizard-shared.js), asked for on
// every keystroke instead of duplicated in this script.
let slugTimer;
document.getElementById('company').addEventListener('input', (e) => {
  clearTimeout(slugTimer);
  const name = e.target.value;
  const hint = document.getElementById('slug-preview');
  if (!name.trim()) { hint.innerHTML = '&nbsp;'; return; }
  slugTimer = setTimeout(async () => {
    const res = await fetch('/' + TOKEN + '/slug?name=' + encodeURIComponent(name));
    const { workforceId } = await res.json();
    hint.textContent = fill(T.workforceIdHint, { id: workforceId });
  }, 200);
});

// --- Wizard navigation ---
let currentStep = 1;
const TOTAL_STEPS = 7;
const stepPanels = Array.from(document.querySelectorAll('.step-panel'));
const stepSegs = Array.from(document.querySelectorAll('.stepper .seg'));

function showStep(n) {
  currentStep = n;
  stepPanels.forEach((el) => { el.hidden = Number(el.dataset.step) !== n; });
  stepSegs.forEach((el) => {
    const s = Number(el.dataset.segStep);
    el.classList.toggle('active', s === n);
    el.classList.toggle('done', s < n);
  });
  if (n === TOTAL_STEPS) renderPreview();
}

function setError(id, hasError) {
  document.getElementById(id).classList.toggle('error', hasError);
}

const VALIDATORS = {
  1: () => {
    const ok = Boolean(document.getElementById('company').value.trim());
    setError('company', !ok);
    return ok;
  },
  2: () => {
    const ok = Boolean(resolvedUseCase());
    setError('useCaseOther', !ok && !document.getElementById('use-case-other-field').hidden);
    return ok;
  },
  3: () => {
    const ok = Boolean(document.getElementById('targetDir').value.trim());
    setError('targetDir', !ok);
    return ok;
  },
  4: () => {
    const ok = Boolean(document.getElementById('supervisor').value.trim());
    setError('supervisor', !ok);
    return ok;
  },
  5: () => Boolean(document.getElementById('toolValue').value),
  6: () => true, // git choice always has a value, remote is optional
};

// Each "Continue" briefly shows an affirmation, then advances — the
// "kurz bestätigt" beat asked for, same wording pool as the terminal.
function affirmAndAdvance() {
  const el = document.getElementById('affirmation-' + currentStep);
  if (el) {
    el.textContent = pickAffirmation();
    el.classList.add('show');
  }
  setTimeout(() => {
    if (el) el.classList.remove('show');
    showStep(currentStep + 1);
  }, 550);
}

document.querySelectorAll('[data-next]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const validator = VALIDATORS[currentStep];
    if (validator && !validator()) return;
    affirmAndAdvance();
  });
});

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => showStep(currentStep - 1));
});

['company', 'supervisor', 'targetDir', 'remoteUrl', 'useCaseOther'].forEach((id) => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.querySelector('.step-panel:not([hidden]) [data-next]')?.click();
    }
  });
  document.getElementById(id).addEventListener('input', () => setError(id, false));
});
document.getElementById('toolValue').addEventListener('change', () => setError('toolValue', false));

// --- Git choice toggle ---
const remoteField = document.getElementById('remote-field');
document.querySelectorAll('[data-git-choice]').forEach((btn) => {
  btn.addEventListener('click', () => {
    gitChoice = btn.dataset.gitChoice;
    document.querySelectorAll('[data-git-choice]').forEach((b) =>
      b.classList.toggle('selected', b === btn)
    );
    remoteField.hidden = gitChoice !== 'yes';
  });
});

// --- Folder browser popup ---
// Real filesystem browsing, server-side (see listSubdirectories in
// server.js) — a native <input type="file" webkitdirectory"> or the
// File System Access API can't hand back an absolute path Node could
// write into, so the picker has to go through the server instead.
const dirModal = document.getElementById('dir-modal');
const dirModalPath = document.getElementById('dir-modal-path');
const dirModalList = document.getElementById('dir-modal-list');
let browsingPath = null;

function renderListing(data) {
  browsingPath = data.path;
  dirModalPath.textContent = data.path;
  dirModalList.innerHTML = '';
  if (data.parent) {
    const up = document.createElement('button');
    up.textContent = '.. (up)';
    up.addEventListener('click', () => loadDir(data.parent));
    dirModalList.appendChild(up);
  }
  for (const name of data.entries) {
    const btn = document.createElement('button');
    btn.textContent = '📁 ' + name;
    btn.addEventListener('click', () => loadDir(data.path + '/' + name));
    dirModalList.appendChild(btn);
  }
}

async function loadDir(path) {
  const res = await fetch('/' + TOKEN + '/browse-dir?path=' + encodeURIComponent(path || ''));
  if (!res.ok) return;
  renderListing(await res.json());
}

// New-folder name defaults to the team's own workforce-ID slug — a
// suggestion, not a requirement, and already filesystem-safe (the
// same /slug endpoint the team-name step's live preview uses), so
// typing over it is the exception rather than the norm.
async function suggestFolderName() {
  const name = document.getElementById('company').value.trim();
  const input = document.getElementById('new-folder-name');
  if (!name) { input.value = ''; return; }
  const res = await fetch('/' + TOKEN + '/slug?name=' + encodeURIComponent(name));
  const { workforceId } = await res.json();
  input.value = workforceId;
}

document.querySelector('[data-browse]').addEventListener('click', () => {
  const current = document.getElementById('targetDir').value.trim();
  dirModal.hidden = false;
  loadDir(current && current !== '.' ? current : '');
  suggestFolderName();
});
document.querySelector('[data-dir-create]').addEventListener('click', async () => {
  const nameInput = document.getElementById('new-folder-name');
  const name = nameInput.value.trim();
  if (!name) return;
  const res = await fetch('/' + TOKEN + '/create-dir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: browsingPath, name }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    alert(fill(T.couldNotCreate, { error }));
    return;
  }
  renderListing(await res.json());
  nameInput.value = '';
});
document.querySelector('[data-dir-cancel]').addEventListener('click', () => { dirModal.hidden = true; });
document.querySelector('[data-dir-choose]').addEventListener('click', () => {
  document.getElementById('targetDir').value = browsingPath;
  setError('targetDir', false);
  dirModal.hidden = true;
});

const submitButton = document.getElementById('submit');
const submitLabel = document.getElementById('submit-label');
const SPINNER = '<svg class="spin" width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="2" opacity="0.3"/><path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="currentColor" stroke-width="2"/></svg>';
const CHECK = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

submitButton.addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.className = '';
  status.textContent = '';
  submitButton.disabled = true;
  submitLabel.innerHTML = SPINNER + ' ' + T.writing;

  const res = await fetch('/' + TOKEN + '/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentValues()),
  });

  if (res.ok) {
    submitLabel.innerHTML = CHECK + ' ' + T.written;
    status.className = 'ok';
    status.textContent = T.checkTerminal;
  } else {
    submitButton.disabled = false;
    submitLabel.textContent = T.writeTheFiles;
    status.className = 'error';
    status.textContent = await res.text();
  }
});

loadTools();
renderUseCaseChoices();
</script>
</body>
</html>`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// `openBrowser` and `onReady` exist for testing: a test can skip actually
// launching a GUI browser and instead drive the server directly against
// the URL it's handed.
// Close the server if nothing has come in for this long. Without it, a
// user who closes the tab instead of submitting leaves the terminal
// waiting forever with no way out but Ctrl-C. An hour is far past
// "still thinking about the answer" — the live preview fires a request
// on every keystroke, so any real activity keeps resetting this.
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

export function runWebSetup({ openBrowser = true, onReady, language, idleTimeoutMs = IDLE_TIMEOUT_MS } = {}) {
  if (language) RESOLVED_LANGUAGE = language;
  return new Promise((resolve, reject) => {
    const token = randomBytes(16).toString('hex');
    let settled = false;
    let idleTimer;

    const stopIdleTimer = () => clearTimeout(idleTimer);
    const resetIdleTimer = () => {
      stopIdleTimer();
      idleTimer = setTimeout(() => {
        if (settled) return;
        server.close();
        reject(new Error('Setup page timed out — nothing came in for an hour. Run the installer again when you have a moment.'));
      }, idleTimeoutMs);
      // Don't let a pending timer be the only reason the process stays
      // alive once everything else is done.
      idleTimer.unref?.();
    };

    const server = createServer(async (req, res) => {
      resetIdleTimer();
      const url = new URL(req.url, 'http://127.0.0.1');
      const parts = url.pathname.split('/').filter(Boolean);

      if (parts[0] !== token) {
        res.writeHead(403).end('Not found.');
        return;
      }
      const route = parts[1] ?? '';

      try {
        if (req.method === 'GET' && route === '') {
          res.writeHead(200, { 'Content-Type': 'text/html' }).end(renderPage(token));
          return;
        }

        if (req.method === 'GET' && route === 'juno-icon.png') {
          res.writeHead(200, { 'Content-Type': 'image/png' }).end(JUNO_ICON);
          return;
        }

        if (req.method === 'GET' && route === 'juno.mp4') {
          // Range support isn't optional here — Safari won't play a
          // <video> served without it, and Chrome re-requests with
          // Range as soon as you seek even on a 10-second clip.
          const range = req.headers.range;
          if (!range) {
            res.writeHead(200, {
              'Content-Type': 'video/mp4',
              'Content-Length': JUNO_VIDEO.length,
              'Accept-Ranges': 'bytes',
            }).end(JUNO_VIDEO);
            return;
          }
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          const start = match?.[1] ? Number(match[1]) : 0;
          const end = match?.[2] ? Number(match[2]) : JUNO_VIDEO.length - 1;
          res.writeHead(206, {
            'Content-Type': 'video/mp4',
            'Content-Range': `bytes ${start}-${end}/${JUNO_VIDEO.length}`,
            'Content-Length': end - start + 1,
            'Accept-Ranges': 'bytes',
          }).end(JUNO_VIDEO.subarray(start, end + 1));
          return;
        }

        if (req.method === 'GET' && route === 'tools') {
          const payload = TOOLS.map((tool) => ({
            value: tool.value,
            label: t(tool.label),
            hasAdapter: Boolean(tool.adapters),
          }));
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(payload)
          );
          return;
        }

        if (req.method === 'GET' && route === 'slug') {
          const name = url.searchParams.get('name') || '';
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({ workforceId: slugify(name) })
          );
          return;
        }

        if (req.method === 'GET' && route === 'browse-dir') {
          const requested = url.searchParams.get('path') || process.cwd();
          try {
            const listing = listSubdirectories(requested);
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(listing));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' }).end(
              JSON.stringify({ error: err.message })
            );
          }
          return;
        }

        if (req.method === 'POST' && route === 'create-dir') {
          const body = await readBody(req);
          try {
            const listing = createSubdirectory(body.path, body.name);
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(listing));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' }).end(
              JSON.stringify({ error: err.message })
            );
          }
          return;
        }

        if (req.method === 'POST' && route === 'preview') {
          const fields = await readBody(req);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(renderPreview(fields))
          );
          return;
        }

        if (req.method === 'POST' && route === 'submit') {
          const fields = await readBody(req);
          const missing = ['company', 'supervisor', 'toolValue', 'useCase'].filter(
            (key) => !fields[key]
          );
          if (missing.length > 0) {
            res.writeHead(400).end(`Missing: ${missing.join(', ')}`);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
          settled = true;
          stopIdleTimer();
          resolve({
            targetDir: fields.targetDir || '.',
            workforceId: slugify(fields.company),
            company: fields.company,
            useCase: fields.useCase,
            supervisor: fields.supervisor,
            toolValue: fields.toolValue,
            gitInit: Boolean(fields.gitInit),
            remoteUrl: fields.remoteUrl || null,
          });
          setTimeout(() => server.close(), 500);
          return;
        }

        res.writeHead(404).end('Not found.');
      } catch (err) {
        res.writeHead(500).end(String(err));
      }
    });

    server.listen(0, '127.0.0.1', () => {
      resetIdleTimer();
      const { port } = server.address();
      const url = `http://127.0.0.1:${port}/${token}/`;
      onReady?.(url);
      if (openBrowser) {
        console.log(`\nOpening ${url} in your browser…`);
        open(url).catch(() => {
          console.log(`Could not open a browser automatically — open this URL yourself:\n${url}`);
        });
      }
    });

    process.once('SIGINT', () => {
      if (!settled) {
        stopIdleTimer();
        server.close();
        reject(new Error('Cancelled.'));
      }
    });
  });
}
