// First step of the Preact/htm migration chat/README.md's "Known gaps"
// called for: the message list (renderMessages/renderChannelMessages)
// is Preact-owned now — that's where the duplication actually lived,
// two near-identical hand-built DOM trees for one bubble shape. Everything else here (sidebar, composer, modals,
// socket handling, all the plain state Maps) is deliberately still the
// same vanilla DOM code as before — a contained first slice, not a
// full rewrite; see the component section below for where the vanilla
// code ends and Preact begins. `npm run build:chat` bundles this file
// (chat/src/app.js) into chat/public/app.js via esbuild — that bundle,
// not this file, is what index.html actually loads and what npm
// publishes (see package.json's prepublishOnly), so installing this
// package still never requires a build step on the user's side.
import { Fragment, render } from 'preact';
import { html } from 'htm/preact';

import { renderMarkdown } from './markdown.js';
import { pickConversationToRestore, recallOpenConversation, rememberOpenConversation } from './open-conversation.js';
import { applyTheme, readThemePreference, writeThemePreference } from './theme.js';

const paneEl = document.getElementById('pane');
const paneHeaderEl = document.getElementById('pane-header');
const hiringModeBannerEl = document.getElementById('hiring-mode-banner');
const messagesEl = document.getElementById('messages');
const scrollToBottomButtonEl = document.getElementById('scroll-to-bottom');
const sidebarEl = document.getElementById('sidebar');
const notifyPermissionButtonEl = document.getElementById('notify-permission-button');
const noPersistenceBannerEl = document.getElementById('no-persistence-banner');
const settingsButtonEl = document.getElementById('settings-button');
const settingsBackdropEl = document.getElementById('settings-backdrop');
const settingsModalEl = document.getElementById('settings-modal');
const settingsCloseEl = document.getElementById('settings-close');
const usageSummaryEl = document.getElementById('usage-summary');
const usageTableEl = document.getElementById('usage-table');
const autoModeListEl = document.getElementById('auto-mode-list');
const workforceSwitcherEl = document.getElementById('workforce-switcher');
const workforceMenuEl = document.getElementById('workforce-menu');
const workforceListEl = document.getElementById('workforce-list');
const workforceAddFormEl = document.getElementById('workforce-add-form');
const workforceAddInputEl = document.getElementById('workforce-add-input');
const workforceErrorEl = document.getElementById('workforce-error');
const settingsNotifyRowEl = document.getElementById('settings-notify-row');

// Appearance (settings dialog): the <head> already applied the stored
// choice before the first paint; this only syncs the radios to it and
// applies a new one on the spot. See theme.js.
{
  const themeChoiceEl = document.getElementById('theme-choice');
  const stored = applyTheme(readThemePreference());
  const checked = themeChoiceEl.querySelector(`input[value="${stored}"]`);
  if (checked) checked.checked = true;
  themeChoiceEl.addEventListener('change', (event) => {
    applyTheme(writeThemePreference(event.target.value));
  });
}
const usageLimitsEl = document.getElementById('usage-limits');
const sidebarSearchInputEl = document.getElementById('sidebar-search-input');
const convSettingsBackdropEl = document.getElementById('conv-settings-backdrop');
const convSettingsModalEl = document.getElementById('conv-settings-modal');
const convSettingsTitleEl = document.getElementById('conv-settings-modal__title');
const convSettingsCloseEl = document.getElementById('conv-settings-close');
const convSettingsAutoModeEl = document.getElementById('conv-settings-auto-mode');
const convSettingsNewSessionSectionEl = document.getElementById('conv-settings-new-session-section');
const convSettingsNewSessionEl = document.getElementById('conv-settings-new-session');
const convSettingsModelSectionEl = document.getElementById('conv-settings-model-section');
const convSettingsModelEl = document.getElementById('conv-settings-model');
const convSettingsWorktreeSectionEl = document.getElementById('conv-settings-worktree-section');
const convSettingsWorktreeEl = document.getElementById('conv-settings-worktree');
const convSearchInputEl = document.getElementById('conv-search-input');
const convSearchResultsEl = document.getElementById('conv-search-results');
const convResetContextEl = document.getElementById('conv-reset-context');
const convClearChatEl = document.getElementById('conv-clear-chat');
const convClearChatLabelEl = document.getElementById('conv-clear-chat-label');
const form = document.getElementById('composer');
const input = document.getElementById('composer-input');
const fileInput = document.getElementById('composer-file');
const attachmentPreviewEl = document.getElementById('attachment-preview');
// Explicitly the submit button, not "the first button in the form":
// #attach-button is a real <button> now (it was a <label for> before,
// which no keyboard could reach) and it comes first in the markup.
const sendButton = form.querySelector('button[type="submit"]');
const queueButtonEl = document.getElementById('queue-button');
const attachButtonEl = document.getElementById('attach-button');
const imageLightboxEl = document.getElementById('image-lightbox');
const imageLightboxImgEl = document.getElementById('image-lightbox-img');
const diffButtonEl = document.getElementById('diff-button');
const diffBackdropEl = document.getElementById('diff-backdrop');
const diffModalEl = document.getElementById('diff-modal');
const diffCloseEl = document.getElementById('diff-close');
const diffRefreshEl = document.getElementById('diff-refresh');
const diffModalCwdEl = document.getElementById('diff-modal__cwd');
const diffFileListEl = document.getElementById('diff-file-list');
const diffContentEl = document.getElementById('diff-content');
const appEl = document.getElementById('app');
const mobileBackButtonEl = document.getElementById('mobile-back-button');
// Mobile layout: below styles.css's own breakpoint,
// sidebar and pane can't both fit, so this class (irrelevant above the
// breakpoint — see the media query) decides which one shows. Set
// whenever a conversation is actually opened (selectColleague/
// selectChannel), cleared only by tapping back — switching to the pane
// is automatic, going back to the list is a deliberate action, not
// something a background render should do for you mid-read.
mobileBackButtonEl.addEventListener('click', () => appEl.classList.remove('pane-active'));
// Mobile-only bottom tab bar — the same two destinations
// #brand's own diff/settings buttons open on desktop (see
// openDiffModal/openSettingsModal further down — both plain function
// declarations, hoisted, safe to reference here even though they're
// defined later in this file), reachable from a persistent bottom bar
// instead once #sidebar-column can hide. "Chats" just mirrors the back
// button — same destination, a second way to reach it that also reads
// as "you're here" (aria-current) the way a real tab bar does.
document.getElementById('mobile-tab-chats').addEventListener('click', () => appEl.classList.remove('pane-active'));
document.getElementById('mobile-tab-changes').addEventListener('click', () => openDiffModal());
document.getElementById('mobile-tab-settings').addEventListener('click', () => openSettingsModal());
const brandNameEl = document.getElementById('brand-name');
const brandLogoEl = document.getElementById('brand-logo');
const brandingLogoPreviewEl = document.getElementById('branding-logo-preview');
const brandingLogoFileEl = document.getElementById('branding-logo-file');
const brandingUploadButtonEl = document.getElementById('branding-upload-button');
const brandingErrorEl = document.getElementById('branding-error');

// The id every 1:1 conversation uses before the human ever starts a
// second, parallel one with the same colleague (see store.js on the
// server — same name, same meaning, duplicated here since the browser
// can't import a server module).
const DEFAULT_SESSION_ID = 'default';

// Every per-conversation Map below (history, streaming, ...) is keyed
// by this, not by colleagueId alone — several conversations with the
// same colleague can run side by side, so colleagueId
// alone is not a unique conversation key. Matches the server's
// own `adapterKey()` exactly (chat/server/index.js) so a stats/usage
// update tagged {colleagueId, sessionId} lands under the same key here
// that the server recorded it under. Subagent threads bypass this
// entirely — they index everything by their own already-unique
// synthetic id (`sub:...`), never by colleagueId+sessionId.
function convKey(colleagueId, sessionId) {
  return `${colleagueId}::${sessionId || DEFAULT_SESSION_ID}`;
}

// Same idea as convKey, for channel-only state that needs to tell apart
// which channel a colleague's turn belongs to — pending permission cards
// and the "*" autopilot wildcard (see channelPendingPermission and
// alwaysAllowedTools below). Before this existed, both were keyed by
// colleagueId alone: a second channel silently clobbered a pending
// request from the first, and "autopilot" for her in one channel quietly
// applied in every channel she's in.
function channelKey(colleagueId, channelId) {
  return `${colleagueId}::${channelId}`;
}

let activeColleagueId = null;
let activeSessionId = DEFAULT_SESSION_ID; // null while a subagent thread is open — sessions aren't a thing there
let activeChannelId = null; // mutually exclusive with activeColleagueId
// The conversation key for whatever's currently on screen — a
// subagent thread's own synthetic id, or colleagueId+session for
// everything else. Returns null when nothing's selected yet.
function activeConvKey() {
  if (!activeColleagueId) return null;
  return isSubagentThread(activeColleagueId) ? activeColleagueId : convKey(activeColleagueId, activeSessionId);
}
let showChannelForm = false;
const colleagueSessions = new Map(); // colleagueId -> [{id, title, createdAt}] — the *extra* sessions, not the implicit default one
// colleagueId -> the session last opened with her, so clicking her
// sidebar row returns there instead of always to the default one (her
// sessions have no rows of their own — see renderSidebar).
const lastSessionByColleague = new Map();

// Every conversation key that belongs to one colleague: her default
// conversation plus each extra session.
function sessionKeysFor(colleagueId) {
  return [
    convKey(colleagueId, DEFAULT_SESSION_ID),
    ...(colleagueSessions.get(colleagueId) || []).map((s) => convKey(colleagueId, s.id)),
  ];
}
const showSessionForm = new Set(); // colleagueId currently showing its "+ New session" form
const autoModeKeys = new Set(); // convKey-shaped strings currently running with tool-permission auto-approve on
// In-app unread markers: the desktop Notification is OS-gated, so it
// can't be the only sign that something new landed while you were
// looking elsewhere. `unreadConversations` holds convKey-shaped strings for
// a 1:1/session (`convKey(colleagueId, sessionId)`, matching
// autoModeKeys' own scheme) and `channel:<channelId>` for a channel —
// prefixed so a colleague id and a channel id can never collide in the
// same Set. Marked on arrival when that conversation isn't the one
// currently open (see the 'message'/'channel_message' handlers below),
// cleared the moment it's opened (see selectColleague/selectChannel).
const unreadConversations = new Set();
const UNREAD_CHANNEL_PREFIX = 'channel:';
// Same "channel:<id>" shape unreadConversations already uses — reused
// here (drafts, below) so both features key a channel identically
// without a second prefix constant to keep in sync by hand.
function channelConvKey(channelId) {
  return UNREAD_CHANNEL_PREFIX + channelId;
}

// A single shared textarea across every conversation would leave
// half-typed text sitting in the wrong place after switching to another
// colleague or channel, or lose it once you typed over it. `drafts` holds unsent composer text per
// conversation, keyed the same way `unreadConversations` is
// (`convKey(colleagueId, sessionId)` / `channelConvKey(channelId)`).
// Saved only when *leaving* a conversation (see saveDraft, called from
// selectColleague/selectChannel before they reassign the active-*
// globals) — the currently open one's draft just lives in the textarea
// itself, no need to mirror it into the map on every keystroke.
const drafts = new Map();

// The conv key for whatever's currently open, or null when there's
// nothing with a composer open yet (first load) or a subagent thread
// (composer disabled there — see isSubagentThread, nothing to draft).
// Channels and 1:1s use different active-* globals (see activeChannelId/
// activeColleagueId below), so this can't just reuse activeConvKey() —
// that one assumes a colleague is active and returns nonsense for a
// channel.
function currentDraftKey() {
  if (activeChannelId) return channelConvKey(activeChannelId);
  if (activeColleagueId && !isSubagentThread(activeColleagueId)) return convKey(activeColleagueId, activeSessionId);
  return null;
}

function saveDraft() {
  const key = currentDraftKey();
  if (!key) return;
  if (input.value) drafts.set(key, input.value);
  else drafts.delete(key);
}

// The document title is the one "something's new" signal that works
// even with notifications denied/OS-suppressed and the tab in the
// background — a browser keeps rendering title updates from a
// background tab. `BASE_TITLE` starts as whatever's in the actual
// <title> tag (so this doesn't drift from index.html before the team
// name is known) and is updated once loadRoster() learns it — `let`,
// not `const`, on purpose: a direct document.title assignment there
// would only survive until the next refreshUnreadTitle() call, which
// would silently reset it back to the stale placeholder.
let BASE_TITLE = document.title;
function refreshUnreadTitle() {
  document.title = unreadConversations.size > 0 ? `(${unreadConversations.size}) ${BASE_TITLE}` : BASE_TITLE;
}
const channelsById = new Map(); // channelId -> {id, name, memberIds}
const channelMessages = new Map(); // channelId -> [{senderId, text, kind?}] — senderId is 'you', 'system', or a colleague id
// Live, in-progress state for channel-triggered turns — the counterpart
// to `streaming`/`thinkingStreaming`/`pendingPermission` below, but
// channel turns can have more than one colleague mid-turn at once (a
// reply can trigger the next hop before the previous one is fully
// wrapped up), so these are keyed by colleagueId and carry their own
// channelId to filter against whichever channel is on screen.
const channelTyping = new Map(); // colleagueId -> channelId
const channelStreaming = new Map(); // colleagueId -> {channelId, text}
const channelThinkingStreaming = new Map(); // colleagueId -> {channelId, text}
// colleagueId -> [{kind: 'tool_use'|'thinking', ...}] — a channel turn's
// own version of the 1:1 view's pendingTrail: tool calls collected here
// as they happen instead of landing as their own separate rows (a long
// run of loose, non-scrollable "noran: Bash: …" lines — the exact thing
// the 1:1 trail box already avoids). Moved onto the finished channelMessages item as `item.trail`
// once her reply lands (see the 'channel_message' handler) and rendered
// there the same way MessageRow already renders a 1:1 item's trail —
// this reuses that, no channel-specific rendering needed. Same
// bare-colleagueId keying (and the same cross-channel caveat) as
// channelStreaming/channelThinkingStreaming/channelTyping above — not
// upgraded to channelKey(colleagueId, channelId) here, to stay
// consistent with its neighbors rather than fix that one alone.
const channelPendingTrail = new Map();
// channelKey(colleagueId, channelId) -> {channelId, colleagueId, requestId,
// ...request} — colleagueId alone used to be the whole key, which meant
// a second channel's pending request for the same colleague silently
// overwrote the first's card (never lost server-side — the server still
// tracks it by requestId — but unreachable in this tab, so it just sat
// there unanswered until it timed out or the connection dropped).
const channelPendingPermission = new Map();

// Model/effort/tokens per colleague — one entry regardless
// of whether the numbers came from a 1:1 turn or a channel turn, since
// it's the same underlying session either way (see claude.js: one
// query() call lives for the adapter's whole lifetime). Seeded from
// `api/colleague-stats` on load so a browser reload doesn't show blanks
// until the next message, then kept live by 'session_info'/'usage'
// updates.
const colleagueStats = new Map(); // colleagueId -> {model, effort, inputTokens, outputTokens, totalTokens, costUsd}

// The gatekeeper (see gatekeeper.js) isn't a colleague, so its usage
// doesn't fit colleagueStats' per-colleague shape, so it gets its own
// tally. A running total since the server started, seeded from
// `api/gatekeeper-usage` on load, kept live by 'gatekeeper_usage'.
let gatekeeperUsage = { calls: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 };

// A timestamp on every message. Local wall-clock time
// (browser's own timezone), HH:MM — the same granularity chat apps
// like Slack/iMessage show by default; the exact second isn't
// interesting here, only "when roughly did this land". `createdAt` is
// an ISO string either read back from the store (history/channel-
// history — see selectColleague/selectChannel) or stamped on arrival
// for a live update (see the 'message'/'channel_message' handlers) —
// either way a plain `new Date(...)` parse.
function formatMessageTime(createdAt) {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTokenCount(n) {
  if (typeof n !== 'number') return '?';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function formatCost(usd) {
  return typeof usd === 'number' ? `$${usd.toFixed(4)}` : '–';
}

// Turns a convKey ("colleagueId::sessionId") back into something
// readable — the colleague's name, plus her session's title when it
// isn't the implicit default one.
function describeConvKey(key) {
  const [colleagueId, sessionId] = key.split('::');
  const name = colleaguesById.get(colleagueId)?.name || colleagueId;
  if (sessionId === DEFAULT_SESSION_ID) return name;
  const session = (colleagueSessions.get(colleagueId) || []).find((s) => s.id === sessionId);
  return `${name} — ${session?.title || sessionId}`;
}

// The one-line summary shown per colleague, or null if nothing's known
// about her yet (no turn has completed since the server started).
function statsLine(colleagueId) {
  const stats = colleagueStats.get(colleagueId);
  if (!stats) return null;
  const parts = [];
  if (stats.model) parts.push(stats.model);
  if (stats.effort) parts.push(`effort: ${stats.effort}`);
  if (typeof stats.totalTokens === 'number') parts.push(`${formatTokenCount(stats.totalTokens)} tokens`);
  // The pane header's line carries the cost too; composer-usage (see
  // below) carries the Session %-bar instead of duplicating tokens/cost.
  if (typeof stats.costUsd === 'number') parts.push(formatCost(stats.costUsd));
  return parts.length ? parts.join(' · ') : null;
}

// Toggles auto mode ("Allow-all") for whatever 1:1
// conversation is currently open. Server-authoritative: this only
// sends the request and updates local state optimistically: the
// 'auto_mode_changed' echo (see socket handler above) is what actually
// confirms it, same pattern as everything else here.
function toggleAutoMode() {
  const key = activeConvKey();
  const enabled = !autoModeKeys.has(key);
  if (enabled) autoModeKeys.add(key);
  else {
    autoModeKeys.delete(key);
    // "Turn on autopilot" on a permission card also remembers "every tool" for
    // this conversation in this tab; switching Auto mode off has to withdraw
    // that too, or the tab keeps answering every request with "allow".
    withdrawAllowEverything(key);
  }
  socket.send(JSON.stringify({ type: 'set_auto_mode', colleagueId: activeColleagueId, sessionId: activeSessionId, enabled }));
  renderPaneHeader();
}

// Explicit "turn it on" for the active 1:1 conversation, as opposed to
// the header checkbox's toggle — used by the permission card's
// "Turn on autopilot" button (see permissionCardEl), which should
// never accidentally switch auto mode back off.
function turnOnAutoMode() {
  const key = activeConvKey();
  if (autoModeKeys.has(key)) return;
  autoModeKeys.add(key);
  socket.send(JSON.stringify({ type: 'set_auto_mode', colleagueId: activeColleagueId, sessionId: activeSessionId, enabled: true }));
  renderPaneHeader();
}

// "Kontext zurücksetzen" — the counterpart to the channel backfill
// (server/index.js's `previousTurn`): once a colleague can carry the
// last turn forward on her own, there has to be a deliberate way to
// throw that away again instead of waiting for a server restart. Drops
// the live SDK session server-side; the persisted transcript stays
// (see server/index.js's 'reset_context' handler) — this clears what
// she remembers, not what's on screen.
//
// A subagent panel is that colleague's own
// remembered context too (it exists only because she ran a Task call),
// so resetting her context takes those with it: the server deletes the
// stored windows of this conversation and tells every tab
// (subagent_removed, handled in handleSocketMessage).
function resetContext() {
  if (activeChannelId) {
    socket.send(JSON.stringify({ type: 'reset_context', channelId: activeChannelId }));
    return;
  }
  if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
    socket.send(JSON.stringify({ type: 'reset_context', colleagueId: activeColleagueId, sessionId: activeSessionId }));
  }
}

// Tool names a conversation has been told to stop asking about — keyed
// the same way pendingPermission/channelPendingPermission are (convKey
// for a 1:1, channelKey(colleagueId, channelId) for a channel — bare
// colleagueId would have made "autopilot" for her in one channel
// silently also apply in every other channel she's in). A `'*'` entry means "everything", set by the
// permission card's "Turn on autopilot" button — the channel-side
// equivalent of auto mode, since auto mode itself is only wired
// server-side for 1:1 sessions (see server/index.js's autoModeSessions —
// a channel turn always prompts). Client-only and per-tab: doesn't
// survive a reload, same as the rest of a tool call's ephemeral detail
// (see toolDetailEl) — and unlike real auto mode, has no visible on/off
// state anywhere in the UI (Settings' Auto Mode list only ever reads
// the server-side 1:1 kind); left as-is for now, tracked separately.
const alwaysAllowedTools = new Map();

function isAlwaysAllowed(key, toolName) {
  const allowed = alwaysAllowedTools.get(key);
  return Boolean(allowed && (allowed.has('*') || allowed.has(toolName)));
}

// Drops the "every tool" entry ('*') of a conversation, which "Turn on
// autopilot" adds next to Auto mode; single tools allowed with "Allow always"
// stay.
function withdrawAllowEverything(key) {
  const allowed = alwaysAllowedTools.get(key);
  if (!allowed) return;
  allowed.delete('*');
  if (!allowed.size) alwaysAllowedTools.delete(key);
}
function rememberAlwaysAllowed(key, toolName) {
  if (!alwaysAllowedTools.has(key)) alwaysAllowedTools.set(key, new Set());
  alwaysAllowedTools.get(key).add(toolName);
}

// --- Conversation settings modal --------------------------------------
// Everything that would otherwise clutter the pane header (Auto mode,
// per-member Autopilot, Reset context, search within this one
// conversation, and a destructive "Clear chat") lives behind the ⋮
// button in its own dialog.

function convSettingsAutoModeRowEl(colleague, checked, onChange) {
  const row = document.createElement('label');
  row.className = 'auto-mode-toggle';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = checked;
  checkbox.addEventListener('change', () => onChange(checkbox.checked));
  const nameSpan = document.createElement('span');
  nameSpan.textContent = colleague ? ` ${colleague.name} — auto mode (allow all tools)` : ' Auto mode (allow all tools)';
  row.append(checkbox, nameSpan);
  return row;
}

// Rebuilds the modal's Auto-mode section for whichever conversation is
// open right now — a single row+toggle for a 1:1 (was the header's own
// checkbox), one row per member for a channel (was each member's own
// inline "Autopilot" checkbox in the pane header).
function renderConvSettingsAutoMode() {
  convSettingsAutoModeEl.innerHTML = '';
  if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
    const key = activeConvKey();
    convSettingsAutoModeEl.appendChild(
      convSettingsAutoModeRowEl(null, autoModeKeys.has(key), () => toggleAutoMode())
    );
    return;
  }
  if (activeChannelId) {
    const channel = channelsById.get(activeChannelId);
    for (const id of channel?.memberIds || []) {
      const autopilotKey = channelKey(id, activeChannelId);
      convSettingsAutoModeEl.appendChild(
        convSettingsAutoModeRowEl(colleaguesById.get(id), Boolean(alwaysAllowedTools.get(autopilotKey)?.has('*')), (checked) => {
          if (checked) rememberAlwaysAllowed(autopilotKey, '*');
          else alwaysAllowedTools.delete(autopilotKey);
        })
      );
    }
  }
}

// The model picker for the open 1:1 conversation. The list comes from the
// colleague's own session (what this account can actually use, as the
// SDK reports it), so asking for it starts that session if it is not
// running yet — a second or two, hence the "Loading…" line. A backend
// without a model choice answers `supported: false` and the whole
// section stays hidden. The choice is applied to the running session on
// the server and remembered there (see set_model in server/index.js).
let modelPicker = null; // { colleagueId, sessionId, select, hint, error, confirmed }
async function renderConvSettingsModel() {
  convSettingsModelEl.innerHTML = '';
  modelPicker = null;
  if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
    convSettingsModelSectionEl.hidden = true;
    return;
  }
  const colleagueId = activeColleagueId;
  const sessionId = activeSessionId;
  convSettingsModelSectionEl.hidden = false;
  const loading = document.createElement('p');
  loading.className = 'model-picker__hint';
  loading.textContent = 'Loading models…';
  convSettingsModelEl.appendChild(loading);

  let data;
  try {
    const res = await fetch(`api/models?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`);
    data = await res.json();
  } catch {
    data = { supported: false };
  }
  // The dialog may have been closed or pointed at another conversation
  // while the session was starting.
  if (convSettingsBackdropEl.hidden || colleagueId !== activeColleagueId || sessionId !== activeSessionId) return;
  convSettingsModelEl.innerHTML = '';
  if (!data.supported || !data.models?.length) {
    convSettingsModelSectionEl.hidden = true;
    return;
  }

  const select = document.createElement('select');
  select.id = 'conv-model-select';
  select.setAttribute('aria-label', 'Model');
  for (const model of data.models) {
    const option = document.createElement('option');
    option.value = model.value;
    option.textContent = model.displayName || model.value;
    select.appendChild(option);
  }
  const confirmed = data.models.some((m) => m.value === data.choice) ? data.choice : 'default';
  select.value = data.models.some((m) => m.value === confirmed) ? confirmed : data.models[0].value;

  const hint = document.createElement('p');
  hint.className = 'model-picker__hint';
  const error = document.createElement('p');
  error.className = 'model-picker__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  const showDescription = () => {
    hint.textContent = data.models.find((m) => m.value === select.value)?.description || '';
  };
  showDescription();

  select.addEventListener('change', () => {
    showDescription();
    error.hidden = true;
    select.disabled = true; // until the server confirms or refuses
    socket.send(JSON.stringify({ type: 'set_model', colleagueId, sessionId, model: select.value }));
  });

  convSettingsModelEl.append(select, hint, error);
  modelPicker = { colleagueId, sessionId, select, hint, error, confirmed: select.value };
}

// Sessions are managed in this same dialog, alongside starting a new
// one. They are not listed in the sidebar (see renderSidebar), so this
// section is where all of them live — her main conversation first,
// then every extra one, the open one marked, any other a click away —
// with "+ New session" underneath, where it already was. 1:1 only: a
// channel or a subagent thread has no sessions, so the whole section
// hides there.
function renderConvSettingsNewSession() {
  if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
    convSettingsNewSessionSectionEl.hidden = true;
    return;
  }
  convSettingsNewSessionSectionEl.hidden = false;
  const colleague = colleaguesById.get(activeColleagueId);
  convSettingsNewSessionEl.innerHTML = '';

  const list = document.createElement('ul');
  list.className = 'session-list';
  const entries = [
    { id: DEFAULT_SESSION_ID, title: 'Main conversation' },
    ...(colleagueSessions.get(colleague.id) || []),
  ];
  for (const session of entries) {
    const key = convKey(colleague.id, session.id);
    const isCurrent = session.id === activeSessionId;
    const li = document.createElement('li');
    // Same split as the workforce switcher: the open one is a plain
    // row (nothing to activate), every other one is a button.
    const row = document.createElement(isCurrent ? 'div' : 'button');
    row.className = 'session-list__row' + (isCurrent ? ' session-list__row--current' : '');
    if (!isCurrent) row.type = 'button';
    const title = document.createElement('span');
    title.className = 'session-list__title';
    title.textContent = session.title || 'Untitled session';
    row.appendChild(title);
    if (isCurrent) {
      const tag = document.createElement('span');
      tag.className = 'session-list__tag';
      tag.textContent = 'open';
      row.appendChild(tag);
    }
    // The unread/draft state that used to sit on each session's own
    // sidebar row has to live somewhere a session can still be told
    // apart — here.
    appendUnreadBadge(row, key);
    appendDraftBadge(row, key);
    if (!isCurrent) {
      row.addEventListener('click', () => {
        closeConvSettingsModal();
        selectColleague(colleague, session.id);
      });
    }
    li.appendChild(row);
    list.appendChild(li);
  }
  convSettingsNewSessionEl.appendChild(list);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'secondary-button';
  toggle.innerHTML = '';
  if (showSessionForm.has(colleague.id)) {
    toggle.append(xIconEl(), document.createTextNode(' Cancel'));
  } else {
    toggle.textContent = `+ New session with ${colleague.name}`;
  }
  toggle.addEventListener('click', () => {
    if (showSessionForm.has(colleague.id)) showSessionForm.delete(colleague.id);
    else showSessionForm.add(colleague.id);
    renderConvSettingsNewSession();
  });
  convSettingsNewSessionEl.appendChild(toggle);
  if (showSessionForm.has(colleague.id)) convSettingsNewSessionEl.appendChild(newSessionFormEl(colleague));
}

// Search within the already-open conversation — no server round trip:
// `history` already holds every message this conversation has loaded
// (see selectColleague's own fetch), which is exactly what's on screen.
// A global, cross-conversation search is a separate feature (see
// runSidebarSearch below, which does need the server — most
// conversations were never opened this session).
function renderConvSearchResults(query) {
  convSearchResultsEl.innerHTML = '';
  const q = query.trim().toLowerCase();
  if (!q) return;
  // Channel transcripts live in channelMessages, not history —
  // activeConvKey() returns null for a channel, so this used to search
  // an empty array there and report "No matches" for every channel,
  // regardless of what was actually on screen.
  const raw = activeChannelId ? (channelMessages.get(activeChannelId) || []) : (history.get(activeConvKey()) || []);
  const items = raw
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.text && item.text.toLowerCase().includes(q));
  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-note';
    li.textContent = 'No matches in this conversation.';
    convSearchResultsEl.appendChild(li);
    return;
  }
  for (const { item, index } of items) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'settings-list__label';
    // 1:1 items carry `role`; channel items carry `senderId` instead
    // (see channelMessages) — same two cases renderChannelMessages
    // itself switches on.
    // Same defect either side: a raw internal value shown as if it were
    // a name. Channel items carry `senderId`; a 1:1 item's own role was
    // literally the string "assistant" (whatever the adapter calls it),
    // which read as "assistant: ..." in every result instead of her name.
    const who = activeChannelId
      ? (item.senderId === 'you' ? 'You' : item.senderId === 'system' ? 'System' : colleaguesById.get(item.senderId)?.name || item.senderId)
      : (item.role === 'you' ? 'You' : colleaguesById.get(activeColleagueId)?.name || item.role);
    label.textContent = `${who}: ${truncatePreview(item.text, 80)}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Jump';
    button.addEventListener('click', () => {
      closeConvSettingsModal();
      jumpToMessage(index);
    });
    li.append(label, button);
    convSearchResultsEl.appendChild(li);
  }
}

// `.message` elements render 1:1 with `history.get(key)`'s own order
// (see the Messages component) — no separate id to look up, the array
// index the search above already has is also the child index here.
function jumpToMessage(index) {
  const node = messagesEl.querySelectorAll('.message')[index];
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  node.classList.add('message--highlight');
  setTimeout(() => node.classList.remove('message--highlight'), 1600);
}

convSearchInputEl.addEventListener('input', () => renderConvSearchResults(convSearchInputEl.value));

const convSearchPanelEl = document.getElementById('conv-search-panel');
const convSearchCloseEl = document.getElementById('conv-search-close');
let convSearchOpener = null;

function openConvSearchPanel(opener) {
  convSearchOpener = opener || document.activeElement;
  convSearchPanelEl.hidden = false;
  convSearchInputEl.value = '';
  convSearchResultsEl.innerHTML = '';
  convSearchInputEl.focus();
}

function closeConvSearchPanel() {
  if (convSearchPanelEl.hidden) return;
  convSearchPanelEl.hidden = true;
  convSearchInputEl.value = '';
  convSearchResultsEl.innerHTML = '';
  // renderPaneHeader rebuilds the toggle button on every render (a new
  // element each time), so there is nothing to hold a lasting reference
  // to — look it up fresh. At most one exists at a time.
  document.querySelector('.pane-header__search-toggle')?.setAttribute('aria-expanded', 'false');
  if (convSearchOpener?.isConnected) convSearchOpener.focus?.();
  convSearchOpener = null;
}

convSearchCloseEl.addEventListener('click', closeConvSearchPanel);
convSearchPanelEl.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { event.preventDefault(); closeConvSearchPanel(); }
});

// Two-step in place of a native confirm() (see index.html's own comment
// on #conv-clear-chat): tracked as a plain boolean rather than a
// one-shot listener pair — a one-shot "next click anywhere disarms"
// listener sounds equivalent but isn't: it leaves the *original* click
// listener still attached after a disarming click elsewhere, so a
// later click on the now-normal-looking button would fire it with no
// second confirmation actually shown. A boolean plus one persistent
// listener each has no such stale-listener trap.
let clearChatArmed = false;

function disarmClearChat() {
  clearChatArmed = false;
  convClearChatLabelEl.textContent = 'Clear chat';
  convClearChatEl.classList.remove('danger-button--armed');
}

convClearChatEl.addEventListener('click', (event) => {
  // Without this, the bubbled click would also reach the modal-wide
  // "click elsewhere disarms" listener below and immediately undo the
  // arming this same click just did.
  event.stopPropagation();
  if (!clearChatArmed) {
    clearChatArmed = true;
    convClearChatLabelEl.textContent = 'Really clear? Click again';
    convClearChatEl.classList.add('danger-button--armed');
    return;
  }
  disarmClearChat();
  if (activeChannelId) {
    socket.send(JSON.stringify({ type: 'clear_chat', channelId: activeChannelId }));
  } else if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
    socket.send(JSON.stringify({ type: 'clear_chat', colleagueId: activeColleagueId, sessionId: activeSessionId }));
  }
});
// A click anywhere else in the modal (including its own close button)
// disarms instead of firing — otherwise a stray click right after
// arming could clear a chat nobody meant to clear.
convSettingsModalEl.addEventListener('click', () => {
  if (clearChatArmed) disarmClearChat();
});

convResetContextEl.addEventListener('click', () => {
  resetContext();
  closeConvSettingsModal();
});

// --- Dialog focus handling, shared by all three modals ------------------
//
// Every one of them used to do nothing but flip `hidden`. That leaves the
// focus sitting on the button behind the backdrop: Escape did nothing,
// the only way to reach the close button was to tab forward through the
// whole dialog, and Tab kept right on going out the back into the
// sidebar and composer that the overlay is covering. One helper here
// rather than the same four lines pasted into each open/close pair.
const FOCUSABLE = [
  'a[href]', 'button:not(:disabled)', 'input:not(:disabled)',
  'select:not(:disabled)', 'textarea:not(:disabled)', '[tabindex]:not([tabindex="-1"])',
].join(',');

// What to hand focus back to once the dialog closes. Keyed by backdrop so
// two dialogs can never overwrite each other's answer.
const dialogOpener = new WeakMap();

function focusablesIn(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function openDialog(backdropEl, modalEl) {
  dialogOpener.set(backdropEl, document.activeElement);
  backdropEl.hidden = false;
  // The close button rather than the first field: opening Settings should
  // not drop the caret into the "add a workforce" path box, and the exit
  // is the one control every dialog has.
  const target = modalEl.querySelector('[data-dialog-close]') || focusablesIn(modalEl)[0] || modalEl;
  target.focus?.();
}

function closeDialog(backdropEl) {
  backdropEl.hidden = true;
  const opener = dialogOpener.get(backdropEl);
  dialogOpener.delete(backdropEl);
  // Only if it is still on the page and still visible — renderPaneHeader
  // rebuilds the pane header (and with it the button that opened the
  // conversation dialog) on every roster update.
  if (opener?.isConnected && opener.offsetParent !== null) opener.focus?.();
}

// Topmost open dialog. The lightbox sits above the others (z-index 20 vs
// 10 in styles.css), so it answers Escape first when both are open.
function topmostDialog() {
  if (!imageLightboxEl.hidden) return { backdrop: imageLightboxEl, modal: imageLightboxEl, close: closeImageLightbox };
  if (!convSettingsBackdropEl.hidden) return { backdrop: convSettingsBackdropEl, modal: convSettingsModalEl, close: closeConvSettingsModal };
  if (!settingsBackdropEl.hidden) return { backdrop: settingsBackdropEl, modal: settingsModalEl, close: closeSettingsModal };
  if (!diffBackdropEl.hidden) return { backdrop: diffBackdropEl, modal: diffModalEl, close: closeDiffModal };
  return null;
}

document.addEventListener('keydown', (event) => {
  const open = topmostDialog();
  if (!open) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    open.close();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusablesIn(open.modal);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  // Wrap at both ends, and pull focus back in if it has already escaped
  // (it has, whenever the dialog opened before this handler existed).
  if (!open.modal.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function openConvSettingsModal() {
  if (activeChannelId) {
    convSettingsTitleEl.textContent = `#${channelsById.get(activeChannelId)?.name || activeChannelId} settings`;
  } else {
    convSettingsTitleEl.textContent = `${colleaguesById.get(activeColleagueId)?.name || activeColleagueId} settings`;
  }
  renderConvSettingsAutoMode();
  renderConvSettingsNewSession();
  renderConvSettingsWorktree();
  disarmClearChat();
  openDialog(convSettingsBackdropEl, convSettingsModalEl);
  // After the dialog is open, not before: it fetches, and checks on its
  // way back that the dialog is still the one that asked.
  renderConvSettingsModel();
}

function closeConvSettingsModal() {
  disarmClearChat();
  closeDialog(convSettingsBackdropEl);
}

convSettingsCloseEl.addEventListener('click', closeConvSettingsModal);
convSettingsBackdropEl.addEventListener('click', (event) => {
  if (event.target === convSettingsBackdropEl) closeConvSettingsModal();
});

// One entry per colleague, active in the current view — a single line
// for a 1:1 thread (plus the auto-mode toggle, which only makes sense
// for a real, standing 1:1 session — not a channel, not a one-off
// subagent exchange), one line per member for a channel (several
// colleagues' stats are relevant there at once).
// What `api/worktree` says per 1:1 conversation key: {available, worktree}.
// Loaded on demand (first time the header or the settings need
// it), not with the roster.
const worktreeInfo = new Map();
const worktreeInfoLoading = new Set();
async function loadWorktreeInfo(colleagueId, sessionId, { force = false } = {}) {
  const key = convKey(colleagueId, sessionId);
  if (worktreeInfoLoading.has(key) || (worktreeInfo.has(key) && !force)) return;
  worktreeInfoLoading.add(key);
  try {
    const res = await fetch(
      `api/worktree?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
    );
    worktreeInfo.set(key, await res.json());
  } catch {
    worktreeInfo.set(key, { available: false, worktree: null });
  } finally {
    worktreeInfoLoading.delete(key);
  }
  if (key === activeConvKey()) {
    renderPaneHeader();
    if (!convSettingsBackdropEl.hidden) renderConvSettingsWorktree();
  }
}

// The settings section that moves the open 1:1 conversation into its own
// worktree. Hidden for channels, subagent threads and folders that are not
// a workforce id to keep the worktree under. The folder to branch from is
// the workforce folder, or a repo path typed here.
let worktreeForm = null; // { button, error } while the section shows the button
async function renderConvSettingsWorktree() {
  convSettingsWorktreeEl.innerHTML = '';
  worktreeForm = null;
  if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
    convSettingsWorktreeSectionEl.hidden = true;
    return;
  }
  const colleagueId = activeColleagueId;
  const sessionId = activeSessionId;
  const key = convKey(colleagueId, sessionId);
  if (!worktreeInfo.has(key)) {
    await loadWorktreeInfo(colleagueId, sessionId);
    return; // loadWorktreeInfo re-renders this section once it has the answer
  }
  const info = worktreeInfo.get(key);
  if (!info.available) {
    convSettingsWorktreeSectionEl.hidden = true;
    return;
  }
  convSettingsWorktreeSectionEl.hidden = false;
  const hint = document.createElement('p');
  hint.className = 'model-picker__hint';
  if (info.worktree) {
    hint.textContent =
      `Repo: ${info.worktree.repoName || 'unknown'}. Branch: ${info.worktree.branch}. ` +
      `Worktree folder: ${info.worktree.path}.`;
    convSettingsWorktreeEl.append(hint);
    return;
  }
  hint.textContent =
    'Creates a git worktree and a branch for this conversation. She keeps what she knows and works there from her next message on. There is no way back from here yet. One worktree per conversation. Leave the path empty for the folder this chat was started in; for another repo, enter its absolute path.';
  const pathInput = document.createElement('input');
  pathInput.type = 'text';
  pathInput.placeholder = 'Repo path (empty: the folder this chat was started in)';
  pathInput.setAttribute('aria-label', 'Repo path');
  pathInput.spellcheck = false;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Work in its own worktree';
  const error = document.createElement('p');
  error.className = 'model-picker__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  button.addEventListener('click', () => {
    error.hidden = true;
    button.disabled = true; // until the server answers
    const repoPath = pathInput.value.trim();
    socket.send(JSON.stringify({ type: 'use_worktree', colleagueId, sessionId, ...(repoPath ? { repoPath } : {}) }));
  });
  convSettingsWorktreeEl.append(pathInput, button, hint, error);
  worktreeForm = { colleagueId, sessionId, button, error };
}

function renderPaneHeader() {
  paneHeaderEl.innerHTML = '';
  let hasContent = false;

  // Everything that wraps goes inside this, so the header itself only
  // ever has three children: avatar, this, and the ⋮ button. Before,
  // the entries and the button were siblings in one wrapping flex row,
  // and the button — which carries `margin-left: auto` to sit far right
  // — was pushed onto a line of its own as soon as the entries filled
  // the first one. That left a 122px-tall header at 320px with a lone ⋮
  // floating under the stats.
  const entries = document.createElement('div');
  entries.className = 'pane-header__entries';

  if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
    const key = activeConvKey();
    // Her photo is not repeated in every message bubble
    // (see MessageRow/StreamingRow); it lives here instead, once per
    // conversation, the way a 1:1 thread only ever needs it once.
    paneHeaderEl.appendChild(avatarEl(colleaguesById.get(activeColleagueId)));
    // Her sessions have no sidebar rows any more (see renderSidebar),
    // so this is the one place on screen that says which of them you're
    // in. Only for an extra session — the main conversation is the
    // default and needs no label. A button, because the next thing you
    // want after reading it is usually the list it came from.
    if (activeSessionId && activeSessionId !== DEFAULT_SESSION_ID) {
      const session = (colleagueSessions.get(activeColleagueId) || []).find((s) => s.id === activeSessionId);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pane-header__session';
      chip.textContent = session?.title || 'Untitled session';
      chip.title = 'Sessions with this colleague';
      chip.addEventListener('click', openConvSettingsModal);
      entries.appendChild(chip);
    }
    // The branch of this conversation's own worktree, and only that: a
    // conversation without one has no branch of its own, and the folder the
    // chat was started in says nothing about where she is working (she can
    // work in another repo). Loaded when first needed (see loadWorktreeInfo).
    const info = worktreeInfo.get(key);
    if (!info) loadWorktreeInfo(activeColleagueId, activeSessionId);
    if (info?.worktree) {
      const chip = document.createElement('span');
      chip.className = 'pane-header__branch';
      chip.textContent = info.worktree.branch;
      chip.title = info.worktree.repoName
        ? `Branch of this conversation's own worktree in ${info.worktree.repoName}`
        : "Branch of this conversation's own worktree";
      entries.appendChild(chip);
    }
    const line = statsLine(key);
    if (line) {
      const span = document.createElement('span');
      span.className = 'pane-header__entry';
      span.appendChild(document.createTextNode(line));
      entries.appendChild(span);
    }
    paneHeaderEl.classList.toggle('pane-header--auto-mode', autoModeKeys.has(key));
    hasContent = true;
  } else {
    paneHeaderEl.classList.remove('pane-header--auto-mode');
    if (activeChannelId) {
      // A single summed value across all members — one line
      // per member (name + her own model/tokens/cost) crowded the header
      // in any channel with more than one or two people. A single total
      // across every member answers the question the header is actually
      // for ("was hat dieser Kanal gekostet") without the per-person
      // breakdown, which still lives in the usage table (see usageRowEl).
      const channel = channelsById.get(activeChannelId);
      let totalTokens = 0;
      let totalCost = 0;
      let hasStats = false;
      for (const id of channel?.memberIds || []) {
        const stats = colleagueStats.get(convKey(id, DEFAULT_SESSION_ID));
        if (!stats) continue;
        if (typeof stats.totalTokens === 'number') { totalTokens += stats.totalTokens; hasStats = true; }
        if (typeof stats.costUsd === 'number') { totalCost += stats.costUsd; hasStats = true; }
      }
      if (hasStats) {
        const span = document.createElement('span');
        span.className = 'pane-header__entry';
        span.appendChild(document.createTextNode(`${formatTokenCount(totalTokens)} tokens · ${formatCost(totalCost)}`));
        entries.appendChild(span);
        hasContent = true;
      }
    }
  }
  // Account-wide plan usage, sitting with the other countable things
  // rather than on its own strip above the composer. It is not per-conversation, so it renders whenever the
  // header has any content at all, 1:1 or channel alike.
  if (hasContent && planUsage && typeof planUsage.utilization === 'number') {
    entries.appendChild(usageLimitRowEl('Session (5h)', planUsage, { compact: true }));
  }
  if (entries.childElementCount) paneHeaderEl.appendChild(entries);

  // Fixed to the right-hand corner regardless of how much (or little)
  // wraps in .pane-header__entries next to it — grouped in one element
  // so `margin-left: auto` in styles.css only has to be set once, not
  // once per button, and so a fourth action later has somewhere to go
  // without another round of this.
  if (activeChannelId || (activeColleagueId && !isSubagentThread(activeColleagueId))) {
    const actions = document.createElement('div');
    actions.className = 'pane-header__actions';

    // Lives here rather than in the ⋮ dialog — "Search in this chat"
    // would be three taps deep for something reached for mid-read, and closed
    // itself after every hit. A toggle next to the icon it already
    // matches in #sidebar-search, not a new visual language.
    const searchToggle = document.createElement('button');
    searchToggle.type = 'button';
    searchToggle.className = 'pane-header__search-toggle';
    searchToggle.setAttribute('aria-label', 'Search this conversation');
    searchToggle.setAttribute('aria-expanded', 'false');
    searchToggle.setAttribute('aria-controls', 'conv-search-panel');
    searchToggle.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchToggle.addEventListener('click', () => {
      searchToggle.setAttribute('aria-expanded', 'true');
      openConvSearchPanel(searchToggle);
    });
    actions.appendChild(searchToggle);

    // Opens the conversation settings dialog, which holds the Auto-mode
    // checkbox and Reset context button (see openConvSettingsModal/
    // renderConvSettingsAutoMode below; the channel's per-member
    // Autopilot checkboxes live there too).
    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'pane-header__menu';
    menuButton.title = 'Conversation settings';
    menuButton.setAttribute('aria-label', 'Conversation settings');
    // An inline SVG instead of the raw glyph "⋮" (see xIconEl's own
    // note). Three filled dots rather
    // than this app's usual bare stroke: a ring drawn in outline at
    // stroke-width 2 is nearly invisible at this size, and a filled dot
    // is the shape every "more actions" menu already uses. Documented
    // as a deliberate exception in DESIGN.md's asset table, not a
    // shortcut back to a font glyph.
    menuButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
    menuButton.addEventListener('click', openConvSettingsModal);
    actions.appendChild(menuButton);

    paneHeaderEl.appendChild(actions);
    hasContent = true;
  }
  paneHeaderEl.hidden = !hasContent;
  // A conversation switch invalidates whatever the search panel was
  // showing — close it rather than leaving stale results from the
  // conversation the reader just left.
  closeConvSearchPanel();
}

// There is deliberately no strip above the composer. It would hold a permanent, account-wide number in the one place where the
// screen is scarcest — directly over the text field on a phone — for a
// figure that only moves every few hours, and it would appear mid-work
// the first time a colleague replied, shifting the layout under the
// reader. The readout lives in the pane header now, with the model, token and
// cost figures it belongs beside (see renderPaneHeader).

// Claude's own claude.ai-plan rate-limit utilization (see
// server/index.js's api/usage-limits, backed by claude.js's
// getRateLimits() — an experimental SDK API, best-effort by design,
// same caveat as Settings' own usage-limits section). Only the
// five_hour ("session") window,
// not the weekly ones Settings already shows in full. `null` until a
// colleague's adapter has actually run once this session (see
// getRateLimits' own "message a colleague first" note) or if the
// account has no plan limits to report at all (API key/Bedrock/Vertex).
let planUsage = null;
async function refreshPlanUsage() {
  try {
    const res = await fetch('api/usage-limits');
    const data = await res.json();
    planUsage = data.rateLimits?.five_hour || null;
  } catch {
    planUsage = null;
  }
  renderPaneHeader();
}
let pendingAttachment = null; // {name, mimeType, data (base64), dataUrl} for the next message, or null
let colleaguesList = []; // roster in display order, for rebuilding the sidebar
// colleagueId -> {id, name, role, hasAvatar, avatarId?} — real colleagues
// from the roster, plus a synthetic entry per subagent exchange (see
// subagent_start below), all read the exact same way by avatarEl,
// renderMessages, selectColleague, etc.
const colleaguesById = new Map();
const history = new Map(); // colleagueId -> [{role, text, attachments?}]
// ownerColleagueId -> Map(subagentId -> {id, ownerColleagueId, knownColleagueId,
// subagentType, taskDescription, closed, syntheticId}) — bookkeeping for the
// sidebar's nested entries. The actual conversation lives in `history` under
// `syntheticId`, exactly like any other colleague's.
const subagentPanels = new Map();
const streaming = new Map(); // colleagueId -> accumulated text of the in-progress reply
const thinkingStreaming = new Map(); // colleagueId -> accumulated extended-thinking text of the in-progress turn
// colleagueId -> [{kind: 'tool_use'|'thinking', ...}] — everything a turn did
// on the way to its reply, in order. This collapses into
// one small, scrollable box ahead of the reply instead of a run of
// separate bubbles (tool call, then reasoning, then the answer, each its
// own row) — one box, still positioned above the reply, same place the
// reasoning always read. Filled live as tool_use/thinking_delta updates
// arrive, moved onto the finished message item (see the 'message' case)
// and cleared once there.
const pendingTrail = new Map();

// A colleague (or one of her nested sessions/subagent panels — anything
// with its own `history`/`streaming` key) is "typing" for as long as any
// of these three maps holds something for that key: `streaming` once her
// reply text starts landing, `thinkingStreaming`/`pendingTrail` often
// earlier still, while she's still reasoning or mid tool call. This is
// visible in the sidebar, not just inside whichever
// conversation happens to be open — see the `wasTyping` checks around
// the socket handler's delta/thinking_delta/tool_use cases below, which
// call renderSidebar() only on the false→true transition instead of on
// every token.
// A message written while the colleague was mid-turn (`pending`) is read by
// her only after the turn that was running: when that turn is over, the
// message takes its place behind everything she has said meanwhile.
function settleWaiting(list) {
  const waiting = list.filter((m) => m.pending);
  if (!waiting.length) return;
  const rest = list.filter((m) => !m.pending);
  for (const m of waiting) delete m.pending;
  list.length = 0;
  list.push(...rest, ...waiting);
}

function isChannelBusy(channelId) {
  for (const typingIn of channelTyping.values()) if (typingIn === channelId) return true;
  return false;
}

// Nobody is writing in this channel any more: whatever was written in the
// meantime is read from now on.
function settleChannelIfIdle(channelId) {
  if (isChannelBusy(channelId)) return;
  const list = channelMessages.get(channelId);
  if (list) settleWaiting(list);
}

function isTyping(key) {
  return streaming.has(key) || thinkingStreaming.has(key) || pendingTrail.has(key);
}

// A one-line summary of a tool call's input, the way the native apps
// show it ("Bash: pwd; find …") instead of just the bare tool name —
// otherwise a colleague's "thinking" shows as several unlabeled
// "Using Bash…" lines in a row.
function toolInputSummary(input) {
  if (!input) return '';
  const value = input.command ?? input.file_path ?? input.path ?? input.pattern ?? input.query;
  const text = typeof value === 'string' ? value : JSON.stringify(input);
  return text.length > 80 ? text.slice(0, 80) + '…' : text;
}

// The one-line label for a tool-use trail entry ("Bash: pwd" or, when
// toolInputSummary has nothing to show, "Using Bash…") — factored out
// once three call sites needed the exact same expression: building a
// live trail entry (1:1 and channel) and, since persisted trails only
// store {name, input} (see store.js's messages.trail column), rebuilding
// the same label when a saved history loads back in (see selectColleague).
function toolUseLine(name, input) {
  const summary = toolInputSummary(input);
  return summary ? `${name}: ${summary}` : `Using ${name}…`;
}

// A persisted trail (store.js's messages.trail — [{kind:'tool_use', name,
// input}] | [{kind:'thinking', text}]) only carries the raw fields, not
// the rendered label — TrailBox wants the exact same {kind, text,
// toolName, toolInput} shape a live trail entry has (see the 'tool_use'
// cases above), so a tool-use entry gets its label rebuilt through the
// same toolUseLine() a live one uses; a thinking entry already has its
// text and passes through unchanged. Undefined (not []) for "no trail" —
// matches item.trail's own undefined-when-empty convention elsewhere.
function reconstructTrail(trail) {
  if (!trail?.length) return undefined;
  return trail.map((entry) =>
    entry.kind === 'tool_use'
      ? { kind: 'tool_use', text: toolUseLine(entry.name, entry.input), toolName: entry.name, toolInput: entry.input, approval: entry.approval }
      : entry
  );
}
// Conversation keys whose stored transcript has been fetched (or emptied),
// as opposed to keys that only have an entry because a live update arrived.
const loadedHistory = new Set();
const pendingPermission = new Map(); // colleagueId -> {requestId, toolName, title, displayName, description, input}

// --- "Einstellungsprozess-Modus" ---------------------------------
// When a colleague starts a hiring process, the chat
// should visually detach from the ordinary conversation. A colleague's
// own text triggers it via a small marker protocol: a line containing
// exactly `:::mode hiring-process:start` opens the mode for that
// conversation, `:::mode hiring-process:end` closes it. Neither line
// is a real message — both are stripped out before the text is shown
// or stored.
// Juno's own profile.md (team/juno/profile.md) now instructs her to
// emit these — start once Phase 1 (needs assessment) has actually
// cleared and the process really begins, end once probation begins or
// she's told to stop. Scoped to Juno only for this repo;
// a colleague elsewhere in a different install (e.g. a
// dedicated HR colleague like Ada in another workforce) would need
// the same instruction added to her own profile if wanted there too.
const HIRING_MODE_START = /^:::mode hiring-process:start\s*$/m;
const HIRING_MODE_END = /^:::mode hiring-process:end\s*$/m;
const hiringModeConversations = new Set(); // convKey (or channelId) currently in hiring-process mode

function applyHiringModeMarkers(key, text) {
  let result = text;
  if (HIRING_MODE_START.test(result)) {
    hiringModeConversations.add(key);
    result = result.replace(HIRING_MODE_START, '').trim();
  }
  if (HIRING_MODE_END.test(result)) {
    hiringModeConversations.delete(key);
    result = result.replace(HIRING_MODE_END, '').trim();
  }
  return result;
}

function refreshHiringModeStyling(key) {
  paneEl.classList.toggle('pane--hiring-mode', hiringModeConversations.has(key));
  hiringModeBannerEl.hidden = !hiringModeConversations.has(key);
}

// --- Desktop notifications ----------------------------------------
// Notifications for when the chat isn't focused. Best-effort: some browsers only grant
// Notification permission off a real user gesture, so this both tries
// proactively on load (harmless no-op where that's blocked) and offers
// an explicit button (see notify-permission-button) for when it is.
function isConversationVisible(key) {
  return document.hasFocus() && key === activeConvKey();
}

function notify(title, body, onClick) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  // No document.hasFocus() check here on purpose: both call sites
  // already decide precisely (focused tab *and* looking at this exact
  // conversation), which is finer-grained than "the tab has focus at
  // all". A blanket focus check here used to override that and swallow
  // every notification for a background channel/DM while the tab was
  // simply open somewhere else — notifications would never fire
  // during normal use, only once the whole browser lost focus.
  const n = new Notification(title, { body, icon: 'logo.png' });
  n.onclick = () => {
    window.focus();
    onClick?.();
    n.close();
  };
}

function refreshNotifyPermissionButton() {
  if (!('Notification' in window)) {
    notifyPermissionButtonEl.hidden = true;
    return;
  }
  notifyPermissionButtonEl.hidden = Notification.permission !== 'default';
}

// --- Settings & usage modal ----------------------------------------
// One modal, three sections: token/cost usage per colleague (+ the
// gatekeeper's own, which isn't a colleague),
// which sessions currently have auto mode on (with a way to turn one
// off without having to go find that conversation first), and the
// notification-permission status. Re-rendered on open and again
// whenever the underlying data changes while it's open (see the
// `!settingsBackdropEl.hidden` checks at each call site below).
// A `<tr>` for one usage row — `who` is either a colleague (gets her
// real avatar, for quick recognition instead of reading names one by
// one) or a plain label (the Gatekeeper row, which isn't a colleague).
function usageRowEl({ colleague, label, model, effort, tokens, cost, className }) {
  const row = document.createElement('tr');
  if (className) row.className = className;

  const whoCell = document.createElement('td');
  whoCell.className = 'usage-table__who';
  if (colleague) whoCell.appendChild(avatarEl(colleague));
  whoCell.appendChild(document.createTextNode(label));
  row.appendChild(whoCell);

  // Tokens and cost come before model and effort. The table is wider
  // than a phone can show (394px of columns against 311px of dialog at
  // a 390px viewport) and whatever sits on the right is what scrolls
  // out of sight. Those should be the numbers the section exists to
  // show, not Model and Effort, which nobody opens this to read.
  const tokensCell = document.createElement('td');
  tokensCell.className = 'usage-table__number';
  tokensCell.textContent = formatTokenCount(tokens);
  row.appendChild(tokensCell);

  const costCell = document.createElement('td');
  costCell.className = 'usage-table__number';
  costCell.textContent = formatCost(cost);
  row.appendChild(costCell);

  const modelCell = document.createElement('td');
  modelCell.className = 'usage-table__model';
  modelCell.textContent = model || '–';
  row.appendChild(modelCell);

  const effortCell = document.createElement('td');
  effortCell.textContent = effort || '–';
  row.appendChild(effortCell);

  return row;
}

function renderUsageTable() {
  usageTableEl.innerHTML = '';
  // A real <thead>, and `scope` on each header cell. Rows appended
  // straight to <table> land in an anonymous row group, not a <tbody>
  // element — so `#usage-table tbody tr:nth-child(odd)` in styles.css
  // would match nothing at all (querySelector('tbody') is null), so the
  // zebra striping would be dead code; this is what it is written
  // against. `scope` matters
  // more here than in most tables, because these cells scroll out of
  // view one by one and the column they belong to is the thing a reader
  // needs to recover.
  const thead = document.createElement('thead');
  const head = document.createElement('tr');
  head.innerHTML = '<th scope="col">Who</th><th scope="col" class="usage-table__number">Tokens</th>' +
    '<th scope="col" class="usage-table__number">Cost</th><th scope="col">Model</th><th scope="col">Effort</th>';
  thead.appendChild(head);
  usageTableEl.appendChild(thead);
  const tbody = document.createElement('tbody');
  usageTableEl.appendChild(tbody);

  let totalTokens = 0;
  let totalCost = 0;
  for (const [key, stats] of colleagueStats) {
    const tokens = typeof stats.totalTokens === 'number' ? stats.totalTokens : 0;
    const cost = typeof stats.costUsd === 'number' ? stats.costUsd : 0;
    totalTokens += tokens;
    totalCost += cost;
    const [colleagueId] = key.split('::');
    tbody.appendChild(usageRowEl({
      colleague: colleaguesById.get(colleagueId),
      label: describeConvKey(key),
      model: stats.model,
      effort: stats.effort,
      tokens,
      cost,
    }));
  }

  totalTokens += gatekeeperUsage.totalTokens || 0;
  totalCost += gatekeeperUsage.costUsd || 0;
  tbody.appendChild(usageRowEl({
    // The row is a count, and a count of one is singular in the language
    // this interface is written in.
    label: `Gatekeeper (${gatekeeperUsage.calls || 0} ${gatekeeperUsage.calls === 1 ? 'call' : 'calls'})`,
    model: 'haiku',
    tokens: gatekeeperUsage.totalTokens || 0,
    cost: gatekeeperUsage.costUsd,
  }));

  tbody.appendChild(usageRowEl({
    label: 'Total',
    tokens: totalTokens,
    cost: totalCost,
    className: 'usage-table__total',
  }));

  // The headline number, front and center, above the row-by-row
  // breakdown — the user shouldn't have to add up a column by eye to
  // answer "how much has this cost so far".
  usageSummaryEl.innerHTML = '';
  const tokensBig = document.createElement('span');
  tokensBig.className = 'usage-summary__figure';
  tokensBig.textContent = formatTokenCount(totalTokens) + ' tokens';
  const costBig = document.createElement('span');
  costBig.className = 'usage-summary__figure';
  costBig.textContent = formatCost(totalCost);
  usageSummaryEl.append(tokensBig, document.createTextNode(' · '), costBig);
}

function renderAutoModeList() {
  autoModeListEl.innerHTML = '';
  if (autoModeKeys.size === 0) {
    const li = document.createElement('li');
    li.className = 'empty-note';
    // Deliberately narrower than "nothing is on autopilot": this list
    // only ever reads the server-side 1:1 auto mode (autoModeKeys). A
    // channel's own "Turn on autopilot" lives in alwaysAllowedTools and
    // has no representation here at all, so a blanket "nothing is on
    // autopilot" would claim something about the whole app that this
    // list cannot back.
    li.textContent = 'No one-to-one conversation has auto mode on right now. Channel autopilot is not listed here.';
    autoModeListEl.appendChild(li);
    return;
  }
  for (const key of autoModeKeys) {
    const [colleagueId] = key.split('::');
    const li = document.createElement('li');
    li.appendChild(avatarEl(colleaguesById.get(colleagueId)));
    const label = document.createElement('span');
    label.className = 'settings-list__label';
    label.textContent = describeConvKey(key);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Turn off';
    button.addEventListener('click', () => {
      const [colleagueId, sessionId] = key.split('::');
      autoModeKeys.delete(key);
      socket.send(JSON.stringify({ type: 'set_auto_mode', colleagueId, sessionId, enabled: false }));
      renderAutoModeList();
      if (key === activeConvKey()) renderPaneHeader();
    });
    li.append(label, button);
    autoModeListEl.appendChild(li);
  }
}

function renderSettingsNotifyRow() {
  settingsNotifyRowEl.innerHTML = '';
  if (!('Notification' in window)) {
    settingsNotifyRowEl.textContent = 'Not supported in this browser.';
    return;
  }
  // Was `Status: ${Notification.permission}` — the raw Web API enum, so
  // this row read "Status: denied" or, worse, "Status: default", which
  // means "not asked yet" and reads like "the standard setting". And on
  // "denied" the Enable button below is correctly withheld
  // (requestPermission() cannot undo a denial), which left the row as a
  // diagnosis with no way out of it.
  const STATE_TEXT = {
    granted: 'Notifications are on.',
    denied: 'Notifications are blocked for this site. Browsers only let you undo that in their own site settings, not from a page — look for notification permissions there.',
    default: 'Notifications are off. Turn them on to hear about replies while this window is in the background.',
  };
  settingsNotifyRowEl.append(document.createTextNode(STATE_TEXT[Notification.permission] || `Status: ${Notification.permission}`));
  if (Notification.permission === 'default') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Enable';
    button.style.marginLeft = '0.5rem';
    button.addEventListener('click', () => {
      Notification.requestPermission().then(() => {
        refreshNotifyPermissionButton();
        renderSettingsNotifyRow();
      });
    });
    settingsNotifyRowEl.appendChild(button);
  }
}

function formatResetAt(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

// Claude.ai plan rate-limit (session and weekly) utilization, not this app's own token/cost tally (that's the table
// above). `window` is one of `SDKControlGetUsageResponse.rate_limits`'s
// entries: `{utilization: number|null, resets_at: string|null}`.
const USAGE_LIMIT_LABELS = {
  five_hour: 'Session (5h)',
  seven_day: 'Weekly',
  seven_day_oauth_apps: 'Weekly · OAuth apps',
  seven_day_opus: 'Weekly · Opus',
  seven_day_sonnet: 'Weekly · Sonnet',
  seven_day_overage_included: 'Weekly · overage-included',
};

// `compact`: the small, right-aligned variant used in the pane header (see
// renderPaneHeader) instead of Settings' own full-width row — same
// structure, sized down and non-stretching via .usage-limit-row--compact
// in styles.css.
function usageLimitRowEl(label, window, { compact = false } = {}) {
  const row = document.createElement('div');
  row.className = 'usage-limit-row' + (compact ? ' usage-limit-row--compact' : '');
  const labelEl = document.createElement('span');
  labelEl.className = 'usage-limit-row__label';
  labelEl.textContent = label;
  const pct = typeof window.utilization === 'number' ? Math.max(0, Math.min(100, window.utilization)) : null;
  const barOuter = document.createElement('div');
  barOuter.className = 'usage-limit-row__bar';
  const barInner = document.createElement('div');
  barInner.className = 'usage-limit-row__bar-fill';
  if (pct !== null && pct >= 90) barInner.classList.add('usage-limit-row__bar-fill--critical');
  barInner.style.width = (pct ?? 0) + '%';
  barOuter.appendChild(barInner);
  const detail = document.createElement('span');
  detail.className = 'usage-limit-row__detail';
  const resets = formatResetAt(window.resets_at);
  // The full "NN% · resets Fr., 13:40" detail (this row's
  // `white-space: nowrap`, fine with Settings' own full-width row) has
  // nowhere to go in the compact variant, and would be forced past the
  // edge instead of wrapping. Just the percentage there; Settings' own "Claude plan
  // limits" section still shows the full reset time for whoever wants
  // it.
  detail.textContent = pct === null ? '—' : compact ? `${Math.round(pct)}%` : `${Math.round(pct)}%${resets ? ` · resets ${resets}` : ''}`;
  row.append(labelEl, barOuter, detail);
  return row;
}

// Reads Claude's own claude.ai-plan rate-limit windows via an
// EXPERIMENTAL SDK API (see claude.js's getRateLimits() — the method
// name is the SDK's own, not something invented here). Only called
// from openSettingsModal, not refreshSettingsModalIfOpen: it round-
// trips to Claude's usage endpoint through a live session, and a
// number that only moves on Claude's own reset windows doesn't need
// re-fetching on every stats-changing socket update mid-conversation.
async function renderUsageLimits() {
  usageLimitsEl.innerHTML = '';
  const loading = document.createElement('div');
  loading.className = 'empty-note';
  loading.textContent = 'Loading…';
  usageLimitsEl.appendChild(loading);

  let data;
  try {
    const res = await fetch('api/usage-limits');
    data = await res.json();
  } catch {
    usageLimitsEl.innerHTML = '';
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = 'Could not load.';
    usageLimitsEl.appendChild(note);
    return;
  }
  if (settingsBackdropEl.hidden) return; // modal got closed while this was in flight

  usageLimitsEl.innerHTML = '';
  const rateLimits = data.rateLimits;
  if (!rateLimits) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent =
      'Not available yet — message a colleague first this run, or this account has no claude.ai ' +
      "plan limits to report (API key/Bedrock/Vertex sessions don't).";
    usageLimitsEl.appendChild(note);
    return;
  }

  let any = false;
  for (const key of ['five_hour', 'seven_day', 'seven_day_opus', 'seven_day_sonnet', 'seven_day_oauth_apps']) {
    const window = rateLimits[key];
    if (!window) continue;
    any = true;
    usageLimitsEl.appendChild(usageLimitRowEl(USAGE_LIMIT_LABELS[key] || key, window));
  }
  for (const bucket of rateLimits.model_scoped || []) {
    any = true;
    usageLimitsEl.appendChild(usageLimitRowEl(`Weekly · ${bucket.display_name}`, bucket));
  }
  if (!any) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = 'No windows reported.';
    usageLimitsEl.appendChild(note);
  }

  const footnote = document.createElement('div');
  footnote.className = 'usage-limits__footnote';
  footnote.textContent = 'Best-effort — reads an experimental Claude Agent SDK API that may change or disappear.';
  usageLimitsEl.appendChild(footnote);
}

function refreshSettingsModalIfOpen() {
  if (settingsBackdropEl.hidden) return;
  renderUsageTable();
  renderAutoModeList();
  // Not renderUsageLimits() here on purpose: this is called on every
  // stats-changing socket update (frequent, mid-conversation), and each
  // call round-trips through a live Claude session to the claude.ai
  // usage endpoint — openSettingsModal's own call, once per open, is
  // enough for a number that only moves on Claude's own reset windows.
}

// --- Workforce switcher -------------------------------------------
// Pick among the different workforces from within the chat window.
// One GET for the (read-only) list;
// add/switch/remove are mutations and go over the socket, same split
// as everything else in this app (see server/index.js's own comment on
// its api/workforces route).
// Messages of yours waiting in the *other* workforces (their turn runs on in
// their own server, see switch_workforce). Polled lightly, see below.
let otherWorkforcesWaiting = new Map(); // path -> count, only counts above 0
const workforceWaitingBadgeEl = document.getElementById('workforce-waiting-badge');

async function refreshWorkforceStatus() {
  try {
    const [statusRes, listRes] = await Promise.all([fetch('api/workforces-status'), fetch('api/workforces')]);
    if (!statusRes.ok || !listRes.ok) return;
    const [status, list] = await Promise.all([statusRes.json(), listRes.json()]);
    const current = list.find((w) => w.current)?.path;
    otherWorkforcesWaiting = new Map(
      status.filter((w) => w.path !== current && w.waiting > 0).map((w) => [w.path, w.waiting])
    );
  } catch {
    return; // a failed poll leaves the last answer standing; the next one corrects it
  }
  let total = 0;
  for (const n of otherWorkforcesWaiting.values()) total += n;
  workforceWaitingBadgeEl.hidden = total === 0;
  if (total > 0) {
    const text = `${total} ${total === 1 ? 'message' : 'messages'} waiting in other workforces`;
    workforceWaitingBadgeEl.title = text;
    workforceSwitcherEl.setAttribute('aria-label', `${brandNameEl.textContent}: switch workforce, ${text}`);
  } else {
    workforceSwitcherEl.removeAttribute('aria-label');
  }
}

setInterval(() => { if (!document.hidden) refreshWorkforceStatus(); }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshWorkforceStatus(); });

async function renderWorkforceList() {
  workforceListEl.innerHTML = '';
  const [res] = await Promise.all([fetch('api/workforces'), refreshWorkforceStatus()]);
  const workforces = await res.json();
  for (const workforce of workforces) {
    const li = document.createElement('li');
    li.className = 'workforce-row';

    // The whole row switches, rather than a "Switch" button beside a
    // label that does nothing — in a menu whose only purpose is picking
    // one of these, a row you can't click is a row that looks broken.
    // (A <div> for the current one: it is already what you are looking
    // at, so there is nothing to activate.)
    const pick = document.createElement(workforce.current ? 'div' : 'button');
    pick.className = 'workforce-row__pick';
    if (!workforce.current) {
      pick.type = 'button';
      pick.disabled = !workforce.hasTeam;
    }

    const nameRow = document.createElement('span');
    nameRow.className = 'workforce-row__name';
    nameRow.textContent = workforce.name;
    if (workforce.current) {
      const tag = document.createElement('span');
      tag.className = 'workforce-row__tag';
      tag.textContent = 'current';
      nameRow.appendChild(tag);
    }
    const waitingCount = otherWorkforcesWaiting.get(workforce.path);
    if (waitingCount && !workforce.current) {
      const waiting = document.createElement('span');
      waiting.className = 'workforce-row__waiting';
      waiting.textContent = String(waitingCount);
      waiting.title = `${waitingCount} ${waitingCount === 1 ? 'message' : 'messages'} waiting`;
      nameRow.appendChild(waiting);
    }
    pick.appendChild(nameRow);

    const path = document.createElement('span');
    path.className = 'workforce-row__path';
    // The folder a workforce lives in is the only thing telling two
    // identically named ones apart, so it stays on the row — one line,
    // ellipsis, full path on hover.
    // The reason goes first on a row that can't be switched to: with the
    // path in front, a long one (an old scratchpad folder, say) pushes
    // "no team/ folder" past the ellipsis and the row just looks
    // inexplicably dead. Full path still on the title, as on every row.
    path.textContent = workforce.hasTeam
      ? workforce.displayPath
      : `No team/ folder — ${workforce.displayPath}`;
    path.title = workforce.path;
    pick.appendChild(path);

    if (!workforce.current) {
      pick.addEventListener('click', () => {
        pick.disabled = true;
        nameRow.textContent = `Switching to ${workforce.name}…`;
        switchWorkforce(workforce.path);
      });
    }
    li.appendChild(pick);

    if (!workforce.current) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'workforce-row__remove';
      removeButton.appendChild(xIconEl());
      removeButton.title = 'Remove from this list';
      removeButton.setAttribute('aria-label', `Remove ${workforce.path} from this list`);
      removeButton.addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'remove_workforce', path: workforce.path }));
      });
      li.appendChild(removeButton);
    }
    workforceListEl.appendChild(li);
  }
}

// The server's own reply (workforce_switch_ready) carries the fresh
// instance's URL as it sees itself — always 127.0.0.1 (see
// runChatServer's own `url` construction), regardless of whether *this*
// tab got here over LAN. Swapping in this tab's own current hostname
// before navigating is what makes a LAN session (e.g. from a phone)
// land on an address the phone can actually reach, instead of on
// "127.0.0.1" meaning the phone itself.
function switchWorkforce(path) {
  workforceErrorEl.hidden = true;
  socket.send(JSON.stringify({ type: 'switch_workforce', path }));
}

workforceAddFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const path = workforceAddInputEl.value.trim();
  if (!path) return;
  workforceErrorEl.hidden = true;
  socket.send(JSON.stringify({ type: 'add_workforce', path }));
});

// Not openDialog/closeDialog: those two are for the modal dialogs (a
// backdrop, a focus trap, Escape handled centrally for them). This is a
// menu hanging off its own button — it closes on a click anywhere else,
// it doesn't take the screen, and trapping focus in a four-row list
// would be the heavier thing, not the safer one.
function openWorkforceMenu() {
  workforceErrorEl.hidden = true;
  workforceAddInputEl.value = '';
  // Painted before the fetch resolves — the list it last held is
  // already the right shape, and re-rendering into it is what the
  // fetch is for. An empty menu that fills in a tick later is the
  // worse of the two.
  renderWorkforceList();
  workforceMenuEl.hidden = false;
  workforceSwitcherEl.setAttribute('aria-expanded', 'true');
}

function closeWorkforceMenu() {
  workforceMenuEl.hidden = true;
  workforceSwitcherEl.setAttribute('aria-expanded', 'false');
}

workforceSwitcherEl.addEventListener('click', (event) => {
  // Without this the document listener below sees the same click on its
  // way up and closes the menu the instant this opened it.
  event.stopPropagation();
  if (workforceMenuEl.hidden) openWorkforceMenu();
  else closeWorkforceMenu();
});

// Clicks inside the menu (picking a workforce, typing a path, removing
// one) are not "somewhere else" — only clicks that land outside both
// the menu and the button that opens it close it.
document.addEventListener('click', (event) => {
  if (workforceMenuEl.hidden) return;
  if (workforceMenuEl.contains(event.target) || workforceSwitcherEl.contains(event.target)) return;
  closeWorkforceMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || workforceMenuEl.hidden) return;
  // Stops the same Escape from also reaching whatever else listens for
  // it (the dialogs, the conversation search) — the topmost thing it
  // can dismiss is this menu, and one key press should dismiss one
  // thing.
  event.stopPropagation();
  closeWorkforceMenu();
  workforceSwitcherEl.focus();
}, true);

function openSettingsModal() {
  renderUsageTable();
  renderAutoModeList();
  renderSettingsNotifyRow();
  renderUsageLimits();
  // Not `brandLogoEl.src` as the source of truth here — an unset <img>
  // src reads back as the page's own URL (a real browser quirk), not
  // empty, which would have made a "fall back to logo.png" check never
  // trigger. Just fetch it directly, same as loadRoster does.
  brandingLogoPreviewEl.src = 'logo.png';
  brandingErrorEl.hidden = true;
  openDialog(settingsBackdropEl, settingsModalEl);
}

function closeSettingsModal() {
  closeDialog(settingsBackdropEl);
}

settingsButtonEl.addEventListener('click', openSettingsModal);
settingsCloseEl.addEventListener('click', closeSettingsModal);
settingsBackdropEl.addEventListener('click', (event) => {
  if (event.target === settingsBackdropEl) closeSettingsModal();
});

// Logo editing from within the window — reads the
// picked file as a data URL, strips the "data:...;base64," prefix (the
// server wants the same bare-base64 shape a chat image attachment
// already uses — see agentAdapter.js), and sends it over the socket as
// 'upload_logo' (see server/index.js). The 'logo_updated'/
// 'logo_upload_failed' replies are handled in the main socket listener
// below, not here — this only ever fires the request.
// A logo upload from an actual phone photo would be very slow — a
// modern phone camera photo is easily several MB/many megapixels, and
// this only ever needs to become a small square app icon (the built-in
// logo.png this replaces is 512x512). Downscaling to at most 512px on
// the longer side *before* ever base64-encoding/sending it cuts the
// payload from megabytes to tens of KB, rather than just
// hiding the wait behind a spinner. Canvas-based, not a plain
// FileReader-only read: decoding through an <img> is
// what makes resizing possible at all, a raw file read can only give
// back the same original bytes.
brandingUploadButtonEl.addEventListener('click', () => brandingLogoFileEl.click());
attachButtonEl.addEventListener('click', () => fileInput.click());

brandingLogoFileEl.addEventListener('change', () => {
  const file = brandingLogoFileEl.files?.[0];
  brandingLogoFileEl.value = ''; // lets picking the exact same file again re-fire 'change'
  if (!file) return;
  brandingErrorEl.hidden = true;
  resizeImageToPngDataUrl(file, 512)
    .then((dataUrl) => {
      const commaIndex = dataUrl.indexOf(',');
      const data = commaIndex === -1 ? '' : dataUrl.slice(commaIndex + 1);
      if (!data) return;
      socket.send(JSON.stringify({ type: 'upload_logo', data }));
    })
    .catch(() => {
      brandingErrorEl.textContent = 'Could not read that image.';
      brandingErrorEl.hidden = false;
    });
});

// `maxDimension`: the longer side is capped there, the shorter side
// scales to keep the original aspect ratio — no cropping, so a
// non-square source still comes out looking like itself, just smaller
// (the server writes it verbatim as logo.png; nothing forces it square).
function resizeImageToPngDataUrl(file, maxDimension) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode the picked file as an image'));
    };
    img.src = objectUrl;
  });
}

// --- Changed-files / diff view --------------------------------------
// A dedicated view of the changed files, as a diff like in VS Code.
// Scoped to the open conversation: its own worktree when it has one,
// otherwise the one repo this server actually knows about
// (`targetDir`, the `--dir` this chat was started against, see
// server/index.js's api/git-status/api/git-diff) — a colleague working
// in some other repo named to her directly doesn't show up here;
// this reads the working tree, not any colleague's own knowledge of
// what she touched.
let diffFiles = null; // null = couldn't ask (no .git, no `git`); [] = asked, nothing changed
let activeDiffPath = null;

function diffStatusLabel(status) {
  const s = status.trim();
  if (s === '??') return 'new';
  if (s.includes('R')) return 'renamed';
  if (s.includes('D')) return 'deleted';
  if (s.includes('A')) return 'added';
  return 'modified';
}

// File tree like in VS Code — folders nested by path instead of flat
// "mitarbeiter/noran/konzepte/dependabot-automerge.md" rows. `dirs` maps a path segment to its own
// {dirs, files} node; `files` holds the entries that live directly in
// this folder (VS Code's own git-status tree shape, not a general
// filesystem tree — only changed/new/deleted paths ever appear here at
// all, nothing unmodified).
function buildDiffFileTree(files) {
  const root = { dirs: new Map(), files: [] };
  for (const file of files) {
    const parts = file.path.split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const segment = parts[i];
      if (!node.dirs.has(segment)) node.dirs.set(segment, { dirs: new Map(), files: [] });
      node = node.dirs.get(segment);
    }
    node.files.push(file);
  }
  return root;
}

// VS Code's "compact folders": a chain of directories with nothing but
// one more directory in them (no files, no sibling folders) collapses
// into a single row — "mitarbeiter/noran/konzepte" as one line instead
// of three nested ones. Walks down from `node` for as long as that
// holds, folding each segment's name onto `name`.
function collapseDiffFolderChain(name, node) {
  while (node.files.length === 0 && node.dirs.size === 1) {
    const [childName, childNode] = node.dirs.entries().next().value;
    name = `${name}/${childName}`;
    node = childNode;
  }
  return { name, node };
}

// The tree leaf shows just the filename — the folder rows above it
// already spell out the rest of the path, same as VS Code never repeats
// a directory name inside its own contents. A rename's `file.label`
// still carries the full "old -> new" (see gitStatus in server/index.js)
// but the new path is all the tree structure itself can place; the full
// label survives as a hover title instead of being dropped.
function diffFileLeafLabel(file) {
  const base = file.path.slice(file.path.lastIndexOf('/') + 1);
  return { base, title: file.label !== file.path ? file.label : file.path };
}

function diffFileButton(file) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'diff-file' + (file.path === activeDiffPath ? ' diff-file--active' : '');
  const statusLabel = diffStatusLabel(file.status);
  const statusTag = document.createElement('span');
  statusTag.className = `diff-file__status diff-file__status--${statusLabel}`;
  statusTag.textContent = file.status.trim() || '?';
  statusTag.title = statusLabel;
  const { base, title } = diffFileLeafLabel(file);
  const label = document.createElement('span');
  label.className = 'diff-file__path';
  label.textContent = base;
  label.title = title;
  button.append(statusTag, label);
  button.addEventListener('click', () => selectDiffFile(file.path));
  return button;
}

// Recurses depth-first, directories (compacted, alphabetical) before
// files (alphabetical) at each level — same ordering VS Code's own
// explorer/changes tree uses.
function renderDiffTreeInto(node, container, depth) {
  const dirNames = [...node.dirs.keys()].sort((a, b) => a.localeCompare(b));
  for (const rawName of dirNames) {
    const { name, node: target } = collapseDiffFolderChain(rawName, node.dirs.get(rawName));
    const li = document.createElement('li');
    const folderRow = document.createElement('div');
    folderRow.className = 'diff-tree__folder';
    folderRow.style.paddingLeft = `${depth * 0.9}rem`;
    folderRow.textContent = name;
    folderRow.title = name;
    li.appendChild(folderRow);
    const group = document.createElement('ul');
    group.className = 'diff-tree__group';
    renderDiffTreeInto(target, group, depth + 1);
    li.appendChild(group);
    container.appendChild(li);
  }
  const files = [...node.files].sort((a, b) => a.path.localeCompare(b.path));
  for (const file of files) {
    const li = document.createElement('li');
    const button = diffFileButton(file);
    button.style.paddingLeft = `${0.5 + depth * 0.9}rem`;
    li.appendChild(button);
    container.appendChild(li);
  }
}

function renderDiffFileList() {
  diffFileListEl.innerHTML = '';
  if (diffFiles === null) {
    diffFileListEl.innerHTML = '<li class="empty-note">Not a git repository here, or git isn’t available.</li>';
    return;
  }
  if (diffFiles.length === 0) {
    diffFileListEl.innerHTML = '<li class="empty-note">No changes.</li>';
    return;
  }
  renderDiffTreeInto(buildDiffFileTree(diffFiles), diffFileListEl, 0);
}

// Turns a unified diff into colored lines — +green/-red/hunk-header
// muted, everything else plain — the readable, at-a-glance part of a
// VS Code-style diff. Not a full editor clone (no syntax highlighting,
// no side-by-side view): what a VS Code-style diff needs most here is
// seeing what changed without leaving the chat, not a pixel match.
function renderDiffContent(diffText) {
  diffContentEl.innerHTML = '';
  if (!diffText) {
    diffContentEl.textContent = 'No diff available.';
    return;
  }
  for (const line of diffText.split('\n')) {
    const lineEl = document.createElement('div');
    if (line.startsWith('+') && !line.startsWith('+++')) lineEl.className = 'diff-line diff-line--add';
    else if (line.startsWith('-') && !line.startsWith('---')) lineEl.className = 'diff-line diff-line--del';
    else if (line.startsWith('@@')) lineEl.className = 'diff-line diff-line--hunk';
    else if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('+++') || line.startsWith('---')) {
      lineEl.className = 'diff-line diff-line--meta';
    } else {
      lineEl.className = 'diff-line';
    }
    lineEl.textContent = line || ' ';
    diffContentEl.appendChild(lineEl);
  }
}

// The conversation the dialog speaks for, as query parameters: a colleague
// conversation names itself (the server uses its worktree if it has one),
// channels and subagent threads send nothing and get the workforce folder.
function diffScopeParams() {
  if (!activeColleagueId || isSubagentThread(activeColleagueId) || !activeSessionId) return '';
  return `colleagueId=${encodeURIComponent(activeColleagueId)}&sessionId=${encodeURIComponent(activeSessionId)}`;
}
let diffLoadSeq = 0; // answers for an earlier conversation are dropped

async function loadDiffContent(path) {
  diffContentEl.textContent = 'Loading…';
  const seq = diffLoadSeq;
  try {
    const res = await fetch(`api/git-diff?path=${encodeURIComponent(path)}&${diffScopeParams()}`);
    const data = await res.json();
    if (activeDiffPath !== path || seq !== diffLoadSeq) return; // switched files again before this landed
    renderDiffContent(data.diff);
  } catch {
    if (activeDiffPath === path) diffContentEl.textContent = 'Could not load diff.';
  }
}

function selectDiffFile(path) {
  activeDiffPath = path;
  renderDiffFileList();
  loadDiffContent(path);
}

async function loadDiffFiles() {
  const seq = ++diffLoadSeq;
  diffFileListEl.innerHTML = '<li class="empty-note">Loading…</li>';
  diffContentEl.textContent = '';
  let data;
  try {
    const res = await fetch(`api/git-status?${diffScopeParams()}`);
    data = await res.json();
  } catch {
    if (seq !== diffLoadSeq) return;
    diffFiles = null;
    renderDiffFileList();
    return;
  }
  if (diffBackdropEl.hidden || seq !== diffLoadSeq) return; // closed, or another conversation asked since
  diffFiles = data.files;
  const where = `${data.worktree ? 'Worktree' : 'Workforce folder'}: ${data.cwd || ''}${data.branch ? ` (${data.branch})` : ''}`;
  diffModalCwdEl.textContent = where;
  diffModalCwdEl.title = where;
  if (diffFiles && diffFiles.length > 0) {
    if (!activeDiffPath || !diffFiles.some((f) => f.path === activeDiffPath)) activeDiffPath = diffFiles[0].path;
  } else {
    activeDiffPath = null;
  }
  renderDiffFileList();
  if (activeDiffPath) loadDiffContent(activeDiffPath);
}

// The conversation (or its worktree) changed under an open dialog.
function refreshDiffIfOpen() {
  if (diffBackdropEl.hidden) return;
  activeDiffPath = null;
  loadDiffFiles();
}

function openDiffModal() {
  openDialog(diffBackdropEl, diffModalEl);
  loadDiffFiles();
}
function closeDiffModal() {
  closeDialog(diffBackdropEl);
}
diffButtonEl.addEventListener('click', openDiffModal);
diffCloseEl.addEventListener('click', closeDiffModal);
diffRefreshEl.addEventListener('click', loadDiffFiles);
diffBackdropEl.addEventListener('click', (event) => {
  if (event.target === diffBackdropEl) closeDiffModal();
});

// Forcing `messagesEl.scrollTop` to the bottom on every single delta (see
// renderMessages/renderChannelMessages) would yank the pane back down
// when scrolling up mid-stream to read something earlier. The two
// render functions therefore check this *before* they touch
// the DOM (scrollHeight only reflects what's already on screen at that
// point) and only auto-scroll when you were already within a few
// pixels of the bottom — otherwise #scroll-to-bottom shows instead.
const SCROLL_TO_BOTTOM_THRESHOLD = 48;
function isNearBottom() {
  return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight <= SCROLL_TO_BOTTOM_THRESHOLD;
}
// A live "thinking" box is height-limited (see .message--thinking in
// styles.css); while it fills up it should show its newest lines, not
// stay on the first ones.
function followThinkingTail() {
  for (const box of messagesEl.querySelectorAll('.message--thinking > span')) box.scrollTop = box.scrollHeight;
}
function scrollMessagesToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
  scrollToBottomButtonEl.hidden = true;
}
// Called after every render (whether or not it auto-scrolled) and on
// every manual scroll, so the button's visibility always matches
// reality — including someone scrolling back down by hand without
// ever touching the button itself.
function updateScrollToBottomButton() {
  scrollToBottomButtonEl.hidden = isNearBottom();
}
messagesEl.addEventListener('scroll', updateScrollToBottomButton, { passive: true });
scrollToBottomButtonEl.addEventListener('click', () => scrollMessagesToBottom());

// A sent image's thumbnail (`.attachment-thumb`, both 1:1 and channel
// bubbles — see renderMessages/renderChannelMessages) opens full-size
// on click. Delegated on `messagesEl` rather than bound per-thumbnail:
// both render functions rebuild the whole message list from scratch on
// every update (`messagesEl.innerHTML = ''`), so a direct listener
// would need re-attaching after every single render — one listener on
// the never-replaced container that only cares about the event target
// avoids that entirely.
function openImageLightbox(thumb) {
  imageLightboxImgEl.src = thumb.src;
  imageLightboxImgEl.alt = thumb.alt;
  dialogOpener.set(imageLightboxEl, thumb);
  imageLightboxEl.hidden = false;
  imageLightboxEl.focus();
}
function closeImageLightbox() {
  imageLightboxEl.hidden = true;
  imageLightboxImgEl.src = '';
  const opener = dialogOpener.get(imageLightboxEl);
  dialogOpener.delete(imageLightboxEl);
  if (opener?.isConnected) opener.focus?.();
}
// The Copy button of a code block (see markdown.js) is part of the rendered
// HTML, so one delegated listener serves all of them, like the thumbnails.
messagesEl.addEventListener('click', (event) => {
  const button = event.target.closest?.('.code-copy');
  if (!button) return;
  const code = button.parentElement?.querySelector('code');
  if (code) copyWithFeedback(code.textContent, button);
});
messagesEl.addEventListener('click', (event) => {
  if (!event.target.classList.contains('attachment-thumb')) return;
  openImageLightbox(event.target);
});
// Thumbnails carry tabindex/role from renderMessages, so they are real
// stops; Enter and Space have to be spelled out because an <img> is not
// a button and gets no activation behaviour of its own.
messagesEl.addEventListener('keydown', (event) => {
  if (!event.target.classList.contains('attachment-thumb')) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openImageLightbox(event.target);
});
imageLightboxEl.addEventListener('click', closeImageLightbox);
// Escape for this one is handled by the shared dialog keydown listener
// above, together with the other three.

function wsUrl() {
  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';
  return `${scheme}${location.host}${location.pathname}ws`;
}

// Registers the synthetic, colleague-shaped entry a subagent exchange
// gets — built once at subagent_start, read by avatarEl/renderMessages/
// selectColleague exactly like a roster entry, which is the whole
// point: it looks exactly like the other colleagues, not a bespoke view.
function registerSubagentColleague(panel) {
  const known = panel.knownColleagueId ? colleaguesById.get(panel.knownColleagueId) : null;
  colleaguesById.set(panel.syntheticId, {
    id: panel.syntheticId,
    name: known ? known.name : panel.subagentType,
    role: panel.taskDescription || (known ? known.role : panel.subagentType),
    hasAvatar: known ? known.hasAvatar : false,
    // avatarEl fetches by this when set, so a known colleague's real
    // photo shows up here too — the synthetic id itself isn't a real
    // colleague the /api/avatar route would recognize.
    avatarId: known ? known.id : null,
  });
}

// The ways a subagent panel goes away — one deliberate click on a
// single row (see renderSidebar's `.colleague-row__remove`), or the
// server reporting windows gone (a reset or cleared chat of the owner, or
// another tab closing one: subagent_removed). Both funnel
// through this one: drop the bookkeeping entry, drop the synthetic
// colleague-shaped entry registerSubagentColleague added so avatarEl/
// selectColleague stop resolving it, and — if that panel happened to be
// the open conversation — fall back to the owner's own thread rather
// than leave the pane pointing at a row that no longer exists in the
// sidebar. A click also tells the server, which deletes the window and its
// messages for good; `notify: false` is for when the server told us.
function removeSubagentPanel(ownerColleagueId, subagentId, { notify = true } = {}) {
  const panels = subagentPanels.get(ownerColleagueId);
  const panel = panels?.get(subagentId);
  if (!panel) return;
  panels.delete(subagentId);
  colleaguesById.delete(panel.syntheticId);
  history.delete(panel.syntheticId);
  loadedHistory.delete(panel.syntheticId);
  if (notify) socket.send(JSON.stringify({ type: 'close_subagent', id: subagentId }));
  if (activeColleagueId === panel.syntheticId) {
    const owner = colleaguesById.get(ownerColleagueId);
    if (owner) selectColleague(owner, panel.sessionId || lastSessionByColleague.get(owner.id) || DEFAULT_SESSION_ID);
  }
  renderSidebar();
}

// Builds the panels the server still has (api/subagent-threads) — after a
// reload or a server restart they are all that is left of the windows. A
// panel that is already here (live, this page) is only brought up to date.
// What was streamed live is not restored: a running one shows its brief
// and "running" until its end arrives.
function restoreSubagentPanels(threads) {
  for (const thread of threads) {
    if (!subagentPanels.has(thread.ownerId)) subagentPanels.set(thread.ownerId, new Map());
    const panels = subagentPanels.get(thread.ownerId);
    const existing = panels.get(thread.id);
    if (existing) {
      existing.closed = thread.status === 'done';
      continue;
    }
    const panel = {
      id: thread.id,
      ownerColleagueId: thread.ownerId,
      syntheticId: `sub:${thread.id}`,
      knownColleagueId: colleaguesById.has(thread.subagentType) ? thread.subagentType : null,
      subagentType: thread.subagentType,
      taskDescription: thread.description || undefined,
      sessionId: thread.sessionId || DEFAULT_SESSION_ID,
      closed: thread.status === 'done',
    };
    panels.set(thread.id, panel);
    registerSubagentColleague(panel);
  }
}

// A backgrounded/sleeping mobile Safari (and the standalone PWA the
// same way) silently drops the underlying TCP connection; without
// handling that, coming back to the app would mean a socket that looks
// the same but is already dead — nothing arrives until a manual page
// reload. This is handled at the connection layer, not with a reload:
// `handleSocketMessage` below is a named function so connectSocket()
// can reattach it to a fresh WebSocket instance after a drop, no page
// navigation involved.
const handleSocketMessage = (event) => {
  const update = JSON.parse(event.data);

  if (update.type === 'subagent_removed') {
    for (const id of update.ids || []) {
      for (const [ownerId, panels] of subagentPanels) {
        if (panels.has(id)) removeSubagentPanel(ownerId, id, { notify: false });
      }
    }
    return;
  }

  if (update.type === 'channel_created') {
    channelsById.set(update.channel.id, update.channel);
    channelMessages.set(update.channel.id, []);
    renderSidebar();
    // Jump straight into the new channel — same "don't make me go find
    // what I just created" behavior as session_created below. Without
    // it, the sidebar re-render after creating a channel would leave
    // the FIRST colleague focused instead.
    selectChannel(update.channel);
    return;
  }

  if (update.type === 'live_state') {
    // What the colleagues' running turns have produced so far, sent once
    // when this tab connected (see the server's upgrade handler). Replaces
    // the live maps for those conversations rather than appending, so a
    // reconnect of a tab that was listening all along changes nothing.
    // `history` is deliberately left alone: loadColleagueHistory skips a
    // conversation that already has an entry.
    for (const turn of update.turns || []) {
      const key = convKey(turn.colleagueId, turn.sessionId);
      if (turn.thinking) thinkingStreaming.set(key, turn.thinking);
      else thinkingStreaming.delete(key);
      if (turn.text) streaming.set(key, turn.text);
      else streaming.delete(key);
      const trail = reconstructTrail(turn.trail);
      if (trail) pendingTrail.set(key, trail);
      else pendingTrail.delete(key);
      // Messages that still wait (history may or may not be loaded yet; if
      // not, the history rows carry the same mark).
      for (const w of turn.waiting || []) markWaiting(key, w);
    }
    renderSidebar();
    if (activeConvKey()) renderMessages();
    return;
  }

  // The server took a message that arrived mid-turn: it waits, and may be
  // withdrawn if the server says so.
  if (update.type === 'message_waiting') {
    markWaiting(convKey(update.colleagueId, update.sessionId), update);
    if (activeConvKey()) renderMessages();
    return;
  }

  // Answer to a withdrawal (sent to every tab). Withdrawn: the bubble goes
  // and its text returns to an empty composer. Not withdrawn: the message
  // was read already, it stays and stops waiting. An error changes nothing.
  if (update.type === 'message_cancelled') {
    const key = convKey(update.colleagueId, update.sessionId);
    const items = history.get(key) || [];
    const i = items.findIndex((m) => m.clientId === update.id);
    if (i >= 0) {
      const item = items[i];
      if (update.cancelled) {
        items.splice(i, 1);
        if (key === activeConvKey() && !input.value && !pendingAttachment) {
          input.value = item.text || '';
          autoResizeComposer();
        }
      } else if (update.error) {
        delete item.withdrawing;
      } else {
        delete item.pending;
        delete item.withdrawing;
      }
      if (activeConvKey()) renderMessages();
    }
    return;
  }

  if (update.type === 'session_created') {
    if (!colleagueSessions.has(update.colleagueId)) colleagueSessions.set(update.colleagueId, []);
    colleagueSessions.get(update.colleagueId).push(update.session);
    showSessionForm.delete(update.colleagueId);
    renderSidebar();
    closeConvSettingsModal(); // the form that created this session lives there now, not in the sidebar
    // Jump straight into it — starting a session and then having to go
    // find it again would defeat the point.
    const colleague = colleaguesById.get(update.colleagueId);
    if (colleague) selectColleague(colleague, update.session.id);
    return;
  }

  if (update.type === 'auto_mode_changed') {
    const key = convKey(update.colleagueId, update.sessionId);
    if (update.enabled) autoModeKeys.add(key);
    else {
      autoModeKeys.delete(key);
      withdrawAllowEverything(key);
    }
    if (key === activeConvKey()) renderPaneHeader();
    refreshSettingsModalIfOpen();
    return;
  }

  if (update.type === 'worktree_changed') {
    const key = convKey(update.colleagueId, update.sessionId);
    const info = worktreeInfo.get(key) || { available: true };
    worktreeInfo.set(key, { ...info, available: true, worktree: { branch: update.branch, path: update.path, repoName: update.repoName } });
    if (key === activeConvKey()) {
      renderPaneHeader();
      refreshDiffIfOpen();
      if (!convSettingsBackdropEl.hidden) renderConvSettingsWorktree();
    }
    return;
  }

  if (update.type === 'worktree_failed') {
    const form = worktreeForm;
    if (form && form.colleagueId === update.colleagueId && form.sessionId === update.sessionId) {
      form.button.disabled = false;
      form.error.textContent = update.message || 'Could not create the worktree.';
      form.error.hidden = false;
    }
    return;
  }

  if (update.type === 'model_changed' || update.type === 'model_change_failed') {
    const picker = modelPicker;
    const isThisPicker = picker && picker.colleagueId === update.colleagueId && picker.sessionId === update.sessionId;
    if (update.type === 'model_changed') {
      // Show the new model in the header right away; the next session
      // start reports the model the SDK really ended up on and replaces it.
      const key = convKey(update.colleagueId, update.sessionId);
      const stats = colleagueStats.get(key) || {};
      stats.model = update.resolvedModel || update.model || stats.model;
      colleagueStats.set(key, stats);
      if (key === activeConvKey()) renderPaneHeader();
      if (isThisPicker) {
        picker.confirmed = picker.select.value;
        picker.select.disabled = false;
      }
    } else if (isThisPicker) {
      picker.select.value = picker.confirmed; // back to what is really set
      picker.select.disabled = false;
      picker.hint.textContent = '';
      picker.error.textContent = update.message || 'Could not switch the model.';
      picker.error.hidden = false;
    }
    return;
  }

  if (update.type === 'chat_cleared') {
    // Server already deleted the persisted rows (store.clearHistory/
    // clearChannelHistory) and dropped the live adapter — this mirrors
    // that locally: wipe the loaded transcript, the sidebar preview,
    // and re-render whatever's currently on screen.
    const key = update.channelId ? channelConvKey(update.channelId) : convKey(update.colleagueId, update.sessionId);
    history.set(key, []);
    loadedHistory.add(key); // an emptied transcript is the real one, nothing to fetch
    if (!update.channelId) {
      const rosterColleague = colleaguesById.get(update.colleagueId);
      if (rosterColleague) rosterColleague.lastMessage = null;
    }
    renderSidebar();
    if (key === activeConvKey()) {
      if (update.channelId) renderChannelMessages();
      else renderMessages();
    }
    return;
  }

  if (update.type === 'gatekeeper_usage') {
    const { calls, inputTokens, outputTokens, totalTokens, costUsd } = update;
    gatekeeperUsage = { calls, inputTokens, outputTokens, totalTokens, costUsd };
    refreshSettingsModalIfOpen();
    return;
  }

  if (update.type === 'logo_updated') {
    // The file at logo.png changed but the URL didn't — same-URL
    // requests are exactly what a browser image cache is for, so
    // without a cache-buster this would keep showing the old logo until
    // a hard reload. Both places that display it (the sidebar header
    // and, if the settings modal happens to be open, its own preview).
    const bust = `logo.png?t=${Date.now()}`;
    brandLogoEl.src = bust;
    brandingLogoPreviewEl.src = bust;
    return;
  }

  if (update.type === 'logo_upload_failed') {
    brandingErrorEl.textContent = `Could not save the new logo: ${update.message}`;
    brandingErrorEl.hidden = false;
    return;
  }

  if (update.type === 'workforce_added') {
    workforceAddInputEl.value = '';
    renderWorkforceList();
    return;
  }

  if (update.type === 'workforce_add_failed') {
    workforceErrorEl.textContent = update.message;
    workforceErrorEl.hidden = false;
    return;
  }

  if (update.type === 'workforce_removed') {
    renderWorkforceList();
    return;
  }

  if (update.type === 'workforce_switch_ready') {
    const target = new URL(update.url);
    target.hostname = window.location.hostname; // see switchWorkforce's own comment on why
    window.location.href = target.toString();
    return;
  }

  if (update.type === 'workforce_switch_failed') {
    workforceErrorEl.textContent = update.message;
    workforceErrorEl.hidden = false;
    renderWorkforceList(); // re-enables the "Switch" button this failure left stuck on "Switching…"
    return;
  }

  // First answer wins: a permission_request goes out to every open tab
  // (see the server's own broadcast), so more than one tab can be showing the
  // exact same requestId at once — once any of them answers, the
  // server tells every tab to drop its copy. Scans both maps rather
  // than looking the key up directly: this tab has no way to know in
  // advance which colleague/channel key the resolved requestId even
  // belonged to (it never necessarily saw the original request itself —
  // it could have arrived here for the very first time already
  // resolved, if this tab only just connected).
  if (update.type === 'permission_resolved') {
    for (const [key, permission] of pendingPermission) {
      if (permission.requestId !== update.requestId) continue;
      pendingPermission.delete(key);
      if (key === activeConvKey()) renderMessages();
    }
    for (const [key, permission] of channelPendingPermission) {
      if (permission.requestId !== update.requestId) continue;
      channelPendingPermission.delete(key);
      if (activeChannelId) renderChannelMessages();
    }
    return;
  }

  if (update.type === 'channel_message') {
    const text = applyHiringModeMarkers(update.channelId, update.text);
    if (!channelMessages.has(update.channelId)) channelMessages.set(update.channelId, []);
    // The server echoes attachments back as {name, mimeType, data}
    // (base64, no data: prefix — see agentAdapter.js) same as it
    // receives them; renderChannelMessages wants a ready-to-use
    // dataUrl, same shape pendingAttachment already carries for the 1:1
    // preview.
    const attachments = (update.attachments || []).map((a) => ({
      ...a,
      dataUrl: `data:${a.mimeType};base64,${a.data}`,
    }));
    // The channel_message is the authoritative "she's done" signal —
    // the trail collected for her turn (see the 'tool_use'/
    // 'thinking_delta' cases below) moves onto this finished item now,
    // same as the 1:1 view's 'message' case does for pendingTrail —
    // MessageRow already knows how to render item.trail, no
    // channel-specific rendering needed. Only ever set for a colleague's
    // own reply: 'you' and 'system' senders never had anything queued
    // under their id.
    const trail = channelPendingTrail.get(update.senderId) || [];
    if (channelThinkingStreaming.has(update.senderId)) {
      trail.push({ kind: 'thinking', text: channelThinkingStreaming.get(update.senderId).text });
    }
    channelPendingTrail.delete(update.senderId);
    // The server doesn't stamp a live broadcast with a time (only the
    // persisted row it wrote has one) — arrival time is close enough
    // for display and means no server change to carry a timestamp
    // through the whole relay/dispatch path just for this.
    channelMessages.get(update.channelId).push({
      senderId: update.senderId,
      text,
      attachments,
      createdAt: new Date().toISOString(),
      trail: trail.length ? trail : undefined,
      // Written while somebody in the channel is still mid-turn: stays
      // below the live rows, marked as waiting, until the channel is idle.
      pending: update.senderId === 'you' && isChannelBusy(update.channelId),
    });
    // Clears whatever in-progress state her turn left behind, in case a
    // channel_typing(active:false) got here first, last, or not at all —
    // after the trail above already read channelThinkingStreaming, not
    // before.
    channelStreaming.delete(update.senderId);
    channelThinkingStreaming.delete(update.senderId);
    channelTyping.delete(update.senderId);
    settleChannelIfIdle(update.channelId);
    const isColleagueMessage = update.senderId !== 'you' && update.senderId !== 'system';
    if (isColleagueMessage && !(document.hasFocus() && update.channelId === activeChannelId)) {
      const channel = channelsById.get(update.channelId);
      const sender = colleaguesById.get(update.senderId);
      notify(`#${channel?.name || 'channel'} — ${sender?.name || update.senderId}`, text, () => {
        if (channel) selectChannel(channel);
      });
    }
    // In-app badge: independent of document.hasFocus() on purpose —
    // unlike the desktop notify() above (which only wants to interrupt
    // when you're not looking at the app at all), the sidebar badge
    // should show up whenever this channel isn't the one you currently
    // have open, focus or not — that's the whole point of a badge over
    // a fleeting notification.
    if (isColleagueMessage && update.channelId !== activeChannelId) {
      unreadConversations.add(UNREAD_CHANNEL_PREFIX + update.channelId);
      refreshUnreadTitle();
      renderSidebar();
    }
    if (update.channelId === activeChannelId) renderChannelMessages();
    return;
  }

  // Model/effort/tokens — keyed the same way the server recorded them
  // (colleagueId+sessionId; a channel-triggered update carries no
  // sessionId, meaning the colleague's default session, same as the
  // server's own fallback). Re-render whichever view is open, since a
  // colleague can be active in her own DM thread while her stats
  // update from a channel turn, or vice versa.
  if (update.type === 'session_info' || update.type === 'usage') {
    const key = convKey(update.colleagueId, update.sessionId);
    const stats = colleagueStats.get(key) || {};
    if (update.type === 'session_info') {
      stats.model = update.model;
      stats.effort = update.effort;
    } else {
      stats.inputTokens = update.inputTokens;
      stats.outputTokens = update.outputTokens;
      stats.totalTokens = update.totalTokens;
      stats.costUsd = update.costUsd;
    }
    colleagueStats.set(key, stats);
    renderPaneHeader();
    refreshSettingsModalIfOpen();
    // 'usage' fires once per completed turn (not per streaming token —
    // see agentAdapter.js), a reasonable cadence to also recheck the
    // plan's rate-limit window without hammering the experimental
    // endpoint behind it on every delta.
    if (update.type === 'usage') refreshPlanUsage();
    return;
  }

  // Everything below this point is either a plain 1:1 update, or one of
  // the same update types tagged with a channelId (see relayChannelMessage
  // in server/index.js) — a channel turn gets exactly the same streaming/
  // tool-use/permission treatment as a 1:1 chat, just addressed to the
  // channel's live state instead of a colleague's own DM thread.
  if (update.channelId) {
    const { channelId, colleagueId } = update;
    switch (update.type) {
      case 'channel_typing':
        if (update.active) channelTyping.set(colleagueId, channelId);
        else channelTyping.delete(colleagueId);
        if (!update.active) settleChannelIfIdle(channelId);
        renderSidebar(); // channel row's typing indicator — needed even when this channel isn't the open one
        break;
      case 'delta':
        channelStreaming.set(colleagueId, {
          channelId,
          text: (channelStreaming.get(colleagueId)?.text || '') + update.text,
        });
        break;
      case 'thinking_delta':
        channelThinkingStreaming.set(colleagueId, {
          channelId,
          text: (channelThinkingStreaming.get(colleagueId)?.text || '') + update.text,
        });
        break;
      case 'tool_use': {
        // Ephemeral — not persisted to channel_messages, lost on reload.
        // Unlike a 1:1 tool_use line (see store.js's messages.trail
        // column), a channel turn's trail isn't saved server-side either
        // (server/index.js's pendingTrails/pendingThinking only track
        // 1:1 adapterKeys) — a deliberate scope cut, not an oversight;
        // widening it is a separate decision.
        if (!channelPendingTrail.has(colleagueId)) channelPendingTrail.set(colleagueId, []);
        channelPendingTrail.get(colleagueId).push({
          kind: 'tool_use',
          id: update.id,
          text: toolUseLine(update.name, update.input),
          toolName: update.name,
          toolInput: update.input,
        });
        break;
      }
      case 'tool_done': {
        const entry = (channelPendingTrail.get(colleagueId) || []).find((e) => e.id && e.id === update.id);
        if (entry) entry.approval = update.approval;
        break;
      }
      case 'permission_request':
        if (isAlwaysAllowed(channelKey(colleagueId, channelId), update.toolName)) {
          const via = alwaysAllowedTools.get(channelKey(colleagueId, channelId))?.has('*') ? 'autopilot' : 'allow always';
          socket.send(JSON.stringify({ type: 'permission_response', requestId: update.requestId, allow: true, via }));
          break;
        }
        channelPendingPermission.set(channelKey(colleagueId, channelId), { channelId, ...update });
        break;
      default:
        return;
    }
    if (channelId === activeChannelId) renderChannelMessages();
    return;
  }

  const { colleagueId, sessionId } = update;
  // The map key for everything below — colleagueId+session for a real
  // conversation, overridden to the subagent's own synthetic id
  // further down when this turns out to be a subagent update.
  let key = convKey(colleagueId, sessionId);

  // A subagent's own updates are keyed by the owning colleague in the
  // wire format (that's who ran the Task call), but rendered as their
  // own conversation under a synthetic id from here on — same history/
  // streaming maps, same render path as any real colleague.
  if (update.type.startsWith('subagent_')) {
    const ownerColleagueId = colleagueId;
    if (update.type === 'subagent_start') {
      if (!subagentPanels.has(ownerColleagueId)) subagentPanels.set(ownerColleagueId, new Map());
      const panel = {
        id: update.id,
        ownerColleagueId,
        syntheticId: `sub:${update.id}`,
        // When the subagent_type the model picked happens to name a
        // real colleague (Ada addressing "remy" as a subagent, say),
        // her own identity carries over — same avatar, same name,
        // whether she's answering directly or running as someone
        // else's subagent.
        knownColleagueId: colleaguesById.has(update.subagentType) ? update.subagentType : null,
        subagentType: update.subagentType || 'subagent',
        taskDescription: update.taskDescription,
        // The conversation of the owner it was started in: closing the window
        // goes back there, not to her main conversation.
        sessionId: update.sessionId || DEFAULT_SESSION_ID,
        closed: false,
      };
      subagentPanels.get(ownerColleagueId).set(update.id, panel);
      registerSubagentColleague(panel);
      // The brief the colleague gave the sub-agent opens its conversation, so
      // the thread shows what it was asked, not only what it did.
      history.set(
        panel.syntheticId,
        update.prompt ? [{ role: 'you', text: update.prompt, createdAt: new Date().toISOString() }] : []
      );
      loadedHistory.add(panel.syntheticId); // built here, nothing to fetch for it
      renderSidebar();
      return;
    }
    const panel = subagentPanels.get(ownerColleagueId)?.get(update.id);
    if (!panel) return; // update for a panel we never saw subagent_start for
    key = panel.syntheticId;
    if (update.type === 'subagent_tool_use') {
      update.type = 'tool_use'; // falls through to the shared case below
    } else if (update.type === 'subagent_delta') {
      update.type = 'delta';
    } else if (update.type === 'subagent_sent') {
      // A message the colleague sent this sub-agent after its start.
      history.get(key) || history.set(key, []);
      history.get(key).push({ role: 'you', text: update.text, createdAt: new Date().toISOString() });
      if (key === activeConvKey()) renderMessages();
      return;
    } else if (update.type === 'subagent_message') {
      // Finished text between its tool calls: a message of the window; the
      // window itself goes on (only subagent_end closes it).
      history.get(key) || history.set(key, []);
      history.get(key).push({
        role: 'colleague',
        text: update.text,
        createdAt: new Date().toISOString(),
        trail: reconstructTrail(update.trail),
      });
      streaming.delete(key);
      pendingTrail.delete(key);
      if (key === activeConvKey()) renderMessages();
      return;
    } else if (update.type === 'subagent_end') {
      panel.closed = true;
      update.type = 'message';
      update.role = 'colleague';
      update.text = update.report || '';
      renderSidebar(); // the nested entry's "done talking" state
      // The report is often the last text block again: not shown twice.
      const shown = history.get(key) || [];
      const last = shown[shown.length - 1];
      if (last?.role === 'colleague' && last.text === update.text && !update.trail?.length) {
        streaming.delete(key);
        pendingTrail.delete(key);
        thinkingStreaming.delete(key);
        renderSidebar();
        if (key === activeConvKey()) renderMessages();
        return;
      }
    }
  }

  if (!history.has(key)) history.set(key, []);

  switch (update.type) {
    case 'delta': {
      const wasTyping = isTyping(key);
      streaming.set(key, (streaming.get(key) || '') + update.text);
      if (!wasTyping) renderSidebar();
      break;
    }
    case 'thinking_delta': {
      const wasTyping = isTyping(key);
      thinkingStreaming.set(key, (thinkingStreaming.get(key) || '') + update.text);
      if (!wasTyping) renderSidebar();
      break;
    }
    case 'tool_use': {
      const wasTyping = isTyping(key);
      if (!pendingTrail.has(key)) pendingTrail.set(key, []);
      pendingTrail.get(key).push({
        kind: 'tool_use',
        id: update.id,
        text: toolUseLine(update.name, update.input),
        toolName: update.name,
        toolInput: update.input,
      });
      if (!wasTyping) renderSidebar();
      break;
    }
    case 'tool_done': {
      const entry = (pendingTrail.get(key) || []).find((e) => e.id && e.id === update.id);
      if (entry) entry.approval = update.approval;
      // A tool result is where a message sent during her turn is folded into
      // that turn (measured against the SDK, see server/waiting.js): she has
      // read it now, so it stops being drawn as "waiting".
      // (A queued message is never folded: it stays a turn of its own.)
      for (const waiting of history.get(key)) if (waiting.kind !== 'queue') delete waiting.pending;
      break;
    }
    case 'message': {
      streaming.delete(key);
      // The trail (thinking + tool calls) now comes straight from the
      // server (see index.js's own broadcast for 'message') instead of
      // being rebuilt from whatever tool_use/thinking_delta events this
      // particular tab happened to receive live — with two tabs open on
      // the same conversation, a tab that (re)connected
      // partway through a turn only ever overheard part of that stream,
      // so a trail built purely from its own pendingTrail/thinkingStreaming
      // was silently incomplete. The server computes the exact same
      // trail it just persisted, so that one is always complete
      // regardless of when this tab joined. Still clear the local
      // per-tab accumulators either way — nothing else reads them once
      // the turn's finished.
      pendingTrail.delete(key);
      thinkingStreaming.delete(key);
      renderSidebar(); // she just stopped typing — clear the sidebar's indicator even if this isn't the open conversation
      const text = applyHiringModeMarkers(key, update.text);
      // Her turn is over: whatever was written meanwhile counts as read
      // now and takes its place in the transcript, above this reply
      // (the order the server stored it in).
      // What still waits (not folded) is stored behind this reply: the
      // oldest one starts now, the others keep waiting.
      const stillWaiting = history.get(key).filter((m) => m.pending);
      if (stillWaiting.length) {
        delete stillWaiting[0].pending;
        delete stillWaiting[0].withdrawing;
      }
      history.set(key, history.get(key).filter((m) => !stillWaiting.includes(m)));
      history.get(key).push({
        role: update.role,
        text,
        createdAt: new Date().toISOString(),
        // update.trail arrives in the raw, persisted shape (see
        // store.js: {kind:'tool_use', name, input}) — the same shape
        // api/history already returns, and reconstructTrail is the
        // exact function that already turns that into what TrailBox
        // renders ({kind:'tool_use', text, toolName, toolInput}).
        // Passing it through unconverted would leave every tool_use
        // line blank: TrailBox reads entry.text, which the raw shape
        // doesn't have.
        trail: reconstructTrail(update.trail),
      });
      history.get(key).push(...stillWaiting);
      // Sidebar preview mirrors what the server's getLastMessages()
      // would now report (main thread only — see its own comment) —
      // updated locally instead of re-fetching the whole roster on
      // every finished turn.
      if (sessionId === DEFAULT_SESSION_ID && key === convKey(colleagueId, sessionId)) {
        const rosterColleague = colleaguesById.get(colleagueId);
        if (rosterColleague) rosterColleague.lastMessage = { role: update.role, text };
      }
      if (update.role === 'colleague' && !isConversationVisible(key)) {
        const target = colleaguesById.get(key) || colleaguesById.get(colleagueId);
        notify(target?.name || colleagueId, text, () => target && selectColleague(target, sessionId));
      }
      // In-app badge — see the channel_message handler's own comment on
      // why this is independent of document.hasFocus(): "not the
      // conversation you have open right now" is the whole signal, tab
      // focus or not.
      if (update.role === 'colleague' && key !== activeConvKey()) {
        unreadConversations.add(key);
        refreshUnreadTitle();
        renderSidebar();
      }
      break;
    }
    case 'permission_request':
      if (isAlwaysAllowed(key, update.toolName)) {
        const via = alwaysAllowedTools.get(key)?.has('*') ? 'autopilot' : 'allow always';
        socket.send(JSON.stringify({ type: 'permission_response', requestId: update.requestId, allow: true, via }));
        return;
      }
      pendingPermission.set(key, update);
      break;
    default:
      return;
  }
  if (key === activeConvKey()) renderMessages();
};

// Exponential backoff (capped at 15s), reset back to the floor the
// moment a connection actually opens — a dropped connection right
// after waking from sleep should retry almost immediately, but a
// server that's genuinely down shouldn't get hammered every 500ms
// forever.
let reconnectDelayMs = 500;
let reconnectTimer = null;

function connectSocket() {
  const s = new WebSocket(wsUrl());
  s.addEventListener('message', handleSocketMessage);
  s.addEventListener('open', () => {
    reconnectDelayMs = 500;
  });
  s.addEventListener('close', () => {
    // Only one retry ever pending at a time — a second 'close' while
    // one is already scheduled (shouldn't happen, but a reconnect
    // attempt that itself immediately fails would otherwise stack
    // more and more timers) just reuses the one already ticking down.
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      socket = connectSocket();
    }, reconnectDelayMs);
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 15000);
  });
  return s;
}

let socket = connectSocket();

// The other half of "no reload, that's WebSocket's job": `close` alone
// only fires once the browser/OS notices the connection is actually
// gone, which on a backgrounded tab can lag well behind the moment
// the user actually looks at the app again. `visibilitychange` is the
// standard "the user is looking at this again" signal — reconnecting
// right then, instead of waiting for `close` to eventually notice,
// is the difference between "instant" and "works after a few seconds
// of nothing".
// Two callers now — the visibility signal below and the pull-to-refresh
// gesture near the end of this file — so the "is it actually dead, and
// if so stop waiting and go now" decision lives in one place rather than
// being restated (and drifting) at each of them.
function reconnectIfDead() {
  if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) return;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectDelayMs = 500;
  socket = connectSocket();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  reconnectIfDead();
});

// `key`: for a 1:1 turn this is the full convKey its one caller already
// passes in (see renderMessages); for a channel turn it's the
// channelKey(colleagueId, channelId) composite PermissionCard builds
// below — either way, an opaque string this function never picks apart,
// just uses to address the right map entry.
function respondToPermission(key, requestId, allow, isChannel) {
  if (isChannel) {
    channelPendingPermission.delete(key);
    renderChannelMessages();
  } else {
    pendingPermission.delete(key);
    renderMessages();
  }
  socket.send(JSON.stringify({ type: 'permission_response', requestId, allow }));
}

// --- Preact components (the migrated slice) -------------------------
// Everything from here to the end of renderChannelMessages is Preact —
// see the file header for scope. The rest of this file, above and
// below this section, is unchanged, hand-written DOM code.

// Shared by the 1:1 view and the channel view — same card, same
// Allow/Deny behavior, wherever the request came from. `isChannel`
// only decides which pending-permission map the response clears.
// `respondToPermission`/`rememberAlwaysAllowed`/`turnOnAutoMode` are
// the same plain functions the old vanilla version called — porting
// the markup didn't need to touch the behavior they implement.
function PermissionCard({ permission, colleagueId, isChannel }) {
  // For a channel, the `colleagueId` prop is the bare id (see
  // renderChannelMessages) — combined here with the channel so per-tool
  // memory and "autopilot" don't leak into her other channels the way
  // they used to (colleagueId alone was the whole key). For a 1:1, the
  // prop is already the full convKey its caller passes in — nothing to
  // combine.
  const key = isChannel ? channelKey(colleagueId, permission.channelId) : colleagueId;
  const allow = () => respondToPermission(key, permission.requestId, true, isChannel);
  // "Allow always" — stop asking about this one tool (e.g. every
  // future Read) for the rest of this conversation, short of full
  // autopilot. Purely client-side (see alwaysAllowedTools): later
  // matching permission_request updates are auto-answered before a
  // card ever gets built for them.
  const allowAlways = () => {
    rememberAlwaysAllowed(key, permission.toolName);
    respondToPermission(key, permission.requestId, true, isChannel);
  };
  const deny = () => respondToPermission(key, permission.requestId, false, isChannel);
  // "Turn on autopilot" — allow everything, not just this one tool.
  // For a 1:1 conversation this is the real, server-backed auto mode
  // (same mechanism as the pane-header checkbox — see turnOnAutoMode);
  // a channel turn has no server-side auto mode to flip (see
  // server/index.js's autoModeSessions), so it gets the client-side "*"
  // wildcard in alwaysAllowedTools instead, scoped to this one channel
  // (see `key` above) — same practical effect, no more cards shown for
  // her in this channel, just not enforced on the server the way 1:1
  // auto mode is, and not remembered anywhere visible (there's
  // nowhere in the UI that shows it's on — tracked separately).
  const autopilot = () => {
    rememberAlwaysAllowed(key, '*');
    if (!isChannel) turnOnAutoMode();
    // respondToPermission below already re-renders the message list
    // (which drops this card) — pane-header's own autopilot badge (see
    // renderPaneHeader) needs its own nudge since it isn't part of that
    // re-render, only when this channel is actually the one on screen.
    if (isChannel && permission.channelId === activeChannelId) renderPaneHeader();
    respondToPermission(key, permission.requestId, true, isChannel);
  };

  return html`
    <div class="permission-card">
      <p>${permission.title || `Wants to use ${permission.displayName || permission.toolName}`}</p>
      ${permission.description ? html`<p class="permission-card__description">${permission.description}</p>` : null}
      <div class="permission-card__actions">
        <button type="button" onClick=${allow}>Allow</button>
        <button type="button" class="permission-card__allow-always" onClick=${allowAlways}>Allow always</button>
        <button type="button" class="permission-card__deny" onClick=${deny}>Deny</button>
        <button type="button" class="permission-card__autopilot" onClick=${autopilot}>Turn on autopilot</button>
      </div>
    </div>
  `;
}

// Preact-only counterpart to the vanilla `avatarEl` below — deliberately
// separate rather than shared: `avatarEl` returns a real DOM node and
// has many other callers outside this migrated slice (sidebar rows,
// the settings usage table, mention autocomplete, ...) that this PR
// doesn't touch. Duplicating these ~6 lines once is the honest
// trade-off for not dragging the rest of the sidebar into this change.
function Avatar({ colleague }) {
  if (colleague?.hasAvatar) {
    const src = `api/avatar?colleagueId=${encodeURIComponent(colleague.avatarId || colleague.id)}`;
    return html`<img class="avatar" src=${src} alt=${colleague.name} />`;
  }
  return html`<div class="avatar avatar--initial">${(colleague?.name || '?').charAt(0).toUpperCase()}</div>`;
}

// Same shape as the old toolDetailEl, ported 1:1: `edits` (a MultiEdit-
// shaped tool) recurses per edit, `old_string`/`new_string` (Edit)
// render as a removed/added pair, `content` (Write) shows the file's
// new content, anything else falls back to formatted JSON.
function ToolDetailBox({ input }) {
  if (!input) return html`<div class="tool-detail">(no input)</div>`;
  if (Array.isArray(input.edits)) {
    return html`<div class="tool-detail">${input.edits.map((edit, i) => html`<${ToolDetailBox} key=${i} input=${edit} />`)}</div>`;
  }
  if (typeof input.old_string === 'string' && typeof input.new_string === 'string') {
    return html`
      <div class="tool-detail">
        <div class="tool-detail__label">− removed</div>
        <pre class="tool-detail__removed">${input.old_string}</pre>
        <div class="tool-detail__label">+ added</div>
        <pre class="tool-detail__added">${input.new_string}</pre>
      </div>
    `;
  }
  return html`<div class="tool-detail"><pre>${typeof input.content === 'string' ? input.content : JSON.stringify(input, null, 2)}</pre></div>`;
}

// The "how she got there" trail — tool calls and extended thinking for
// one turn, collapsed into a single small, scrollable box under the
// finished reply instead of a run of separate bubbles ahead of it (see
// the 'message' case in the socket handler for how the trail is built).
// A tool-use entry keeps its own click-to-expand detail, same as before;
// a thinking entry is just its accumulated text.
// How a tool call got its go-ahead, shown next to the call when it was NOT
// a prompt the human answered: allowed by a settings rule or by default
// ('not asked'), by auto mode, by an earlier "Allow always", or by the
// channel autopilot. Reading files and searching need no approval at all
// (Claude Code's permission docs: read-only tools require none within the
// working directory), so those stay unlabelled.
const NO_APPROVAL_TOOLS = new Set(['Read', 'Grep', 'Glob']);
function approvalLabel(entry) {
  if (!entry.approval || entry.approval === 'asked') return null;
  if (entry.approval === 'not asked' && NO_APPROVAL_TOOLS.has(entry.toolName)) return null;
  return entry.approval === 'not asked' ? 'ran without asking' : entry.approval;
}

function TrailBox({ trail, onToggleEntry }) {
  return html`
    <div class="trail-box">
      ${trail.map(
        (entry, i) =>
          html`<div key=${i} class="trail-box__entry">
            ${entry.kind === 'tool_use'
              ? html`
                  <span class="tool-use-line" onClick=${() => onToggleEntry(i)}>${entry.text}</span>
                  ${approvalLabel(entry) ? html` <span class="trail-box__approval">${approvalLabel(entry)}</span>` : null}
                  ${entry.expanded ? html`<${ToolDetailBox} input=${entry.toolInput} />` : null}
                `
              : html`<span class="trail-box__thinking">${entry.text}</span>`}
          </div>`
      )}
    </div>
  `;
}

// One row of a conversation — a real message/tool-use line, used by
// both renderMessages and renderChannelMessages. This one component is
// the actual point of the migration: the two callers used to build
// this same bubble shape by hand, twice, with the duplication drifting
// a little further apart every time a feature (attachments, timestamps)
// landed in one and had to be copied into the other by hand.
//
// `avatarColleague` is null when no avatar should show at all (a "you"
// or system row) — not just "no colleague known". `nameTag` is only
// ever used on the non-tool-use branch (a tool-use line's own text
// already carries whatever name prefix its caller decided on — see
// `toolText`), matching the old code's exact behavior, not something
// redesigned here. `onToggleTrailEntry` flips one entry of `item.trail`
// (see TrailBox) — only reachable on that same non-tool-use branch,
// since a standalone tool-use row (still used as-is by the channel view)
// never carries a trail of its own. The trail itself renders as its own
// element above the bubble, not inside it — ahead of the reply, where
// the reasoning reads naturally, rather than tucked under the reply
// text or as a run of separate bubbles.
// Puts `text` on the clipboard. `navigator.clipboard` only exists in secure
// contexts (https or localhost, MDN: Clipboard.writeText), and this app is
// also opened over plain http on a LAN address, so there is a fallback
// through a temporary, selected textarea. Resolves to true when it worked.
async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the textarea
    }
  }
  const previous = document.activeElement;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  previous?.focus?.();
  return ok;
}

// Copies and says so on the button itself for a moment ("Copied" or
// "Copy failed"), then restores its label.
async function copyWithFeedback(text, button) {
  const label = button.dataset.label || button.textContent;
  button.dataset.label = label;
  const ok = await copyToClipboard(text);
  button.textContent = ok ? 'Copied' : 'Copy failed';
  clearTimeout(Number(button.dataset.timer));
  button.dataset.timer = String(setTimeout(() => { button.textContent = label; }, 1500));
}

function MessageRow({ role, avatarColleague, nameTag, item, toolText, onToggle, onToggleTrailEntry, onWithdraw }) {
  const isToolUse = item.toolInput !== undefined;
  const time = formatMessageTime(item.createdAt);
  return html`
    <${Fragment}>
      ${item.trail?.length ? html`<${TrailBox} trail=${item.trail} onToggleEntry=${onToggleTrailEntry} />` : null}
      <div class="message message--${role}${item.pending ? ' message--pending' : ''}">
        ${avatarColleague ? html`<${Avatar} colleague=${avatarColleague} />` : null}
        ${isToolUse
          ? html`
              <span class="tool-use-line" onClick=${onToggle}>${toolText}</span>
              ${item.expanded ? html`<${ToolDetailBox} input=${item.toolInput} />` : null}
            `
          : html`
              <span>
                ${nameTag ? html`<strong class="message__sender">${nameTag}</strong><br />` : null}
                ${item.text ? html`<span dangerouslySetInnerHTML=${{ __html: renderMarkdown(item.text) }} />` : null}
                ${(item.attachments || []).map(
                  (attachment, i) => html`<img key=${i} class="attachment-thumb" src=${attachment.dataUrl} alt=${attachment.name} role="button" tabindex="0" />`
                )}
                <span class="message__footer">
                  ${item.text
                    ? html`<button type="button" class="copy-button" aria-label="Copy message as Markdown" onClick=${(event) => copyWithFeedback(item.text, event.currentTarget)}>Copy</button>`
                    : null}
                  ${item.pending
                    ? html`<time class="message__time">${item.kind === 'queue' ? 'Queued, answered after this turn' : 'Waiting, not read yet'}</time>
                        ${item.canCancel && item.clientId
                          ? html`<button type="button" class="withdraw-button" disabled=${Boolean(item.withdrawing)} aria-label="Withdraw this message, it has not been read yet" onClick=${onWithdraw}>Withdraw</button>`
                          : null}`
                    : time ? html`<time class="message__time">${time}</time>` : null}
                </span>
              </span>
            `}
      </div>
    <//>
  `;
}

// The "still typing" / extended-thinking row — a colleague's live,
// in-progress turn. No timestamp (it isn't a finished message yet) and
// no attachments (never streamed). `nameTag` is only passed by the
// channel view's typing-indicator loop, which can have several
// colleagues mid-turn at once and needs to say whose text this is; the
// 1:1 view never passes it, matching the old code (a DM only ever has
// one other party, no name needed).
// `colleague`: null means "don't show an avatar here at all" (see
// MessageRow's own avatarColleague — same convention), not "show the
// fallback initial circle for an unknown colleague". Avatars next to
// bubbles are for group chats only: the 1:1 view passes null here, the
// channel view passes the real colleague (several senders there, an
// avatar is what says who).
function StreamingRow({ role, colleague, nameTag, text }) {
  return html`
    <div class="message message--${role} message--streaming">
      ${colleague ? html`<${Avatar} colleague=${colleague} />` : null}
      <span>
        ${nameTag ? html`<strong class="message__sender">${nameTag}</strong><br />` : null}
        <span dangerouslySetInnerHTML=${{ __html: renderMarkdown(text) }} />
      </span>
    </div>
  `;
}

// An <img> for a colleague with a photo, or a circle with their first
// initial when they don't have one yet — hiring day one, before anyone
// has gotten around to a photo, still needs to render something.
// `avatarId` (set on a subagent's synthetic colleague entry — see
// registerSubagentColleague) fetches a known colleague's real photo
// under her own id, since the synthetic id itself isn't one
// /api/avatar recognizes.
// The one shared "x to close/remove" glyph — every remaining spot that
// used to set `textContent = '✕'` is a dynamically built element, so it
// could not reuse index.html's own inline SVGs directly. One helper
// instead of pasting the markup four times. See DESIGN.md's asset rule:
// icons are inline SVG on purpose, never a Unicode symbol from the
// system font.
function xIconEl() {
  const span = document.createElement('span');
  span.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
  return span.firstElementChild;
}

function avatarEl(colleague) {
  if (colleague?.hasAvatar) {
    const img = document.createElement('img');
    img.className = 'avatar';
    img.src = `api/avatar?colleagueId=${encodeURIComponent(colleague.avatarId || colleague.id)}`;
    img.alt = colleague.name;
    return img;
  }
  const fallback = document.createElement('div');
  fallback.className = 'avatar avatar--initial';
  fallback.textContent = (colleague?.name || '?').charAt(0).toUpperCase();
  return fallback;
}

// Shown in #messages when there is genuinely nothing to show. Kept to
// one line: it is a hint about the next step, not a welcome screen.
function EmptyConversation({ text }) {
  return html`<p class="conversation-empty">${text}</p>`;
}

function renderMessages({ forceScrollToBottom = false } = {}) {
  // Measured before `render()` below touches the DOM — scrollHeight
  // only reflects what's on screen right now, so this has to happen
  // while "on screen" still means the previous, not the about-to-grow,
  // content (see isNearBottom's own comment).
  const stickToBottom = forceScrollToBottom || isNearBottom();
  const key = activeConvKey();
  const items = history.get(key) || [];
  // No `colleague` lookup here anymore — a 1:1 thread doesn't show a
  // per-message avatar at all now (see MessageRow/StreamingRow calls
  // below), her photo lives in the pane-header instead (renderPaneHeader).
  const thinkingText = thinkingStreaming.get(key);
  const partialText = streaming.get(key);
  const permission = pendingPermission.get(key);
  // Tool calls for the turn still in progress — not attached to a
  // finished message yet (that only happens in the 'message' case), so
  // shown live in the same small box, right under the in-progress reply.
  const liveTrail = pendingTrail.get(key) || [];

  // One bubble. A message sent while the colleague was mid-turn is
  // `pending` (see the send handler) and is drawn below her live block
  // instead of among the settled ones — otherwise it scrolls up out of
  // sight above her still-growing thinking and tool lines.
  const row = (item, i) => html`<${MessageRow}
    key=${i}
    role=${item.role}
    avatarColleague=${null}
    nameTag=${null}
    item=${item}
    toolText=${item.text}
    onToggle=${() => {
      item.expanded = !item.expanded;
      renderMessages();
    }}
    onToggleTrailEntry=${(entryIndex) => {
      item.trail[entryIndex].expanded = !item.trail[entryIndex].expanded;
      renderMessages();
    }}
    onWithdraw=${() => {
      item.withdrawing = true;
      renderMessages();
      socket.send(JSON.stringify({ type: 'cancel_message', id: item.clientId, colleagueId: activeColleagueId, sessionId: activeSessionId }));
    }}
  />`;

  render(
    html`<${Fragment}>
      ${items.map((item, i) => (item.pending ? null : row(item, i)))}
      ${thinkingText ? html`<${StreamingRow} role="thinking" colleague=${null} text=${thinkingText} />` : null}
      ${partialText ? html`<${StreamingRow} role="colleague" colleague=${null} text=${partialText} />` : null}
      ${liveTrail.length
        ? html`<${TrailBox}
            trail=${liveTrail}
            onToggleEntry=${(entryIndex) => {
              liveTrail[entryIndex].expanded = !liveTrail[entryIndex].expanded;
              renderMessages();
            }}
          />`
        : null}
      ${permission ? html`<${PermissionCard} permission=${permission} colleagueId=${key} isChannel=${false} />` : null}
      ${items.map((item, i) => (item.pending ? row(item, i) : null))}
      ${isTyping(key) && !permission ? html`<div class="typing-indicator" role="status">typing…</div>` : null}
      ${!items.length && !thinkingText && !partialText && !permission && !liveTrail.length
        ? html`<${EmptyConversation}
            text=${`No messages with ${colleaguesById.get(activeColleagueId)?.name || 'this colleague'} yet. Write the first one below.`}
          />`
        : null}
    <//>`,
    messagesEl
  );

  refreshHiringModeStyling(key);
  followThinkingTail();
  updateQueueButton();
  if (stickToBottom) scrollMessagesToBottom();
  else updateScrollToBottomButton();
}

// "Queue message" next to Send: only in a 1:1 conversation whose colleague
// is working on a turn right now (without one there is nothing to queue
// behind, Send does the same).
function updateQueueButton() {
  queueButtonEl.hidden = !(activeColleagueId && !activeChannelId && !input.disabled && isTyping(activeConvKey()));
}

// A channel's message list, one bubble per sender — the part a 1:1
// thread doesn't need, since there only one "colleague" ever speaks.
// role--you/role--colleague/role--system reuse the exact same bubble
// styling as a 1:1 thread; only the colleague bubbles additionally
// carry a name tag, since which colleague spoke changes message to
// message here.
function renderChannelMessages({ forceScrollToBottom = false } = {}) {
  queueButtonEl.hidden = true;
  // Same reasoning as renderMessages' own stickToBottom — measured
  // before render() below, not after.
  const stickToBottom = forceScrollToBottom || isNearBottom();
  const items = channelMessages.get(activeChannelId) || [];

  // Who's currently mid-turn in this channel, so there is always an
  // indication of who's writing. One entry per colleague actively
  // replying here right now, carrying her live thinking/reply text as
  // it streams in, exactly like the 1:1 view does.
  const typingEntries = [];
  for (const [colleagueId, channelId] of channelTyping) {
    if (channelId !== activeChannelId) continue;
    const colleague = colleaguesById.get(colleagueId);
    const thinkingPartial = channelThinkingStreaming.get(colleagueId);
    const partial = channelStreaming.get(colleagueId);
    typingEntries.push({
      colleagueId,
      colleague,
      thinkingText: thinkingPartial?.channelId === activeChannelId ? thinkingPartial.text : null,
      liveText: partial?.channelId === activeChannelId ? partial.text : '',
      // Tool calls for her turn still in progress — not attached to a
      // finished item yet (see the 'channel_message' handler), so shown
      // live here, same idea as the 1:1 view's own liveTrail.
      liveTrail: channelPendingTrail.get(colleagueId) || [],
    });
  }

  // Filters by value (p.channelId), not the map's own key — the key is
  // now the opaque channelKey(colleagueId, channelId) composite (see
  // above), not something worth picking apart here.
  const permissionEntries = [...channelPendingPermission.values()].filter((p) => p.channelId === activeChannelId);

  // One bubble. A `pending` message (written while somebody was mid-turn)
  // is drawn below the live rows instead of among the settled ones.
  const row = (item, i) => {
    const isYou = item.senderId === 'you';
    const isSystem = item.senderId === 'system';
    const sender = isYou || isSystem ? null : colleaguesById.get(item.senderId);
    const role = isYou ? 'you' : isSystem ? 'system' : 'colleague';
    return html`<${MessageRow}
      key=${i}
      role=${role}
      avatarColleague=${sender}
      nameTag=${sender?.name || null}
      item=${item}
      toolText=${item.text}
      onToggle=${() => {
        item.expanded = !item.expanded;
        renderChannelMessages();
      }}
      onToggleTrailEntry=${(entryIndex) => {
        item.trail[entryIndex].expanded = !item.trail[entryIndex].expanded;
        renderChannelMessages();
      }}
    />`;
  };

  render(
    html`<${Fragment}>
      ${items.map((item, i) => (item.pending ? null : row(item, i)))}
      ${typingEntries.map(
        ({ colleagueId, colleague, thinkingText, liveText, liveTrail }) => html`
          <${Fragment} key=${colleagueId}>
            ${liveTrail.length
              ? html`<${TrailBox}
                  trail=${liveTrail}
                  onToggleEntry=${(entryIndex) => {
                    liveTrail[entryIndex].expanded = !liveTrail[entryIndex].expanded;
                    renderChannelMessages();
                  }}
                />`
              : null}
            ${thinkingText ? html`<${StreamingRow} role="thinking" colleague=${colleague} text=${thinkingText} />` : null}
            <${StreamingRow}
              role="colleague"
              colleague=${colleague}
              nameTag=${colleague?.name || colleagueId}
              text=${liveText || 'is typing…'}
            />
          <//>
        `
      )}
      ${permissionEntries.map(
        (permission) => html`<${PermissionCard}
          key=${channelKey(permission.colleagueId, permission.channelId)}
          permission=${permission}
          colleagueId=${permission.colleagueId}
          isChannel=${true}
        />`
      )}
      ${items.map((item, i) => (item.pending ? row(item, i) : null))}
      ${!items.length && !typingEntries.length
        ? html`<${EmptyConversation}
            text=${`Nothing in #${channelsById.get(activeChannelId)?.name || 'this channel'} yet. Write the first message, or @name someone to bring them in.`}
          />`
        : null}
    <//>`,
    messagesEl
  );

  refreshHiringModeStyling(activeChannelId);
  followThinkingTail();
  if (stickToBottom) scrollMessagesToBottom();
  else updateScrollToBottomButton();
}

async function selectChannel(channel) {
  saveDraft(); // for whatever was active before this switch, not the channel below
  appEl.classList.add('pane-active'); // no-op above the mobile breakpoint (see styles.css)
  activeChannelId = channel.id;
  activeColleagueId = null;
  activeSessionId = null;
  rememberOpenConversation({ channelId: channel.id });
  closeMentionAutocomplete();
  if (unreadConversations.delete(UNREAD_CHANNEL_PREFIX + channel.id)) refreshUnreadTitle();
  renderSidebar();
  input.disabled = false;
  sendButton.disabled = false;
  attachButtonEl.style.display = '';
  input.placeholder = `Message #${channel.name}… (@name/@all to address someone directly, or just ask)`;
  input.value = drafts.get(channelConvKey(channel.id)) || '';
  autoResizeComposer();

  renderPaneHeader();
  refreshDiffIfOpen();
  await loadChannelHistory(channel.id);
  // Forced, not the usual isNearBottom heuristic — this is a fresh
  // conversation replacing whatever was on screen a moment ago, so
  // that heuristic would be reading the *previous* channel's scroll
  // position, not this one's.
  if (activeChannelId === channel.id) renderChannelMessages({ forceScrollToBottom: true });
}

// Split out of selectChannel so the pull-to-refresh gesture can ask for
// the same history again with `force` — opening a channel wants the
// cached copy if there is one, pulling down explicitly means "I don't
// trust what I'm looking at, go and ask the server".
async function loadChannelHistory(channelId, { force = false } = {}) {
  if (channelMessages.has(channelId) && !force) return;
  const res = await fetch(`api/channel-history?channelId=${encodeURIComponent(channelId)}`);
  const rows = await res.json();
  channelMessages.set(
    channelId,
    rows.map((row) => ({
      senderId: row.sender_id,
      text: row.text,
      createdAt: row.created_at,
      attachments: storedAttachments(row.attachments),
    }))
  );
}

// A subagent exchange (synthetic id, starts with "sub:") is a single
// already-running-or-finished Task call, not a standing session —
// nothing would receive a reply, so the composer stays off for one.
function isSubagentThread(colleagueId) {
  return colleagueId.startsWith('sub:');
}

// `sessionId` defaults to the colleague's implicit main conversation.
// Passing a real session id (from the sidebar's nested session rows,
// or right after creating a new one) switches to that parallel
// conversation instead — same colleague, same persona, independent
// history and adapter (see server/index.js's own adapterKey()).
async function selectColleague(colleague, sessionId = DEFAULT_SESSION_ID) {
  saveDraft(); // for whatever was active before this switch, not the colleague below
  appEl.classList.add('pane-active'); // no-op above the mobile breakpoint (see styles.css)
  activeColleagueId = colleague.id;
  activeSessionId = isSubagentThread(colleague.id) ? null : sessionId;
  if (activeSessionId !== null) lastSessionByColleague.set(colleague.id, activeSessionId);
  if (activeSessionId !== null) rememberOpenConversation({ colleagueId: colleague.id, sessionId: activeSessionId });
  activeChannelId = null;
  closeMentionAutocomplete();
  if (unreadConversations.delete(activeConvKey())) refreshUnreadTitle();
  renderSidebar();
  const canReply = !isSubagentThread(colleague.id);
  input.disabled = !canReply;
  sendButton.disabled = !canReply;
  attachButtonEl.style.display = '';
  input.placeholder = canReply ? `Message ${colleague.name}…` : 'One-off exchange — nothing to reply to here.';
  input.value = canReply ? drafts.get(convKey(colleague.id, activeSessionId)) || '' : '';
  autoResizeComposer();
  renderPaneHeader();
  refreshDiffIfOpen();

  const key = activeConvKey();
  await loadColleagueHistory(colleague.id, activeSessionId, key);
  // Forced — same reasoning as selectChannel's own call just above.
  if (activeConvKey() === key) renderMessages({ forceScrollToBottom: true });
}

// Images stored with a message come back as {id, name, mimeType}; the
// bytes are fetched by the <img> itself (api/attachment), so `dataUrl`
// holds that address — every renderer only ever reads `dataUrl`.
function storedAttachments(list) {
  return (list || []).map((a) => ({ ...a, dataUrl: `api/attachment?id=${a.id}` }));
}

// Marks the bubble sent under `w.id` as waiting (see message_waiting).
function markWaiting(key, w) {
  const item = (history.get(key) || []).find((m) => m.clientId === w.id);
  if (!item) return;
  item.pending = true;
  item.kind = w.kind;
  item.canCancel = Boolean(w.canCancel);
}

// Same split, same reason as loadChannelHistory above.
// A subagent window's brief, tool lines and report are stored by the server
// under its synthetic id too (see store.js), so it loads like any other.
async function loadColleagueHistory(colleagueId, sessionId, key, { force = false } = {}) {
  sessionId = sessionId || DEFAULT_SESSION_ID; // a subagent thread has no session of its own  // Not `history.has(key)`: a live update (delta, thinking, a message that
  // arrives) creates an empty entry before this runs when a tab is opened
  // or reloaded mid-turn, and that used to count as "already loaded" — the
  // stored conversation then never appeared.
  if (loadedHistory.has(key) && !force) return;
  const res = await fetch(
    `api/history?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
  );
  const rows = await res.json();
  loadedHistory.add(key);
  history.set(
    key,
    rows.map((row) => ({
      role: row.role,
      text: row.text,
      createdAt: row.created_at,
      trail: reconstructTrail(row.trail),
      attachments: storedAttachments(row.attachments),
      ...(row.waiting
        ? { pending: true, clientId: row.waiting.id, kind: row.waiting.kind, canCancel: row.waiting.canCancel }
        : {}),
    }))
  );
}


// Rebuilds the whole sidebar: one row per colleague, plus — right
// under whichever colleague is currently running one — a faded,
// clickable row per subagent exchange she's had, opening the exact
// same chat view as any real colleague (see registerSubagentColleague
// above). Called on roster load, on colleague selection (for the
// active-row highlight), and whenever a subagent starts or ends.
// A small dot on a sidebar row for a conversation in `unreadConversations`
// — appended after the text, before the button closes, same row every
// entry point below already builds. No-op (no dot) when there's nothing
// unread for that key, so a fully-read sidebar looks exactly as it did
// before this feature existed.
// `key` may be one conversation key or several (a colleague's row
// stands for all of her sessions — see sessionKeysFor); one badge if
// any of them qualifies, never one per session.
function appendUnreadBadge(button, key) {
  const keys = Array.isArray(key) ? key : [key];
  if (!keys.some((k) => unreadConversations.has(k))) return;
  const dot = document.createElement('span');
  dot.className = 'unread-badge';
  dot.title = 'New since you last looked';
  button.appendChild(dot);
}

// Same idea, same call sites, for `drafts` instead of
// `unreadConversations` — a small pencil rather than a dot, since
// "you have unsent text here" and "something new arrived here" are
// different things worth telling apart at a glance, not the same badge
// reused. Both can show on the same row (a draft in a channel that also
// got a reply while you were away) — appended as a separate element,
// not a shared one.
function appendDraftBadge(button, key) {
  const keys = Array.isArray(key) ? key : [key];
  if (!keys.some((k) => drafts.has(k))) return;
  const pencil = document.createElement('span');
  pencil.className = 'draft-badge';
  // Plain inline SVG, not an emoji glyph — same as every other icon
  // in this app (see index.html's own icons and their shared .icon
  // CSS class).
  pencil.innerHTML =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
  pencil.title = 'Unsent draft';
  button.appendChild(pencil);
}

// Subtitle for a sidebar row: "typing…" while that key's turn is in
// progress (see isTyping), the row's normal subtitle otherwise — same
// check for a colleague's main thread, a nested session, or a subagent
// panel, all three keying their turn into streaming/thinkingStreaming/
// pendingTrail exactly alike. This is visible in the sidebar
// itself, not only inside whichever conversation happens to be open.
function sidebarSubtitle(key, fallback) {
  return isTyping(key) ? { text: 'typing…', typing: true } : { text: fallback, typing: false };
}

function sidebarSubtitleHtml(key, fallback) {
  const { text, typing } = sidebarSubtitle(key, fallback);
  return `<span class="colleague__role${typing ? ' colleague__role--typing' : ''}">${text}</span>`;
}

// Collapse to one line and cap the length — a preview is a teaser, not
// the message itself (that's one tap away in the opened conversation).
function truncatePreview(text, max = 64) {
  const oneLine = (text || '').replace(/\s+/g, ' ').trim();
  return oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine;
}

// Top-level colleague row only (see call site): the role moves up next
// to the name in parens, kept very short —
// while the line below turns into a preview of the last message, same
// spot the role used to occupy on its own. Nested rows (parallel
// sessions, subagent panels) keep the plain role/title subtitle via
// sidebarSubtitleHtml above; they have no per-row lastMessage tracked.
function sidebarNameHtml(colleague) {
  // Wrapped in one line container, not two sibling spans directly under
  // .colleague__text — that parent is flex-direction:column (see its
  // own CSS), which turns direct children into separate stacked rows;
  // name and role-tag need to be two inline items *within* the same
  // row instead (see .colleague__name-line's own CSS, and the ellipsis
  // truncation instead of wrapping when the role is
  // long).
  const roleTag = colleague.role ? `<span class="colleague__role-tag">(${colleague.role})</span>` : '';
  return `<span class="colleague__name-line"><span class="colleague__name">${colleague.name}</span>${roleTag}</span>`;
}

function sidebarPreviewHtml(key, colleague) {
  if (isTyping(key)) return `<span class="colleague__role colleague__role--typing">typing…</span>`;
  const last = colleague.lastMessage;
  // colleague.role is deliberately not repeated here as a fallback
  // subtitle: it already sits right next to the name (see
  // sidebarNameHtml), so showing it again right below would double up
  // the exact same text for anyone with no messages yet.
  if (!last) return `<span class="colleague__role">No messages yet</span>`;
  const prefix = last.role === 'you' ? 'You: ' : '';
  return `<span class="colleague__role">${prefix}${truncatePreview(last.text)}</span>`;
}

// --- Sidebar search (everyone & everything) ---------------------------
// A search over everything, above the colleague list. Two sources
// merged into one flat result list while a query is typed: colleague
// names (instant, already have colleaguesList in memory) and message
// text (server-side — most conversations were never opened this
// session, so their text isn't in `history` to search client-side the
// way the in-chat search above does).
let sidebarSearchQuery = '';
let sidebarSearchHits = []; // server search results for the current query
let sidebarSearchDebounce = null;

async function runSidebarSearch(query) {
  clearTimeout(sidebarSearchDebounce);
  sidebarSearchDebounce = setTimeout(async () => {
    const res = await fetch(`api/search?q=${encodeURIComponent(query)}`);
    const hits = await res.json();
    // The query may have changed (or been cleared) while this was in
    // flight — only apply a response that still matches what's in the
    // box right now, same stale-response guard as everywhere else here
    // that awaits across a render.
    if (query === sidebarSearchQuery) {
      sidebarSearchHits = hits;
      renderSidebar();
    }
  }, 250);
}

sidebarSearchInputEl.addEventListener('input', () => {
  sidebarSearchQuery = sidebarSearchInputEl.value.trim();
  if (!sidebarSearchQuery) {
    sidebarSearchHits = [];
    renderSidebar();
    return;
  }
  runSidebarSearch(sidebarSearchQuery);
  renderSidebar(); // instant colleague-name matches while the message search is still in flight
});

function sidebarSearchResultRowEl({ avatarColleague, name, snippet, onClick }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'colleague';
  button.appendChild(avatarColleague ? avatarEl(avatarColleague) : (() => {
    const icon = document.createElement('div');
    icon.className = 'avatar avatar--initial';
    icon.textContent = '#';
    return icon;
  })());
  const text = document.createElement('span');
  text.className = 'colleague__text';
  text.innerHTML = `<span class="colleague__name">${name}</span>` +
    `<span class="colleague__role">${truncatePreview(snippet)}</span>`;
  button.appendChild(text);
  button.addEventListener('click', onClick);
  return button;
}

function renderSidebarSearchResults() {
  sidebarEl.innerHTML = '';
  const q = sidebarSearchQuery.toLowerCase();
  const nameMatches = colleaguesList.filter((c) => c.name.toLowerCase().includes(q));
  if (nameMatches.length === 0 && sidebarSearchHits.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No matches.';
    sidebarEl.appendChild(empty);
    return;
  }
  if (nameMatches.length > 0) {
    const header = document.createElement('div');
    header.className = 'sidebar-section-header';
    header.textContent = 'Colleagues';
    sidebarEl.appendChild(header);
    for (const colleague of nameMatches) {
      sidebarEl.appendChild(sidebarSearchResultRowEl({
        avatarColleague: colleague,
        name: colleague.name,
        snippet: colleague.role || '',
        // Opening a result deliberately keeps the search open and does
        // not clear the query/results; selectColleague's own
        // renderSidebar() call re-renders this same search view since
        // sidebarSearchQuery is still set.
        onClick: () => selectColleague(colleague),
      }));
    }
  }
  if (sidebarSearchHits.length > 0) {
    const header = document.createElement('div');
    header.className = 'sidebar-section-header';
    header.textContent = 'Messages';
    sidebarEl.appendChild(header);
    for (const hit of sidebarSearchHits) {
      if (hit.kind === 'channel') {
        const channel = channelsById.get(hit.channelId);
        sidebarEl.appendChild(sidebarSearchResultRowEl({
          avatarColleague: null,
          name: `#${channel?.name || hit.channelId}`,
          snippet: `${hit.senderId === 'you' ? 'You' : colleaguesById.get(hit.senderId)?.name || hit.senderId}: ${hit.text}`,
          onClick: () => { if (channel) openChannelAtHit(channel, hit); },
        }));
      } else {
        const colleague = colleaguesById.get(hit.colleagueId);
        sidebarEl.appendChild(sidebarSearchResultRowEl({
          avatarColleague: colleague,
          name: colleague?.name || hit.colleagueId,
          snippet: `${hit.role === 'you' ? 'You' : hit.role}: ${hit.text}`,
          onClick: () => { if (colleague) openColleagueAtHit(colleague, hit); },
        }));
      }
    }
  }
}

// Clicking a global search hit opens the conversation and jumps to the
// actual match instead of landing on the bottom, as opening it normally
// would. `hit` (from api/search — text + createdAt, no index: main-
// thread messages/channel messages aren't addressed by position on the
// server) is matched by (text, createdAt) against the just-loaded
// client-side array to recover a position jumpToMessage can scroll to.
// Not a guaranteed-unique match (two messages with the same text in the
// same millisecond would collide) — good enough for "land near the
// right message", not a hard requirement here.
async function openColleagueAtHit(colleague, hit) {
  await selectColleague(colleague);
  const items = history.get(convKey(colleague.id, DEFAULT_SESSION_ID)) || [];
  const index = items.findIndex((item) => item.createdAt === hit.createdAt && item.text === hit.text);
  if (index !== -1) jumpToMessage(index);
}

async function openChannelAtHit(channel, hit) {
  await selectChannel(channel);
  const items = channelMessages.get(channel.id) || [];
  const index = items.findIndex((item) => item.createdAt === hit.createdAt && item.text === hit.text);
  if (index !== -1) jumpToMessage(index);
}

function renderSidebar() {
  if (sidebarSearchQuery) {
    renderSidebarSearchResults();
    return;
  }
  sidebarEl.innerHTML = '';
  if (colleaguesList.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No colleagues in team/ yet.';
    sidebarEl.appendChild(empty);
    return;
  }
  for (const colleague of colleaguesList) {
    const button = document.createElement('button');
    button.type = 'button';
    // Active for any of her sessions, not only the default one — the
    // sessions have no rows of their own any more (see the comment at
    // the end of this loop), so this row is the only place left that
    // can say "you're talking to her". `activeSessionId` is null while
    // one of her subagent threads is open; that row lights up instead.
    const isActiveHere = colleague.id === activeColleagueId && activeSessionId !== null;
    button.className = 'colleague' + (isActiveHere ? ' colleague--active' : '');
    button.dataset.id = colleague.id;
    button.appendChild(avatarEl(colleague));
    // The preview follows the session that's open, so the row agrees
    // with the pane next to it; otherwise her main conversation.
    const shownSessionId = isActiveHere ? activeSessionId : DEFAULT_SESSION_ID;
    const shownKey = convKey(colleague.id, shownSessionId);
    const text = document.createElement('span');
    text.className = 'colleague__text';
    text.innerHTML = sidebarNameHtml(colleague) + sidebarPreviewHtml(shownKey, colleague);
    button.appendChild(text);
    // One badge for all of her conversations — a reply in a session you
    // can't see a row for must still show up somewhere.
    const allKeys = sessionKeysFor(colleague.id);
    appendUnreadBadge(button, allKeys);
    appendDraftBadge(button, allKeys);
    // Back to the session you were last in with her, not always the
    // default one — otherwise clicking her row while you're in session
    // two would silently drop you out of it.
    button.addEventListener('click', () => selectColleague(colleague, lastSessionByColleague.get(colleague.id) || DEFAULT_SESSION_ID));
    sidebarEl.appendChild(button);

    // Stays after the subagent finishes — it's a way back to that
    // exchange, not just a live indicator that should vanish once
    // it's no longer running (it must not disappear right when the
    // conversation ends).
    // Every sub-agent gets its row, named colleague or not: a general-purpose
    // one (or a small model) is exactly the kind that has no other way in.
    for (const panel of subagentPanels.get(colleague.id)?.values() ?? []) {
      const synthetic = colleaguesById.get(panel.syntheticId);
      const nested = document.createElement('button');
      nested.type = 'button';
      nested.className = 'colleague colleague--nested' +
        (panel.closed ? ' colleague--nested-done' : '') +
        (panel.syntheticId === activeColleagueId ? ' colleague--active' : '');
      nested.appendChild(avatarEl(synthetic));
      const nestedText = document.createElement('span');
      nestedText.className = 'colleague__text';
      nestedText.innerHTML = `<span class="colleague__name">${synthetic.name}</span>` +
        sidebarSubtitleHtml(panel.syntheticId, panel.closed ? 'done talking' : synthetic.role);
      nested.appendChild(nestedText);
      appendUnreadBadge(nested, panel.syntheticId);
      nested.addEventListener('click', () => selectColleague(synthetic));
      // A way to drop a single panel manually, not just all of a colleague's via reset-context.
      // A sibling button rather than nesting it inside `nested` itself
      // (invalid HTML — a <button> can't contain another one, and the
      // click targeting gets ambiguous even where a browser tolerates
      // it), wrapped together in `.colleague-row` so the row still reads
      // as one flex line. Only while she's done talking: deleting a
      // still-running panel would just let it silently keep working
      // with nowhere for its updates to land (see subagentPanels.get in
      // the socket handler above, which already no-ops for that).
      if (panel.closed) {
        const row = document.createElement('div');
        row.className = 'colleague-row';
        nested.classList.add('colleague-row__button');
        row.appendChild(nested);
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'colleague-row__remove';
        removeButton.appendChild(xIconEl());
        removeButton.title = 'Remove this panel';
        removeButton.setAttribute('aria-label', `Remove subagent panel for ${synthetic.name}`);
        removeButton.addEventListener('click', (event) => {
          event.stopPropagation();
          removeSubagentPanel(colleague.id, panel.id);
        });
        row.appendChild(removeButton);
        sidebarEl.appendChild(row);
      } else {
        sidebarEl.appendChild(nested);
      }
    }

    // Extra, parallel sessions with this colleague don't get rows of
    // their own here, and don't share the nested look of a subagent
    // exchange. A subagent is something that happened *inside* her
    // conversation and is worth seeing at a glance; a session is the
    // same colleague again, and one row per colleague is what the list
    // is for. Picking and starting sessions lives in her ⋮ dialog now
    // (see renderConvSettingsSessions); the row above carries the
    // unread/draft state of all of them, and the pane header names the
    // one that's open.
  }

  renderChannelsSection();
}

// The little inline form behind "+ New session with <name>" — same
// pattern as channelFormEl below: a title (optional — "Topic zwei" is
// enough, it doesn't need to be a real title) and a submit button that
// fires a `create_session` message; the server assigns the id and the
// 'session_created' echo (see socket handler above) is what actually
// adds it and switches into it.
function newSessionFormEl(colleague) {
  const formEl = document.createElement('form');
  formEl.className = 'session-form';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = "What's this session about? (optional)";
  formEl.appendChild(titleInput);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Start';
  formEl.appendChild(submit);

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.send(JSON.stringify({ type: 'create_session', colleagueId: colleague.id, title: titleInput.value.trim() }));
  });

  return formEl;
}

// Group channels: freely composed (not one fixed
// "everyone" channel), so creating one is part of the sidebar itself
// rather than a separate screen.
function renderChannelsSection() {
  const header = document.createElement('div');
  header.className = 'sidebar-section-header';
  header.textContent = 'Channels';
  sidebarEl.appendChild(header);

  for (const channel of channelsById.values()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'colleague' + (channel.id === activeChannelId ? ' colleague--active' : '');
    const icon = document.createElement('div');
    icon.className = 'avatar avatar--initial';
    icon.textContent = '#';
    button.appendChild(icon);
    const text = document.createElement('span');
    text.className = 'colleague__text';
    const memberNames = channel.memberIds.map((id) => colleaguesById.get(id)?.name || id).join(', ');
    // Unlike a DM/session (one turn, one key), a channel can have several
    // colleagues typing at once — name them, same "typing…" subtitle
    // idea as sidebarSubtitle, but built from channelTyping instead of a
    // single isTyping(key) check.
    const typingNames = [...channelTyping.entries()]
      .filter(([, chId]) => chId === channel.id)
      .map(([cId]) => colleaguesById.get(cId)?.name || cId);
    text.innerHTML = `<span class="colleague__name">#${channel.name}</span>` +
      (typingNames.length
        ? `<span class="colleague__role colleague__role--typing">${typingNames.join(', ')} typing…</span>`
        : `<span class="colleague__role">${memberNames}</span>`);
    button.appendChild(text);
    appendUnreadBadge(button, UNREAD_CHANNEL_PREFIX + channel.id);
    appendDraftBadge(button, channelConvKey(channel.id));
    button.addEventListener('click', () => selectChannel(channel));
    sidebarEl.appendChild(button);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'new-channel-button';
  toggle.innerHTML = '';
  if (showChannelForm) {
    toggle.append(xIconEl(), document.createTextNode(' Cancel'));
  } else {
    toggle.textContent = '+ New channel';
  }
  toggle.addEventListener('click', () => {
    showChannelForm = !showChannelForm;
    renderSidebar();
  });
  sidebarEl.appendChild(toggle);

  if (showChannelForm) sidebarEl.appendChild(channelFormEl());
}

function channelFormEl() {
  const formEl = document.createElement('form');
  formEl.id = 'channel-form';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Channel name';
  nameInput.required = true;
  formEl.appendChild(nameInput);

  // The submit handler below refuses a channel with no members, and used
  // to do it by returning silently — the button looked like it worked and
  // nothing happened, with the requirement itself written down nowhere.
  const membersHint = document.createElement('p');
  membersHint.className = 'channel-form__hint';
  membersHint.textContent = 'Who is in it? Pick at least one.';
  formEl.appendChild(membersHint);

  const members = document.createElement('div');
  members.className = 'channel-form__members';
  for (const colleague of colleaguesList) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = colleague.id;
    label.append(checkbox, document.createTextNode(' ' + colleague.name));
    members.appendChild(label);
  }
  formEl.appendChild(members);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Create';
  formEl.appendChild(submit);

  // Disabled until the form would actually go through, so the reason a
  // click does nothing is visible before the click rather than after it.
  const syncSubmit = () => {
    submit.disabled = !nameInput.value.trim() || !members.querySelector('input:checked');
  };
  nameInput.addEventListener('input', syncSubmit);
  members.addEventListener('change', syncSubmit);
  syncSubmit();

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const memberIds = [...members.querySelectorAll('input:checked')].map((c) => c.value);
    const name = nameInput.value.trim();
    if (!name || memberIds.length === 0) return;
    socket.send(JSON.stringify({ type: 'create_channel', name, memberIds }));
    showChannelForm = false;
    renderSidebar();
  });

  return formEl;
}

// `preserveSelection`: the startup call ends by opening the first
// colleague, which is right once and wrong every time after — a pull on
// the sidebar means "is this list still true", not "throw away the
// conversation I'm reading". It also skips the notification prompt,
// which belongs to first load, not to every refresh.
async function loadRoster({ preserveSelection = false } = {}) {
  const statusRes = await fetch('api/status');
  const { persisted, teamName } = await statusRes.json();
  noPersistenceBannerEl.hidden = persisted;
  // The header carries the team's own name and a logo that
  // can be swapped — both come from api/status/logo.png now (see
  // server/index.js's resolveCustomLogo), not hardcoded in index.html.
  // The `<img>` has no src until this resolves, so there's nothing to
  // flash from one logo to another.
  brandNameEl.textContent = teamName;
  // The name truncates in a 220px sidebar (see styles.css) — keep the
  // whole of it reachable on a pointer at least.
  brandNameEl.title = teamName;
  BASE_TITLE = `${teamName} chat`;
  refreshUnreadTitle();
  brandLogoEl.src = 'logo.png';
  // Not awaited — this round-trips through a live Claude session and
  // shouldn't hold up the rest of startup; renderPaneHeader() (called
  // inside) picks it up whenever it resolves. Almost always resolves to
  // `null` this early anyway (no colleague adapter exists until the
  // first message is sent — see refreshPlanUsage's own comment), but
  // costs nothing to try.
  refreshPlanUsage();

  // Pruned, not just written over: this runs a second time now (a pull
  // on the sidebar), and a colleague or channel that has gone away since
  // would otherwise stay in these maps forever — the sidebar would keep
  // listing someone the server no longer knows. Not a bare .clear() on
  // colleaguesById though: the synthetic "sub:" entries in there are
  // registered locally (see registerSubagentColleague) and were never in
  // api/colleagues to begin with, so clearing would take the open
  // subagent threads with it.
  const res = await fetch('api/colleagues');
  colleaguesList = await res.json();
  const rosterIds = new Set(colleaguesList.map((c) => c.id));
  for (const id of [...colleaguesById.keys()]) {
    if (!isSubagentThread(id) && !rosterIds.has(id)) colleaguesById.delete(id);
  }
  for (const colleague of colleaguesList) colleaguesById.set(colleague.id, colleague);

  // The sub-agent windows the server kept (see restoreSubagentPanels).
  // After the roster is in colleaguesById, so a window of a known colleague
  // gets her name and avatar again.
  try {
    const subRes = await fetch('api/subagent-threads');
    if (subRes.ok) restoreSubagentPanels(await subRes.json());
  } catch {
    // an older server has no such route: no windows to restore
  }

  const channelsRes = await fetch('api/channels');
  const channels = await channelsRes.json();
  channelsById.clear();
  for (const channel of channels) channelsById.set(channel.id, channel);

  // colleague-stats and auto-mode-sessions are already keyed the same
  // way convKey() produces locally (see server/index.js's adapterKey())
  // — no reshaping needed, just load them straight in.
  const statsRes = await fetch('api/colleague-stats');
  for (const [key, stats] of Object.entries(await statsRes.json())) colleagueStats.set(key, stats);

  // Replaced wholesale rather than added to: this is the one piece of
  // roster state where the interesting change is a key *disappearing*
  // (auto-mode switched off elsewhere), and adding-only would leave the
  // sidebar showing it as still on after a refresh.
  const autoModeRes = await fetch('api/auto-mode-sessions');
  const autoModeSessions = await autoModeRes.json();
  autoModeKeys.clear();
  for (const key of autoModeSessions) autoModeKeys.add(key);

  const gatekeeperUsageRes = await fetch('api/gatekeeper-usage');
  gatekeeperUsage = await gatekeeperUsageRes.json();

  await Promise.all(
    colleaguesList.map(async (colleague) => {
      const sessionsRes = await fetch(`api/sessions?colleagueId=${encodeURIComponent(colleague.id)}`);
      colleagueSessions.set(colleague.id, await sessionsRes.json());
    })
  );

  refreshNotifyPermissionButton();
  if (!preserveSelection && 'Notification' in window && Notification.permission === 'default') {
    // Best-effort — some browsers only grant this off a real click, in
    // which case this silently does nothing and notify-permission-button
    // (wired up below) is the fallback.
    Notification.requestPermission().then(refreshNotifyPermissionButton).catch(() => {});
  }

  renderSidebar();
  if (preserveSelection) {
    // The pane is showing a conversation whose stats/auto-mode/session
    // list may just have moved underneath it.
    renderPaneHeader();
    return;
  }
  // A reload (or reopening the app) goes back to the conversation that
  // was open, not to the first colleague.
  const restore = pickConversationToRestore(recallOpenConversation(), {
    colleagueIds: colleaguesList.map((c) => c.id),
    channelIds: [...channelsById.keys()],
    sessionIdsByColleague: Object.fromEntries([...colleagueSessions].map(([id, sessions]) => [id, sessions.map((x) => x.id)])),
    defaultSessionId: DEFAULT_SESSION_ID,
  });
  if (restore?.channelId) selectChannel(channelsById.get(restore.channelId));
  else if (restore) selectColleague(colleaguesById.get(restore.colleagueId), restore.sessionId);
  else if (colleaguesList.length > 0) selectColleague(colleaguesList[0]);
}

notifyPermissionButtonEl.addEventListener('click', () => {
  Notification.requestPermission().then(refreshNotifyPermissionButton).catch(() => {});
});

// Shared by the 📎 file picker and the composer's paste handler below —
// both end up with a File/Blob and want the exact same pendingAttachment
// shape out of it.
function loadAttachmentFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    // dataUrl is what the "you" bubble renders from; data strips the
    // "data:<mime>;base64," prefix, since that's all the adapters want.
    const dataUrl = reader.result;
    pendingAttachment = { name: file.name || 'pasted-image', mimeType: file.type, dataUrl, data: dataUrl.split(',')[1] };
    renderAttachmentPreview();
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  loadAttachmentFromFile(file);
});

// Pasting an image (screenshot, copied from Preview/Finder/a
// browser) works the same as picking one with 📎 — preview and
// all. Only intercepted when the clipboard actually carries an image;
// a normal text paste (the overwhelming majority) falls through
// untouched. Same one-attachment-at-a-time model the file picker
// already has — a multi-image paste keeps only the first, silently,
// exactly like selecting several files in the picker would.
input.addEventListener('paste', (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  const imageItem = [...items].find((item) => item.type.startsWith('image/'));
  if (!imageItem) return; // let the browser handle a plain text paste as usual
  event.preventDefault();
  const file = imageItem.getAsFile();
  if (file) loadAttachmentFromFile(file);
});

function renderAttachmentPreview() {
  attachmentPreviewEl.innerHTML = '';
  attachmentPreviewEl.hidden = !pendingAttachment;
  if (!pendingAttachment) return;
  const img = document.createElement('img');
  img.src = pendingAttachment.dataUrl;
  img.alt = pendingAttachment.name;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.appendChild(xIconEl());
  remove.setAttribute('aria-label', `Discard attachment ${pendingAttachment.name}`);
  remove.addEventListener('click', () => {
    pendingAttachment = null;
    fileInput.value = '';
    renderAttachmentPreview();
  });
  attachmentPreviewEl.append(img, remove);
}

const mentionAutocompleteEl = document.getElementById('mention-autocomplete');
// {start, end, query, matches, selectedIndex} — start/end are character
// offsets in input.value bounding the "@partial" token the dropdown is
// currently completing, or null when it isn't showing.
let mentionState = null;

// The whole roster matching what's been typed after the "@", not just
// this channel's current members, as in Teams/Slack, where
// @-mentioning someone is how you loop her in, not something the
// dropdown hides just because she isn't here yet. `inChannel` tells
// renderMentionAutocomplete which of the two she is, so the dropdown
// stays honest about it (see the hint text there) instead of implying
// every suggestion reaches her the same way. It doesn't, yet: mentioning
// someone outside the channel only actually dispatches to her once
// she's a member (extractMentions in server/mentions.js still filters
// on memberIds) — inserting her name here doesn't add her. Auto-joining
// her on mention is a real follow-up, not solved by this change; ask
// before building it, since it's a channel-membership decision, not a
// UI one. Plus the two "address everyone" keywords mentions.js treats
// specially, kept in sync with its ALL_KEYWORDS by hand since that list
// is tiny and server-side.
function mentionCandidates(query) {
  const channel = activeChannelId && channelsById.get(activeChannelId);
  const q = query.toLowerCase();
  // The suggestion list itself isn't a channel-only thing, even though dispatch is (see the
  // comment further up). Outside a channel there's no membership to
  // compare against, so `inChannel` is simply absent — renderMentionAutocomplete
  // only shows the "not in this channel" hint when it's explicitly false,
  // never when it's undefined.
  const named = colleaguesList
    .filter((c) => c.id.toLowerCase().startsWith(q) || c.name.toLowerCase().startsWith(q))
    .map((c) => ({ id: c.id, name: c.name, inChannel: channel ? channel.memberIds.includes(c.id) : undefined }))
    // Members of this channel first (immediately reachable), then
    // everyone else — alphabetical within each group. Outside a
    // channel every candidate ties on inChannel, so this is just a
    // plain alphabetical sort there.
    .sort((a, b) => (a.inChannel !== b.inChannel ? (a.inChannel ? -1 : 1) : a.name.localeCompare(b.name)));
  const everyone = channel
    ? ['all', 'everyone'].filter((kw) => kw.startsWith(q)).map((kw) => ({ id: kw, name: 'Everyone in this channel', inChannel: true }))
    : [];
  return [...named, ...everyone];
}

// The "@partial" token surrounding the caret, if the caret is inside
// one right now — same word-character set as mentions.js's own
// MENTION_PATTERN, so the dropdown only ever offers what the server
// would actually recognize as a mention.
function currentMentionToken() {
  const caret = input.selectionStart;
  const match = input.value.slice(0, caret).match(/@([a-z0-9_-]*)$/i);
  return match ? { start: caret - match[0].length, end: caret, query: match[1] } : null;
}

function closeMentionAutocomplete() {
  mentionState = null;
  mentionAutocompleteEl.hidden = true;
  mentionAutocompleteEl.innerHTML = '';
}

function renderMentionAutocomplete() {
  mentionAutocompleteEl.innerHTML = '';
  mentionAutocompleteEl.hidden = false;
  mentionState.matches.forEach((candidate, index) => {
    const li = document.createElement('li');
    li.setAttribute('aria-selected', String(index === mentionState.selectedIndex));
    const known = colleaguesById.get(candidate.id);
    if (known) {
      li.appendChild(avatarEl(known));
    } else {
      const icon = document.createElement('div');
      icon.className = 'avatar avatar--initial';
      icon.textContent = '@';
      li.appendChild(icon);
    }
    li.appendChild(document.createTextNode(candidate.name));
    // She's on the roster but not (yet) a member of this channel —
    // suggested anyway (see mentionCandidates), but flagged rather than
    // shown exactly like someone who's already reachable here.
    if (candidate.inChannel === false) {
      li.classList.add('mention-candidate--outside');
      const hint = document.createElement('span');
      hint.className = 'mention-candidate__hint';
      hint.textContent = 'not in this channel';
      li.appendChild(hint);
    }
    // mousedown, not click — fires before the input blurs, so the
    // caret/selection this reads is still the one the user was
    // looking at, not wherever focus landed after blur.
    li.addEventListener('mousedown', (event) => {
      event.preventDefault();
      acceptMention(candidate);
    });
    mentionAutocompleteEl.appendChild(li);
  });
}

function acceptMention(candidate) {
  const { start, end } = mentionState;
  const insertion = `@${candidate.id} `;
  input.value = input.value.slice(0, start) + insertion + input.value.slice(end);
  const caret = start + insertion.length;
  input.focus();
  input.setSelectionRange(caret, caret);
  autoResizeComposer(); // programmatic value changes don't fire 'input' on their own
  closeMentionAutocomplete();
}

// Composer grew from a single-line <input> into a <textarea> so a
// longer message doesn't scroll sideways out of view while you're still
// writing it. Height tracks content directly (reset to 'auto' first, so
// deleting a line shrinks it back down instead of only ever growing) —
// capped by #composer-input's own max-height/overflow-y in styles.css.
const COMPOSER_MAX_HEIGHT = 192; // px, matches styles.css's 12rem
function autoResizeComposer() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, COMPOSER_MAX_HEIGHT) + 'px';
}

input.addEventListener('input', () => {
  autoResizeComposer();
  const token = currentMentionToken();
  const matches = token ? mentionCandidates(token.query) : [];
  if (matches.length === 0) {
    closeMentionAutocomplete();
    return;
  }
  mentionState = { ...token, matches, selectedIndex: 0 };
  renderMentionAutocomplete();
});

// Arrow keys move the highlight, Enter/Tab accept it, Escape dismisses
// it — the same keys a native Enter-to-send composer would otherwise
// use, so these all call preventDefault() to keep the dropdown from
// fighting the form. Falls through to the plain composer handling below
// when the mention dropdown isn't open.
input.addEventListener('keydown', (event) => {
  if (mentionState) {
    const { matches } = mentionState;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      mentionState.selectedIndex = (mentionState.selectedIndex + 1) % matches.length;
      renderMentionAutocomplete();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      mentionState.selectedIndex = (mentionState.selectedIndex - 1 + matches.length) % matches.length;
      renderMentionAutocomplete();
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      acceptMention(matches[mentionState.selectedIndex]);
    } else if (event.key === 'Escape') {
      closeMentionAutocomplete();
    }
    return;
  }
  // Plain Enter now needs an explicit submit: a <textarea> (unlike the
  // old single-line <input>) treats it as "insert a newline" by
  // default, not "submit the form". Shift+Enter is the one combination
  // left alone — its default browser behavior already is "insert a
  // newline", so there's nothing to do but *not* intercept it. Plain
  // Shift+Enter is the cross-app convention (Slack, Discord,
  // iMessage, …) — Cmd is just along for the ride when it's also
  // held, not required.
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    // Alt+Enter: "Queue message" (only while that button is there).
    if (event.altKey && !queueButtonEl.hidden) form.requestSubmit(queueButtonEl);
    else form.requestSubmit();
  }
});

input.addEventListener('blur', () => closeMentionAutocomplete());

// Names a message so the server can withdraw it later (crypto.randomUUID
// only exists in secure contexts; a LAN address over http is not one).
function newMessageId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  closeMentionAutocomplete();
  const text = input.value.trim();
  if (!text && !pendingAttachment) return;

  if (activeChannelId) {
    // No optimistic local render here — the server echoes every
    // channel message (including your own) back over the socket, so
    // rendering it twice would be the bug, not a missing feature. An
    // attachment on its own (no text) is still worth sending — same
    // rule as the 1:1 branch below.
    const channelAttachments = pendingAttachment ? [pendingAttachment] : [];
    socket.send(JSON.stringify({
      type: 'channel_message',
      channelId: activeChannelId,
      text,
      attachments: channelAttachments.map((a) => ({ name: a.name, mimeType: a.mimeType, data: a.data })),
    }));
    drafts.delete(channelConvKey(activeChannelId)); // sent, not a draft anymore
    input.value = '';
    autoResizeComposer();
    pendingAttachment = null;
    fileInput.value = '';
    renderAttachmentPreview();
    return;
  }

  if (!activeColleagueId) return;
  const key = activeConvKey();
  if (!history.has(key)) history.set(key, []);
  const attachments = pendingAttachment ? [pendingAttachment] : [];
  // Written while she is still mid-turn: it stays below her live block,
  // marked as waiting, until her turn ends (see the 'message' update).
  // "Queue message" only counts while her turn runs; otherwise it is a plain send.
  const typing = isTyping(key);
  const kind = typing && event.submitter === queueButtonEl ? 'queue' : 'send';
  const clientId = newMessageId();
  history.get(key).push({ role: 'you', text, attachments, createdAt: new Date().toISOString(), pending: typing, clientId, kind });
  // Forced — sending your own message should always land you at the
  // bottom, same as every other chat app, regardless of where you'd
  // scrolled to read something older first.
  renderMessages({ forceScrollToBottom: true });
  if (activeSessionId === DEFAULT_SESSION_ID) {
    const rosterColleague = colleaguesById.get(activeColleagueId);
    if (rosterColleague) {
      rosterColleague.lastMessage = { role: 'you', text: text || 'Sent an attachment' };
      renderSidebar();
    }
  }
  socket.send(JSON.stringify({
    colleagueId: activeColleagueId,
    sessionId: activeSessionId,
    id: clientId,
    kind,
    text,
    attachments: attachments.map((a) => ({ name: a.name, mimeType: a.mimeType, data: a.data })),
  }));
  drafts.delete(key); // sent, not a draft anymore
  input.value = '';
  autoResizeComposer();
  pendingAttachment = null;
  fileInput.value = '';
  renderAttachmentPreview();
});

// --- Pull to refresh -------------------------------------------------
// The gesture the PWA was missing. On a phone "show me
// what's actually there now" is a pull — and in a standalone window
// there is no reload button to fall back on, so without this the only
// honest answer to a stale-looking screen was to close the app.
//
// It sits on BOTH full-screen scrollers, not just the open conversation:
// below the breakpoint the sidebar and the pane are two separate screens
// (see #app's mobile layout in styles.css), and a gesture that silently
// does nothing on one of them is a gesture nobody tries twice. Same
// mechanism, different question — the sidebar asks "is this list still
// true", the transcript asks "is this conversation still true".
//
// Both also revive the socket if it happens to be dead. That's not a
// second feature: the connection is what keeps either view current, and
// the moment someone reaches for a refresh gesture is exactly the moment
// they've stopped believing the connection. No reload, anywhere — the
// socket comes back, the page stays.

const PULL_TRIGGER_PX = 56; // travel, after damping, at which letting go refreshes
const PULL_MAX_PX = 72; // nothing moves further than this, however hard it's pulled
// Both deliberately short: the list itself doesn't move under the
// indicator, so every extra pixel of travel is another row it covers up.
const PULL_DAMPING = 0.45; // finger travel -> indicator travel; this is the "rubber"
const PULL_MIN_SPIN_MS = 450; // a refresh that answers instantly still has to be *seen*

// `surface`: the band drawn during the pull is opaque, and #messages and
// #sidebar sit on different backgrounds — it has to be told which one it
// is standing in for.
function attachPullToRefresh(scroller, onRefresh, surface) {
  const indicator = document.createElement('div');
  indicator.className = 'pull-refresh';
  indicator.style.setProperty('--pull-surface', surface);
  // Decorative: it reports the progress of a gesture that only exists
  // for a pointer in the first place, and the refreshed content lands in
  // #messages, which is already an aria-live region.
  indicator.setAttribute('aria-hidden', 'true');
  const spinner = document.createElement('span');
  spinner.className = 'pull-refresh__spinner';
  indicator.appendChild(spinner);
  document.body.appendChild(indicator);

  let startY = null;
  let pull = 0;
  let busy = false;

  function setPull(px) {
    pull = px;
    indicator.style.setProperty('--pull', `${px}px`);
    indicator.style.setProperty('--pull-progress', String(Math.min(px / PULL_TRIGGER_PX, 1)));
    indicator.classList.toggle('pull-refresh--armed', px >= PULL_TRIGGER_PX);
  }

  function hide() {
    setPull(0);
    indicator.classList.remove('pull-refresh--visible');
  }

  scroller.addEventListener('touchstart', (e) => {
    if (busy || e.touches.length !== 1) return;
    // Only a gesture that begins at the very top is a pull-to-refresh.
    // Anywhere else it is an ordinary scroll and has to stay one — this
    // single check is the whole difference between a gesture that feels
    // native and one that hijacks the list.
    if (scroller.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    // Measured per gesture rather than cached: the scroller's top edge
    // moves with the notch inset, the keyboard, and the mobile/desktop
    // layout switch, and a stale rect would park the indicator over the
    // wrong edge.
    const rect = scroller.getBoundingClientRect();
    indicator.style.left = `${rect.left}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.top = `${rect.top}px`;
    indicator.classList.remove('pull-refresh--settling');
  }, { passive: true });

  scroller.addEventListener('touchmove', (e) => {
    if (startY === null) return;
    const delta = e.touches[0].clientY - startY;
    // Upward, or the list started scrolling after all: this was a scroll,
    // not a pull. Bow out and leave the rest of the gesture to the
    // scroller.
    if (delta <= 0 || scroller.scrollTop > 0) {
      startY = null;
      hide();
      return;
    }
    // Non-passive on purpose (see the listener options): without
    // preventDefault the same downward travel is also the platform's own
    // overscroll, and the indicator would be tracking a finger that is
    // visibly dragging something else at the same time.
    e.preventDefault();
    indicator.classList.add('pull-refresh--visible');
    setPull(Math.min(delta * PULL_DAMPING, PULL_MAX_PX));
  }, { passive: false });

  async function release() {
    if (startY === null) return;
    startY = null;
    indicator.classList.add('pull-refresh--settling');
    if (pull < PULL_TRIGGER_PX) {
      hide();
      return;
    }
    busy = true;
    indicator.classList.add('pull-refresh--busy');
    setPull(PULL_TRIGGER_PX); // snaps back to the trigger distance and hangs there while it works
    try {
      reconnectIfDead();
      await Promise.all([
        onRefresh(),
        new Promise((resolve) => setTimeout(resolve, PULL_MIN_SPIN_MS)),
      ]);
    } catch {
      // A refresh that couldn't reach the server leaves the view exactly
      // as it was, which is the truthful outcome; the socket's own
      // backoff is what recovers from it. Nothing here is worth an alert.
    } finally {
      busy = false;
      indicator.classList.remove('pull-refresh--busy');
      hide();
    }
  }

  scroller.addEventListener('touchend', release, { passive: true });
  scroller.addEventListener('touchcancel', release, { passive: true });
}

// Re-asks the server for whatever the pane is currently showing. Deliberately
// only the open conversation: refetching every cached thread would be slower
// and would still only be visible for this one.
async function refreshActiveConversation() {
  if (activeChannelId) {
    const channelId = activeChannelId;
    await loadChannelHistory(channelId, { force: true });
    if (activeChannelId === channelId) renderChannelMessages();
    return;
  }
  if (!activeColleagueId) return;
  const key = activeConvKey();
  const colleagueId = activeColleagueId;
  const sessionId = activeSessionId;
  await loadColleagueHistory(colleagueId, sessionId, key, { force: true });
  // Guarded because the fetch is awaited: a tap in the sidebar mid-refresh
  // would otherwise repaint the new conversation with the old one's rows.
  if (activeConvKey() === key) renderMessages();
}

attachPullToRefresh(messagesEl, refreshActiveConversation, 'var(--bg)');
attachPullToRefresh(sidebarEl, () => loadRoster({ preserveSelection: true }), 'var(--bg-sidebar)');

loadRoster();
refreshWorkforceStatus();
