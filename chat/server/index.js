// The chat server. Long-running by design — unlike src/web/server.js
// (a one-shot form that closes itself once submitted), this stays up
// until the person closes the terminal: a chat isn't "submitted", it's
// an ongoing thing to come back to.
//
// Same access-control shape as the installer's browser step though, and
// for the same reason: bound to 127.0.0.1 by default, a random one-time
// token in the URL so nothing else on the machine can open it by
// guessing a port. No accounts, no passwords — this runs on your own
// machine for you alone.
//
// `lan: true` (same local network only) binds to 0.0.0.0 instead —
// deliberately opt-in, never the default. The token is still the only
// gate at that point, over plain HTTP, against a live agent session
// with real Bash/file/git execution in the target repo (autopilot skips
// even the permission prompt) — worth knowing before turning it on,
// which is why runChatServer prints an explicit warning when it does
// rather than silently widening what "reaching this chat" means.

import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { basename, dirname, join as joinPath, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import open from 'open';
import { WebSocketServer } from 'ws';

import { createAdapter } from './agentAdapter.js';
import { waitUntilIdle } from './drain.js';
import { validateModelChoice } from './modelChoice.js';
import { WaitingMessages } from './waiting.js';
import { decideRelevance } from './gatekeeper.js';
import { extractMentions, extractVocativeAddresses } from './mentions.js';
import { findLayout, readRoster, resolveAvatarPath } from './roster.js';
import { DEFAULT_SESSION_ID, openStore } from './store.js';
import { resolveWorkforce } from './workforceId.js';
import { activateWorktree, canOfferWorktree, worktreeIsStartRepo } from './useWorktree.js';
import { currentBranch, gitRoot, resolveGitDir } from './worktree.js';
import { addWorkforce, listWorkforces, removeWorkforce, setActiveWorkforce } from '../../shared/workforceRegistry.js';
import { getOrCreateSession, saveSessionPort } from '../../shared/chatSessions.js';

// One colleague can now have several independent, parallel
// conversations running at once (e.g. one session per topic) — each is its own adapter
// instance (own SDK session, own permission state, own history), keyed
// by colleague *and* session rather than colleague alone.
function adapterKey(colleagueId, sessionId) {
  return `${colleagueId}::${sessionId || DEFAULT_SESSION_ID}`;
}

// How many automatic colleague-to-colleague relays a single channel
// message may trigger before the chain stops on its own and hands
// back to the human — each hop is a real, billed model turn, and
// colleagues can mention each other right back. The depth is a
// deliberate tradeoff between conversational reach and cost.
const MAX_RELAY_DEPTH = 4;

// Merges one 'session_info'/'usage' adapter update (see agentAdapter.js)
// into `statsMap`'s entry for `colleagueId`, in place. A pure function
// rather than a closure over the connection so it's unit-testable
// without a real adapter or WebSocket — see test/chat-stats.test.js.
// Anything else in `update` is ignored, so callers can pass adapter
// updates through unfiltered.
export function recordStats(statsMap, colleagueId, update) {
  if (update.type !== 'session_info' && update.type !== 'usage') return;
  const stats = statsMap.get(colleagueId) || {};
  if (update.type === 'session_info') {
    stats.model = update.model;
    stats.effort = update.effort;
  } else {
    stats.inputTokens = update.inputTokens;
    stats.outputTokens = update.outputTokens;
    stats.totalTokens = update.totalTokens;
    stats.costUsd = update.costUsd;
  }
  statsMap.set(colleagueId, stats);
}

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = joinPath(MODULE_DIR, '..', 'public');
// The same image README.md already uses as hire-juno's own mark
// (there's no separate abstract logo — Juno's icon does double duty),
// read once at module load like src/web/server.js reads it for the
// installer's own browser step.
const LOGO_PATH = joinPath(MODULE_DIR, '..', '..', 'src', 'web', 'assets', 'juno-icon.png');
const LOGO = readFileSync(LOGO_PATH);

// A `logo.png` sitting at
// the target repo's own root (next to CONSTITUTION.md/verfassung.md,
// the other place this app already reads directly out of that repo)
// overrides the built-in mark. Same shape as resolveAvatarPath in
// roster.js (a plain PNG at a fixed, well-known path — no config field
// to keep in sync with a second source of truth), just repo-root-scoped
// instead of per-colleague. Re-checked on every request rather than
// cached at startup: dropping a new logo.png in shouldn't need a server
// restart to take effect, same as swapping a colleague's own avatar.
export function resolveCustomLogo(dir) {
  const path = joinPath(dir, 'logo.png');
  try {
    return statSync(path).isFile() ? path : null;
  } catch {
    return null;
  }
}

// Neither api/avatar nor logo.png used to send any
// caching headers at all, so the browser had no way to know a given
// avatar/logo response was still good and would (heuristically, browser-
// dependent, not something to rely on) refetch the full file — and a
// colleague avatar here is routinely 2+ MB, unresized.
// renderSidebar() in app.js rebuilds the whole sidebar from scratch on
// every typing-state change alone, 19 call sites total — that's 19
// chances per avatar per session to redownload multiple MB each, over
// real WiFi once --lan is on, not instant localhost. `Last-Modified` +
// `If-Modified-Since` (no ETag needed — a file's mtime is a perfectly
// good validator here, one fs.statSync, no extra hashing) turns a cache
// hit into a bodyless 304 instead of resending the whole image; `no-cache`
// (not a long max-age) still means every load revalidates rather than
// blindly trusting a possibly-swapped avatar for some arbitrary window —
// cheap either way once the 304 path exists.
function sendCachedFile(req, res, filePath, contentType) {
  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    res.writeHead(404).end('Not found.');
    return;
  }
  const lastModified = stat.mtime.toUTCString();
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Last-Modified', lastModified);
  if (req.headers['if-modified-since'] === lastModified) {
    res.writeHead(304).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': contentType }).end(readFileSync(filePath));
}

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  // manifest.webmanifest is the one other
  // text file besides index.html that needs a placeholder filled in
  // (see TEMPLATED below), not a third kind of static file.
  '.webmanifest': 'application/manifest+json',
};

// index.html and manifest.webmanifest both carry placeholders — this is
// the exact set, not "any .html/.webmanifest file happens to work",
// since a mismatch here would substitute into (or skip) the wrong file
// silently.
const TEMPLATED = new Set(['index.html', 'manifest.webmanifest']);

// `req` (optional — omit for a caller with nothing to validate against)
// enables the exact same Last-Modified/If-Modified-Since dance
// sendCachedFile already does for avatars/logos above. This never had
// it before: every restart used to hand out a brand-new random
// port+token (see runChatServer's own history), so no browser could
// ever have a stale cached copy of *this* URL to begin with — a missing
// cache header was harmless. Now that a workforce's URL is sticky
// across restarts (shared/chatSessions.js), the same
// URL really can get requested again after app.js/styles.css changed
// server-side, and with no validator at all here, a phone's browser
// cache had nothing telling it to ever re-check — a browser that wasn't reloaded from a fresh tab
// could keep rendering an old, broken cached copy of styles.css (icons
// with no `.icon` sizing at all, rendering at raw SVG intrinsic size)
// after server updates.
function serveStatic(route, res, token, teamName, req) {
  const file = route === '' ? 'index.html' : route;
  // No traversal beyond the known, fixed set of static files this
  // module ships — a chat message is never a path, but staying
  // deliberate here costs nothing.
  const ext = '.' + file.split('.').pop();
  if (!CONTENT_TYPES[ext] || file.includes('..') || file.includes('/')) {
    res.writeHead(404).end('Not found.');
    return;
  }
  const filePath = joinPath(PUBLIC_DIR, file);
  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    res.writeHead(404).end('Not found.');
    return;
  }
  const lastModified = stat.mtime.toUTCString();
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Last-Modified', lastModified);
  if (req && req.headers['if-modified-since'] === lastModified) {
    res.writeHead(304).end();
    return;
  }
  try {
    const body = readFileSync(filePath);
    if (TEMPLATED.has(file)) {
      // __TOKEN__: every fetch and the WebSocket both live under
      // /<token>/ (see the file header) — index.html needs it to talk
      // back to the server at all; manifest.webmanifest doesn't (its
      // start_url/scope are "." — relative to the manifest's own URL,
      // which already carries the token by the time a browser fetches
      // it), but templating it the same way costs nothing and means one
      // substitution path, not two. __TEAM_NAME__: manifest.webmanifest
      // only, the home-screen app name (see runChatServer's api/status,
      // same source of truth as the sidebar header/tab title).
      const rendered = body
        .toString('utf8')
        .replace(/__TOKEN__/g, token)
        .replace(/__TEAM_NAME__/g, teamName);
      res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] }).end(rendered);
      return;
    }
    res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] }).end(body);
  } catch {
    res.writeHead(404).end('Not found.');
  }
}

// A look at what a colleague actually changed in the
// repo she's working in (`targetDir`, the one this whole server was
// started against), without having to leave the chat for a terminal.
// `git status --porcelain=v1` output, one row per line: `XY PATH` for
// a normal entry, `XY OLD -> NEW` for a rename. `null` (not `[]`) means
// "couldn't ask" — no `.git` here, or `git` isn't on PATH — so the
// frontend can tell that apart from "asked, nothing changed".
function gitStatus(dir) {
  try {
    const out = execFileSync('git', ['status', '--porcelain=v1'], { cwd: dir, encoding: 'utf8' });
    return out
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const status = line.slice(0, 2);
        const rest = line.slice(3);
        const renameParts = rest.split(' -> ');
        const path = renameParts.length === 2 ? renameParts[1] : rest;
        return { status, path, label: rest };
      });
  } catch {
    return null;
  }
}

// `path` must be one of `gitStatus(dir)`'s own current entries — see
// the `api/git-diff` route below for why: this is the one thing that
// checks a client-supplied path against the filesystem at all, and
// `--no-index` (needed for an untracked file, which has no diff
// against anything to ask git for otherwise) doesn't respect the repo
// boundary the way a normal `git diff -- <path>` does.
function gitDiff(dir, filePath, isUntracked) {
  try {
    const args = isUntracked ? ['diff', '--no-index', '--', '/dev/null', filePath] : ['diff', '--', filePath];
    return execFileSync('git', args, { cwd: dir, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  } catch (err) {
    // `git diff --no-index` exits 1 when the two sides actually differ
    // (the normal, expected case here, not a failure) — its stdout is
    // still on the thrown error's own `.stdout`.
    return typeof err.stdout === 'string' ? err.stdout : null;
  }
}

// The first non-internal IPv4 address across all interfaces — "the"
// address on an ordinary single-NIC machine on one WiFi, which is the
// case this is for (same local network only). A machine with several
// active interfaces (VPN, a second adapter) may have more than one LAN
// address; this picks whichever `os.networkInterfaces()` lists first,
// not necessarily the one the phone on the same WiFi would actually
// reach — good enough to print as a likely URL, not guaranteed correct
// on every machine.
function lanAddress() {
  for (const iface of Object.values(networkInterfaces())) {
    for (const addr of iface || []) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return null;
}

// The chat servers running in this process, by workforce folder. A server
// that was switched away from keeps running while one of its colleagues is
// mid-turn (see 'switch_workforce'); switching back finds it here and goes to
// it, instead of starting a second server beside it that knows nothing of the
// running turn (and would resume the same SDK session a second time).
const runningServers = new Map(); // resolved folder -> { url, server, closing }

export function runChatServer({ targetDir = process.cwd(), openBrowser = true, onReady, lan = false } = {}) {
  const runningKey = resolvePath(targetDir);
  const running = runningServers.get(runningKey);
  if (running && !running.closing) {
    onReady?.(running.url);
    if (openBrowser) open(running.url).catch(() => {});
    return Promise.resolve({ url: running.url, server: running.server });
  }
  return new Promise((resolve, reject) => {
    // Token and preferred port both come from the same persisted-per-path record
    // now (see shared/chatSessions.js), instead of a fresh random
    // token and an OS-assigned port every single launch. Which actual
    // port gets bound (the remembered one, or a fallback if that one's
    // taken) is decided down at server.listen() below.
    const session = getOrCreateSession(targetDir);
    const token = session.token;
    // Registers whatever
    // `--dir` this launch points at, every time, not only the first.
    // Covers both a fresh install (which already registers itself at
    // the end of scaffolding — see install.js) and a repo that
    // predates this feature entirely and never went through that
    // (an existing workforce): the first time chat runs
    // against it at all, it's in the switcher from then on. Idempotent
    // (addWorkforce no-ops if the path's already there) and non-fatal
    // — a registry write failing here shouldn't stop the chat itself
    // from starting.
    try {
      addWorkforce(targetDir);
      // Only after addWorkforce has vouched for it (folder exists, has
      // a team/ or mitarbeiter/ in it) — "active" is what the next bare
      // launch opens, so a path that isn't a workforce must never get
      // written there, or every following launch starts in a repo with
      // no colleagues in it.
      setActiveWorkforce(targetDir);
    } catch {
      // Not a workforce repo (no team/ or mitarbeiter/) or the folder
      // doesn't exist — readRoster below will surface that the same
      // way it always has; nothing new to report here.
    }
    const workforce = resolveWorkforce(targetDir);
    const store = openStore({ workforceId: workforce?.id, baseDir: workforce?.baseDir });
    if (!store.persisted) {
      console.log(
        '\nNo workforce ID found (CONSTITUTION.md/verfassung.md missing or still unfilled) — chat history will not survive a restart.'
      );
    }
    // One adapter instance per (colleague, session) for the life of the
    // server — it holds a live, running agent session; re-creating
    // that per message would drop conversation context and any
    // in-flight permission state. A channel turn always uses a
    // colleague's DEFAULT_SESSION_ID adapter (calling adapterFor with
    // just the colleagueId) — the extra, parallel sessions are for the
    // human's own side-by-side 1:1 conversations, not something a
    // channel needs to pick between.
    const adapters = new Map();
    const adapterFor = (colleagueId, sessionId = DEFAULT_SESSION_ID) => {
      const key = adapterKey(colleagueId, sessionId);
      if (!adapters.has(key)) {
        const colleague = readRoster(targetDir).find((c) => c.id === colleagueId);
        if (!colleague) return null;
        // Picks up right where a previous process left off, if this
        // (colleague, session) ever ran before and got that far (see
        // store.js's adapter_sessions table and agentAdapter.js's
        // onSessionId) — `undefined` for a first-ever conversation, which
        // createAdapter/ClaudeAdapter both already treat as "start fresh".
        const resume = store.getAdapterSession(colleagueId, sessionId) || undefined;
        // The model picked for this conversation in its settings, if any.
        const model = store.getModelChoice(colleagueId, sessionId) || undefined;
        // Works in her conversation's own worktree when it has one (and the
        // folder is still there), otherwise in the workforce folder.
        const worktree = store.getWorktree(colleagueId, sessionId);
        // A worktree of another repo does not move her: she keeps the
        // workforce folder as cwd (her agents and settings are read from
        // there) and the prompt names the worktree (see createAdapter).
        const worktreeThere = worktree && existsSync(worktree.path);
        const cwd = worktreeThere && worktreeIsStartRepo(worktree.repoPath, targetDir) ? worktree.path : targetDir;
        // She may move the conversation into a worktree herself (a tool of
        // hers, see useWorktree.js), if it can have one.
        let replaceWhenIdle = false;
        const useWorktree = canOfferWorktree({ workforceId: workforce?.id, existing: worktree })
          ? ({ repoPath } = {}) => {
              const result = activateWorktree({ store, workforceId: workforce?.id, repoDir: targetDir, repoPath, colleagueId, sessionId });
              if (result.ok) result.cwdIsWorktree = worktreeIsStartRepo(result.repoPath, targetDir);
              if (result.ok && result.created) {
                // She is mid-turn: this adapter is replaced once it is idle.
                replaceWhenIdle = true;
                broadcast({
                  type: 'worktree_changed',
                  colleagueId,
                  sessionId,
                  branch: result.branch,
                  path: result.path,
                  repoName: basename(result.repoPath),
                });
              }
              return result;
            }
          : undefined;
        const adapter = createAdapter(colleague, { targetDir, cwd, resume, model, useWorktree, worktree: worktreeThere ? worktree : undefined });
        adapter.onIdle = () => {
          if (!replaceWhenIdle) return;
          adapter.close?.();
          if (adapters.get(key) === adapter) adapters.delete(key);
        };
        // Set once here, not per-message like onUpdate/onPermissionRequest
        // below (bindAdapter) — this is bookkeeping, not delivery to a
        // particular browser tab.
        adapter.onSessionId = (sdkSessionId) => store.saveAdapterSession(colleagueId, sessionId, sdkSessionId);
        // The saved session id points at a conversation the CLI no longer
        // has: forget it and drop this adapter, so the next message starts a
        // fresh session instead of failing the same way every time.
        adapter.onStaleResume = () => {
          store.clearAdapterSession(colleagueId, sessionId);
          adapter.close?.();
          if (adapters.get(key) === adapter) adapters.delete(key);
        };
        adapters.set(key, adapter);
      }
      return adapters.get(key);
    };

    // Model/effort/token stats per (colleague, session), shown in the UI.
    // Session-lifetime state, not persisted (a
    // server restart gets fresh values anyway, same as the adapters
    // themselves), but kept here rather than only inside the WS
    // connection closure so a browser reload doesn't lose it — see
    // `api/colleague-stats` below.
    const colleagueStats = new Map();
    // What the last run reported, so the header survives a restart.
    for (const [colleagueId, sessionId, stats] of store.getAllStats()) {
      colleagueStats.set(adapterKey(colleagueId, sessionId), stats);
    }
    const rememberStats = (key, update) => {
      if (update.type !== 'session_info' && update.type !== 'usage') return;
      const [colleagueId, sessionId] = key.split('::');
      store.saveStats(colleagueId, sessionId, colleagueStats.get(key));
    };

    // Mirrors the client's own pendingTrail/thinkingStreaming (see
    // chat/src/app.js) so a finished reply can be persisted with its
    // trail attached (see bindAdapter below), not just relayed live and
    // then lost on the next reload or restart.
    // Keyed by adapterKey(colleagueId, sessionId), same as `adapters`.
    // Messages sent while a turn was running, per conversation (see waiting.js).
    const waitingYou = new WaitingMessages(store);
    const pendingTrails = new Map(); // key -> [{kind:'tool_use', name, input}]
    const pendingThinking = new Map(); // key -> accumulated thinking text of the in-progress turn
    const pendingText = new Map(); // key -> accumulated reply text of the in-progress turn (live bubble)

    // The gatekeeper isn't a colleague — it's a shared, anonymous
    // classifier call, so its usage doesn't fit colleagueStats' per-
    // colleague shape. This is a running
    // total across every decideRelevance() call since the server
    // started (see gatekeeper.js's own usage return value).
    const gatekeeperUsage = { calls: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 };
    function recordGatekeeperUsage(usage) {
      if (!usage) return;
      gatekeeperUsage.calls += 1;
      gatekeeperUsage.inputTokens += usage.inputTokens;
      gatekeeperUsage.outputTokens += usage.outputTokens;
      gatekeeperUsage.totalTokens += usage.totalTokens;
      gatekeeperUsage.costUsd += usage.costUsd;
    }

    // Sessions beyond the implicit default one, per colleague — few and
    // long-lived like channels, worth caching. Loaded lazily since most
    // colleagues will only ever have the one, implicit session.
    const sessionsByColleague = new Map();
    function sessionsFor(colleagueId) {
      if (!sessionsByColleague.has(colleagueId)) {
        sessionsByColleague.set(colleagueId, store.listSessions(colleagueId));
      }
      return sessionsByColleague.get(colleagueId);
    }

    // "Allow all"/auto mode, per (colleague, session), like the native apps'
    // auto-approve. Deliberately scoped
    // to 1:1 sessions only for this first version, not channels: a
    // channel turn already runs with full permission prompting (see
    // relayChannelMessage below), and folding auto mode into that too
    // is a separate decision, not silently extended.
    const autoModeSessions = new Set();

    // Channels are few and long-lived, worth keeping in memory rather
    // than re-querying the store on every mention lookup.
    const channelsById = new Map(store.listChannels().map((c) => [c.id, c]));
    // A colleague answering in a channel needs a name for the human's turn;
    // without one she cannot say who she is answering. Naming the user here
    // is not a per-message identity check (nothing verifies who is typing)
    // but a statement about this deployment: by default the server binds to
    // 127.0.0.1 only and the URL carries a random one-time token (see the
    // file header), so reaching this chat already requires the same
    // local-machine access a terminal session would. `--lan` (see
    // runChatServer) is where that stops being true: anyone on the same
    // network with the link is "reaching this chat" too and is still
    // answered as the user. Whether that is acceptable depends on who else
    // is on that network, which this file cannot judge.
    const OPERATOR_NAME = 'You';
    const displayNameFor = (senderId) =>
      senderId === 'you' ? OPERATOR_NAME : readRoster(targetDir).find((c) => c.id === senderId)?.name || senderId;

    const server = createServer(async (req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      const parts = url.pathname.split('/').filter(Boolean);

      if (parts[0] !== token) {
        res.writeHead(403).end('Not found.');
        return;
      }
      const route = parts.slice(1).join('/');

      try {
        if (req.method === 'GET' && route === 'api/status') {
          // Channels are gone after a restart when the workforce ID is
          // missing/unfilled — the exact
          // condition store.js already logs to the terminal, but that's
          // easy to miss. Surfacing it in the UI itself means the next
          // person doesn't have to go read server output to find out
          // why nothing survives a restart.
          //
          // `teamName`: the sidebar header carries the
          // team's own name instead of the hardcoded product name
          // "hire-juno" — the workforce id is the one place a team
          // already names itself (the workforce id
          // is assigned once and never changes), so this
          // reuses it rather than inventing a second, unrelated name
          // field to keep in sync. Falls back to the product name when
          // there's no workforce configured yet (see store.persisted's
          // own comment above), same as the header always showed before
          // this existed.
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({ persisted: store.persisted, teamName: workforce?.id || 'hire-juno' })
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/colleagues') {
          // Sidebar preview needs each colleague's latest main-thread
          // message alongside the on-disk profile fields readRoster
          // already returns — one merge here rather than a second
          // round-trip per colleague from the client.
          const lastMessages = store.getLastMessages();
          const roster = readRoster(targetDir).map((colleague) => ({
            ...colleague,
            lastMessage: lastMessages.get(colleague.id) || null,
          }));
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(roster));
          return;
        }

        if (req.method === 'GET' && route === 'api/workforces') {
          // Read-only list, same GET-route convention
          // as api/colleagues/api/channels above; adding/switching are
          // mutations and go over the WebSocket instead (see
          // 'add_workforce'/'switch_workforce'/'remove_workforce'
          // below), same split this app already draws everywhere else
          // (even the branding-logo upload goes over the socket, not a
          // POST route).
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(listWorkforces(targetDir))
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/avatar') {
          const colleagueId = url.searchParams.get('colleagueId') || '';
          const avatarPath = resolveAvatarPath(targetDir, colleagueId);
          if (!avatarPath) {
            res.writeHead(404).end('No avatar.');
            return;
          }
          sendCachedFile(req, res, avatarPath, 'image/png');
          return;
        }

        if (req.method === 'GET' && route === 'logo.png') {
          const customLogo = resolveCustomLogo(targetDir);
          // The built-in LOGO buffer (no custom logo.png set) has no
          // file on disk to stat — served as before, uncached, but it's
          // the 512x512 asset already checked into this package, not a
          // multi-MB user upload, so the same problem doesn't apply.
          if (customLogo) {
            sendCachedFile(req, res, customLogo, 'image/png');
          } else {
            res.writeHead(200, { 'Content-Type': 'image/png' }).end(LOGO);
          }
          return;
        }

        if (req.method === 'GET' && route === 'api/history') {
          const colleagueId = url.searchParams.get('colleagueId') || '';
          const sessionId = url.searchParams.get('sessionId') || DEFAULT_SESSION_ID;
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(store.getHistory(colleagueId, sessionId))
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/attachment') {
          const attachment = store.getAttachment(Number(url.searchParams.get('id')));
          if (!attachment) {
            res.writeHead(404).end('Not found.');
            return;
          }
          // Only image types are ever stored (see store.js); nosniff keeps
          // the browser from guessing a different type from the bytes.
          res.writeHead(200, {
            'Content-Type': attachment.mimeType,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, max-age=31536000, immutable',
          }).end(attachment.data);
          return;
        }

        if (req.method === 'GET' && route === 'api/search') {
          // Search across everything — messages and channel messages
          // together, main threads only (same scope as getLastMessages
          // — see its own comment), merged and re-sorted by recency so
          // the sidebar's global search doesn't have to care which
          // table a hit came from.
          const q = (url.searchParams.get('q') || '').trim();
          if (!q) {
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify([]));
            return;
          }
          const messageHits = store.searchMessages(q).map((hit) => ({
            kind: 'colleague',
            colleagueId: hit.colleagueId,
            role: hit.role,
            text: hit.text,
            createdAt: hit.createdAt,
          }));
          const channelHits = store.searchChannelMessages(q).map((hit) => ({
            kind: 'channel',
            channelId: hit.channelId,
            senderId: hit.senderId,
            text: hit.text,
            createdAt: hit.createdAt,
          }));
          const merged = [...messageHits, ...channelHits]
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, 50);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(merged));
          return;
        }

        if (req.method === 'GET' && route === 'api/sessions') {
          const colleagueId = url.searchParams.get('colleagueId') || '';
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(sessionsFor(colleagueId))
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/auto-mode-sessions') {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify([...autoModeSessions])
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/channels') {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify([...channelsById.values()])
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/colleague-stats') {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(Object.fromEntries(colleagueStats))
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/models') {
          // What the conversation's settings dialog offers. Asked of the
          // colleague's own adapter, so opening the dialog starts her
          // session if it isn't running yet — the same thing the first
          // message would do. A backend without a model choice (Copilot)
          // or a failing SDK call answers `supported: false` and the
          // dialog simply leaves the section out.
          const colleagueId = url.searchParams.get('colleagueId') || '';
          const sessionId = url.searchParams.get('sessionId') || DEFAULT_SESSION_ID;
          const adapter = adapterFor(colleagueId, sessionId);
          let models = null;
          if (adapter && typeof adapter.supportedModels === 'function') {
            try {
              models = await adapter.supportedModels();
            } catch {
              models = null;
            }
          }
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({
              supported: Array.isArray(models),
              models: (models || []).map((m) => ({
                value: m.value,
                displayName: m.displayName,
                description: m.description,
                resolvedModel: m.resolvedModel,
              })),
              choice: store.getModelChoice(colleagueId, sessionId),
            })
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/gatekeeper-usage') {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(gatekeeperUsage)
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/usage-limits') {
          // Rate limits are per Claude.ai account, not per colleague —
          // any already-running Claude adapter can answer for all of
          // them, so this just asks the first one that supports it
          // (Copilot's ACP adapter doesn't — see getRateLimits()'s own
          // comment in claude.js). Null with no colleague messaged yet
          // this run rather than spinning up an adapter (and its
          // subprocess) purely to answer a stats question.
          const adapter = [...adapters.values()].find((a) => typeof a.getRateLimits === 'function');
          const rateLimits = adapter ? await adapter.getRateLimits() : null;
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ rateLimits }));
          return;
        }

        if (req.method === 'GET' && route === 'api/channel-history') {
          const channelId = url.searchParams.get('channelId') || '';
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify(store.getChannelHistory(channelId))
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/worktree') {
          // Whether this conversation can have its own worktree (a git repo
          // and a workforce id to keep it under) and the one it has.
          const colleagueId = url.searchParams.get('colleagueId') || '';
          const sessionId = url.searchParams.get('sessionId') || DEFAULT_SESSION_ID;
          const worktree = store.getWorktree(colleagueId, sessionId);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({
              // The folder to branch from may also be named by the person.
              available: Boolean(workforce?.id),
              worktree: worktree
                ? { branch: worktree.branch, path: worktree.path, repoName: basename(worktree.repoPath || gitRoot(targetDir) || '') }
                : null,
            })
          );
          return;
        }

        // Which folder the changes dialog reads: the conversation's own
        // worktree when `colleagueId` (+ `sessionId`) name one that still
        // exists, otherwise `targetDir`. Channels and subagent threads send
        // no colleagueId and so get `targetDir`.
        const gitScope = () => {
          const colleagueId = url.searchParams.get('colleagueId') || '';
          const sessionId = url.searchParams.get('sessionId') || DEFAULT_SESSION_ID;
          const worktree = colleagueId ? store.getWorktree(colleagueId, sessionId) : null;
          return resolveGitDir(targetDir, worktree);
        };

        if (req.method === 'GET' && route === 'api/git-status') {
          const { dir, isWorktree } = gitScope();
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({ cwd: dir, branch: currentBranch(dir), worktree: isWorktree, files: gitStatus(dir) })
          );
          return;
        }

        if (req.method === 'GET' && route === 'api/git-diff') {
          const filePath = url.searchParams.get('path') || '';
          // Cross-checked against gitStatus()'s own current output
          // rather than trusting the query param directly — `git diff
          // --no-index` (needed below for an untracked file) will
          // happily diff *any* two filesystem paths, repo or not, so
          // an unchecked `path` here would turn this into a generic
          // "read a file this server process can see" endpoint. Only
          // a path git itself currently reports as changed in the
          // chosen folder gets through.
          const { dir } = gitScope();
          const known = (gitStatus(dir) || []).find((f) => f.path === filePath);
          const diff = known ? gitDiff(dir, filePath, known.status.includes('?')) : null;
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ diff }));
          return;
        }

        if (req.method === 'GET') {
          serveStatic(route, res, token, workforce?.id || 'hire-juno', req);
          return;
        }

        res.writeHead(404).end('Not found.');
      } catch (err) {
        res.writeHead(500).end(String(err));
      }
    });

    // The WebSocket carries the actual conversation: one client
    // connection, messages tagged with which colleague they're for —
    // a real ACP adapter will forward session/update notifications
    // over the same socket as they stream in.
    const wss = new WebSocketServer({ noServer: true });

    // Every currently-open tab/browser
    // this server instance is serving. Used to be one `safeSend`
    // *per connection*, so only whichever tab most recently sent a
    // message got any live update at all (see bindAdapter's own old
    // comment: "delivery has to be pinned to the connection" — true for
    // reconnect-takes-over, wrong for "two tabs open at once"). Nothing
    // in this app targets one specific tab over another anywhere, so a
    // flat broadcast to everyone currently connected is the whole fix.
    const connections = new Set();

    // Pending tool-permission requests, keyed by a request id neither
    // side invents twice — server-wide now (used to be one Map per
    // connection, same reasoning as `connections` above): a broadcast
    // permission_request can be answered from *any* currently open tab,
    // not just the one whose turn triggered it. The first
    // `permission_response` for a given id resolves it and removes the
    // entry; every other tab still showing the same prompt gets told to
    // dismiss it (see the 'permission_response' handler below).
    const pendingPermissions = new Map();

    const broadcast = (payload) => {
      const json = JSON.stringify(payload);
      for (const conn of connections) {
        if (conn.readyState === conn.OPEN) conn.send(json);
      }
    };

    server.on('upgrade', (req, socket, head) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] !== token || parts[1] !== 'ws') {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        connections.add(ws);
        ws.on('close', () => connections.delete(ws));

        // A tab that opens (or reloads) while a colleague is mid-turn only
        // hears the rest of the stream; what came before — thinking, reply
        // text so far, tool lines — is told to it once, here. Only for
        // turns still running (an adapter that is not busy has nothing live).
        const turns = [];
        for (const [key, adapter] of adapters) {
          if (!adapter.busy) continue;
          const thinking = pendingThinking.get(key);
          const text = pendingText.get(key);
          const trail = pendingTrails.get(key);
          if (!thinking && !text && !trail?.length) continue;
          const [colleagueId, sessionId] = key.split('::');
          turns.push({ colleagueId, sessionId, thinking, text, trail });
        }
        if (turns.length) ws.send(JSON.stringify({ type: 'live_state', turns }));

        // Bound on the adapter itself, not passed into each
        // sendMessage() call — see agentAdapter.js. A colleague can run
        // a Task subagent in the background and reply right away; that
        // subagent's own updates then arrive well after any single
        // sendMessage() call has resolved, so delivery has to be pinned
        // to the adapter's lifetime, not the request. Re-bound on every
        // message any connection sends this colleague — harmless now
        // that `onUpdate` broadcasts (see `broadcast` above) to every
        // open tab regardless of which one triggered the (re)bind; it
        // used to matter more, back when delivery went to only the one
        // connection that happened to bind last.
        const bindAdapter = (adapter, colleagueId, sessionId) => {
          const key = adapterKey(colleagueId, sessionId);
          adapter.onUpdate = (update) => {
            // Same three update types the client's own trail-building
            // switch reacts to (see the socket handler in
            // chat/src/app.js) — collected here too so the finished
            // 'message' below can persist them, not just relay them live.
            //
            // `trail` (only set for the 'message' branch) used to be
            // computed here purely for store.appendMessage below, never
            // broadcast — with two tabs open on the same
            // conversation, a tab that wasn't connected for the whole
            // turn only ever sees the tool_use/thinking_delta events
            // that happened to stream in *while it was listening*, so
            // its own client-built trail was silently missing whatever
            // came before. Every tab now gets the exact trail that was
            // just persisted, not just whichever fragments it personally
            // overheard — see the client's own 'message' case for the
            // matching half of this fix.
            let trail;
            if (update.type === 'tool_use') {
              if (!pendingTrails.has(key)) pendingTrails.set(key, []);
              pendingTrails.get(key).push({ kind: 'tool_use', id: update.id, name: update.name, input: update.input });
            } else if (update.type === 'tool_done') {
              // A tool result is where a message sent mid-turn gets folded
              // into the turn (see waiting.js), so it no longer waits.
              waitingYou.folded(key);
              // How the call was allowed, kept with the trail so it is still
              // shown after a reload.
              const entry = (pendingTrails.get(key) || []).find((e) => e.id && e.id === update.id);
              if (entry) entry.approval = update.approval;
            } else if (update.type === 'thinking_delta') {
              pendingThinking.set(key, (pendingThinking.get(key) || '') + update.text);
            } else if (update.type === 'delta') {
              pendingText.set(key, (pendingText.get(key) || '') + update.text);
            } else if (update.type === 'message') {
              pendingText.delete(key);
              trail = pendingTrails.get(key) || [];
              if (pendingThinking.has(key)) {
                trail.push({ kind: 'thinking', text: pendingThinking.get(key) });
                pendingThinking.delete(key);
              }
              pendingTrails.delete(key);
              store.appendMessage(colleagueId, sessionId, update.role, update.text, trail);
              // This turn is over: everything that arrived while it ran
              // belongs behind this reply (see store.moveToEnd). The oldest
              // of those is what the colleague starts next, so it stops
              // waiting; the rest keep waiting under their new ids.
              waitingYou.afterReply(key);
            }
            recordStats(colleagueStats, key, update);
            rememberStats(key, update);
            broadcast(trail ? { colleagueId, sessionId, ...update, trail } : { colleagueId, sessionId, ...update });
          };
          adapter.onPermissionRequest = (request) => {
            // Allow-all/auto mode: skip the round trip
            // entirely and allow, same as the native apps' auto-approve.
            // Checked fresh on every request (not captured once at bind
            // time) so toggling it mid-conversation takes effect on the
            // very next tool call, not just the next message.
            if (autoModeSessions.has(key)) return Promise.resolve({ allow: true, via: 'auto mode' });
            return new Promise((resolve) => {
              const requestId = randomUUID();
              pendingPermissions.set(requestId, { resolve });
              broadcast({ colleagueId, sessionId, type: 'permission_request', requestId, ...request });
            });
          };
        };

        // Posts one message into a channel, persists it, shows it to
        // whoever's watching, and — this is the "talk to each other"
        // part — dispatches it to every @mentioned
        // member so she can reply. Her reply recurses back through
        // this same function one level deeper, so she can mention
        // someone else in turn. `depth` is what stops that from
        // running forever: each hop is a real, billed turn.
        //
        // A channel-triggered turn gets the exact same streaming and
        // tool-permission treatment as a 1:1 chat (same as in a normal
        // chat) — the only difference is
        // where the updates are addressed (channelId+colleagueId
        // instead of just colleagueId) and that the final `message`
        // isn't written to that colleague's own DM history, it's
        // routed back through this function as her channel reply.
        //
        // Who gets dispatched to: an explicit @name (or @all/@everyone,
        // see mentions.js) always wins, for free and unambiguously. If
        // nobody was named AND the sender is the human, the gatekeeper
        // (gatekeeper.js) decides, so colleagues can recognize themselves
        // as relevant rather than needing to be tagged every single time
        // the human writes something.
        //
        // The gatekeeper never runs for a colleague-authored message,
        // though: a plain "Moin zusammen" from the human could make
        // both colleagues reply, and each reply ("was liegt an?", "was
        // gibt's?") is itself a question the gatekeeper judged worth
        // relaying, so the two of them kept re-inviting each other
        // turn after turn until the hop limit cut it off. A
        // human message addressing the group is one-way
        // by default — it doesn't imply the group should then start
        // talking *to each other* about it. A colleague can still pull
        // another one in deliberately, the same way she always
        // could — by writing an explicit @name — but an unaddressed
        // colleague reply now never fans back out on its own.
        async function relayChannelMessage(channelId, senderId, text, depth, attachments = []) {
          const channel = channelsById.get(channelId);
          if (!channel) return;
          // Images are stored with the message (store.js, attachments
          // table), so they survive a reload; the broadcast below still
          // carries the bytes for whoever is watching live.
          store.appendChannelMessage(channelId, senderId, text, attachments);
          broadcast({ channelId, type: 'channel_message', senderId, text, attachments });

          // When two channel messages are written back
          // to back, whoever answered the second one had no idea it
          // was a continuation of the first — because a colleague's live
          // session only ever sees the channel messages she was actually
          // dispatched for (explicit @mention or a gatekeeper hit), not
          // the full channel log. A message that skipped her is simply
          // invisible to her model context, even though it's sitting
          // right there in the channel history everyone can see in the
          // UI. Full history replay would fix that completely but costs
          // a turn's worth of tokens on every single dispatch; the
          // chosen approach is narrower — bring the one immediately preceding turn
          // back, cheap insurance against exactly the two-messages-in-a-
          // row case above, not a general backfill. Skipped when she
          // wrote that previous turn herself (it's already in her own
          // session) or when there isn't one yet. Fetched before the
          // gatekeeper call below too — see recentTurns.
          const history = store.getChannelHistory(channelId);
          const previousTurn = history.length >= 2 ? history[history.length - 2] : null;

          // Loaded once here (not just inside the gatekeeper fallback
          // below, where it used to live) — extractVocativeAddresses
          // needs it for every sender, human or colleague, same as
          // extractMentions above it.
          const roster = readRoster(targetDir);
          let targets = extractMentions(text, channel.memberIds, senderId);
          // A colleague (or the human) addressing someone by plain name
          // instead of "@name" — see extractVocativeAddresses for why
          // this runs regardless of sender and stays deterministic
          // rather than falling through to the gatekeeper below.
          const nameIndex = new Map(roster.map((c) => [c.name.toLowerCase(), c.id]));
          const vocative = extractVocativeAddresses(text, nameIndex, channel.memberIds, senderId);
          if (vocative.length) targets = [...new Set([...targets, ...vocative])];
          if (targets.length === 0 && senderId === 'you') {
            // See gatekeeper.js for why explicit @mention skips this
            // entirely (free, deterministic, unambiguous) and this only
            // runs as the fallback for a message from the human that
            // named no one.
            const candidates = channel.memberIds
              .filter((id) => id !== senderId)
              .map((id) => roster.find((c) => c.id === id))
              .filter(Boolean)
              .map((c) => ({ id: c.id, name: c.name, role: c.role }));
            // A short, trailing slice of history so the classifier can
            // recognize a bare reply ("1. go. 2. ok.") as continuing an
            // open question, not judge it in a vacuum — see
            // gatekeeper.js's own comment on why this was silently
            // dropping exactly that case. `history` already has the
            // just-appended current message as its last row, so this
            // slices *before* it and excludes it explicitly.
            const priorTurns = history.slice(0, -1).slice(-6);
            const recentTurns = priorTurns.map(
              (row) => `${displayNameFor(row.sender_id)}: ${row.text}`
            );
            const decision = await decideRelevance({
              senderName: displayNameFor(senderId),
              text,
              members: candidates,
              recentTurns,
            });
            targets = decision.relevant;
            recordGatekeeperUsage(decision.usage);
            broadcast({ type: 'gatekeeper_usage', ...gatekeeperUsage });
          }
          if (targets.length === 0) return;

          if (depth >= MAX_RELAY_DEPTH) {
            const notice = 'Automatic relay stopped here (reached the hop limit) — mention them directly to keep going.';
            store.appendChannelMessage(channelId, 'system', notice);
            broadcast({ channelId, type: 'channel_message', senderId: 'system', text: notice });
            return;
          }

          for (const colleagueId of targets) {
            const adapter = adapterFor(colleagueId);
            if (!adapter) continue;

            // Same update types a 1:1 turn produces (delta, thinking_delta,
            // tool_use, permission_request, message) — just tagged with
            // channelId so the frontend renders them in the channel view
            // instead of that colleague's own DM thread. `message` is the
            // one type that isn't forwarded as-is: it becomes her channel
            // reply, persisted and dispatched exactly like the human's own
            // channel message was above.
            adapter.onUpdate = (update) => {
              if (update.type === 'message') {
                relayChannelMessage(channelId, colleagueId, update.text, depth + 1);
                return;
              }
              // Subagent panels are a DM-only concept for now (they hang
              // off a colleague's own sidebar entry) — not supported from
              // a channel turn yet, so these are dropped rather than fed
              // into state that assumes a 1:1 context.
              if (update.type.startsWith('subagent_')) return;
              recordStats(colleagueStats, adapterKey(colleagueId, DEFAULT_SESSION_ID), update);
              rememberStats(adapterKey(colleagueId, DEFAULT_SESSION_ID), update);
              broadcast({ channelId, colleagueId, ...update });
            };
            adapter.onPermissionRequest = (request) =>
              new Promise((resolve) => {
                const requestId = randomUUID();
                pendingPermissions.set(requestId, { resolve });
                broadcast({ channelId, colleagueId, type: 'permission_request', requestId, ...request });
              });

            broadcast({ channelId, colleagueId, type: 'channel_typing', active: true });
            // A colleague answering in a channel
            // would have no idea anyone else was even there — "[Channel #Name]
            // Sender: text" names the channel and whoever spoke last,
            // never who else is in it. Reads as a stylistic prefix on an
            // otherwise ordinary 1:1 line, not a signal that this is a
            // shared space with named other members she could address
            // directly the same way a human would in a real group chat.
            // Sent on every single turn, not just the first, so it
            // survives however far back a colleague's own context
            // window reaches — one line is cheap compared to silently
            // wrong social context on every reply.
            const otherMembers = channel.memberIds
              .filter((id) => id !== colleagueId)
              .map((id) => displayNameFor(id));
            const channelContext =
              `[Channel #${channel.name} — a shared channel, not a private chat. ` +
              `With you here: ${otherMembers.join(', ')}.]\n`;
            const backfill =
              previousTurn && previousTurn.sender_id !== colleagueId
                ? `[Channel #${channel.name}] ${displayNameFor(previousTurn.sender_id)}: ${previousTurn.text}\n`
                : '';
            const prompt = `${channelContext}${backfill}[Channel #${channel.name}] ${displayNameFor(senderId)}: ${text}`;
            try {
              await adapter.sendMessage(prompt, attachments);
            } finally {
              broadcast({ channelId, colleagueId, type: 'channel_typing', active: false });
            }
          }
        }

        ws.on('message', async (raw) => {
          let payload;
          try {
            payload = JSON.parse(raw.toString('utf8'));
          } catch {
            return;
          }

          if (payload.type === 'permission_response') {
            const pending = pendingPermissions.get(payload.requestId);
            if (!pending) return; // late answer to a request nobody is waiting on anymore
            pendingPermissions.delete(payload.requestId);
            // `via`: set by the browser when it answered on its own (an
            // earlier "Allow always" or the channel autopilot), so the
            // trail can say so. Only these two values are taken over.
            const via = ['allow always', 'autopilot'].includes(payload.via) ? payload.via : undefined;
            pending.resolve({ allow: Boolean(payload.allow), message: payload.message, via });
            // The request itself went out to every open tab (see
            // bindAdapter/relayChannelMessage's own broadcast calls); now
            // that one tab has answered it, every other tab still
            // showing the same requestId needs telling to drop its own
            // copy of the card (see app.js's 'permission_resolved'
            // handler). Broadcasting back to the answering tab too is
            // harmless — it already cleared its own card locally before
            // sending this (see app.js's respondToPermission).
            broadcast({ type: 'permission_resolved', requestId: payload.requestId });
            return;
          }

          if (payload.type === 'create_session') {
            const id = randomUUID();
            const colleagueId = payload.colleagueId;
            if (!colleagueId || !readRoster(targetDir).some((c) => c.id === colleagueId)) return;
            const title = (payload.title || '').trim() || 'New session';
            store.createSession(id, colleagueId, title);
            const session = { id, colleagueId, title, createdAt: new Date().toISOString() };
            sessionsByColleague.set(colleagueId, [...sessionsFor(colleagueId), session]);
            broadcast({ type: 'session_created', colleagueId, session });
            return;
          }

          if (payload.type === 'upload_logo') {
            // An in-app upload, not just "drop a logo.png into the
            // repo yourself" (see resolveCustomLogo above, which this
            // writes into the exact same spot). `data` is base64, no
            // `data:` prefix — same convention as a chat image
            // attachment (see agentAdapter.js). A basic size cap (5 MB
            // decoded) since this writes straight to the target repo's
            // filesystem on request, unlike everything else this
            // WebSocket handles — no such write exists anywhere else in
            // this file. PNG only, matching resolveCustomLogo's fixed
            // `logo.png` name and a colleague avatar's own `<id>.png`
            // convention in roster.js.
            // Every early-return below used to be silent, e.g. when a
            // full-resolution phone photo blew past the 5 MB cap. The
            // client now downscales before ever sending (see app.js's
            // resizeImageToPngDataUrl), so this should be rare, but rare
            // isn't the same as "fine to fail silently".
            if (typeof payload.data !== 'string' || !payload.data) {
              broadcast({ type: 'logo_upload_failed', message: 'No image data received.' });
              return;
            }
            const bytes = Buffer.from(payload.data, 'base64');
            if (bytes.length === 0) {
              broadcast({ type: 'logo_upload_failed', message: 'The uploaded file was empty.' });
              return;
            }
            if (bytes.length > 5 * 1024 * 1024) {
              broadcast({ type: 'logo_upload_failed', message: 'That image is too large (over 5 MB) even after resizing.' });
              return;
            }
            try {
              writeFileSync(joinPath(targetDir, 'logo.png'), bytes);
              broadcast({ type: 'logo_updated' });
            } catch (err) {
              broadcast({ type: 'logo_upload_failed', message: err.message });
            }
            return;
          }

          if (payload.type === 'set_auto_mode') {
            const key = adapterKey(payload.colleagueId, payload.sessionId);
            if (payload.enabled) autoModeSessions.add(key);
            else autoModeSessions.delete(key);
            broadcast({
              type: 'auto_mode_changed',
              colleagueId: payload.colleagueId,
              sessionId: payload.sessionId || DEFAULT_SESSION_ID,
              enabled: Boolean(payload.enabled),
            });
            return;
          }

          if (payload.type === 'set_model') {
            // Applied to the running session right away (the replies that
            // follow use it) and remembered, so a restart or a context
            // reset keeps it. Only a value the SDK itself listed for this
            // account gets through (see modelChoice.js).
            const colleagueId = payload.colleagueId;
            const sessionId = payload.sessionId || DEFAULT_SESSION_ID;
            const fail = (message) => broadcast({ type: 'model_change_failed', colleagueId, sessionId, message });
            const adapter = adapterFor(colleagueId, sessionId);
            if (!adapter || typeof adapter.setModel !== 'function') {
              fail('This colleague has no model choice.');
              return;
            }
            let supported;
            try {
              supported = await adapter.supportedModels();
            } catch (err) {
              fail(`Could not read the available models: ${err.message}`);
              return;
            }
            const checked = validateModelChoice(payload.model, supported);
            if (!checked.ok) {
              fail(checked.message);
              return;
            }
            try {
              await adapter.setModel(checked.model);
            } catch (err) {
              fail(`Could not switch the model: ${err.message}`);
              return;
            }
            store.setModelChoice(colleagueId, sessionId, checked.model);
            const shown = supported.find((m) => m.value === (checked.model ?? 'default'));
            broadcast({
              type: 'model_changed',
              colleagueId,
              sessionId,
              model: checked.model,
              resolvedModel: shown?.resolvedModel || checked.model || null,
            });
            return;
          }

          if (payload.type === 'use_worktree') {
            // Moves this conversation into its own git worktree on a new
            // branch (see worktree.js). Her SDK session is resumed from the
            // saved id, so she keeps what she knows; only her working
            // directory changes, from the next message on.
            const colleagueId = payload.colleagueId;
            const sessionId = payload.sessionId || DEFAULT_SESSION_ID;
            const fail = (message) => broadcast({ type: 'worktree_failed', colleagueId, sessionId, message });
            if (!readRoster(targetDir).some((c) => c.id === colleagueId)) {
              fail('Unknown colleague.');
              return;
            }
            const key = adapterKey(colleagueId, sessionId);
            const result = activateWorktree({
              store,
              workforceId: workforce?.id,
              repoDir: targetDir,
              repoPath: typeof payload.repoPath === 'string' && payload.repoPath.trim() ? payload.repoPath.trim() : undefined,
              colleagueId,
              sessionId,
              busy: Boolean(adapters.get(key)?.busy),
            });
            if (!result.ok) {
              fail(result.message);
              return;
            }
            const { branch, path } = result;
            const repoName = basename(result.repoPath || gitRoot(targetDir) || '');
            if (result.created) {
              // The running adapter still has the old working directory: drop
              // it; the next message creates one in the worktree (adapterFor)
              // and resumes the saved session.
              adapters.get(key)?.close?.();
              adapters.delete(key);
            }
            broadcast({ type: 'worktree_changed', colleagueId, sessionId, branch, path, repoName });
            return;
          }

          if (payload.type === 'reset_context') {
            // Drops the live SDK session(s) so the next message starts
            // with a clean slate — needed once a colleague
            // could carry the previous channel turn forward (see
            // `previousTurn` above): if context now sticks around on its
            // own, there has to be a way to deliberately throw it away
            // again, not just wait for a server restart. Closing the
            // adapter and dropping it from `adapters` used to be treated
            // as enough on its own — it wasn't: adapterFor's own resume
            // (store.getAdapterSession) would still hand the *next*
            // adapter the exact same sdk_session_id, so "starting fresh"
            // only ever meant a fresh in-memory object still resuming
            // the same underlying SDK session — a session stuck resuming a
            // hung turn would resume straight back into it after
            // reset_context. Now also
            // clears the persisted resume pointer (store.clearAdapterSession)
            // so the next message genuinely starts a new SDK session, not
            // just a new adapter object wrapping the old one. The
            // persisted chat log itself is still untouched — this clears
            // what a colleague remembers, not what can still be scrolled
            // back through (see clearHistory below for the one that
            // takes the transcript too).
            //
            // A colleague's channel turns and her own 1:1 chat share the
            // exact same DEFAULT_SESSION_ID adapter (see adapterFor
            // above) — resetting one resets the other too. Flagged, not
            // hidden: a channel-context reset also clears that
            // colleague's 1:1 memory if she has one open under the
            // default session.
            if (payload.channelId) {
              const channel = channelsById.get(payload.channelId);
              if (!channel) return;
              for (const colleagueId of channel.memberIds) {
                const key = adapterKey(colleagueId, DEFAULT_SESSION_ID);
                const adapter = adapters.get(key);
                if (adapter) {
                  adapter.close?.();
                  adapters.delete(key);
                }
                store.clearAdapterSession(colleagueId, DEFAULT_SESSION_ID);
              }
              const notice = `Context reset for #${channel.name} — everyone starts her next reply fresh.`;
              store.appendChannelMessage(payload.channelId, 'system', notice);
              broadcast({ channelId: payload.channelId, type: 'channel_message', senderId: 'system', text: notice });
              return;
            }
            if (payload.colleagueId) {
              const sessionId = payload.sessionId || DEFAULT_SESSION_ID;
              const key = adapterKey(payload.colleagueId, sessionId);
              const adapter = adapters.get(key);
              if (adapter) {
                adapter.close?.();
                adapters.delete(key);
              }
              store.clearAdapterSession(payload.colleagueId, sessionId);
              const notice = 'Context reset — starting fresh from here.';
              store.appendMessage(payload.colleagueId, sessionId, 'system', notice);
              broadcast({ colleagueId: payload.colleagueId, sessionId, type: 'message', role: 'system', text: notice });
            }
            return;
          }

          if (payload.type === 'clear_chat') {
            // The destructive counterpart to reset_context above — that
            // one drops only the live SDK session and says so with a
            // notice appended to the (kept) transcript; this deletes the
            // transcript itself (see store.clearHistory/
            // clearChannelHistory), so there is nothing left to append a
            // notice to. No confirmation dialog here — the client already
            // gated this behind its own two-step "Clear chat" button
            // (see conv-settings modal in app.js); a second native
            // confirm() would just be a second copy of the same gate.
            if (payload.channelId) {
              const channel = channelsById.get(payload.channelId);
              if (!channel) return;
              for (const colleagueId of channel.memberIds) {
                const key = adapterKey(colleagueId, DEFAULT_SESSION_ID);
                const adapter = adapters.get(key);
                if (adapter) {
                  adapter.close?.();
                  adapters.delete(key);
                }
              }
              store.clearChannelHistory(payload.channelId);
              broadcast({ type: 'chat_cleared', channelId: payload.channelId });
              return;
            }
            if (payload.colleagueId) {
              const sessionId = payload.sessionId || DEFAULT_SESSION_ID;
              const key = adapterKey(payload.colleagueId, sessionId);
              const adapter = adapters.get(key);
              if (adapter) {
                adapter.close?.();
                adapters.delete(key);
              }
              store.clearHistory(payload.colleagueId, sessionId);
              broadcast({ type: 'chat_cleared', colleagueId: payload.colleagueId, sessionId });
            }
            return;
          }

          if (payload.type === 'add_workforce') {
            try {
              const workforce = addWorkforce(payload.path);
              broadcast({ type: 'workforce_added', workforce });
            } catch (err) {
              broadcast({ type: 'workforce_add_failed', message: err.message });
            }
            return;
          }

          if (payload.type === 'remove_workforce') {
            removeWorkforce(payload.path);
            broadcast({ type: 'workforce_removed', path: payload.path });
            return;
          }

          if (payload.type === 'switch_workforce') {
            // Deliberately not an in-place swap of this instance's own
            // store/roster/adapters/channels — those are all local
            // consts/lets captured by this same runChatServer() call's
            // closures (store, channelsById, adapters, targetDir
            // itself…), so "swap the active workforce" would mean
            // reassigning every one of them consistently everywhere
            // they're captured, all at once, mid-request, with a live
            // adapter subprocess for every colleague someone's talked to
            // possibly still running. A second, independent call to
            // this exact same function — a fresh port, a fresh token, a
            // fresh set of those same closures for the new targetDir —
            // sidesteps all of that: nothing about the running instance
            // needs to change, so there's nothing to get subtly wrong.
            // `openBrowser: false` because the *client* navigates itself
            // (see app.js's switchWorkforce) — opening a second real
            // browser window here too would just be a second tab nobody
            // asked for.
            try {
              if (!findLayout(payload.path)) {
                throw new Error(`No team/ or mitarbeiter/ folder in ${payload.path} — not a workforce repo.`);
              }
              const { url: newUrl } = await runChatServer({ targetDir: payload.path, lan, openBrowser: false });
              // "Switching" to the folder this server already serves: the tabs
              // just go to the same address, nothing to close.
              if (resolvePath(payload.path) === runningKey) {
                broadcast({ type: 'workforce_switch_ready', url: newUrl });
                return;
              }
              // Broadcast, not a reply to just this one connection —
              // every tab currently open against this instance is about
              // to lose its server out from under it (see the close()
              // below), not only the tab that clicked "Switch"; each of
              // them needs to navigate itself to the new instance, not
              // just this one.
              broadcast({ type: 'workforce_switch_ready', url: newUrl });
              // Give the broadcast above (and every tab's own navigate)
              // a moment to actually go out before this instance closes
              // — a close() called synchronously right after could race
              // the send.
              // The old instance keeps running turns alive: the 'close'
              // handler below waits for them (bounded) before it
              // closes the adapters. Their replies still reach the store.
              // Closed only once nothing runs anymore, and only if nobody is
              // connected by then (someone who switched back is using it
              // again): until then it keeps serving, so switching back finds
              // the running turn alive, live (see runningServers).
              setTimeout(async () => {
                // Waits for the tabs to have left as well as for the turns to
                // end: the broadcast above only just went out.
                await waitUntilIdle(() => connections.size > 0 || [...adapters.values()].some((a) => a.busy));
                const entry = runningServers.get(runningKey);
                if (connections.size > 0 || entry?.server !== server) return;
                entry.closing = true;
                server.close();
              }, 500);
            } catch (err) {
              broadcast({ type: 'workforce_switch_failed', message: err.message });
            }
            return;
          }

          if (payload.type === 'create_channel') {
            const id = randomUUID();
            const memberIds = Array.isArray(payload.memberIds) ? payload.memberIds : [];
            const channel = { id, name: payload.name || 'channel', memberIds };
            channelsById.set(id, channel);
            store.createChannel(id, channel.name, memberIds);
            broadcast({ type: 'channel_created', channel });
            return;
          }

          if (payload.type === 'channel_message') {
            const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
            await relayChannelMessage(payload.channelId, 'you', payload.text, 0, attachments);
            return;
          }

          const { colleagueId, text, attachments } = payload;
          const sessionId = payload.sessionId || DEFAULT_SESSION_ID;
          const adapter = adapterFor(colleagueId, sessionId);
          if (!adapter) {
            broadcast({ colleagueId, sessionId, type: 'message', role: 'system', text: 'Unknown colleague.' });
            return;
          }
          bindAdapter(adapter, colleagueId, sessionId);
          // Images are stored with the message (store.js, attachments table).
          // A message that arrives mid-turn is remembered here, so the
          // reply that ends that turn can be stored in front of it.
          const wasBusy = adapter.busy;
          const savedId = store.appendMessage(colleagueId, sessionId, 'you', text, undefined, attachments);
          if (wasBusy) {
            const key = adapterKey(colleagueId, sessionId);
            waitingYou.add(key, savedId);
          }
          await adapter.sendMessage(text, attachments);
        });
      });
    });

    const host = lan ? '0.0.0.0' : '127.0.0.1';

    const finishListening = () => {
      // From here on, a server error is a genuine runtime problem, not
      // "the remembered port was taken" — the one case the startup
      // dance below already handles by retrying once. A bare
      // console.error rather than another reject(): the promise this
      // function returns has already settled (resolve() below), so a
      // late reject() would just be a silent no-op — this at least
      // surfaces something.
      server.removeAllListeners('error');
      server.on('error', (err) => console.error('\nChat server error:', err));

      const { port } = server.address();
      // Only writes when the bound port actually differs from what was
      // remembered (first-ever launch for this path, or the remembered
      // one was taken and this is the fallback bind) — an unconditional
      // write here would touch the file on every single ordinary
      // launch for no reason.
      if (port !== session.port) saveSessionPort(targetDir, port);
      const url = `http://127.0.0.1:${port}/${token}/`;
      runningServers.set(runningKey, { url, server, closing: false });
      onReady?.(url);
      if (lan) {
        // Explicit, every single run — this is the one thing standing
        // between "reachable from another device on the same WiFi" and
        // "reachable by anyone who can see this token, over plain HTTP,
        // by a live agent session with real Bash/file/git execution in
        // this repo" (autopilot skips even the permission prompt). Not
        // a one-time warning easy to forget between runs.
        const address = lanAddress();
        console.log('\n⚠ --lan is on: this chat is reachable by anyone on the same network who has this link.');
        console.log(address
          ? `On your phone (same WiFi): http://${address}:${port}/${token}/`
          : 'Could not detect a LAN address to print — check `ifconfig`/`ipconfig` for this machine\'s IP on the network.');
      }
      if (openBrowser) {
        console.log(`\nOpening ${url} in your browser…`);
        open(url).catch(() => {
          console.log(`Could not open a browser automatically — open this URL yourself:\n${url}`);
        });
      }
      resolve({ url, server });
    };

    // Tries the
    // remembered port (see shared/chatSessions.js) first so the address
    // actually stays fixed across restarts. `session.port` is only ever
    // a *preference* though: something else may have grabbed that exact
    // port since the last run (another instance, an unrelated app), and
    // failing the whole launch over a stale number would be worse than
    // just picking a new free one and remembering that instead — so
    // EADDRINUSE on the *first* attempt falls back to port 0 (OS picks
    // any free port) exactly once. A second failure after that is a
    // real error, not a stale port, and gets rejected normally.
    // Registered once, up front, rather than passed as `.listen()`'s own
    // callback argument on each attempt below — `.listen(port, host, cb)`
    // adds `cb` as its own `once('listening', cb)` registration every
    // time it's called, so passing `finishListening` to *both* the first
    // attempt and the retry would leave the first (never-fired, since
    // that attempt errored instead of succeeding) registration still
    // attached — and when the retry's `listening` event fires, both
    // copies would run, double-executing everything below (found by
    // actually forcing the fallback path and watching the "Opening…"
    // line print twice). One `once` listener, reused across both
    // attempts, fires exactly once no matter which attempt succeeds.
    server.once('listening', finishListening);
    server.listen(session.port || 0, host);
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE' && session.port) {
        server.listen(0, host);
        server.once('error', reject);
      } else {
        reject(err);
      }
    });

    server.on('close', () => {
      // Each adapter holds its own subprocess/session alive — without
      // this, the process this server runs in never exits by itself
      // (found by running a real one against a live colleague: the
      // WebSocket closed, the HTTP server closed, and the process sat
      // there anyway, kept up by the still-running `claude` child).
      if (runningServers.get(runningKey)?.server === server) runningServers.delete(runningKey);
      for (const adapter of adapters.values()) adapter.close?.();
      store.close();
    });
  });
}
