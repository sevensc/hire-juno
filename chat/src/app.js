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
import { useEffect, useRef, useState } from 'preact/hooks';

import { renderMarkdown } from './markdown.js';
import { youtubeEmbedUrl, youtubeThumbnail, youtubeVideos } from './youtube.js';
import { githubRef, githubRefs, relativeTime } from './github-links.js';
import { nextMenuIndex, pickSendKind } from './send-kind.js';
import { pickConversationToRestore, recallOpenConversation, rememberOpenConversation } from './open-conversation.js';
import { buildIssueUrl } from './issue-link.js';
import { limitNoticeText } from './limit-notice.js';
import { applyTheme, readThemePreference, writeThemePreference } from './theme.js';
import { createCallController } from './call.js';
import { plainTextField } from './plain-field.js';
import { createTranscriber, transcriptArtifact } from './transcribe.js';

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
const permissionsListEl = document.getElementById('permissions-list');
const workforceSwitcherEl = document.getElementById('workforce-switcher');
const workforceMenuEl = document.getElementById('workforce-menu');
const workforceListEl = document.getElementById('workforce-list');
const workforceAddFormEl = document.getElementById('workforce-add-form');
const workforceAddInputEl = document.getElementById('workforce-add-input');
const workforceErrorEl = document.getElementById('workforce-error');
const issueLinkEl = document.getElementById('issue-link');
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
    redrawDiagrams();
  });
}
const usageLimitsEl = document.getElementById('usage-limits');
const sidebarSearchInputEl = document.getElementById('sidebar-search-input');
const convSettingsBackdropEl = document.getElementById('conv-settings-backdrop');
const convSettingsModalEl = document.getElementById('conv-settings-modal');
const convSettingsTitleEl = document.getElementById('conv-settings-modal__title');
const convSettingsCloseEl = document.getElementById('conv-settings-close');
const convSettingsPermissionsEl = document.getElementById('conv-settings-permissions');
const convSettingsNewSessionSectionEl = document.getElementById('conv-settings-new-session-section');
const sessionTabsEl = document.getElementById('session-tabs');
const teamNotifySectionEl = document.getElementById('conv-settings-team-notify-section');
const teamNotifyFieldsetEl = document.getElementById('conv-settings-team-notify');
const convSettingsNewSessionEl = document.getElementById('conv-settings-new-session');
const convSettingsModelSectionEl = document.getElementById('conv-settings-model-section');
const convSettingsModelEl = document.getElementById('conv-settings-model');
const convSettingsWorktreeSectionEl = document.getElementById('conv-settings-worktree-section');
const convSettingsWorktreeEl = document.getElementById('conv-settings-worktree');
const convSettingsTerminalSectionEl = document.getElementById('conv-settings-terminal-section');
const convSettingsTerminalEl = document.getElementById('conv-settings-terminal');
const handoverNoticeEl = document.getElementById('handover-notice');
const convSearchInputEl = document.getElementById('conv-search-input');
const convSearchResultsEl = document.getElementById('conv-search-results');
const convResetContextEl = document.getElementById('conv-reset-context');
const convClearChatEl = document.getElementById('conv-clear-chat');
const convClearChatLabelEl = document.getElementById('conv-clear-chat-label');
const form = document.getElementById('composer');
const input = plainTextField(document.getElementById('composer-input'));
const fileInput = document.getElementById('composer-file');
const attachmentPreviewEl = document.getElementById('attachment-preview');
// Explicitly the submit button, not "the first button in the form":
// #attach-button is a real <button> now (it was a <label for> before,
// which no keyboard could reach) and it comes first in the markup.
const sendButton = document.getElementById('send-button');
const queueButtonEl = document.getElementById('queue-button');
const sendMenuButtonEl = document.getElementById('send-menu-button');
const sendMenuEl = document.getElementById('send-menu');
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
const claudeTokenSectionEl = document.getElementById('claude-token-section');
const claudeTokenStatusEl = document.getElementById('claude-token-status');
const claudeTokenFormEl = document.getElementById('claude-token-form');
const claudeTokenInputEl = document.getElementById('claude-token-input');
const claudeTokenRemoveEl = document.getElementById('claude-token-remove');
const claudeTokenErrorEl = document.getElementById('claude-token-error');

// The id every 1:1 conversation uses before the human ever starts a
// second, parallel one with the same colleague (see store.js on the
// server — same name, same meaning, duplicated here since the browser
// can't import a server module).
const DEFAULT_SESSION_ID = 'default';
// Not a session: the view of a colleague with no conversation open (her card
// and the composer). The first message starts a new session.
const NEW_SESSION = '__new__';

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
// and the standing permissions (see channelPendingPermission and
// permissionStates below). Before this existed, both were keyed by
// colleagueId alone: a second channel silently clobbered a pending
// request from the first, and a permission for her in one channel quietly
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
let pendingFirstMessage = null; // { requestId, text, attachment } or { requestId, takeOver } while a session for it is being created
// Standing tool permissions, as the server holds them (see
// server/permissions.js): key -> { allowAll, tools: Set }. Keys are
// convKey-shaped for a 1:1 and channelKey-shaped for a channel member.
// Entries with nothing set are dropped.
const permissionStates = new Map();
// In-app unread markers: the desktop Notification is OS-gated, so it
// can't be the only sign that something new landed while you were
// looking elsewhere. `unreadConversations` holds convKey-shaped strings for
// a 1:1/session (`convKey(colleagueId, sessionId)`, matching
// permissionStates' own scheme) and `channel:<channelId>` for a channel —
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
// A quiet 'Usage at 90 %' in the pane header, per conversation key; gone one
// finished turn after it arrived (see the 'limit_notice' case).
const limitWarnings = new Map();
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
  if (channelsById.has(sessionId)) return `${name} in #${channelsById.get(sessionId).name}`;
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

// Standing permissions live on the server; these only send the request.
// The 'permissions_changed' broadcast (see the socket handler) is what
// updates local state, so every tab, this one included, shows the same.
function allowAllOn(key) {
  return Boolean(permissionStates.get(key)?.allowAll);
}
function alwaysAllowedFor(key) {
  return [...(permissionStates.get(key)?.tools || [])];
}
function applyPermissionState({ key, allowAll, tools }) {
  if (!allowAll && !tools.length) permissionStates.delete(key);
  else permissionStates.set(key, { allowAll, tools: new Set(tools) });
}
// Where a key points, in the shape the server's messages take: a channel
// member (the second half is a channel id) or a 1:1 session.
function permissionTarget(key) {
  const [colleagueId, rest] = key.split('::');
  return channelsById.has(rest) ? { colleagueId, channelId: rest } : { colleagueId, sessionId: rest };
}
function setAllowAll(key, enabled) {
  socket.send(JSON.stringify({ type: 'set_allow_all', ...permissionTarget(key), enabled }));
}
function setAlwaysAllow(key, tool, enabled) {
  socket.send(JSON.stringify({ type: 'set_always_allow', ...permissionTarget(key), tool, enabled }));
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

// --- Conversation settings modal --------------------------------------
// Everything that would otherwise clutter the pane header (Permissions,
// Reset context, search within this one
// conversation, and a destructive "Clear chat") lives behind the ⋮
// button in its own dialog.

function convSettingsPermissionsBlock(key, colleague) {
  const block = document.createElement('div');
  block.className = 'permissions-block';
  const row = document.createElement('label');
  row.className = 'auto-mode-toggle';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = allowAllOn(key);
  checkbox.addEventListener('change', () => setAllowAll(key, checkbox.checked));
  const nameSpan = document.createElement('span');
  nameSpan.textContent = colleague ? ` ${colleague.name} — Allow all tools` : ' Allow all tools';
  row.append(checkbox, nameSpan);
  block.appendChild(row);
  const note = document.createElement('p');
  note.className = 'permissions-note';
  note.textContent = 'Edits files, runs commands and uses the web without asking.';
  block.appendChild(note);
  const tools = alwaysAllowedFor(key);
  const list = document.createElement('ul');
  list.className = 'settings-list';
  list.setAttribute('aria-label', colleague ? `Always allowed for ${colleague.name}` : 'Always allowed');
  if (!tools.length) {
    const li = document.createElement('li');
    li.className = 'empty-note';
    li.textContent = 'No tool is always allowed. Use "Always allow" on a request to add one.';
    list.appendChild(li);
  }
  for (const tool of tools) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'settings-list__label';
    label.textContent = `Always allow ${tool}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Revoke';
    button.setAttribute('aria-label', `Revoke always allow ${tool}`);
    button.addEventListener('click', () => setAlwaysAllow(key, tool, false));
    li.append(label, button);
    list.appendChild(li);
  }
  block.appendChild(list);
  return block;
}

// Rebuilds the modal's Permissions section for whichever conversation is
// open right now: one block for a 1:1, one per member for a channel.
function renderConvSettingsPermissions() {
  convSettingsPermissionsEl.innerHTML = '';
  if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
    convSettingsPermissionsEl.appendChild(convSettingsPermissionsBlock(activeConvKey(), null));
    return;
  }
  if (activeChannelId) {
    const channel = channelsById.get(activeChannelId);
    for (const id of channel?.memberIds || []) {
      convSettingsPermissionsEl.appendChild(
        convSettingsPermissionsBlock(channelKey(id, activeChannelId), colleaguesById.get(id))
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
  const entries = colleagueSessions.get(colleague.id) || [];
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
    convClearChatLabelEl.textContent = activeChannelId && channelsById.get(activeChannelId)?.room
      ? 'Clears #team for everyone. Click again'
      : 'Really clear? Click again';
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

// Team room: which messages notify this person. Saved on the server, so
// it applies to push notifications as well as to an open tab.
const TEAM_NOTIFY_CHOICES = [
  { mode: 'all', label: 'All messages' },
  { mode: 'mentions', label: 'Only messages to me (@me or a reply to me)' },
  { mode: 'people', label: 'Only messages from people' },
  { mode: 'mine', label: 'Only answers to what I asked a colleague' },
];

function renderTeamNotify() {
  const room = activeChannelId && channelsById.get(activeChannelId)?.room;
  teamNotifySectionEl.hidden = !room;
  if (!room) return;
  teamNotifyFieldsetEl.querySelectorAll('label').forEach((l) => l.remove());
  for (const choice of TEAM_NOTIFY_CHOICES) {
    const label = document.createElement('label');
    label.className = 'team-notify-choice';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'team-notify';
    radio.value = choice.mode;
    radio.checked = (room.notify || 'all') === choice.mode;
    radio.addEventListener('change', () => socket.send(JSON.stringify({ type: 'set_team_notify', mode: choice.mode })));
    label.append(radio, document.createTextNode(` ${choice.label}`));
    teamNotifyFieldsetEl.appendChild(label);
  }
}

function openConvSettingsModal() {
  takeOverDone.clear();
  renderTeamNotify();
  if (activeChannelId) {
    convSettingsTitleEl.textContent = `#${channelsById.get(activeChannelId)?.name || activeChannelId} settings`;
  } else {
    convSettingsTitleEl.textContent = `${colleaguesById.get(activeColleagueId)?.name || activeColleagueId} settings`;
  }
  renderConvSettingsPermissions();
  renderConvSettingsNewSession();
  renderConvSettingsWorktree();
  renderConvSettingsTerminal();
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
document.getElementById('conv-settings-media').addEventListener('click', () => {
  closeConvSettingsModal();
  openMediaView(activeChannelId ? { channelId: activeChannelId } : { colleagueId: activeColleagueId, sessionId: activeSessionId });
});
convSettingsBackdropEl.addEventListener('click', (event) => {
  if (event.target === convSettingsBackdropEl) closeConvSettingsModal();
});

// One entry per colleague, active in the current view — a single line
// for a 1:1 thread (plus the permissions, which only makes sense
// for a real, standing 1:1 session — not a channel, not a one-off
// subagent exchange), one line per member for a channel (several
// colleagues' stats are relevant there at once).
// What `api/worktree` says per 1:1 conversation key: {available, worktree}.
// Loaded on demand (first time the header or the settings need
// it), not with the roster.
const worktreeInfo = new Map();
const worktreeInfoLoading = new Set();
async function loadWorktreeInfo(colleagueId, sessionId, { force = false } = {}) {
  if (sessionId === NEW_SESSION) return;
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

// --- Continue in the terminal ----------------------------------------
// What `api/cli-session` says per 1:1 conversation key: {available,
// resumeCommand, forkCommand, handedOver, ...}. Loaded on demand, and
// refreshed whenever the dialog opens (the first reply makes it available).
const cliInfo = new Map();
async function loadCliInfo(colleagueId, sessionId) {
  const key = convKey(colleagueId, sessionId);
  try {
    const res = await fetch(
      `api/cli-session?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
    );
    cliInfo.set(key, await res.json());
  } catch {
    cliInfo.set(key, { available: false, handedOver: false });
  }
  if (key === activeConvKey()) {
    renderHandoverNotice();
    if (!convSettingsBackdropEl.hidden) renderConvSettingsTerminal({ reload: false });
  }
}

// The line above the composer while the terminal has the conversation.
function renderHandoverNotice() {
  handoverNoticeEl.innerHTML = '';
  const colleagueId = activeColleagueId;
  const sessionId = activeSessionId;
  const info = colleagueId && !isSubagentThread(colleagueId) ? cliInfo.get(convKey(colleagueId, sessionId)) : null;
  handoverNoticeEl.hidden = !info?.handedOver;
  if (!info?.handedOver) return;
  const text = document.createElement('span');
  text.textContent = 'Handed over to the terminal';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Take back';
  button.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'take_back_terminal', colleagueId, sessionId }));
  });
  handoverNoticeEl.append(text, button);
}

// The settings section: one menu button ("Continue in terminal") with
// "Transfer to terminal" (the chat lets go of the session) and "Fork into
// terminal" (a copy; the chat goes on unchanged). Both copy the command and
// show it here. Nothing is opened or run for you.
let terminalForm = null; // { colleagueId, sessionId, status } while the section is shown
async function renderConvSettingsTerminal({ reload = true } = {}) {
  convSettingsTerminalEl.innerHTML = '';
  terminalForm = null;
  if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
    convSettingsTerminalSectionEl.hidden = true;
    return;
  }
  const colleagueId = activeColleagueId;
  const sessionId = activeSessionId;
  const key = convKey(colleagueId, sessionId);
  if (reload) {
    await loadCliInfo(colleagueId, sessionId); // re-renders this section once it has the answer
    return;
  }
  const info = cliInfo.get(key);
  if (!info) return;
  convSettingsTerminalSectionEl.hidden = false;

  const status = document.createElement('p');
  status.className = 'model-picker__hint';
  status.setAttribute('role', 'status');
  const error = document.createElement('p');
  error.className = 'model-picker__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  const commandEl = document.createElement('code');
  commandEl.className = 'terminal-command';
  commandEl.hidden = true;
  terminalForm = { colleagueId, sessionId, status, error, commandEl };

  const wrap = document.createElement('div');
  wrap.className = 'terminal-menu';
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'terminal-menu-button';
  button.textContent = 'Continue in terminal';
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'terminal-menu-list');
  const list = document.createElement('ul');
  list.id = 'terminal-menu-list';
  list.className = 'terminal-menu__list';
  list.setAttribute('role', 'menu');
  list.setAttribute('aria-labelledby', 'terminal-menu-button');
  list.hidden = true;

  const closeMenu = ({ refocus = false } = {}) => {
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (refocus) button.focus();
  };
  const items = [];
  const addItem = (label, onChoose) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'terminal-menu__item';
    item.setAttribute('role', 'menuitem');
    item.tabIndex = -1;
    item.textContent = label;
    item.addEventListener('click', () => {
      closeMenu({ refocus: true });
      onChoose();
    });
    li.appendChild(item);
    list.appendChild(li);
    items.push(item);
  };
  const show = (command, message) => {
    error.hidden = true;
    commandEl.textContent = command;
    commandEl.hidden = false;
    status.textContent = message;
  };
  addItem('Transfer to terminal', async () => {
    if (isTyping(key)) {
      error.textContent = 'She is still answering. Hand over once she is done.';
      error.hidden = false;
      return;
    }
    // Copied right away, while the click still counts as the gesture the
    // clipboard asks for; the server may still refuse (then the message below says so).
    const ok = await copyToClipboard(info.resumeCommand);
    show(info.resumeCommand, `${ok ? 'Copied.' : 'Copy failed, select it by hand.'} Run it in a terminal. The chat lets go of the session meanwhile.`);
    socket.send(JSON.stringify({ type: 'handover_terminal', colleagueId, sessionId }));
  });
  addItem('Fork into terminal', async () => {
    const ok = await copyToClipboard(info.forkCommand);
    show(info.forkCommand, `${ok ? 'Copied.' : 'Copy failed, select it by hand.'} The terminal works on a copy; this chat goes on unchanged.`);
  });

  const focusItem = (index) => items[(index + items.length) % items.length].focus();
  const openMenu = (index) => {
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    focusItem(index);
  };
  button.addEventListener('click', () => (list.hidden ? openMenu(0) : closeMenu()));
  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); openMenu(0); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); openMenu(-1); }
  });
  list.addEventListener('keydown', (event) => {
    const at = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); focusItem(at + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem(at - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusItem(0); }
    else if (event.key === 'End') { event.preventDefault(); focusItem(-1); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeMenu({ refocus: true }); }
    else if (event.key === 'Tab') closeMenu();
  });
  wrap.addEventListener('focusout', (event) => {
    if (!wrap.contains(event.relatedTarget)) closeMenu();
  });
  wrap.append(button, list);

  const hint = document.createElement('p');
  hint.className = 'model-picker__hint';
  if (!info.available) {
    button.disabled = true;
    hint.textContent = 'Available once she has answered at least once.';
  } else {
    hint.textContent =
      'Copies a command for a terminal on this machine; nothing is opened for you. Transfer: the chat stops using the session until you take it back. Fork: the terminal works on a copy and this chat goes on unchanged.';
  }
  convSettingsTerminalEl.append(wrap);
  if (info.handedOver) {
    const handed = document.createElement('p');
    handed.className = 'model-picker__hint';
    handed.textContent = 'Handed over to the terminal. Take it back above the message box.';
    convSettingsTerminalEl.append(handed);
  }
  convSettingsTerminalEl.append(hint, commandEl, status, error);
  convSettingsTerminalEl.append(takeOverEl(colleagueId, sessionId));
}

// "Take over a terminal session": lists the sessions started in the CLI in
// this conversation's folder (newest first) and lets this conversation resume
// one of them from the next message on.
let takeOverForm = null; // { colleagueId, sessionId, status, error } while shown
const takeOverDone = new Set(); // conversation keys taken over while the dialog is open
const TAKEN_OVER = 'Taken over. Its last messages are shown in this chat now, and your next message here continues the terminal session.';
function takeOverEl(colleagueId, sessionId) {
  const box = document.createElement('div');
  box.className = 'cli-takeover';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Take over a terminal session…';
  const list = document.createElement('ul');
  list.className = 'cli-takeover__list';
  list.hidden = true;
  const status = document.createElement('p');
  status.className = 'model-picker__hint';
  status.setAttribute('role', 'status');
  const error = document.createElement('p');
  error.className = 'model-picker__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  takeOverForm = { colleagueId, sessionId, status, error, list };
  if (takeOverDone.has(convKey(colleagueId, sessionId))) status.textContent = TAKEN_OVER;

  const when = (iso) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };
  button.addEventListener('click', async () => {
    takeOverDone.delete(convKey(colleagueId, sessionId));
    error.hidden = true;
    status.textContent = 'Looking for terminal sessions…';
    let sessions = [];
    try {
      const res = await fetch(
        `api/cli-sessions?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
      );
      sessions = (await res.json()).sessions || [];
    } catch {
      sessions = [];
    }
    list.innerHTML = '';
    if (!sessions.length) {
      list.hidden = true;
      status.textContent = 'No terminal session started in this folder.';
      return;
    }
    status.textContent = 'From the next message on, this conversation continues the chosen session. Close it in the terminal first.';
    for (const session of sessions) {
      const li = document.createElement('li');
      const pick = document.createElement('button');
      pick.type = 'button';
      pick.className = 'cli-takeover__item';
      const title = document.createElement('span');
      title.className = 'cli-takeover__title';
      title.textContent = session.lastPrompt || session.firstPrompt;
      const meta = document.createElement('span');
      meta.className = 'cli-takeover__meta';
      meta.textContent = [session.agent, when(session.updatedAt), session.firstPrompt && session.firstPrompt !== session.lastPrompt ? `started with: ${session.firstPrompt}` : '']
        .filter(Boolean)
        .join(' · ');
      pick.append(title, meta);
      pick.addEventListener('click', () => {
        if (isTyping(convKey(colleagueId, sessionId))) {
          error.textContent = 'She is still answering. Take the session over once she is done.';
          error.hidden = false;
          return;
        }
        status.textContent = 'Taking over…';
        if (sessionId === NEW_SESSION) {
          // On her card there is no conversation yet: start one named after
          // the terminal session, then take the session over into it (see
          // the 'session_created' update).
          if (pendingFirstMessage) return;
          const requestId = newMessageId();
          pendingFirstMessage = { requestId, takeOver: session.id };
          const title = (session.lastPrompt || session.firstPrompt || 'Terminal session').replace(/\s+/g, ' ').slice(0, 40);
          socket.send(JSON.stringify({ type: 'create_session', colleagueId, title, requestId }));
          return;
        }
        socket.send(JSON.stringify({ type: 'adopt_cli_session', colleagueId, sessionId, sdkSessionId: session.id }));
      });
      li.appendChild(pick);
      list.appendChild(li);
    }
    list.hidden = false;
  });
  box.append(button, list, status, error);
  return box;
}

// Shares a meeting link in the team room (any https address, e.g. a
// Google Meet link), for calls outside the chat.
function linkButtonEl(channelId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pane-header__call';
  button.title = 'Share a meeting link';
  button.setAttribute('aria-label', 'Share a meeting link');
  button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';
  button.addEventListener('click', () => {
    const link = (window.prompt('Link to the meeting (e.g. Google Meet):') || '').trim();
    if (!link) return;
    if (!/^https:\/\/[^\s]+$/.test(link)) {
      window.alert('Please paste a full https:// link.');
      return;
    }
    socket.send(JSON.stringify({ type: 'channel_message', channelId, text: `Meeting: ${link}`, attachments: [] }));
  });
  return button;
}

// "Only people" in the team room: hides colleagues' replies and the
// messages addressed to a colleague. Remembered per device.
let roomHumansOnly = (() => {
  try {
    return localStorage.getItem('teamRoomHumansOnly') === '1';
  } catch {
    return false;
  }
})();

function humansOnlyButtonEl() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pane-header__call${roomHumansOnly ? ' pane-header__call--live' : ''}`;
  const label = roomHumansOnly ? 'Show colleagues again' : 'Only people (hide colleagues)';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-pressed', String(roomHumansOnly));
  button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.6.2 4.6 1.9 5.3 5.4"/></svg>';
  button.addEventListener('click', () => {
    roomHumansOnly = !roomHumansOnly;
    try {
      localStorage.setItem('teamRoomHumansOnly', roomHumansOnly ? '1' : '0');
    } catch {
      // not stored; works for this visit
    }
    renderPaneHeader();
    renderChannelMessages();
  });
  return button;
}

// Starts or joins the video call of the team room (see call.js).
function videoButtonEl(channelId) {
  const button = document.createElement('button');
  button.type = 'button';
  const { joined, runningWithout } = call.state();
  button.className = `pane-header__call${runningWithout ? ' pane-header__call--live' : ''}`;
  const label = runningWithout ? 'Join the video call' : joined ? 'In the video call' : 'Start a video call';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/></svg>';
  button.addEventListener('click', () => startOrJoinRoomCall(channelId));
  return button;
}

async function startOrJoinRoomCall(channelId) {
  if (call.state().joined) return;
  const starting = !call.state().runningWithout;
  try {
    await call.join();
  } catch (err) {
    window.alert(`Could not start the camera or microphone: ${err.message}`);
    return;
  }
  if (starting) {
    socket.send(JSON.stringify({ type: 'channel_message', channelId, text: 'Started a video call. Tap the camera in #team to join.', attachments: [] }));
  }
}

// Tabs for the open colleague's conversations: the main one, every extra
// session, and "+" for a new one. Each tab carries its unread/draft mark.
function renderSessionTabs() {
  const colleague = activeColleagueId && !isSubagentThread(activeColleagueId) ? colleaguesById.get(activeColleagueId) : null;
  sessionTabsEl.hidden = !colleague;
  sessionTabsEl.innerHTML = '';
  if (!colleague) return;
  const entries = [...(colleagueSessions.get(colleague.id) || [])];
  if (activeSessionId === NEW_SESSION) entries.push({ id: NEW_SESSION, title: 'New conversation' });
  let activeTab = null;
  for (const session of entries) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'session-tab';
    tab.setAttribute('role', 'tab');
    const selected = session.id === activeSessionId;
    tab.setAttribute('aria-selected', String(selected));
    const label = document.createElement('span');
    label.textContent = session.title || 'Untitled session';
    tab.appendChild(label);
    const key = convKey(colleague.id, session.id);
    appendUnreadBadge(tab, key);
    appendDraftBadge(tab, key);
    if (selected) activeTab = tab;
    else tab.addEventListener('click', () => selectColleague(colleague, session.id));
    if (session.id !== NEW_SESSION) {
      // The tab is itself a button, so the "end" control is a span with a
      // button role next to the label rather than a nested <button>.
      const end = document.createElement('span');
      end.className = 'session-tab__end';
      end.setAttribute('role', 'button');
      end.tabIndex = 0;
      const what = `End session "${session.title || 'Untitled session'}"`;
      end.title = what;
      end.setAttribute('aria-label', what);
      end.textContent = '×';
      const endIt = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (isTyping(key)) {
          window.alert('She is still answering. End the session once she is done.');
          return;
        }
        if (!window.confirm(`${what}? The tab closes and her process stops. The messages stay stored.`)) return;
        socket.send(JSON.stringify({ type: 'close_session', colleagueId: colleague.id, sessionId: session.id }));
      };
      end.addEventListener('click', endIt);
      end.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') endIt(event);
      });
      tab.appendChild(end);
    }
    sessionTabsEl.appendChild(tab);
  }
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'session-tab session-tab--new';
  add.textContent = '+';
  add.title = `New session with ${colleague.name}`;
  add.setAttribute('aria-label', `New session with ${colleague.name}`);
  add.addEventListener('click', () => selectColleague(colleague, NEW_SESSION));
  sessionTabsEl.appendChild(add);
  activeTab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function renderPaneHeader() {
  renderSessionTabs();
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
    // Which session is open shows in the tabs below the header now (see
    // renderSessionTabs).
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
    if (limitWarnings.has(key)) {
      const span = document.createElement('span');
      span.className = 'pane-header__entry';
      span.textContent = limitWarnings.get(key).text;
      entries.appendChild(span);
    }
    // Colour alone is no signal for everyone: say it in words too.
    if (allowAllOn(key)) {
      const span = document.createElement('span');
      span.className = 'pane-header__entry';
      span.textContent = 'All tools allowed';
      entries.appendChild(span);
    }
    paneHeaderEl.classList.toggle('pane-header--auto-mode', allowAllOn(key));
    hasContent = true;
  } else {
    paneHeaderEl.classList.remove('pane-header--auto-mode');
    if (activeChannelId && channelsById.get(activeChannelId)?.room) {
      // The team room: who is in it, and whether this chat reaches it.
      const { connected, members = [] } = channelsById.get(activeChannelId).room;
      const span = document.createElement('span');
      span.className = 'pane-header__entry';
      span.textContent = connected ? members.map((m) => m.name).join(', ') || 'Team' : 'Team room not reachable';
      entries.appendChild(span);
      hasContent = true;
    } else if (activeChannelId) {
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
    if (activeChannelId && channelsById.get(activeChannelId)?.room) {
      actions.appendChild(humansOnlyButtonEl());
      actions.appendChild(videoButtonEl(activeChannelId));
      actions.appendChild(linkButtonEl(activeChannelId));
    }
    actions.appendChild(searchToggle);

    // Opens the conversation settings dialog, which holds the Permissions
    // section and Reset context button (see openConvSettingsModal/
    // renderConvSettingsPermissions below; the channel's per-member
    // permissions live there too).
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
    // On her card there is no conversation yet to have settings.
    if (activeSessionId !== NEW_SESSION) actions.appendChild(menuButton);

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
// dedicated HR colleague like Una in another workforce) would need
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
// which conversations have tools allowed ahead of time (with a way to
// revoke one without having to go find that conversation first), and the
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

function renderPermissionsList() {
  permissionsListEl.innerHTML = '';
  const rows = [];
  for (const [key, state] of permissionStates) {
    if (state.allowAll) rows.push({ key, text: 'Allow all tools', off: () => setAllowAll(key, false), action: 'Turn off' });
    for (const tool of state.tools) {
      rows.push({ key, text: `Always allow ${tool}`, off: () => setAlwaysAllow(key, tool, false), action: 'Revoke' });
    }
  }
  if (!rows.length) {
    const li = document.createElement('li');
    li.className = 'empty-note';
    li.textContent = 'Nothing is allowed ahead of time. Everything that asks will ask.';
    permissionsListEl.appendChild(li);
    return;
  }
  for (const { key, text, off, action } of rows) {
    const [colleagueId] = key.split('::');
    const li = document.createElement('li');
    li.appendChild(avatarEl(colleaguesById.get(colleagueId)));
    const label = document.createElement('span');
    label.className = 'settings-list__label';
    label.textContent = `${describeConvKey(key)}: ${text}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action;
    button.setAttribute('aria-label', `${action}: ${describeConvKey(key)}, ${text}`);
    button.addEventListener('click', off);
    li.append(label, button);
    permissionsListEl.appendChild(li);
  }
}

// The server's push key when it can send push notifications (a chat
// served with --socket), else null. Set from api/status in loadRoster.
let pushKey = null;

function pushKeyBytes(key) {
  const raw = atob(key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (key.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// Push notifications on this device: asks for permission (on a tap, as
// Safari requires), registers sw.js and hands the subscription to the
// server. On an iPhone this only works from the Home Screen app.
async function enablePush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return renderSettingsNotifyRow();
  const registration = await navigator.serviceWorker.register('sw.js');
  await navigator.serviceWorker.ready;
  const subscription = (await registration.pushManager.getSubscription())
    || (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: pushKeyBytes(pushKey) }));
  socket.send(JSON.stringify({ type: 'push_subscribe', subscription: subscription.toJSON() }));
  renderSettingsNotifyRow();
}

async function renderPushRow() {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (!supported) {
    const iPhone = /iPhone|iPad/.test(navigator.userAgent);
    settingsNotifyRowEl.textContent = iPhone
      ? 'To get notifications on this iPhone, add this page to the Home Screen in Safari (Share, then Add to Home Screen) and open it from there.'
      : 'Push notifications are not supported in this browser.';
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  const subscribed = Boolean(registration && (await registration.pushManager.getSubscription()));
  settingsNotifyRowEl.innerHTML = '';
  if (Notification.permission === 'denied') {
    settingsNotifyRowEl.textContent = 'Notifications are blocked for this site. You can allow them again in the browser or system settings.';
    return;
  }
  settingsNotifyRowEl.append(document.createTextNode(
    subscribed && Notification.permission === 'granted'
      ? 'Push notifications are on for this device.'
      : 'Get a notification on this device when someone writes while the chat is closed.'
  ));
  if (!(subscribed && Notification.permission === 'granted')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Enable';
    button.style.marginLeft = '0.5rem';
    button.addEventListener('click', () => {
      enablePush().catch((err) => {
        settingsNotifyRowEl.textContent = `Could not turn on notifications: ${err.message}`;
      });
    });
    settingsNotifyRowEl.appendChild(button);
  }
}

function renderSettingsNotifyRow() {
  if (pushKey) {
    renderPushRow();
    return;
  }
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
  renderPermissionsList();
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
  renderPermissionsList();
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

// `state`: 'set' | 'missing' on a socket server, undefined anywhere else,
// where the section stays hidden (see server/claudeToken.js).
function renderClaudeToken(state) {
  claudeTokenSectionEl.hidden = !state;
  if (!state) return;
  claudeTokenStatusEl.textContent = state === 'set'
    ? 'A token is set. Paste a new one to replace it.'
    : 'No token yet: your colleagues cannot answer until one is set.';
  claudeTokenRemoveEl.hidden = state !== 'set';
  claudeTokenErrorEl.hidden = true;
}

claudeTokenFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const token = claudeTokenInputEl.value.trim();
  if (!token) return;
  socket.send(JSON.stringify({ type: 'set_claude_token', token }));
  claudeTokenInputEl.value = '';
});
claudeTokenRemoveEl.addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'remove_claude_token' }));
});

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
    if (owner) selectColleague(owner, panel.sessionId);
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
    // It is the whole truth about running turns: a turn that ended while
    // this tab was away (a phone in the background) is not in it, and its
    // leftover "typing…" and thinking must go, or they stay on screen.
    const running = new Set((update.turns || []).map((t) => convKey(t.colleagueId, t.sessionId)));
    for (const map of [thinkingStreaming, streaming, pendingTrail]) {
      for (const key of [...map.keys()]) if (!running.has(key)) map.delete(key);
    }
    // Channel turns are not part of it; their leftovers go as well, a turn
    // still running shows again with its next piece.
    channelTyping.clear();
    channelStreaming.clear();
    channelThinkingStreaming.clear();
    channelPendingTrail.clear();
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

  // The session took up the message sent under `update.id`: it was read, at
  // this moment, so it stops being drawn as waiting (and cannot be withdrawn).
  if (update.type === 'message_read') {
    const items = history.get(convKey(update.colleagueId, update.sessionId)) || [];
    const item = items.find((m) => m.clientId === update.id);
    if (item) {
      delete item.pending;
      delete item.withdrawing;
      if (activeConvKey()) renderMessages();
    }
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
    const first = pendingFirstMessage && pendingFirstMessage.requestId === update.requestId ? pendingFirstMessage : null;
    // Another tab of this chat started it: only the tabs change here.
    if (update.requestId && !first) {
      if (activeColleagueId === update.colleagueId) renderSessionTabs();
      renderSidebar();
      return;
    }
    pendingFirstMessage = null;
    renderSidebar();
    closeConvSettingsModal(); // the form that created this session lives there now, not in the sidebar
    // Jump straight into it — starting a session and then having to go
    // find it again would defeat the point.
    const colleague = colleaguesById.get(update.colleagueId);
    if (!colleague) return;
    if (first?.takeOver) {
      socket.send(JSON.stringify({ type: 'adopt_cli_session', colleagueId: colleague.id, sessionId: update.session.id, sdkSessionId: first.takeOver }));
      selectColleague(colleague, update.session.id);
      return;
    }
    selectColleague(colleague, update.session.id).then(() => {
      if (!first) return;
      // The message written on her card goes out as this session's first.
      input.value = first.text;
      pendingAttachment = first.attachment;
      renderAttachmentPreview();
      form.requestSubmit();
    });
    return;
  }

  if (update.type === 'session_closed') {
    const list = colleagueSessions.get(update.colleagueId) || [];
    colleagueSessions.set(update.colleagueId, list.filter((session) => session.id !== update.sessionId));
    const colleague = colleaguesById.get(update.colleagueId);
    if (colleague && activeColleagueId === update.colleagueId && activeSessionId === update.sessionId) {
      selectColleague(colleague);
    } else {
      renderSidebar();
      if (activeColleagueId === update.colleagueId) renderSessionTabs();
    }
    return;
  }

  if (update.type === 'session_close_failed') {
    window.alert(`Session not ended: ${update.message || 'failed'}`);
    return;
  }

  if (update.type === 'permissions_changed') {
    applyPermissionState(update);
    renderPaneHeader();
    renderConvSettingsPermissions();
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

  if (update.type === 'terminal_handover') {
    const key = convKey(update.colleagueId, update.sessionId);
    cliInfo.set(key, { ...(cliInfo.get(key) || { available: true }), handedOver: Boolean(update.handedOver) });
    const form = terminalForm;
    if (update.failed && form && form.colleagueId === update.colleagueId && form.sessionId === update.sessionId) {
      form.commandEl.hidden = true;
      form.status.textContent = '';
      form.error.textContent = `Not handed over: ${update.message || 'failed'} Do not use the copied command.`;
      form.error.hidden = false;
    }
    if (key === activeConvKey()) {
      renderHandoverNotice();
      if (!update.failed && !convSettingsBackdropEl.hidden && !update.handedOver) renderConvSettingsTerminal({ reload: false });
    }
    return;
  }

  if (update.type === 'cli_session_adopted') {
    const form = takeOverForm;
    if (form && form.colleagueId === update.colleagueId && form.sessionId === update.sessionId) {
      if (update.ok) {
        form.list.hidden = true;
        form.error.hidden = true;
        form.status.textContent = TAKEN_OVER;
      } else {
        form.status.textContent = '';
        form.error.textContent = `Not taken over: ${update.message || 'failed'}`;
        form.error.hidden = false;
      }
    }
    if (update.ok) {
      const key = convKey(update.colleagueId, update.sessionId);
      takeOverDone.add(key);
      loadCliInfo(update.colleagueId, update.sessionId);
      loadColleagueHistory(update.colleagueId, update.sessionId, key, { force: true }).then(() => {
        if (activeConvKey() === key) renderMessages({ forceScrollToBottom: true });
      });
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
    // A channel's messages on screen come from channelMessages, not history.
    if (update.channelId) channelMessages.set(update.channelId, []);
    loadedHistory.add(key); // an emptied transcript is the real one, nothing to fetch
    if (!update.channelId) {
      const rosterColleague = colleaguesById.get(update.colleagueId);
      if (rosterColleague) rosterColleague.lastMessage = null;
    }
    renderSidebar();
    // activeConvKey() only knows 1:1 conversations; a cleared channel that
    // is open has to be compared by its own id.
    if (update.channelId ? update.channelId === activeChannelId : key === activeConvKey()) {
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

  if (update.type === 'pong') {
    lastPongAt = Date.now();
    return;
  }

  if (update.type === 'call_signal') {
    call.onSignal(update.from, update.data);
    return;
  }

  if (update.type === 'team_notify') {
    for (const channel of channelsById.values()) if (channel.room) channel.room.notify = update.mode;
    renderTeamNotify();
    return;
  }

  if (update.type === 'open_questions') {
    openQuestions = update.questions || [];
    renderSidebar();
    if (!artifactViewerEl.hidden && artifactViewerEl.dataset.view === 'questions') openQuestionsView();
    return;
  }

  if (update.type === 'room_reactions') {
    const item = (channelMessages.get(update.channelId) || []).find((m) => m.roomId === update.roomId);
    if (item) {
      item.reactions = update.reactions || [];
      if (activeChannelId === update.channelId) renderChannelMessages();
    }
    return;
  }

  if (update.type === 'room_state') {
    for (const channel of channelsById.values()) {
      if (channel.room) channel.room = { connected: update.connected, members: update.members || channel.room.members, you: update.you || channel.room.you };
    }
    if (activeChannelId && channelsById.get(activeChannelId)?.room) {
      renderPaneHeader();
      // The chat (re)connected to the room: what was said meanwhile is there now.
      if (update.synced) refreshActiveConversation().catch(() => {});
    }
    return;
  }

  if (update.type === 'github_action_result') {
    githubActionWaiting.get(update.requestId)?.(update);
    githubActionWaiting.delete(update.requestId);
    return;
  }

  if (update.type === 'github_account') {
    githubProfile.account = update;
    githubProfile.lists = null;
    loadGithubProfile();
    return;
  }

  if (update.type === 'github_account_failed') {
    githubAccountError?.(update.message);
    return;
  }

  if (update.type === 'claude_token_status') {
    renderClaudeToken(update.claudeToken);
    return;
  }

  if (update.type === 'claude_token_failed') {
    claudeTokenErrorEl.textContent = update.message;
    claudeTokenErrorEl.hidden = false;
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
    // Team room pictures come as an address (`url`) instead of the bytes.
    const attachments = (update.attachments || []).map((a) => ({
      ...a,
      dataUrl: a.url || `data:${a.mimeType};base64,${a.data}`,
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
      senderName: update.senderName || null,
      artifact: update.artifact || null,
      // Team room only: its id there, what it answers, its reactions.
      roomId: update.roomId ?? null,
      replyTo: update.replyTo || null,
      reactions: update.reactions || [],
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
    // The team room says per message whether it notifies (this person's setting).
    if (isColleagueMessage && update.notify !== false && !(document.hasFocus() && update.channelId === activeChannelId)) {
      const channel = channelsById.get(update.channelId);
      const sender = colleaguesById.get(update.senderId);
      notify(`#${channel?.name || 'channel'} — ${update.senderName || sender?.name || update.senderId}`, text, () => {
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
        // real colleague (Una addressing "remy" as a subagent, say),
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
    case 'limit_notice': {
      // Shown in the conversation it hit, until the next finished turn
      // ('message' below) takes it away again; not stored.
      const { line, warning } = limitNoticeText(update);
      if (warning) {
        limitWarnings.set(key, { text: warning, fresh: true });
        if (key === activeConvKey()) renderPaneHeader();
      } else {
        history.set(key, (history.get(key) || []).filter((m) => !m.limitNotice));
        history.get(key).push({ role: 'system', text: line, createdAt: new Date().toISOString(), limitNotice: true });
      }
      break;
    }
    case 'message': {
      streaming.delete(key);
      if (update.role === 'colleague') {
        // A warning comes in during a turn that then succeeds: it lasts through
        // that turn's end and goes with the next one.
        const warned = limitWarnings.get(key);
        if (warned?.fresh) warned.fresh = false;
        else limitWarnings.delete(key);
        history.set(key, (history.get(key) || []).filter((m) => !m.limitNotice));
      }
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
      if (key === convKey(colleagueId, sessionId)) {
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
  // A connection attempt that hangs (a phone between networks) would
  // otherwise never close and so never be retried.
  const connectTimeout = setTimeout(() => {
    if (s.readyState === WebSocket.CONNECTING) s.close();
  }, 8000);
  s.addEventListener('message', handleSocketMessage);
  s.addEventListener('open', () => {
    clearTimeout(connectTimeout);
    reconnectDelayMs = 500;
    // Whatever arrived while the connection was down never reached this
    // tab: after a reconnect the open conversation and the list are loaded
    // again, so nothing needs a manual reload.
    if (socketOpenedBefore) {
      refreshActiveConversation().catch(() => {});
      loadRoster({ preserveSelection: true }).catch(() => {});
    }
    socketOpenedBefore = true;
    // The server sends push notifications only while no tab is in view.
    s.send(JSON.stringify({ type: 'visibility', visible: document.visibilityState === 'visible' }));
  });
  s.addEventListener('close', () => {
    // A connection replaced on purpose (see retireSocket) has its successor already.
    if (s.retired) return;
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

let socketOpenedBefore = false;

// Takes a connection out of service before its successor starts: it may
// still be alive and deliver, and every streamed piece would then arrive
// twice (doubled text in a reply or its thinking).
function retireSocket(old) {
  old.retired = true;
  old.removeEventListener('message', handleSocketMessage);
  try { old.close(); } catch { /* already closing */ }
}
let socket = connectSocket();

// A phone can bring the app back with a connection that still looks open
// but is dead. Coming back into view, the tab asks the server for a sign
// of life and reconnects if none arrives.
let lastPongAt = 0;
function probeSocket() {
  if (socket.readyState !== WebSocket.OPEN) return;
  const sentAt = Date.now();
  socket.send(JSON.stringify({ type: 'ping' }));
  setTimeout(() => {
    if (lastPongAt >= sentAt || socket.readyState === WebSocket.CONNECTING) return;
    retireSocket(socket);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectDelayMs = 500;
    socket = connectSocket();
  }, 4000);
}

// While the app is on screen it says so every 10 seconds. The server sends
// push notifications only when no tab has done that recently: a phone
// freezes a closed app's code, but its connection may stay up for a while.
// The same tick checks the connection itself: one that looks open but
// no longer carries anything (a dropped network, a server restart behind
// a proxy) is replaced instead of leaving the chat silently stale.
setInterval(() => {
  if (document.visibilityState === 'visible' && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'visibility', visible: true }));
    probeSocket();
  }
}, 10000);

// Keyboard open on a touch screen: typing in the composer (or any text
// field), or the visible area clearly shorter than it has been.
let tallestVisible = 0;
const touchScreen = window.matchMedia('(pointer: coarse)').matches;
function updateKeyboardOpen() {
  const editing = touchScreen && document.activeElement?.matches?.('#composer-input, input[type="text"], textarea');
  const shrunk = window.visualViewport ? tallestVisible - window.visualViewport.height > 150 : false;
  document.documentElement.classList.toggle('keyboard-open', Boolean(editing || shrunk));
}
document.addEventListener('focusin', updateKeyboardOpen);
document.addEventListener('focusout', () => setTimeout(updateKeyboardOpen, 50));

// On an iPhone the on-screen keyboard does not shrink the layout viewport:
// the page is pushed up instead, composer and header out of place. The app
// takes the visible height instead and stays at the top.
if (window.visualViewport) {
  const fitToVisible = () => {
    document.documentElement.style.setProperty('--app-height', `${Math.round(window.visualViewport.height)}px`);
    // Keyboard open: the layout is a good deal taller than what is visible.
    // Then the room kept free for the home indicator is not needed, and the
    // conversation header gets compact, so more of the messages stays in view.
    // The tallest the visible area has been is the screen without keyboard;
    // in a Home Screen app the window itself shrinks with the keyboard, so
    // comparing with window.innerHeight would never see it.
    tallestVisible = Math.max(tallestVisible, window.visualViewport.height);
    updateKeyboardOpen();
    if (window.scrollY) window.scrollTo(0, 0);
  };
  window.visualViewport.addEventListener('resize', fitToVisible);
  window.visualViewport.addEventListener('scroll', fitToVisible);
  fitToVisible();
}

// The video call of the team room and its full-screen view.
const callOverlayEl = document.createElement('div');
callOverlayEl.id = 'call-overlay';
callOverlayEl.hidden = true;
document.body.appendChild(callOverlayEl);
const callVideos = new Map(); // participant key -> <video>
let callSpotlight = null; // participant key shown big, picked by a click
let callMinimized = false; // the call as a small window in the corner
let callPipWindow = null; // the call in its own always-on-top window (Document Picture-in-Picture)

function roomMemberName(memberId) {
  for (const channel of channelsById.values()) {
    const member = channel.room?.members?.find((m) => m.id === memberId);
    if (member) return member.name;
  }
  return memberId;
}

function callTile(keyName, stream, label, { mirrored = false, muted = false, screen = false } = {}) {
  let tile = callVideos.get(keyName);
  if (!tile) {
    tile = document.createElement('figure');
    tile.className = 'call-tile';
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    const caption = document.createElement('figcaption');
    tile.append(video, caption);
    callVideos.set(keyName, tile);
  }
  const video = tile.querySelector('video');
  video.muted = muted;
  // Safari moves an incoming video into a small floating window by itself
  // when the app or tab goes to the background.
  if (!muted) {
    video.autoPictureInPicture = true;
    video.setAttribute('autopictureinpicture', '');
  }
  video.classList.toggle('call-tile__video--mirrored', mirrored);
  // A shared screen is shown whole, not cropped to fill the tile.
  video.classList.toggle('call-tile__video--screen', screen);
  if (stream && video.srcObject !== stream) video.srcObject = stream;
  tile.querySelector('figcaption').textContent = label;
  return tile;
}

// Tile key of a participant's shared screen: its own tile next to the
// camera; an older app without a second video channel sends the screen
// instead of the camera, then it is the camera tile.
const screenTileKey = (peer) => (peer.screenStream ? `${peer.key}:screen` : peer.key);

// The video for the small floating window: someone sharing a screen, else
// the first other participant.
function pictureInPictureVideo() {
  const { peers } = call.state();
  const sharing = peers.find((p) => p.sharing);
  const k = sharing ? screenTileKey(sharing) : peers[0]?.key;
  return k ? callVideos.get(k)?.querySelector('video') : null;
}

async function togglePictureInPicture() {
  const video = pictureInPictureVideo();
  if (!video) return;
  try {
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else if (video.requestPictureInPicture) await video.requestPictureInPicture();
    else if (video.webkitSetPresentationMode) {
      video.webkitSetPresentationMode(video.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture');
    }
  } catch {
    // not allowed right now (e.g. no video yet); nothing to undo
  }
}

// The small window with everyone in it: Chromium browsers can put any
// part of a page in an always-on-top window (Document Picture-in-Picture);
// elsewhere only one video can float, the main one.
async function openCallWindow() {
  if (callPipWindow) return;
  if (!window.documentPictureInPicture) {
    togglePictureInPicture();
    return;
  }
  try {
    const win = await window.documentPictureInPicture.requestWindow({ width: 420, height: 320 });
    for (const node of document.querySelectorAll('link[rel="stylesheet"], style')) {
      const copy = node.cloneNode(true);
      if (copy.tagName === 'LINK') copy.href = node.href; // absolute: the window has no base address
      win.document.head.appendChild(copy);
    }
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme) win.document.documentElement.setAttribute('data-theme', theme);
    win.document.title = 'Call';
    win.document.body.className = 'call-pip';
    callPipWindow = win;
    // Closing the window brings the videos back into the page first.
    win.addEventListener('pagehide', () => {
      callPipWindow = null;
      renderCall(call.state());
    });
    renderCall(call.state());
  } catch {
    togglePictureInPicture();
  }
}

// A video taken out of the page is paused by the browser and stays frozen
// after it comes back; every visible one is told to play again.
function resumeCallVideos(tiles) {
  for (const tile of tiles.values()) {
    const video = tile.querySelector('video');
    if (video?.srcObject && video.paused) video.play().catch(() => {});
  }
}

// The compact view (corner and small window): one picture big, everyone
// else small on top of it, so nobody drops out of sight.
function compactCallStage(tiles, mainKey, onMainClick) {
  const stage = document.createElement('div');
  stage.className = 'call-mini__stage';
  const main = document.createElement('div');
  main.className = 'call-mini__main';
  const mainTile = tiles.get(mainKey);
  main.appendChild(mainTile);
  mainTile.onclick = onMainClick;
  stage.appendChild(main);
  const strip = document.createElement('div');
  strip.className = 'call-mini__strip';
  for (const [key, tile] of tiles) {
    if (key === mainKey) continue;
    tile.onclick = (event) => {
      event.stopPropagation();
      callSpotlight = key;
      renderCall(call.state());
    };
    strip.appendChild(tile);
  }
  if (strip.childElementCount) stage.appendChild(strip);
  return stage;
}

// Chrome can open the small window by itself when a tab with a running
// call goes to the background, if the page offers this action.
try {
  navigator.mediaSession?.setActionHandler?.('enterpictureinpicture', () => {
    if (call.state().joined) openCallWindow();
  });
} catch {
  // the browser does not know this action
}

function renderCall(state) {
  if (activeChannelId && channelsById.get(activeChannelId)?.room) renderPaneHeader();
  callOverlayEl.hidden = !state.joined;
  if (!state.joined) {
    callPipWindow?.close();
    callPipWindow = null;
    callOverlayEl.innerHTML = '';
    callVideos.clear();
    return;
  }
  const wanted = new Set([
    'local',
    ...(state.screen ? ['local:screen'] : []),
    ...state.peers.flatMap((p) => (p.screenStream ? [p.key, `${p.key}:screen`] : [p.key])),
  ]);
  for (const k of [...callVideos.keys()]) if (!wanted.has(k)) callVideos.delete(k);
  if (callSpotlight && !wanted.has(callSpotlight)) callSpotlight = null;

  // Every participant's tile; a click on one makes it the big one (again:
  // back to the even grid).
  const tiles = new Map();
  for (const peer of state.peers) {
    const name = roomMemberName(peer.member);
    const screenInCamera = peer.sharing && !peer.screenStream;
    const tile = callTile(peer.key, peer.stream, screenInCamera ? `${name} (screen)` : name, { screen: screenInCamera });
    tile.classList.toggle('call-tile--paused', peer.paused);
    tile.dataset.initial = name.slice(0, 1).toUpperCase();
    tile.dataset.pausedText = `${name} is away, video paused`;
    tiles.set(peer.key, tile);
    if (peer.screenStream) {
      // The screen's video element plays muted: the sound comes with the camera.
      tiles.set(`${peer.key}:screen`, callTile(`${peer.key}:screen`, peer.screenStream, `${name} (screen)`, { muted: true, screen: true }));
    }
  }
  tiles.set('local', callTile('local', state.local, 'You', { mirrored: true, muted: true }));
  if (state.screen) tiles.set('local:screen', callTile('local:screen', state.screen, 'Your screen', { muted: true, screen: true }));
  for (const [key, tile] of tiles) {
    tile.onclick = () => {
      callSpotlight = callSpotlight === key ? null : key;
      renderCall(call.state());
    };
  }
  // Big: the one picked, else a shared screen, else nobody (even grid).
  const sharing = state.peers.find((p) => p.sharing);
  const big = callSpotlight || (sharing ? screenTileKey(sharing) : null);

  const control = (label, active, onClick, extra = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `call-control${active ? '' : ' call-control--off'}${extra}`;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  };
  const leave = async () => {
    if (transcriber.state().running) await finishTranscript();
    callMinimized = false;
    callPipWindow?.close();
    call.leave();
  };

  const ts = transcriber.state();
  if (ts.running) {
    transcriber.sync([
      { key: 'local', stream: state.local, name: roomMemberName(state.me) },
      ...state.peers.map((p) => ({ key: p.key, stream: p.stream, name: roomMemberName(p.member) })),
    ]);
  }

  const mainKey = big || state.peers[0]?.key || 'local';

  // In its own window: everyone there, the page stays free for the chat.
  if (callPipWindow) {
    const back = () => callPipWindow?.close();
    const bar = document.createElement('div');
    bar.className = 'call-mini__bar';
    bar.append(
      control('Back', true, back),
      control(state.micOn ? 'Mute' : 'Unmute', state.micOn, () => call.toggleMic()),
      control(state.camOn ? 'Cam off' : 'Cam on', state.camOn, () => call.toggleCam()),
      control('Leave', true, leave, ' call-control--leave'),
    );
    callPipWindow.document.body.replaceChildren(compactCallStage(tiles, mainKey, () => {}), bar);
    callOverlayEl.hidden = true;
    callOverlayEl.replaceChildren();
    resumeCallVideos(tiles);
    return;
  }

  // Minimized: one small window in the corner, the chat stays usable.
  callOverlayEl.classList.toggle('call-overlay--mini', callMinimized);
  if (callMinimized) {
    const expand = () => { callMinimized = false; renderCall(call.state()); };
    const bar = document.createElement('div');
    bar.className = 'call-mini__bar';
    bar.append(
      control('Expand', true, expand),
      control(state.micOn ? 'Mute' : 'Unmute', state.micOn, () => call.toggleMic()),
      control('Leave', true, leave, ' call-control--leave'),
    );
    callOverlayEl.replaceChildren(compactCallStage(tiles, mainKey, expand), bar);
    resumeCallVideos(tiles);
    return;
  }

  const stage = document.createElement('div');
  if (big && tiles.has(big)) {
    stage.className = 'call-stage call-stage--spotlight';
    const main = document.createElement('div');
    main.className = 'call-stage__main';
    main.appendChild(tiles.get(big));
    const strip = document.createElement('div');
    strip.className = 'call-stage__strip';
    for (const [key, tile] of tiles) if (key !== big) strip.appendChild(tile);
    stage.append(main, strip);
  } else {
    stage.className = `call-grid call-grid--${Math.min(tiles.size, 4)}`;
    for (const tile of tiles.values()) stage.appendChild(tile);
  }

  const controls = document.createElement('div');
  controls.className = 'call-controls';
  const pipVideo = pictureInPictureVideo();
  const pipAvailable = Boolean(window.documentPictureInPicture)
    || Boolean(pipVideo && (document.pictureInPictureEnabled || pipVideo.webkitSupportsPresentationMode?.('picture-in-picture')));
  controls.append(
    control('Minimize', true, () => { callMinimized = true; renderCall(call.state()); }),
    ...(pipAvailable ? [control('Small window', true, () => openCallWindow())] : []),
    control(state.micOn ? 'Mute' : 'Unmute', state.micOn, () => call.toggleMic()),
    control(state.camOn ? 'Camera off' : 'Camera on', state.camOn, () => call.toggleCam()),
    ...(state.canShareScreen
      ? [control(state.screen ? 'Stop sharing' : 'Share screen', !state.screen, () => {
          (state.screen ? call.stopScreen() : call.shareScreen()).catch(() => {});
        })]
      : []),
    control('Leave', true, leave, ' call-control--leave'),
  );
  // Transcription runs on a computer only: too heavy for a phone.
  const canTranscribe = !/iPhone|iPad|Android/.test(navigator.userAgent);
  // One transcript per call is enough: while another tab writes one (also
  // this person's other device), this one does not start a second.
  if (canTranscribe && (ts.running || !state.transcribedBy.length)) {
    controls.append(control(
      ts.running ? 'Stop transcript' : ts.progress != null ? `Loading model ${ts.progress}%` : 'Transcribe',
      !ts.running,
      () => toggleTranscript(),
    ));
  }
  const status = document.createElement('p');
  status.className = 'call-status';
  const others = state.transcribedBy.map(roomMemberName);
  status.textContent = [
    state.peers.length ? '' : 'Waiting for the others to join…',
    big ? 'Tap the big picture to go back to all.' : state.peers.length ? 'Tap a picture to make it big.' : '',
    ts.running ? `Transcription running on this device (${ts.model}, ${ts.device}, ${ts.lines} lines${ts.queued ? `, ${ts.queued} waiting` : ''}).` : '',
    others.length ? `Transcription running (${others.join(', ')}).` : '',
  ].filter(Boolean).join(' ');
  callOverlayEl.replaceChildren(stage, status, controls);
  resumeCallVideos(tiles);
}

// Reader for an artifact of the team room (e.g. a call transcript).
const artifactViewerEl = document.createElement('div');
artifactViewerEl.id = 'artifact-viewer';
artifactViewerEl.hidden = true;
document.body.appendChild(artifactViewerEl);

// Mermaid diagrams (```mermaid blocks, see markdown.js). The library is a
// file of its own (public/mermaid.js) and only loads once a finished
// message or document holds a diagram; a reply still being written keeps
// showing the source. Drawn in the colours of the current theme, and drawn
// again when the theme changes. A diagram that cannot be drawn stays code.
let mermaidLoading = null;
function loadMermaid() {
  if (globalThis.hireJunoMermaid) return Promise.resolve(globalThis.hireJunoMermaid);
  if (!mermaidLoading) {
    mermaidLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'mermaid.js';
      script.onload = () => (globalThis.hireJunoMermaid ? resolve(globalThis.hireJunoMermaid) : reject(new Error('mermaid missing')));
      script.onerror = () => {
        mermaidLoading = null;
        script.remove();
        reject(new Error('mermaid not loaded'));
      };
      document.head.appendChild(script);
    });
  }
  return mermaidLoading;
}
const diagramSvgs = new Map(); // theme + source -> svg text, or null when it cannot be drawn
let diagramCount = 0;
let drawingDiagrams = false;
function diagramTheme() {
  const set = document.documentElement.dataset.theme;
  const dark = set ? set === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  return dark ? 'dark' : 'default';
}
async function drawDiagrams() {
  if (drawingDiagrams) return;
  const pending = () => [...document.querySelectorAll('.diagram[data-diagram="mermaid"]:not([data-drawn])')].filter((b) => !b.closest('.message--streaming'));
  if (!pending().length) return;
  drawingDiagrams = true;
  try {
    let mermaid;
    try {
      mermaid = await loadMermaid();
    } catch {
      return; // offline or missing: the source stays, the next render tries again
    }
    let blocks;
    while ((blocks = pending()).length) {
      for (const block of blocks) {
        block.dataset.drawn = 'pending';
        const source = block.querySelector('.diagram__source code')?.textContent || '';
        const theme = diagramTheme();
        const key = `${theme}\n${source}`;
        if (!diagramSvgs.has(key)) {
          const id = `hj-diagram-${++diagramCount}`;
          try {
            mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme });
            diagramSvgs.set(key, (await mermaid.render(id, source)).svg);
          } catch {
            diagramSvgs.set(key, null);
          }
          // A failed render can leave its scratch element behind.
          document.getElementById(id)?.remove();
          document.getElementById(`d${id}`)?.remove();
        }
        const svg = diagramSvgs.get(key);
        if (!block.isConnected) continue;
        if (svg) {
          block.querySelector('.diagram__canvas').innerHTML = svg;
          block.dataset.drawn = 'done';
        } else {
          block.dataset.drawn = 'failed';
        }
      }
    }
  } finally {
    drawingDiagrams = false;
  }
}
function redrawDiagrams() {
  for (const block of document.querySelectorAll('.diagram[data-drawn]')) {
    delete block.dataset.drawn;
    block.querySelector('.diagram__canvas').innerHTML = '';
  }
  drawDiagrams();
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', redrawDiagrams);
{
  let queued = false;
  const queueDraw = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      drawDiagrams();
    });
  };
  const watch = new MutationObserver(queueDraw);
  watch.observe(messagesEl, { childList: true, subtree: true });
  watch.observe(artifactViewerEl, { childList: true, subtree: true });
}
// "Code" under a diagram shows its source (to read or copy), again hides it.
document.addEventListener('click', (event) => {
  const toggle = event.target.closest?.('.diagram__toggle');
  if (!toggle) return;
  const block = toggle.closest('.diagram');
  const open = block.classList.toggle('diagram--show-code');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.textContent = open ? 'Hide code' : 'Code';
});

async function openArtifact(id) {
  artifactViewerEl.hidden = false;
  artifactViewerEl.innerHTML = '<div class="artifact-viewer__panel"><p>Loading…</p></div>';
  let artifact = null;
  try {
    const res = await fetch(`api/room-artifact?id=${encodeURIComponent(id)}`);
    artifact = res.ok ? await res.json() : null;
  } catch {
    artifact = null;
  }
  const panel = document.createElement('div');
  panel.className = 'artifact-viewer__panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  const header = document.createElement('div');
  header.className = 'artifact-viewer__header';
  const title = document.createElement('h2');
  title.textContent = artifact?.title || 'Not available';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy';
  copy.addEventListener('click', (event) => copyWithFeedback(artifact?.content || '', event.currentTarget));
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', closeArtifact);
  header.append(title, ...(artifact ? [copy] : []), close);
  const body = document.createElement('div');
  body.className = 'artifact-viewer__body';
  body.innerHTML = artifact ? renderMarkdown(artifact.content) : '<p>This document could not be loaded.</p>';
  panel.append(header, body);
  artifactViewerEl.replaceChildren(panel);
  close.focus();
}

// The person's profile (sidebar "You"): their GitHub account, and the open
// issues and pull requests assigned to them or waiting for their review.
let personName = '';
let githubProfile = { account: null, lists: null, loading: false, error: null };
function profileDisplayName() {
  const room = [...channelsById.values()].find((c) => c.room)?.room;
  return (personName || room?.you?.name || roomSelfName || 'You').replace(/\s*\(.*\)\s*$/, '') || 'You';
}
async function loadGithubProfile() {
  githubProfile.loading = true;
  try {
    githubProfile.account = await fetch('api/github-account').then((r) => r.json());
    githubProfile.lists = githubProfile.account.login ? await fetch('api/github-assigned').then((r) => r.json()) : null;
    githubProfile.error = githubProfile.lists?.error || null;
  } catch {
    githubProfile.error = 'failed';
  } finally {
    githubProfile.loading = false;
    renderSidebar();
    if (artifactViewerEl.dataset.view === 'profile') renderProfileView();
  }
}
// Asked again every five minutes while the chat is open.
setInterval(() => { if (document.visibilityState === 'visible') loadGithubProfile(); }, 5 * 60 * 1000);

function openProfileView() {
  artifactViewerEl.hidden = false;
  artifactViewerEl.dataset.view = 'profile';
  renderProfileView();
  artifactViewerEl.querySelector('.artifact-viewer__header button')?.focus();
  loadGithubProfile();
}

function GithubItemRow({ item }) {
  return html`<li><a class=${`profile-item gh-tone--${item.state === 'open' ? 'open' : item.state === 'draft' ? 'muted' : item.state}`} href=${item.url} target="_blank" rel="noopener noreferrer">
    <${GithubKindIcon} kind=${item.kind} />
    <span class="profile-item__main">
      <span class="profile-item__title">${item.title}</span>
      <span class="profile-item__meta">${item.owner}/${item.repo} #${item.number}${item.state === 'draft' ? ' · Draft' : ''}${item.updatedAt ? ` · updated ${relativeTime(item.updatedAt)}` : ''}</span>
    </span>
  </a></li>`;
}

function GithubList({ title, items, empty }) {
  return html`<section class="profile-list">
    <h3>${title} <span class="profile-list__count">${items ? items.length : ''}</span></h3>
    ${!items ? html`<p class="profile-note">Loading…</p>`
      : items.length ? html`<ul>${items.map((item) => html`<${GithubItemRow} key=${item.url} item=${item} />`)}</ul>`
      : html`<p class="profile-note">${empty}</p>`}
  </section>`;
}

function ProfileGithubAccount({ account }) {
  const [error, setError] = useState(null);
  if (!account) return html`<p class="profile-note">Loading…</p>`;
  const submit = (event, type, field) => {
    event.preventDefault();
    const value = event.currentTarget.elements[field].value.trim();
    if (!value) return;
    setError(null);
    socket.send(JSON.stringify({ type, [field]: value }));
    event.currentTarget.reset();
  };
  githubAccountError = setError;
  const status = account.token ? html`Your own token, signed in as <strong>@${account.login}</strong>. What you do on GitHub from here shows as you.`
    : account.login ? html`GitHub name <strong>@${account.login}</strong>${account.source === 'gh' ? ' (as GitHub is signed in on this server)' : ''}. Without your own token the chat acts on GitHub with this server's GitHub account.`
    : html`No GitHub account yet. Enter your GitHub name to see what is assigned to you${account.canSetToken ? ', or add your own token' : ''}.`;
  return html`<section class="profile-github">
    <h3>GitHub</h3>
    <p class="profile-note">${status}</p>
    ${!account.token && account.source !== 'gh'
      ? html`<form class="profile-form" onSubmit=${(e) => submit(e, 'set_github_login', 'login')}>
          <input name="login" type="text" autocomplete="username" spellcheck="false" placeholder="GitHub name" aria-label="GitHub name" />
          <button type="submit">Save</button>
        </form>`
      : null}
    ${account.canSetToken
      ? html`<form class="profile-form" autocomplete="off" onSubmit=${(e) => submit(e, 'set_github_token', 'token')}>
          <input name="token" type="password" autocomplete="off" spellcheck="false" placeholder=${account.token ? 'Replace your token' : 'Paste your GitHub token'} aria-label="GitHub token" />
          <button type="submit">${account.token ? 'Replace' : 'Save'}</button>
        </form>
        ${account.token ? html`<button type="button" class="profile-remove" onClick=${() => socket.send(JSON.stringify({ type: 'remove_github_token' }))}>Remove token</button>` : null}
        <p class="profile-note profile-note--small">A fine-grained token from GitHub (Settings → Developer settings → Fine-grained tokens), limited to the repositories you work in, with read and write access to Issues and Pull requests (and Projects, to move cards on a board). It is kept in your account on this server only and used only for what you do in this chat.</p>`
      : null}
    ${error ? html`<p class="profile-error" role="alert">${error}</p>` : null}
  </section>`;
}
let githubAccountError = null;

function renderProfileView() {
  let panel = artifactViewerEl.querySelector('.artifact-viewer__panel--profile');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'artifact-viewer__panel artifact-viewer__panel--profile';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Profile');
    artifactViewerEl.replaceChildren(panel);
  }
  const { account, lists, error } = githubProfile;
  render(html`
    <div class="artifact-viewer__header">
      <h2>${profileDisplayName()}</h2>
      <button type="button" onClick=${closeArtifact}>Close</button>
    </div>
    <div class="artifact-viewer__body profile-body">
      <${ProfileGithubAccount} account=${account} />
      ${account?.login
        ? html`
            ${error ? html`<p class="profile-error" role="alert">${error === 'unavailable' ? 'GitHub needs the GitHub CLI (gh) on this server.' : 'Could not load from GitHub just now.'}</p>` : null}
            <${GithubList} title="Issues assigned to you" items=${lists?.issues} empty="No open issues assigned to you." />
            <${GithubList} title="Pull requests assigned to you" items=${lists?.pulls} empty="No open pull requests assigned to you." />
            <${GithubList} title="Waiting for your review" items=${lists?.reviews} empty="No pull requests waiting for your review." />
            <button type="button" class="profile-refresh" onClick=${() => { githubProfile.lists = null; renderProfileView(); loadGithubProfile(); }}>Refresh</button>
          `
        : null}
    </div>
  `, panel);
}

// Shared media: the pictures, links and documents of one conversation, or
// of all of them ({ all: true }), in three tabs, newest first.
let mediaScope = null;
let mediaData = null;
let mediaTab = 'pictures';
async function openMediaView(scope) {
  mediaScope = scope;
  mediaData = null;
  mediaTab = 'pictures';
  artifactViewerEl.hidden = false;
  artifactViewerEl.dataset.view = 'media';
  renderMediaView();
  artifactViewerEl.querySelector('.artifact-viewer__header button')?.focus();
  const q = scope.all ? 'all=1'
    : scope.channelId ? `channelId=${encodeURIComponent(scope.channelId)}`
    : `colleagueId=${encodeURIComponent(scope.colleagueId)}${scope.sessionId && scope.sessionId !== NEW_SESSION ? `&sessionId=${encodeURIComponent(scope.sessionId)}` : ''}`;
  try {
    const data = await fetch(`api/media?${q}`).then((r) => r.json());
    if (mediaScope !== scope) return;
    mediaData = data;
  } catch {
    if (mediaScope !== scope) return;
    mediaData = { error: true, pictures: [], links: [], docs: [] };
  }
  if (artifactViewerEl.dataset.view === 'media') renderMediaView();
}

function MediaOrigin({ item }) {
  const parts = [mediaScope?.all ? item.where : '', item.who, item.createdAt ? formatMessageTime(item.createdAt) : ''].filter(Boolean);
  return html`<span class="media-origin">${parts.join(' · ')}</span>`;
}

function linkLabel(url) {
  const gh = githubRef(url);
  if (gh) return { title: `${gh.owner}/${gh.repo} #${gh.number}`, kind: gh.kind === 'pull' ? 'Pull request' : 'Issue' };
  if (youtubeVideos(url).length) return { title: url.replace(/^https?:\/\//, ''), kind: 'YouTube' };
  try {
    const u = new URL(url);
    return { title: `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname}`, kind: '' };
  } catch {
    return { title: url, kind: '' };
  }
}

function renderMediaView() {
  let panel = artifactViewerEl.querySelector('.artifact-viewer__panel--media');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'artifact-viewer__panel artifact-viewer__panel--media';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    artifactViewerEl.replaceChildren(panel);
  }
  const scope = mediaScope || {};
  const title = scope.all ? 'Shared media, all chats'
    : scope.channelId ? `Shared in #${channelsById.get(scope.channelId)?.name || 'channel'}`
    : `Shared with ${colleaguesById.get(scope.colleagueId)?.name || 'her'}`;
  panel.setAttribute('aria-label', title);
  const data = mediaData;
  const tabs = [
    ['pictures', 'Pictures', data?.pictures?.length],
    ['links', 'Links', data?.links?.length],
    ['docs', 'Documents', data?.docs?.length],
  ];
  const pick = (name) => { mediaTab = name; renderMediaView(); };
  let body;
  if (!data) body = html`<p class="profile-note">Loading…</p>`;
  else if (data.error) body = html`<p class="profile-error" role="alert">Could not load what was shared.</p>`;
  else if (mediaTab === 'pictures') {
    body = data.pictures.length
      ? html`<ul class="media-grid">${data.pictures.map((p) => html`<li key=${p.url}>
          <button type="button" class="media-thumb" aria-label=${`${p.name}${p.who ? `, from ${p.who}` : ''}`} onClick=${(e) => openImageLightbox(e.currentTarget.querySelector('img'))}>
            <img src=${p.url} alt=${p.name} loading="lazy" />
          </button>
          <${MediaOrigin} item=${p} />
        </li>`)}</ul>`
      : html`<p class="profile-note">No pictures shared yet.</p>`;
  } else if (mediaTab === 'links') {
    body = data.links.length
      ? html`<ul class="media-list">${data.links.map((l) => {
          const label = linkLabel(l.url);
          return html`<li key=${l.url}><a class="media-link" href=${l.url} target="_blank" rel="noopener noreferrer">
            <span class="media-link__title">${label.kind ? html`<span class="media-link__kind">${label.kind}</span> ` : null}${label.title}</span>
            <${MediaOrigin} item=${l} />
          </a></li>`;
        })}</ul>`
      : html`<p class="profile-note">No links shared yet.</p>`;
  } else {
    body = data.docs.length
      ? html`<ul class="media-list">${data.docs.map((d) => html`<li key=${d.id}><button type="button" class="media-link" onClick=${() => openArtifact(d.id)}>
          <span class="media-link__title"><span class="media-link__kind">${d.kind === 'transcript' ? 'Transcript' : 'Document'}</span> ${d.title}</span>
          <${MediaOrigin} item=${d} />
        </button></li>`)}</ul>`
      : html`<p class="profile-note">No documents yet. Call transcripts and documents from the team room show here.</p>`;
  }
  render(html`
    <div class="artifact-viewer__header">
      <h2>${title}</h2>
      <button type="button" onClick=${closeArtifact}>Close</button>
    </div>
    <div class="media-tabs" role="tablist">
      ${tabs.map(([name, label, count]) => html`<button type="button" role="tab" class="media-tab" aria-selected=${mediaTab === name ? 'true' : 'false'} onClick=${() => pick(name)}>${label}${count ? html` <span class="profile-list__count">${count}</span>` : null}</button>`)}
    </div>
    <div class="artifact-viewer__body media-body">${body}</div>
  `, panel);
}

function closeArtifact() {
  artifactViewerEl.hidden = true;
  artifactViewerEl.innerHTML = '';
  delete artifactViewerEl.dataset.view;
}
artifactViewerEl.addEventListener('click', (event) => {
  if (event.target === artifactViewerEl) closeArtifact();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !artifactViewerEl.hidden) closeArtifact();
});

const transcriber = createTranscriber({ onChange: () => renderCall(call.state()) });
let transcriptChannelId = null;

async function toggleTranscript() {
  if (transcriber.state().running) {
    await finishTranscript();
    return;
  }
  if (transcriber.state().progress != null) return;
  transcriptChannelId = activeChannelId;
  try {
    await transcriber.start();
  } catch (err) {
    window.alert(`Could not start the transcription: ${err.message}`);
    renderCall(call.state());
    return;
  }
  call.announceTranscribing(true);
  renderCall(call.state());
}

// Posts the transcript to the team room and tells the call it ended.
async function finishTranscript() {
  call.announceTranscribing(false);
  const result = await transcriber.stop();
  if (!result) return;
  const { title, content } = transcriptArtifact(result);
  socket.send(JSON.stringify({ type: 'room_artifact', kind: 'transcript', title, content }));
}

const call = createCallController({
  sendSignal: (to, data) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'call_signal', to, data }));
  },
  fetchIce: () => fetch('api/ice').then((r) => r.json()),
  onChange: renderCall,
});
window.addEventListener('pagehide', () => call.leave());

document.addEventListener('visibilitychange', () => {
  // Only a phone stops the camera in the background; on a computer the
  // picture goes on (as in other call apps), so nothing to tell the others.
  if (/iPhone|iPad|Android/.test(navigator.userAgent)) call.setAway(document.visibilityState !== 'visible');
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'visibility', visible: document.visibilityState === 'visible' }));
  }
});

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
  probeSocket();
  // Back from the lock screen or another app: what happened meanwhile may
  // not have reached this tab, so the running turns and the open
  // conversation are asked for again.
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'get_live_state' }));
  refreshActiveConversation().catch(() => {});
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

// Request ids whose card is showing the "Allow all tools" confirmation.
const confirmingAllowAll = new Set();

// Shared by the 1:1 view and the channel view — same card, same
// Allow/Deny behavior, wherever the request came from. `isChannel`
// only decides which pending-permission map the response clears.
// `respondToPermission` is the same plain function the old vanilla
// version called — porting the markup didn't need to touch it.
function PermissionCard({ permission, colleagueId, isChannel }) {
  // For a channel, the `colleagueId` prop is the bare id (see
  // renderChannelMessages) — combined here with the channel so
  // permissions don't leak into her other channels. For a 1:1, the
  // prop is already the full convKey its caller passes in.
  const key = isChannel ? channelKey(colleagueId, permission.channelId) : colleagueId;
  const confirming = confirmingAllowAll.has(permission.requestId);
  const setConfirming = (on) => {
    if (on) confirmingAllowAll.add(permission.requestId);
    else confirmingAllowAll.delete(permission.requestId);
    if (isChannel) renderChannelMessages();
    else renderMessages();
  };
  const name = colleaguesById.get(key.split('::')[0])?.name || 'She';
  const where = isChannel ? 'this channel' : 'this chat';
  const allow = () => respondToPermission(key, permission.requestId, true, isChannel);
  // "Always allow <tool>": the server stops asking about this one tool
  // for this conversation (every call of it, not just this one).
  const allowAlways = () => {
    setAlwaysAllow(key, permission.toolName, true);
    respondToPermission(key, permission.requestId, true, isChannel);
  };
  const deny = () => respondToPermission(key, permission.requestId, false, isChannel);
  // "Allow all tools": every tool, not just this one; the server holds it.
  const allowAllTools = () => {
    setAllowAll(key, true);
    respondToPermission(key, permission.requestId, true, isChannel);
  };

  return html`
    <div class="permission-card">
      <p>${permission.title || `Wants to use ${permission.displayName || permission.toolName}`}</p>
      ${permission.description ? html`<p class="permission-card__description">${permission.description}</p>` : null}
      <div class="permission-card__actions">
        <button type="button" onClick=${allow}>Allow</button>
        <button type="button" class="permission-card__allow-always" onClick=${allowAlways}
          title=${`Stops asking for ${permission.toolName} in ${where}. Applies to every ${permission.toolName} call, not just this one.`}>Always allow ${permission.toolName}</button>
        <button type="button" class="permission-card__deny" onClick=${deny}>Deny</button>
      </div>
      ${confirming
        ? html`<div class="permission-card__confirm" role="group" aria-label="Allow all tools">
            <p>Allow all tools in ${where}?</p>
            <p class="permission-card__description">${name} will edit files, run commands and use the web without asking, until you turn this off in Conversation settings.</p>
            <div class="permission-card__actions">
              <button type="button" onClick=${allowAllTools}>Allow all tools</button>
              <button type="button" class="permission-card__deny" onClick=${() => setConfirming(false)}>Cancel</button>
            </div>
          </div>`
        : html`<button type="button" class="permission-card__link" onClick=${() => setConfirming(true)}>Allow all tools in ${where}…</button>`}
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
// ('not asked'), by "allow all tools", or by "always allow". Reading files and searching need no approval at all
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

// A YouTube link plays right in the chat: first only its picture (nothing
// from YouTube itself loads), a tap starts the player in place, inline on
// phones. Browsers do not let a video start with sound on its own, so the
// tap is what starts it.
function YouTubeCard({ video }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return html`<div class="youtube-card youtube-card--playing">
      <iframe
        src=${youtubeEmbedUrl(video)}
        title="YouTube video"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>`;
  }
  return html`<button type="button" class="youtube-card" aria-label="Play the YouTube video here" onClick=${(e) => { e.stopPropagation(); setPlaying(true); }}>
    <img src=${youtubeThumbnail(video.id)} alt="" loading="lazy" referrerpolicy="no-referrer" />
    <span class="youtube-card__play" aria-hidden="true"></span>
  </button>`;
}

// A GitHub issue or pull request linked in a message, as a card: title,
// state, labels and a few facts, fetched by this chat's server (with the
// GitHub CLI's account). The whole card opens it on GitHub.
const githubPreviewCache = new Map(); // "owner/repo#n" -> Promise<preview>
function loadGithubPreview(ref) {
  const key = `${ref.owner}/${ref.repo}#${ref.number}`.toLowerCase();
  if (!githubPreviewCache.has(key)) {
    const q = new URLSearchParams({ owner: ref.owner, repo: ref.repo, kind: ref.kind, number: String(ref.number) });
    const request = fetch(`api/github-preview?${q}`)
      .then((r) => (r.ok ? r.json() : { error: 'not_found' }))
      .catch(() => ({ error: 'offline' }));
    githubPreviewCache.set(key, request);
    // A failure is asked again later; a preview stays for the page's life.
    request.then((p) => { if (p.error) setTimeout(() => githubPreviewCache.delete(key), 30000); });
  }
  return githubPreviewCache.get(key);
}

const GH_STATE_LABEL = { open: 'Open', closed: 'Closed', merged: 'Merged', draft: 'Draft' };

function GithubKindIcon({ kind }) {
  // Drawn for this app (see DESIGN.md, icons): an issue is a ring with a
  // dot, a pull request two branch ends joined into one line.
  return kind === 'pull'
    ? html`<svg class="gh-card__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="19" r="2.2" /><path d="M6 7.2v9.6" /><path d="M18 16.8V10a3 3 0 0 0-3-3h-4" /><path d="M13 4.5 10.5 7 13 9.5" /></svg>`
    : html`<svg class="gh-card__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>`;
}

// Changes from a card go over the socket; the answer carries the fresh data.
const githubActionWaiting = new Map(); // requestId -> resolve
function githubAction(ref, body) {
  const requestId = newMessageId();
  socket.send(JSON.stringify({ type: 'github_action', requestId, owner: ref.owner, repo: ref.repo, kind: ref.kind, number: ref.number, ...body }));
  return new Promise((resolve) => {
    githubActionWaiting.set(requestId, resolve);
    setTimeout(() => { if (githubActionWaiting.delete(requestId)) resolve({ error: 'No answer from the server.' }); }, 30000);
  });
}
// Every card of the same issue shows the new state, not only the one used.
function githubPreviewChanged(ref, preview) {
  const key = `${ref.owner}/${ref.repo}#${ref.number}`.toLowerCase();
  githubPreviewCache.set(key, Promise.resolve(preview));
  window.dispatchEvent(new CustomEvent('github-preview', { detail: { key, preview } }));
}

function GithubCardMenu({ gref, preview, menu, onDone }) {
  const [options, setOptions] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    setOptions(null);
    setError(null);
    const q = new URLSearchParams({ owner: gref.owner, repo: gref.repo, kind: gref.kind, number: String(gref.number), what: menu });
    fetch(`api/github-options?${q}`)
      .then((r) => r.json())
      .then((data) => { if (!live) return; if (data.error) setError(data.error); else setOptions(data.options); })
      .catch(() => live && setError('Could not reach the server.'));
    return () => { live = false; };
  }, [menu, gref.url]);
  const run = async (body) => {
    setBusy(true);
    setError(null);
    const result = await githubAction(gref, body);
    setBusy(false);
    if (result.error) setError(result.error);
    else githubPreviewChanged(gref, result.preview);
    if (menu === 'boards' && !result.error) onDone();
  };
  const title = menu === 'labels' ? 'Labels' : menu === 'assignees' ? 'Assignees' : 'Board column';
  let body;
  if (error && !options) body = html`<p class="gh-menu__note gh-menu__error" role="alert">${error}</p>`;
  else if (!options) body = html`<p class="gh-menu__note">Loading…</p>`;
  else if (menu === 'labels') {
    const set = new Set((preview.labels || []).map((l) => l.name));
    body = options.length
      ? html`<div class="gh-menu__choices">${options.map((l) => {
          const on = set.has(l.name);
          return html`<button type="button" class="gh-menu__choice" aria-pressed=${on ? 'true' : 'false'} disabled=${busy} title=${l.description || l.name}
            onClick=${() => run({ action: 'labels', labels: on ? [...set].filter((n) => n !== l.name) : [...set, l.name] })}>
            <span class="gh-card__dot" style=${l.color ? `background: #${l.color}` : null}></span>${l.name}</button>`;
        })}</div>`
      : html`<p class="gh-menu__note">This repository has no labels.</p>`;
  } else if (menu === 'assignees') {
    const set = new Set(preview.assignees || []);
    body = options.length
      ? html`<div class="gh-menu__choices">${options.map((login) => {
          const on = set.has(login);
          return html`<button type="button" class="gh-menu__choice" aria-pressed=${on ? 'true' : 'false'} disabled=${busy}
            onClick=${() => run({ action: 'assignees', assignees: on ? [...set].filter((n) => n !== login) : [...set, login] })}>@${login}</button>`;
        })}</div>`
      : html`<p class="gh-menu__note">Nobody can be assigned here.</p>`;
  } else {
    body = options.length
      ? options.map((board) => html`<div class="gh-menu__board">
          <span class="gh-menu__board-title">${board.title}</span>
          <div class="gh-menu__choices">${board.options.map((o) => html`<button type="button" class="gh-menu__choice" aria-pressed=${board.current === o.id ? 'true' : 'false'} disabled=${busy || board.current === o.id}
            onClick=${() => run({ action: 'move', projectId: board.projectId, itemId: board.itemId, fieldId: board.fieldId, optionId: o.id })}>${o.name}</button>`)}</div>
        </div>`)
      : html`<p class="gh-menu__note">Not on a project board with a Status column.</p>`;
  }
  return html`<div class="gh-menu" role="group" aria-label=${title}>
    ${body}
    ${error && options ? html`<p class="gh-menu__note gh-menu__error" role="alert">${error}</p>` : null}
  </div>`;
}

function GithubCard({ gref }) {
  const [preview, setPreview] = useState(null);
  const [menu, setMenu] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    let live = true;
    loadGithubPreview(gref).then((p) => { if (live) setPreview(p); });
    const key = `${gref.owner}/${gref.repo}#${gref.number}`.toLowerCase();
    const changed = (event) => { if (event.detail.key === key) setPreview(event.detail.preview); };
    window.addEventListener('github-preview', changed);
    return () => { live = false; window.removeEventListener('github-preview', changed); };
  }, [gref.url]);
  const where = `${gref.owner}/${gref.repo}`;
  if (!preview) {
    return html`<span class="gh-card gh-card--loading" aria-live="polite">
      <span class="gh-card__head"><${GithubKindIcon} kind=${gref.kind} /><span class="gh-card__repo">${where}</span><span>#${gref.number}</span></span>
      <span class="gh-card__meta">Loading preview…</span>
    </span>`;
  }
  // No GitHub CLI on this server: the link alone, as before.
  if (preview.error === 'unavailable') return null;
  if (preview.error) {
    return html`<a class="gh-card gh-card--empty" href=${gref.url} target="_blank" rel="noopener noreferrer">
      <span class="gh-card__head"><${GithubKindIcon} kind=${gref.kind} /><span class="gh-card__repo">${where}</span><span>#${gref.number}</span></span>
      <span class="gh-card__meta">No preview: not found, or no access with this server's GitHub account.</span>
    </a>`;
  }
  const facts = [
    preview.author ? `by ${preview.author}` : '',
    preview.assignees?.length ? `assigned to ${preview.assignees.map((a) => `@${a}`).join(', ')}` : '',
    preview.updatedAt ? `updated ${relativeTime(preview.updatedAt)}` : '',
    preview.comments ? `${preview.comments} ${preview.comments === 1 ? 'comment' : 'comments'}` : '',
    preview.kind === 'pull' && preview.changedFiles ? `${preview.changedFiles} ${preview.changedFiles === 1 ? 'file' : 'files'}` : '',
  ].filter(Boolean);
  const stateName = preview.state === 'closed' && preview.kind === 'issue' && preview.reason === 'not_planned' ? 'Not planned' : GH_STATE_LABEL[preview.state] || preview.state;
  // Colour: open green, merged or a finished issue purple, a PR closed
  // unmerged red, a draft or an issue closed as not planned grey.
  const tone = preview.state === 'open' ? 'open'
    : preview.state === 'merged' ? 'merged'
    : preview.state === 'draft' || preview.reason === 'not_planned' ? 'muted'
    : preview.kind === 'issue' ? 'merged' : 'closed';
  const isOpen = preview.state === 'open' || preview.state === 'draft';
  const toggleState = async () => {
    setBusy(true);
    setError(null);
    const result = await githubAction(gref, { action: 'state', state: isOpen ? 'closed' : 'open', reason: isOpen ? 'completed' : null });
    setBusy(false);
    if (result.error) setError(result.error);
    else githubPreviewChanged(gref, result.preview);
  };
  const menuButton = (name, label) => html`<button type="button" class="gh-card__action" aria-expanded=${menu === name ? 'true' : 'false'} onClick=${() => setMenu(menu === name ? null : name)}>${label}</button>`;
  return html`<div class=${`gh-card gh-card--${tone}`}>
    <a class="gh-card__link" href=${gref.url} target="_blank" rel="noopener noreferrer" aria-label=${`${preview.kind === 'pull' ? 'Pull request' : 'Issue'} ${where} #${preview.number}: ${preview.title}, ${stateName}. Opens on GitHub.`}>
      <span class="gh-card__head">
        <${GithubKindIcon} kind=${preview.kind} />
        <span class="gh-card__repo">${where}</span><span>#${preview.number}</span>
        <span class="gh-card__state">${stateName}</span>
      </span>
      <span class="gh-card__title">${preview.title}</span>
      ${preview.body ? html`<span class="gh-card__body">${preview.body}</span>` : null}
      ${preview.labels?.length
        ? html`<span class="gh-card__labels">${preview.labels.map((l) => html`<span class="gh-card__label"><span class="gh-card__dot" style=${l.color ? `background: #${l.color}` : null}></span>${l.name}</span>`)}</span>`
        : null}
      <span class="gh-card__meta">
        ${facts.join(' · ')}
        ${preview.kind === 'pull' ? html`${facts.length ? ' · ' : ''}<span class="gh-card__add">+${preview.additions}</span> <span class="gh-card__del">−${preview.deletions}</span>` : null}
        ${preview.kind === 'pull' && preview.head && preview.base ? html`<span class="gh-card__branches">${preview.head} → ${preview.base}</span>` : null}
      </span>
    </a>
    <div class="gh-card__actions">
      ${preview.state !== 'merged'
        ? html`<button type="button" class="gh-card__action" disabled=${busy} onClick=${toggleState}>${busy ? '…' : isOpen ? 'Close' : 'Reopen'}</button>`
        : null}
      ${menuButton('labels', 'Labels')}
      ${menuButton('assignees', 'Assign')}
      ${menuButton('boards', 'Board')}
    </div>
    ${error ? html`<p class="gh-menu__note gh-menu__error" role="alert">${error}</p>` : null}
    ${menu ? html`<${GithubCardMenu} key=${menu} gref=${gref} preview=${preview} menu=${menu} onDone=${() => setMenu(null)} />` : null}
  </div>`;
}

function MessageRow({ role, avatarColleague, nameTag, item, toolText, onToggle, onToggleTrailEntry, onWithdraw, variant = null, onReply = null, onReact = null, accent = null, onEmoji = null, roomYouId = null }) {
  const isToolUse = item.toolInput !== undefined;
  const time = formatMessageTime(item.createdAt);
  const reactions = item.reactions || [];
  const picking = onEmoji && reactionPickerFor === item.roomId;
  return html`
    <${Fragment}>
      ${item.trail?.length ? html`<${TrailBox} trail=${item.trail} onToggleEntry=${onToggleTrailEntry} />` : null}
      <div class="message message--${role}${variant ? ` message--${variant}` : ''}${item.pending ? ' message--pending' : ''}${onEmoji ? ' message--room' : ''}" style=${accent ? `--person: ${accent}` : null} data-room-id=${onEmoji ? item.roomId : null}>
        ${avatarColleague ? html`<${Avatar} colleague=${avatarColleague} />` : null}
        ${isToolUse
          ? html`
              <span class="tool-use-line" onClick=${onToggle}>${toolText}</span>
              ${item.expanded ? html`<${ToolDetailBox} input=${item.toolInput} />` : null}
            `
          : html`
              <span>
                ${nameTag ? html`<strong class="message__sender">${nameTag}</strong><br />` : null}
                ${item.replyTo
                  ? html`<button type="button" class="reply-quote" aria-label=${`Show the message from ${item.replyTo.name} this answers`} onClick=${() => jumpToRoomMessage(item.replyTo.id)}>
                      <span class="reply-quote__name">${item.replyTo.name}</span>
                      <span class="reply-quote__text">${item.replyTo.excerpt || '…'}</span>
                    </button>`
                  : null}
                ${item.artifact
                  ? html`<button type="button" class="artifact-card" onClick=${() => openArtifact(item.artifact.id)}>
                      <span class="artifact-card__kind">${item.artifact.kind === 'transcript' ? 'Transcript' : 'Document'}</span>
                      <span class="artifact-card__title">${item.artifact.title}</span>
                      <span class="artifact-card__open">Open</span>
                    </button>`
                  : item.text ? html`<span dangerouslySetInnerHTML=${{ __html: renderMarkdown(item.text) }} />` : null}
                ${item.text && !item.artifact
                  ? youtubeVideos(item.text).map((video) => html`<${YouTubeCard} key=${video.id} video=${video} />`)
                  : null}
                ${item.text && !item.artifact
                  ? githubRefs(item.text).map((gref) => html`<${GithubCard} key=${gref.url} gref=${gref} />`)
                  : null}
                ${(item.attachments || []).map(
                  (attachment, i) => html`<img key=${i} class="attachment-thumb" src=${attachment.dataUrl} alt=${attachment.name} role="button" tabindex="0" />`
                )}
                ${reactions.length
                  ? html`<span class="reaction-chips">
                      ${reactions.map((r) => {
                        const mine = r.members.some((m) => m.id === roomYouId);
                        const names = r.members.map((m) => (m.id === roomYouId ? 'You' : m.name)).join(', ');
                        return html`<button
                          type="button"
                          class="reaction-chip${mine ? ' is-mine' : ''}"
                          title=${names}
                          aria-label=${`${r.emoji} from ${names}${mine ? ', tap to take yours back' : ''}`}
                          aria-pressed=${mine ? 'true' : 'false'}
                          onClick=${() => onEmoji?.(r.emoji)}
                        >${r.emoji}${r.members.length > 1 ? html`<span class="reaction-chip__count">${r.members.length}</span>` : null}</button>`;
                      })}
                    </span>`
                  : null}
                ${picking
                  ? html`<span class=${`reaction-picker${reactionPickerBelow ? ' reaction-picker--below' : ''}`} role="group" aria-label="React with">
                      ${ROOM_EMOJI.map(
                        (emoji) => html`<button type="button" class="reaction-picker__emoji" aria-label=${`React with ${emoji}`} onClick=${(e) => { e.stopPropagation(); closeReactionPicker(); onEmoji(emoji); }}>${emoji}</button>`
                      )}
                    </span>`
                  : null}
                <span class="message__footer">
                  ${onReply && (item.text || item.attachments?.length) && !item.pending
                    ? html`<button type="button" class="copy-button" aria-label="Reply to this message" onClick=${onReply}>Reply</button>`
                    : null}
                  ${onEmoji
                    ? html`<button type="button" class="copy-button" aria-label="React to this message" aria-expanded=${picking ? 'true' : 'false'} onClick=${(e) => { e.stopPropagation(); toggleReactionPicker(item.roomId); }}>React</button>`
                    : null}
                  ${onReact && item.text && !item.pending
                    ? reactionsFor(item).map(
                        (r) => html`<button type="button" class="reaction-button" title=${r.label} aria-label=${r.label} onClick=${() => onReact(r.key)}>${r.emoji}</button>`
                      )
                    : null}
                  ${item.text && !item.artifact
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

// Her card from the roster file, shown while no conversation is open.
const profileCards = new Map(); // colleagueId -> card | null
async function loadProfileCard(colleagueId) {
  if (profileCards.has(colleagueId)) return;
  try {
    const res = await fetch(`api/profile?colleagueId=${encodeURIComponent(colleagueId)}`);
    profileCards.set(colleagueId, (await res.json()).card || null);
  } catch {
    profileCards.set(colleagueId, null);
  }
  if (activeColleagueId === colleagueId && activeSessionId === NEW_SESSION) renderMessages();
}

function ProfileCard({ colleague, card }) {
  const avatar = colleague.hasAvatar
    ? html`<img class="profile-card__avatar" src=${`api/avatar?colleagueId=${encodeURIComponent(colleague.avatarId || colleague.id)}`} alt="" />`
    : html`<div class="profile-card__avatar profile-card__avatar--initial">${(colleague.name || '?').charAt(0).toUpperCase()}</div>`;
  return html`<section class="profile-card" aria-label=${`About ${colleague.name}`}>
    ${avatar}
    <h2 class="profile-card__name">${card?.heading || colleague.name}</h2>
    ${!card && colleague.role ? html`<p class="profile-card__role">${colleague.role}</p>` : null}
    ${card?.fields?.length
      ? html`<dl class="profile-card__fields">
          ${card.fields.map((f) => html`<${Fragment}><dt>${f.label}</dt><dd>${f.value}</dd><//>`)}
        </dl>`
      : null}
    ${card?.text ? card.text.split('\n\n').map((para) => html`<p class="profile-card__text">${para}</p>`) : null}
    <p class="profile-card__hint">Write below to start a conversation with ${colleague.name}, or continue one from a terminal.</p>
    <${CardTakeOver} colleagueId=${colleague.id} />
  </section>`;
}

// The "Take over a terminal session…" control (takeOverEl) on her card.
function CardTakeOver({ colleagueId }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.replaceChildren(takeOverEl(colleagueId, NEW_SESSION));
  }, [colleagueId]);
  return html`<div class="profile-card__takeover" ref=${ref}></div>`;
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
  if (activeColleagueId && activeSessionId === NEW_SESSION) {
    const colleague = colleaguesById.get(activeColleagueId);
    render(colleague ? html`<${ProfileCard} colleague=${colleague} card=${profileCards.get(colleague.id)} />` : null, messagesEl);
    updateScrollToBottomButton();
    return;
  }
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
    onReply=${item.role === 'colleague' ? () => startReply(activeColleagueId, colleaguesById.get(activeColleagueId)?.name || '', item.text) : null}
    onReact=${item.role === 'colleague' ? (key) => sendReaction(key, activeColleagueId, colleaguesById.get(activeColleagueId)?.name || '', item.text) : null}
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
  updateSendMenu();
  if (stickToBottom) scrollMessagesToBottom();
  else updateScrollToBottomButton();
}

// The arrow next to Send (and its menu with "Queue message"): only in a 1:1
// conversation whose colleague is working on a turn right now (without one
// there is nothing to queue behind, Send does the same).
function updateSendMenu() {
  const available = Boolean(activeColleagueId && !activeChannelId && !input.disabled && isTyping(activeConvKey()));
  sendMenuButtonEl.hidden = !available;
  if (!available) closeSendMenu();
}

function sendMenuItems() {
  return [...sendMenuEl.querySelectorAll('[role="menuitem"]')];
}

function openSendMenu() {
  sendMenuEl.hidden = false;
  sendMenuButtonEl.setAttribute('aria-expanded', 'true');
  sendMenuItems()[0].focus();
}

function closeSendMenu({ restoreFocus = false } = {}) {
  const wasOpen = !sendMenuEl.hidden;
  sendMenuEl.hidden = true;
  sendMenuButtonEl.setAttribute('aria-expanded', 'false');
  if (wasOpen && restoreFocus && !sendMenuButtonEl.hidden) sendMenuButtonEl.focus();
}

sendMenuButtonEl.addEventListener('click', () => {
  if (sendMenuEl.hidden) openSendMenu();
  else closeSendMenu({ restoreFocus: true });
});
sendMenuButtonEl.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    if (sendMenuEl.hidden) openSendMenu();
  }
});
sendMenuEl.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSendMenu({ restoreFocus: true });
    return;
  }
  if (event.key === 'Tab') {
    closeSendMenu();
    return;
  }
  const items = sendMenuItems();
  const next = nextMenuIndex(items.indexOf(document.activeElement), event.key, items.length);
  if (next !== null) {
    event.preventDefault();
    items[next].focus();
  }
  // Enter and Space on a focused item click it, which submits the form.
});
// A click anywhere else closes it; the click on an entry itself submits first.
document.addEventListener('click', (event) => {
  if (!sendMenuEl.hidden && !sendMenuEl.contains(event.target) && !sendMenuButtonEl.contains(event.target)) closeSendMenu();
});

// A channel's message list, one bubble per sender — the part a 1:1
// thread doesn't need, since there only one "colleague" ever speaks.
// role--you/role--colleague/role--system reuse the exact same bubble
// styling as a 1:1 thread; only the colleague bubbles additionally
// carry a name tag, since which colleague spoke changes message to
// message here.
function renderChannelMessages({ forceScrollToBottom = false } = {}) {
  sendMenuButtonEl.hidden = true;
  closeSendMenu();
  // Same reasoning as renderMessages' own stickToBottom — measured
  // before render() below, not after.
  const stickToBottom = forceScrollToBottom || isNearBottom();
  const isRoom = Boolean(channelsById.get(activeChannelId)?.room);
  // In the team room a colleague's reply is told apart by colour, and
  // "only people" hides it together with the messages addressed to one.
  const isAgentItem = (item) => item.senderId !== 'you' && item.senderId !== 'system' && !item.senderId.startsWith('human:');
  // Addressed to a colleague: an @mention of her, or a reply or reaction
  // quoting one of her messages ("> **Kim:** …", see quoteOf).
  const colleagueNames = new Set(colleaguesList.map((c) => c.name.toLowerCase()));
  const toAgent = (item) => {
    if (isAgentItem(item)) return false;
    const text = String(item.text || '');
    if ([...text.matchAll(/@([a-z][a-z0-9_-]*)/gi)].some((m) => colleaguesById.has(m[1].toLowerCase()))) return true;
    if (item.replyTo?.agent) return true;
    const quoted = text.match(/^> \*\*(.+?):\*\*/);
    return Boolean(quoted && colleagueNames.has(quoted[1].toLowerCase()));
  };
  const items = (channelMessages.get(activeChannelId) || []).filter(
    (item) => !(isRoom && roomHumansOnly && (isAgentItem(item) || toAgent(item)))
  );

  // Who's currently mid-turn in this channel, so there is always an
  // indication of who's writing. One entry per colleague actively
  // replying here right now, carrying her live thinking/reply text as
  // it streams in, exactly like the 1:1 view does.
  const typingEntries = [];
  for (const [colleagueId, channelId] of channelTyping) {
    if (channelId !== activeChannelId) continue;
    if (isRoom && roomHumansOnly) continue;
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
    // A person in the team room is no colleague: an initial instead of a photo.
    const sender = isYou || isSystem
      ? null
      : colleaguesById.get(item.senderId) || (item.senderName ? { id: item.senderId, name: item.senderName, hasAvatar: false } : null);
    const role = isYou ? 'you' : isSystem ? 'system' : 'colleague';
    return html`<${MessageRow}
      key=${i}
      role=${role}
      avatarColleague=${sender}
      variant=${!isRoom || isYou || isSystem ? null : isAgentItem(item) ? 'agent' : mentionsMe(item.text) || item.replyTo?.mine ? 'mention' : 'person'}
      accent=${isRoom && item.senderId.startsWith('human:') ? personColor(item.senderId) : null}
      nameTag=${item.senderName || sender?.name || null}
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
      onReply=${!isSystem && !item.artifact ? () => replyToChannelItem(item) : null}
      onReact=${isRoom && isAgentItem(item) && colleaguesById.has(item.senderId)
        ? (key) => sendReaction(key, item.senderId, sender?.name || '', item.text, item.roomId)
        : null}
      roomYouId=${isRoom ? channelsById.get(activeChannelId)?.room?.you?.id || null : null}
      onEmoji=${isRoom && item.roomId != null && !item.pending ? (emoji) => toggleRoomReaction(item.roomId, emoji) : null}
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
  closeSendMenu();
  if (unreadConversations.delete(UNREAD_CHANNEL_PREFIX + channel.id)) refreshUnreadTitle();
  renderSidebar();
  input.disabled = false;
  sendButton.disabled = false;
  attachButtonEl.style.display = '';
  if (channel.room) call.probe();
  input.placeholder = channel.room
    ? `Message #${channel.name}… (@name brings a colleague in)`
    : `Message #${channel.name}… (@name/@all to address someone directly, or just ask)`;
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
      // Set for people and for colleagues answering for someone else in the
      // team room (see server/room.js); a plain channel has none.
      senderName: row.sender_name || null,
      artifact: row.artifact || null,
      roomId: row.room_id ?? null,
      replyTo: row.reply_to || null,
      reactions: row.reactions || [],
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
// Which conversation opening her shows: the one asked for if it is still a
// tab, else the one last open, else her newest tab, else her card.
function sessionToOpen(colleagueId, wanted) {
  const open = (colleagueSessions.get(colleagueId) || []).map((s) => s.id);
  if (wanted === NEW_SESSION) return NEW_SESSION;
  if (wanted && open.includes(wanted)) return wanted;
  const last = lastSessionByColleague.get(colleagueId);
  if (last && open.includes(last)) return last;
  return open.length ? open[open.length - 1] : NEW_SESSION;
}

async function selectColleague(colleague, sessionId) {
  saveDraft(); // for whatever was active before this switch, not the colleague below
  appEl.classList.add('pane-active'); // no-op above the mobile breakpoint (see styles.css)
  activeColleagueId = colleague.id;
  activeSessionId = isSubagentThread(colleague.id) ? null : sessionToOpen(colleague.id, sessionId);
  const fresh = activeSessionId === NEW_SESSION;
  if (activeSessionId !== null && !fresh) lastSessionByColleague.set(colleague.id, activeSessionId);
  if (activeSessionId !== null && !fresh) rememberOpenConversation({ colleagueId: colleague.id, sessionId: activeSessionId });
  activeChannelId = null;
  closeMentionAutocomplete();
  closeSendMenu();
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
  renderHandoverNotice();
  if (fresh) {
    renderMessages({ forceScrollToBottom: true });
    loadProfileCard(colleague.id);
    return;
  }
  if (canReply) loadCliInfo(colleague.id, activeSessionId);

  const key = activeConvKey();
  await loadColleagueHistory(colleague.id, activeSessionId, key);
  // Forced — same reasoning as selectChannel's own call just above.
  if (activeConvKey() === key) renderMessages({ forceScrollToBottom: true });
}

// Images stored with a message come back as {id, name, mimeType}; the
// bytes are fetched by the <img> itself (api/attachment), so `dataUrl`
// holds that address — every renderer only ever reads `dataUrl`.
function storedAttachments(list) {
  return (list || []).map((a) => ({ ...a, dataUrl: a.url || `api/attachment?id=${a.id}` }));
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
  await selectColleague(colleague, DEFAULT_SESSION_ID);
  const items = history.get(activeConvKey()) || [];
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
  // On a phone the list of colleagues is an overview of small cards (photo,
  // name, role) instead of rows; what hangs off a colleague (sub-agent
  // panels) and the channels follow below it as before.
  const phone = isPhoneLayout();
  const grid = phone ? document.createElement('div') : null;
  if (grid) {
    grid.className = 'colleague-grid';
    sidebarEl.appendChild(grid);
  }
  const afterGrid = phone ? document.createElement('div') : sidebarEl;
  for (const colleague of colleaguesList) {
    if (phone) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'colleague-tile';
      tile.dataset.id = colleague.id;
      tile.appendChild(avatarEl(colleague));
      const name = document.createElement('span');
      name.className = 'colleague-tile__name';
      name.textContent = colleague.name;
      const role = document.createElement('span');
      role.className = 'colleague-tile__role';
      role.textContent = colleague.role || '';
      tile.append(name, role);
      const tileKeys = sessionKeysFor(colleague.id);
      appendUnreadBadge(tile, tileKeys);
      appendDraftBadge(tile, tileKeys);
      tile.addEventListener('click', () => selectColleague(colleague));
      grid.appendChild(tile);
    }
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
    const shownSessionId = isActiveHere && activeSessionId !== NEW_SESSION
      ? activeSessionId
      : lastSessionByColleague.get(colleague.id) || DEFAULT_SESSION_ID;
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
    button.addEventListener('click', () => selectColleague(colleague));
    if (!phone) sidebarEl.appendChild(button);

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
        afterGrid.appendChild(row);
      } else {
        afterGrid.appendChild(nested);
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
  if (phone) sidebarEl.appendChild(afterGrid);

  renderChannelsSection();
  renderSessionTabs();
}

// Opens the conversation a notification is about: { channelId } or
// { colleagueId, sessionId }.
function openConversationTarget(target) {
  if (target?.channelId && channelsById.has(target.channelId)) selectChannel(channelsById.get(target.channelId));
  else if (target?.colleagueId && colleaguesById.has(target.colleagueId)) selectColleague(colleaguesById.get(target.colleagueId), target.sessionId);
}
navigator.serviceWorker?.addEventListener('message', (event) => {
  if (event.data?.type === 'open_conversation') openConversationTarget(event.data.target);
});

// The phone layout: one screen at a time, below the desktop breakpoint
// (styles.css: min-width 721px).
function isPhoneLayout() {
  return !window.matchMedia('(min-width: 721px)').matches;
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

  // The person's profile: their GitHub account and what is assigned to them.
  {
    const header = document.createElement('div');
    header.className = 'sidebar-section-header';
    header.textContent = 'You';
    sidebarEl.appendChild(header);
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'open-questions-entry profile-entry';
    const name = profileDisplayName();
    entry.appendChild(avatarEl({ id: 'human:you', name, hasAvatar: false }));
    const label = document.createElement('span');
    label.className = 'profile-entry__label';
    const login = githubProfile.account?.login;
    label.textContent = login ? `${name} · @${login}` : name;
    entry.appendChild(label);
    const waiting = githubProfile.lists ? githubProfile.lists.issues.length + githubProfile.lists.pulls.length + githubProfile.lists.reviews.length : 0;
    if (waiting) {
      const badge = document.createElement('span');
      badge.className = 'open-questions-entry__count';
      badge.textContent = String(waiting);
      badge.title = 'Open issues and pull requests assigned to you or waiting for your review';
      entry.appendChild(badge);
    }
    entry.setAttribute('aria-label', `Profile${waiting ? `, ${waiting} waiting for you on GitHub` : ''}`);
    entry.addEventListener('click', openProfileView);
    sidebarEl.appendChild(entry);
    // Everything shared in all chats: pictures, links, documents.
    const media = document.createElement('button');
    media.type = 'button';
    media.className = 'open-questions-entry media-entry';
    media.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>';
    const mediaLabel = document.createElement('span');
    mediaLabel.textContent = 'Shared media';
    media.appendChild(mediaLabel);
    media.addEventListener('click', () => openMediaView({ all: true }));
    sidebarEl.appendChild(media);
  }

  // The team's open questions (team room only): one entry with a count.
  if (openQuestions) {
    const header = document.createElement('div');
    header.className = 'sidebar-section-header';
    header.textContent = 'Open questions';
    sidebarEl.appendChild(header);
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'open-questions-entry';
    entry.innerHTML = '<span class="open-questions-entry__icon" aria-hidden="true">❓</span>';
    const label = document.createElement('span');
    label.textContent = openQuestions.length ? 'Waiting for an answer' : 'None open';
    entry.appendChild(label);
    if (openQuestions.length) {
      const badge = document.createElement('span');
      badge.className = 'open-questions-entry__count';
      badge.textContent = String(openQuestions.length);
      entry.appendChild(badge);
    }
    entry.addEventListener('click', openQuestionsView);
    sidebarEl.appendChild(entry);
  }
}

// Open questions of the team (null where there is no team room).
let openQuestions = null;

function openQuestionsView() {
  artifactViewerEl.hidden = false;
  const panel = document.createElement('div');
  panel.className = 'artifact-viewer__panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  const header = document.createElement('div');
  header.className = 'artifact-viewer__header';
  const title = document.createElement('h2');
  title.textContent = 'Open questions';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', closeArtifact);
  header.append(title, close);
  const body = document.createElement('div');
  body.className = 'artifact-viewer__body';
  const addForm = document.createElement('form');
  addForm.className = 'open-questions-add';
  const addInput = document.createElement('input');
  addInput.type = 'text';
  addInput.placeholder = 'Add an open question…';
  addInput.setAttribute('aria-label', 'New open question');
  const addButton = document.createElement('button');
  addButton.type = 'submit';
  addButton.textContent = 'Add';
  addForm.append(addInput, addButton);
  addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = addInput.value.trim();
    if (!text) return;
    socket.send(JSON.stringify({ type: 'question_add', text }));
    addInput.value = '';
  });
  const list = document.createElement('ul');
  list.className = 'open-questions-list';
  if (!openQuestions?.length) {
    const empty = document.createElement('li');
    empty.className = 'open-questions-list__empty';
    empty.textContent = 'No open questions. ❓ on a colleague\'s message puts one here.';
    list.appendChild(empty);
  }
  for (const q of openQuestions || []) {
    const li = document.createElement('li');
    const text = document.createElement('div');
    text.className = 'open-questions-list__text';
    text.textContent = q.text;
    const meta = document.createElement('div');
    meta.className = 'open-questions-list__meta';
    const date = new Date(q.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    meta.textContent = [q.source ? `from ${q.source}` : null, `noted by ${q.askedBy}`, date].filter(Boolean).join(' · ');
    const done = document.createElement('button');
    done.type = 'button';
    done.className = 'open-questions-list__done';
    done.textContent = 'Done';
    done.addEventListener('click', () => socket.send(JSON.stringify({ type: 'question_done', id: q.id })));
    const main = document.createElement('div');
    main.append(text, meta);
    li.append(main, done);
    list.appendChild(li);
  }
  body.append(addForm, list);
  panel.append(header, body);
  artifactViewerEl.replaceChildren(panel);
  artifactViewerEl.dataset.view = 'questions';
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
  const { persisted, teamName, version, claudeToken, pushKey: serverPushKey, person } = await statusRes.json();
  personName = person || '';
  loadGithubProfile();
  fetch('api/open-questions')
    .then((r) => r.json())
    .then((list) => {
      openQuestions = list;
      renderSidebar();
    })
    .catch(() => {});
  renderClaudeToken(claudeToken);
  pushKey = serverPushKey || null;
  issueLinkEl.href = buildIssueUrl({ version, userAgent: navigator.userAgent });
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

  // colleague-stats and permissions are already keyed the same
  // way convKey() produces locally (see server/index.js's adapterKey())
  // — no reshaping needed, just load them straight in.
  const statsRes = await fetch('api/colleague-stats');
  for (const [key, stats] of Object.entries(await statsRes.json())) colleagueStats.set(key, stats);

  // Replaced wholesale rather than added to: this is the one piece of
  // roster state where the interesting change is a key *disappearing*
  // (a permission revoked elsewhere), and adding-only would leave the
  // sidebar showing it as still on after a refresh.
  const permissionsRes = await fetch('api/permissions');
  permissionStates.clear();
  for (const state of await permissionsRes.json()) applyPermissionState(state);

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
  // Opened from a notification: straight into that conversation.
  const fromNotification = (() => {
    try {
      const raw = new URLSearchParams(location.search).get('open');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  if (fromNotification) {
    window.history.replaceState(null, '', location.pathname);
    openConversationTarget(fromNotification);
    return;
  }
  // A phone opens on the overview of colleagues; a computer goes straight
  // back into the conversation.
  if (isPhoneLayout()) return;
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
  // The people in the team room, by their handle (see personHandle).
  const people = channel?.room
    ? (channel.room.members || [])
        .map((m) => ({ id: personHandle(m.name), name: m.name, person: true }))
        .filter((p) => p.id.startsWith(q) || p.name.toLowerCase().startsWith(q))
        .filter((p) => !colleaguesById.has(p.id))
    : [];
  return [...people, ...named, ...everyone];
}

// Whether a team room message @mentions this person.
function mentionsMe(text) {
  const room = [...channelsById.values()].find((c) => c.room)?.room;
  const me = room?.you?.name || roomSelfName;
  if (!me) return false;
  const handle = personHandle(me);
  return [...String(text || '').matchAll(/@([a-z][a-z0-9_-]*)/gi)].some((m) => m[1].toLowerCase() === handle);
}
let roomSelfName = null;

// Each person in the team room keeps one colour, derived from their id, so
// it is the same on every device. Blue (own messages) and yellow
// (mentions, open questions) are left out on purpose.
const PERSON_COLORS = ['#1f9d74', '#d9730d', '#8b5cf6', '#0e9fb3', '#be185d', '#7c8a12'];
// By position in the room's member list sorted by id, so up to six people
// never share a colour; anyone not (yet) in that list by a hash of the id.
function personColor(senderId) {
  const id = String(senderId).replace(/^human:/, '');
  const room = [...channelsById.values()].find((c) => c.room)?.room;
  const ids = (room?.members || []).map((m) => m.id).sort();
  const index = ids.indexOf(id);
  if (index !== -1) return PERSON_COLORS[index % PERSON_COLORS.length];
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PERSON_COLORS[h % PERSON_COLORS.length];
}

// A person's @handle in the team room: the name in lower case, letters,
// digits, - and _ only (what the mention pattern reads as one word).
function personHandle(name) {
  return String(name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]/g, '');
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

// Slash commands: "/" at the start of the composer opens a list of what can
// be run. The chat's own commands run here in the page; in a conversation
// with a colleague her commands and skills (from her session, see
// api/commands) follow, and sending "/name …" runs them in her session.
// The same dropdown as for @mentions, with `mentionState.kind` 'command'.
const CHAT_COMMANDS = [
  {
    name: 'new',
    description: 'Start a new conversation with her',
    where: 'colleague',
    run: () => {
      const colleague = colleaguesById.get(activeColleagueId);
      if (colleague) selectColleague(colleague, NEW_SESSION);
    },
  },
  {
    name: 'call',
    description: 'Start or join the video call of the team room',
    where: 'room',
    run: () => startOrJoinRoomCall(activeChannelId),
  },
  // GitHub search: the words after the command search as you type, picking
  // a result puts its link in the composer (the message then shows its card).
  { name: 'issue', argumentHint: '<search words>', description: 'Find a GitHub issue and put its link here', search: 'issue', run: () => 'keep' },
  { name: 'pr', argumentHint: '<search words>', description: 'Find a GitHub pull request and put its link here', search: 'pull', run: () => 'keep' },
];

function chatCommandsHere() {
  const room = Boolean(activeChannelId && channelsById.get(activeChannelId)?.room);
  const colleague = Boolean(!activeChannelId && activeColleagueId && !isSubagentThread(activeColleagueId));
  return CHAT_COMMANDS.filter((c) => (c.where === 'room' ? room : c.where === 'colleague' ? colleague : true));
}

// Her commands, per colleague, fetched when "/" is first typed in her
// conversation and kept for two minutes (a few seconds while none of her
// sessions runs yet).
const colleagueCommands = new Map(); // colleagueId -> { at, started, commands, loading }
function colleagueCommandsFor(colleagueId) {
  const known = colleagueCommands.get(colleagueId);
  // Not started yet: asked again a few seconds later, she may be by then.
  if (known && (known.loading || Date.now() - known.at < (known.started ? 120000 : 5000))) return known;
  const entry = { at: Date.now(), started: true, commands: known?.commands || [], loading: true };
  colleagueCommands.set(colleagueId, entry);
  const sessionId = activeSessionId && activeSessionId !== NEW_SESSION ? activeSessionId : '';
  fetch(`api/commands?colleagueId=${encodeURIComponent(colleagueId)}${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`)
    .then((r) => r.json())
    .then((data) => {
      entry.started = Boolean(data.started);
      entry.commands = data.supported ? data.commands : [];
    })
    .catch(() => {})
    .finally(() => {
      entry.loading = false;
      entry.at = Date.now();
      // The list may be open and waiting for these.
      if (mentionState?.kind === 'command') refreshSlashList();
    });
  return entry;
}

function currentSlashToken() {
  const caret = input.selectionStart;
  const before = input.value.slice(0, caret);
  const search = before.match(/^\/(issue|pr)\s+([\s\S]*)$/i);
  if (search) return { start: 0, end: input.value.length, query: '', search: search[1].toLowerCase() === 'pr' ? 'pull' : 'issue', words: search[2].trim() };
  const match = before.match(/^\/([A-Za-z0-9:_-]*)$/);
  return match ? { start: 0, end: caret, query: match[1] } : null;
}

// Results for "/issue …" / "/pr …", fetched a moment after typing stops.
let githubSearchTimer = null;
let githubSearchState = { key: '', loading: false, results: [], error: null, owner: null };
// Open ones only, unless the switch at the end of the list says otherwise.
let githubSearchAll = false;
function githubSearchFor(kind, words) {
  const key = `${kind}\n${githubSearchAll}\n${words}`;
  if (githubSearchState.key === key) return githubSearchState;
  clearTimeout(githubSearchTimer);
  githubSearchState = { key, loading: Boolean(words), results: [], error: null, owner: githubSearchState.owner };
  if (!words) return githubSearchState;
  const state = githubSearchState;
  githubSearchTimer = setTimeout(() => {
    fetch(`api/github-search?kind=${kind}&q=${encodeURIComponent(words)}${githubSearchAll ? '&all=1' : ''}`)
      .then((r) => r.json())
      .then((data) => {
        state.results = data.results || [];
        state.error = data.error || null;
        state.owner = data.owner || null;
      })
      .catch(() => { state.error = 'failed'; })
      .finally(() => {
        state.loading = false;
        if (githubSearchState === state && mentionState?.kind === 'command') refreshSlashList();
      });
  }, 300);
  return state;
}

function slashCandidates(query) {
  const q = query.toLowerCase();
  const fits = (name) => name.toLowerCase().startsWith(q);
  const own = chatCommandsHere().filter((c) => fits(c.name)).map((c) => ({ name: c.name, description: c.description, argumentHint: c.argumentHint || '', chat: true }));
  if (activeChannelId || !activeColleagueId || isSubagentThread(activeColleagueId)) return { matches: own, note: null };
  const hers = colleagueCommandsFor(activeColleagueId);
  const theirs = hers.commands
    .filter((c) => fits(c.name) && !own.some((o) => o.name === c.name))
    .map((c) => ({ name: c.name, description: c.description, argumentHint: c.argumentHint }));
  const name = colleaguesById.get(activeColleagueId)?.name || 'her';
  const note = hers.loading && !hers.commands.length ? `Loading ${name}'s commands…`
    : !hers.started ? `${name}'s own commands show once this conversation has started.`
    : null;
  return { matches: [...own, ...theirs], note };
}

function refreshSlashList() {
  const token = currentSlashToken();
  if (!token) {
    closeMentionAutocomplete();
    return;
  }
  if (token.search) {
    const found = githubSearchFor(token.search, token.words);
    const what = `${githubSearchAll ? '' : 'open '}${token.search === 'pull' ? 'pull requests' : 'issues'}`;
    const where = found.owner ? ` in ${found.owner}` : '';
    const note = !token.words ? `Type words to search ${what}${where}; repo:owner/name searches one repository.`
      : found.loading ? `Searching ${what}…`
      : found.error === 'unavailable' ? 'GitHub search needs the GitHub CLI (gh) on this server.'
      : found.error ? 'The search did not work. Try other words.'
      : !found.results.length ? `No ${what} found${where}.`
      : null;
    const keep = mentionState?.kind === 'command' && mentionState.search ? Math.min(mentionState.selectedIndex, Math.max(found.results.length - 1, 0)) : 0;
    mentionState = { kind: 'command', ...token, matches: found.loading ? [] : found.results.map((r) => ({ ...r, result: true })), note, selectedIndex: keep, searchSwitch: Boolean(token.words) };
    renderMentionAutocomplete();
    return;
  }
  const { matches, note } = slashCandidates(token.query);
  if (!matches.length && !note) {
    closeMentionAutocomplete();
    return;
  }
  const keep = mentionState?.kind === 'command' ? Math.min(mentionState.selectedIndex, Math.max(matches.length - 1, 0)) : 0;
  mentionState = { kind: 'command', ...token, matches, note, selectedIndex: keep };
  renderMentionAutocomplete();
}

// Runs one of the chat's own commands, if `text` is one ("/new").
function runChatCommand(text) {
  const match = String(text).trim().match(/^\/([A-Za-z0-9:_-]+)(?:\s+([\s\S]*))?$/);
  if (!match) return false;
  const command = chatCommandsHere().find((c) => c.name === match[1].toLowerCase());
  if (!command) return false;
  return command.run(match[2] || '') || true;
}

function closeMentionAutocomplete() {
  mentionState = null;
  mentionAutocompleteEl.hidden = true;
  mentionAutocompleteEl.innerHTML = '';
}

function renderMentionAutocomplete() {
  mentionAutocompleteEl.innerHTML = '';
  mentionAutocompleteEl.hidden = false;
  mentionAutocompleteEl.classList.toggle('mention-autocomplete--commands', mentionState.kind === 'command');
  if (mentionState.kind === 'command') {
    mentionState.matches.forEach((candidate, index) => {
      const li = document.createElement('li');
      li.className = 'command-candidate';
      if (candidate.result) {
        li.classList.add('command-candidate--result', `command-candidate--${candidate.state}`);
        li.setAttribute('aria-selected', String(index === mentionState.selectedIndex));
        const where = document.createElement('span');
        where.className = 'command-candidate__name';
        where.textContent = `${candidate.repo} #${candidate.number}`;
        const state = document.createElement('span');
        state.className = 'command-candidate__args';
        state.textContent = `${GH_STATE_LABEL[candidate.state] || candidate.state}${candidate.updatedAt ? ` · ${relativeTime(candidate.updatedAt)}` : ''}`;
        const title = document.createElement('span');
        title.className = 'command-candidate__description';
        title.textContent = candidate.title;
        li.append(where, state, title);
        li.addEventListener('mousedown', (event) => {
          event.preventDefault();
          acceptMention(candidate);
        });
        if (index === mentionState.selectedIndex) requestAnimationFrame(() => li.scrollIntoView({ block: 'nearest' }));
        mentionAutocompleteEl.appendChild(li);
        return;
      }
      li.setAttribute('aria-selected', String(index === mentionState.selectedIndex));
      const name = document.createElement('span');
      name.className = 'command-candidate__name';
      name.textContent = `/${candidate.name}`;
      li.appendChild(name);
      if (candidate.argumentHint) {
        const hint = document.createElement('span');
        hint.className = 'command-candidate__args';
        hint.textContent = candidate.argumentHint;
        li.appendChild(hint);
      }
      const what = document.createElement('span');
      what.className = 'command-candidate__description';
      what.textContent = candidate.description || '';
      li.appendChild(what);
      li.addEventListener('mousedown', (event) => {
        event.preventDefault();
        acceptMention(candidate);
      });
      if (index === mentionState.selectedIndex) requestAnimationFrame(() => li.scrollIntoView({ block: 'nearest' }));
      mentionAutocompleteEl.appendChild(li);
    });
    if (mentionState.note) {
      const li = document.createElement('li');
      li.className = 'command-candidate command-candidate--note';
      li.textContent = mentionState.note;
      mentionAutocompleteEl.appendChild(li);
    }
    // The search's switch: open ones only, or closed and merged ones too.
    if (mentionState.searchSwitch) {
      const li = document.createElement('li');
      li.className = 'command-candidate command-candidate--switch';
      li.setAttribute('role', 'switch');
      li.setAttribute('aria-checked', String(githubSearchAll));
      li.textContent = githubSearchAll ? 'Showing closed and merged too · show only open ones' : 'Only open ones · show closed and merged too';
      li.addEventListener('mousedown', (event) => {
        event.preventDefault();
        githubSearchAll = !githubSearchAll;
        refreshSlashList();
      });
      mentionAutocompleteEl.appendChild(li);
    }
    return;
  }
  mentionState.matches.forEach((candidate, index) => {
    const li = document.createElement('li');
    li.setAttribute('aria-selected', String(index === mentionState.selectedIndex));
    const known = colleaguesById.get(candidate.id);
    if (candidate.person) {
      li.appendChild(avatarEl({ id: `human:${candidate.id}`, name: candidate.name, hasAvatar: false }));
    } else if (known) {
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
  if (!candidate) return;
  const { start, end } = mentionState;
  const insertion = candidate.result ? `${candidate.url} ` : mentionState.kind === 'command' ? `/${candidate.name} ` : `@${candidate.id} `;
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
  if (currentSlashToken()) {
    refreshSlashList();
    return;
  }
  const token = currentMentionToken();
  const matches = token ? mentionCandidates(token.query) : [];
  if (matches.length === 0) {
    closeMentionAutocomplete();
    return;
  }
  mentionState = { kind: 'mention', ...token, matches, selectedIndex: 0 };
  renderMentionAutocomplete();
});

// Arrow keys move the highlight, Enter/Tab accept it, Escape dismisses
// it — the same keys a native Enter-to-send composer would otherwise
// use, so these all call preventDefault() to keep the dropdown from
// fighting the form. Falls through to the plain composer handling below
// when the mention dropdown isn't open.
input.addEventListener('keydown', (event) => {
  if (mentionState && mentionState.matches.length) {
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
    // Alt+Enter: "Queue message" (only while the menu is there).
    if (event.altKey && !sendMenuButtonEl.hidden) form.requestSubmit(queueButtonEl);
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

// Replying to one message: the reply carries a short quote of it, so the
// colleague (and everyone in a channel) sees what it answers. In the team
// room a reply to a colleague's message brings her in without an @.
let replyTarget = null; // { senderId, name, excerpt, roomId }
const replyBarEl = document.createElement('div');
replyBarEl.id = 'reply-bar';
replyBarEl.hidden = true;
form.parentNode.insertBefore(replyBarEl, form);

function excerptOf(text) {
  return String(text || '')
    .split('\n')
    .filter((line) => !line.startsWith('>'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

function quoteOf(target) {
  return `> **${target.name}:** ${target.excerpt}${target.excerpt.length >= 160 ? '…' : ''}\n\n`;
}

function startReply(senderId, name, text, roomId = null) {
  replyTarget = { senderId, name, excerpt: excerptOf(text) || 'Picture', roomId };
  replyBarEl.hidden = false;
  replyBarEl.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'reply-bar__text';
  label.textContent = `Reply to ${name}: ${replyTarget.excerpt}`;
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.setAttribute('aria-label', 'Cancel reply');
  cancel.appendChild(xIconEl());
  cancel.addEventListener('click', clearReply);
  replyBarEl.append(label, cancel);
  input.focus();
}

// Reply to a message in the open channel: in the team room it points to the
// message by its id there (the room keeps the quote), elsewhere it is quoted.
function replyToChannelItem(item) {
  const isYou = item.senderId === 'you';
  const sender = colleaguesById.get(item.senderId);
  const name = isYou ? 'You' : item.senderName || sender?.name || '';
  const isRoom = Boolean(channelsById.get(activeChannelId)?.room);
  startReply(isYou ? null : item.senderId, name, item.text, isRoom ? item.roomId : null);
}

// Team room reactions, as in a messenger: a few emoji to pick from; one per
// person and message, the same one again takes it back.
const ROOM_EMOJI = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
let reactionPickerFor = null; // the room message id whose picker is open
let reactionPickerHeldAt = 0; // when a long press opened it
let reactionPickerBelow = false; // no room above the message for it

function toggleRoomReaction(roomId, emoji) {
  socket.send(JSON.stringify({ type: 'room_react', roomId, emoji }));
}

function toggleReactionPicker(roomId, { held = false } = {}) {
  reactionPickerFor = reactionPickerFor === roomId ? null : roomId;
  reactionPickerHeldAt = held ? Date.now() : 0;
  const bubble = messagesEl.querySelector(`.message[data-room-id="${Number(roomId)}"] > span`);
  reactionPickerBelow = Boolean(bubble) && bubble.getBoundingClientRect().top - messagesEl.getBoundingClientRect().top < 64;
  renderChannelMessages();
  // Kept on screen on a narrow phone: moved in by what would stick out.
  const picker = messagesEl.querySelector('.reaction-picker');
  if (picker) {
    const rect = picker.getBoundingClientRect();
    const margin = 8;
    const shift = rect.right > window.innerWidth - margin ? window.innerWidth - margin - rect.right : rect.left < margin ? margin - rect.left : 0;
    if (shift) picker.style.transform = `translateX(${Math.round(shift)}px)`;
  }
}

function closeReactionPicker() {
  if (reactionPickerFor === null) return;
  reactionPickerFor = null;
  if (activeChannelId) renderChannelMessages();
}

document.addEventListener('click', (event) => {
  // The click a touch browser may send when the long press that opened it ends.
  if (Date.now() - reactionPickerHeldAt < 800) return;
  if (reactionPickerFor !== null && !event.target.closest?.('.reaction-picker')) closeReactionPicker();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeReactionPicker();
});

// Shows the message a reply answers, if it is loaded: scrolled into view
// and lit up for a moment.
function jumpToRoomMessage(roomId) {
  const el = messagesEl.querySelector(`.message[data-room-id="${Number(roomId)}"]`);
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.classList.remove('message--highlight');
  void el.offsetWidth; // restarts the animation on a second tap
  el.classList.add('message--highlight');
  setTimeout(() => el.classList.remove('message--highlight'), 1600);
}

// On a touch screen, in the team room: swipe a message to the right to
// reply to it, hold it to react.
(function installRoomGestures() {
  const SWIPE_REPLY_PX = 56;
  const HOLD_MS = 450;
  let start = null; // { x, y, dx, el, item, swiping }
  let holdTimer = null;
  const itemFor = (el) => (channelMessages.get(activeChannelId) || []).find((m) => m.roomId === Number(el.dataset.roomId));
  const reset = () => {
    clearTimeout(holdTimer);
    if (start?.el) {
      start.el.style.transform = '';
      start.el.classList.remove('message--swiping');
    }
    start = null;
  };
  messagesEl.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || !activeChannelId) return;
    // A swipe may start anywhere on the message, even on a button (a touch
    // browser moves a touch to the nearest one); holding a button or link
    // stays that control's own.
    if (e.target.closest('iframe, input, textarea, .reaction-picker')) return;
    const onControl = Boolean(e.target.closest('button, a, img'));
    const el = e.target.closest('.message--room');
    if (!el) return;
    const item = itemFor(el);
    if (!item) return;
    start = { x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, el, item, swiping: false };
    holdTimer = onControl ? null : setTimeout(() => {
      if (!start || start.swiping) return;
      navigator.vibrate?.(10);
      toggleReactionPicker(item.roomId, { held: true });
    }, HOLD_MS);
  }, { passive: true });
  // The direction is settled by the first move: mostly to the right is a
  // reply swipe, and from then on the page script keeps the gesture (the
  // list does not scroll); anything else is left to the browser as a scroll.
  // No touch-action on the messages for this: inside the scrolling list it
  // made a phone move the whole page instead of the list.
  messagesEl.addEventListener('touchmove', (e) => {
    if (!start) return;
    const dx = e.touches[0].clientX - start.x;
    const dy = e.touches[0].clientY - start.y;
    if (!start.swiping) {
      // A finger held still wobbles a little: that is still a hold.
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      clearTimeout(holdTimer);
      if (dx <= 0 || Math.abs(dy) >= dx) {
        reset();
        return;
      }
      start.swiping = true;
      start.el.classList.add('message--swiping');
    }
    if (e.cancelable) e.preventDefault();
    start.dx = dx;
    start.el.style.transform = `translateX(${Math.min(Math.max(dx, 0), SWIPE_REPLY_PX + 24)}px)`;
  }, { passive: false });
  const end = () => {
    if (!start) return;
    const { swiping, item, dx } = start;
    reset();
    if (swiping && dx >= SWIPE_REPLY_PX) replyToChannelItem(item);
  };
  messagesEl.addEventListener('touchend', end);
  messagesEl.addEventListener('touchcancel', reset);
  // The long press opened the picker; the system menu stays shut.
  messagesEl.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.message--room') && window.matchMedia('(hover: none)').matches) e.preventDefault();
  });
})();

function clearReply() {
  replyTarget = null;
  replyBarEl.hidden = true;
  replyBarEl.innerHTML = '';
}

// The quick reactions offered on a colleague's message. 👍 only where the
// message ends with a question: it means "yes, do it" to a yes-or-no one.
const REACTION_SET = [
  { key: 'yes', emoji: '👍', label: 'Yes, go ahead' },
  { key: 'no', emoji: '✖️', label: 'No, or another proposal' },
  { key: 'knowledge', emoji: '📖', label: 'Use or record this in the team knowledge' },
  { key: 'question', emoji: '❓', label: 'Note this as an open question' },
];
function reactionsFor(item) {
  const lastLine = String(item.text || '').trim().split('\n').filter(Boolean).pop() || '';
  const asks = /\?[)*_\s]*$/.test(lastLine);
  return REACTION_SET.filter((r) => r.key !== 'yes' || asks);
}

// Sends a reaction at once, as a reply made of the emoji (its meaning goes
// to the colleague with it, see server/reactions.js).
function sendReaction(key, colleagueId, name, text, roomId = null) {
  const reaction = REACTION_SET.find((r) => r.key === key);
  if (!reaction) return;
  // In the team room the reply points to her message; elsewhere it quotes it.
  const inRoom = activeChannelId && roomId != null;
  const body = inRoom ? reaction.emoji : quoteOf({ name, excerpt: excerptOf(text) }) + reaction.emoji;
  // ❓ also puts the question on the team's list of open questions.
  if (key === 'question' && openQuestions) {
    const full = String(text || '').split('\n').filter((l) => !l.startsWith('>')).join(' ').replace(/\s+/g, ' ').trim().slice(0, 600);
    socket.send(JSON.stringify({ type: 'question_add', text: full, source: name }));
  }
  if (activeChannelId) {
    socket.send(JSON.stringify({ type: 'channel_message', channelId: activeChannelId, text: body, attachments: [], replyTo: inRoom ? roomId : colleagueId, reaction: key }));
    return;
  }
  const convK = activeConvKey();
  if (!history.has(convK)) history.set(convK, []);
  const typing = isTyping(convK);
  const kind = pickSendKind({ typing, requested: undefined });
  const clientId = newMessageId();
  history.get(convK).push({ role: 'you', text: body, attachments: [], createdAt: new Date().toISOString(), pending: typing, clientId, kind });
  renderMessages({ forceScrollToBottom: true });
  socket.send(JSON.stringify({ colleagueId: activeColleagueId, sessionId: activeSessionId, id: clientId, kind, text: body, attachments: [], reaction: key }));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  closeMentionAutocomplete();
  if (!sendMenuEl.hidden) { closeSendMenu(); input.focus(); }
  const typed = input.value.trim();
  if (!typed && !pendingAttachment) return;
  // One of the chat's own commands runs here and is not sent ("keep": it
  // stays in the composer, e.g. a search with nothing picked yet).
  const ran = !pendingAttachment && runChatCommand(typed);
  if (ran) {
    if (ran !== 'keep') {
      input.value = '';
      autoResizeComposer();
      clearReply();
    }
    return;
  }
  // A team room reply points to the message by its id there; elsewhere the
  // reply carries a quote of it.
  const roomReply = replyTarget?.roomId != null && Boolean(channelsById.get(activeChannelId)?.room);
  const replyTo = roomReply ? replyTarget.roomId : replyTarget?.senderId || null;
  const text = replyTarget && typed && !roomReply ? quoteOf(replyTarget) + typed : typed;
  clearReply();

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
      replyTo,
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
  if (activeSessionId === NEW_SESSION) {
    // On her card: start a session named after the message, then send it
    // there (see the 'session_created' update).
    if (pendingFirstMessage) return;
    const requestId = newMessageId();
    pendingFirstMessage = { requestId, text: input.value, attachment: pendingAttachment };
    const title = (typed || 'New conversation').replace(/\s+/g, ' ').slice(0, 40);
    socket.send(JSON.stringify({ type: 'create_session', colleagueId: activeColleagueId, title, requestId }));
    drafts.delete(activeConvKey());
    return;
  }
  const key = activeConvKey();
  if (cliInfo.get(key)?.handedOver) {
    // No quiet second writer: ask, and take the session back first.
    if (!window.confirm('The terminal may be using this session. Take it back and send?')) return;
    cliInfo.set(key, { ...cliInfo.get(key), handedOver: false });
    renderHandoverNotice();
    socket.send(JSON.stringify({ type: 'take_back_terminal', colleagueId: activeColleagueId, sessionId: activeSessionId }));
  }
  if (!history.has(key)) history.set(key, []);
  const attachments = pendingAttachment ? [pendingAttachment] : [];
  // Written while she is still mid-turn: it stays below her live block,
  // marked as waiting, until her turn ends (see the 'message' update).
  // "Queue message" only counts while her turn runs; otherwise it is a plain send.
  const typing = isTyping(key);
  const kind = pickSendKind({ typing, requested: event.submitter?.dataset.kind });
  const clientId = newMessageId();
  history.get(key).push({ role: 'you', text, attachments, createdAt: new Date().toISOString(), pending: typing, clientId, kind });
  // Forced — sending your own message should always land you at the
  // bottom, same as every other chat app, regardless of where you'd
  // scrolled to read something older first.
  renderMessages({ forceScrollToBottom: true });
  {
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
