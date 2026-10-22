// The seam this whole module is designed around: one chat UI, one
// small adapter interface, one implementation per agent backend —
// each using whatever mechanism is actually official for that backend,
// not a single shared transport imposed on all of them. For Claude
// today that's the Claude Agent SDK directly (see adapters/claude.js);
// for backends that speak the Agent Client Protocol natively
// (Copilot CLI, Gemini CLI), the right adapter is an ACP client. See
// the planning notes for why this isn't "everything over ACP" or
// "everything over a Claude Code wrapper" — both were considered and
// rejected.
//
// The interface every adapter implements:
//   adapter.onUpdate = fn
//   adapter.onPermissionRequest = fn
//   adapter.onSessionId = fn                        — optional, Claude-adapter
//     only: called with the backend's own resumable session id once it's
//     known (see adapters/claude.js), so the caller can save it (store.js's
//     adapter_sessions table) and pass it back in as `resume` on the next
//     createAdapter() call for the same (colleague, session) — without
//     this, a server restart drops conversation context even though the
//     chat transcript itself is still sitting in `messages`.
//   adapter.sendMessage(text, attachments): Promise<void>
//   adapter.close()
//
// `onUpdate`/`onPermissionRequest` are adapter-level properties the
// caller assigns (and may re-assign — see server/index.js binding them
// on every incoming WebSocket message, not just once), not something
// passed into sendMessage() itself. Found the hard way: a colleague can
// spawn a Task subagent in the background and reply immediately
// without waiting; the subagent's own messages then arrive after that
// turn's sendMessage() promise already resolved. Scoping delivery to
// that one call meant those later messages had nowhere to go — a
// silent, total loss of the subagent thread, not a rendering bug.
//
// `attachments` is an array of `{ name, mimeType, data }` (data is
// base64, no `data:` prefix) — images only for this first version
// (image/png, image/jpeg, image/gif, image/webp). Both backends'
// content-block formats support documents too, but scoping this first
// pass to one attachment kind keeps the two adapters' behavior
// symmetric; broadening it is a config/UI change, not an architecture
// one.
// `onUpdate` is called with one of:
//   { type: 'delta', text }                        — a streamed text chunk
//   { type: 'thinking_delta', text }                — streamed extended-thinking text,
//     the part before a colleague acts — separate from `delta` because it's
//     not the reply itself, shown in the UI with its own, more muted styling
//   { type: 'tool_use', name, input }               — a tool call in progress
//   { type: 'message', role, text }                 — the turn's final message (persisted)
//   { type: 'subagent_start', id, subagentType, taskDescription }
//   { type: 'subagent_delta', id, text }
//   { type: 'subagent_tool_use', id, name, input }
//   { type: 'session_info', model, effort }         — sent once, as soon as
//     the backend's session actually starts (the model/effort a colleague
//     is really running on can differ from what her profile.md asks for —
//     org caps, model-support downgrades, availability); `effort` is null
//     when the model doesn't support the parameter at all. Claude-adapter
//     only for now — Copilot's ACP session doesn't surface this today.
//   { type: 'usage', inputTokens, outputTokens, totalTokens, costUsd }
//     — sent after every turn's result. Cumulative for the adapter's whole
//     lifetime (one persistent session per colleague, see claude.js), not
//     just that one turn — so the frontend can just display the latest
//     value rather than summing across turns itself. Claude-adapter only.
//   { type: 'subagent_end', id, report }             — `report` is the
//     subagent's own final answer (the Task tool_result's text content),
//     not just the tool calls she made getting there. The five subagent_*
//     types, keyed by `id` (the Task tool call's own tool-use ID), become
//     their own colleague-shaped conversation in the frontend — same
//     sidebar entry, same message bubbles as a real colleague, not a
//     bespoke view (see chat/public/app.js's registerSubagentColleague).
//     Claude-adapter only for now — see adapters/claude.js for how `id`
//     is derived.
// `onPermissionRequest` is called with a tool-call description and must
// return `{ allow: boolean, message?: string }`.

import { readFileSync } from 'node:fs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ClaudeAdapter } from './adapters/claude.js';
import { CopilotAdapter } from './adapters/copilot.js';
import { readProfileBody } from './roster.js';

// A skill loaded automatically whenever colleagues live in the chat UI —
// appended to every Claude-adapter colleague's own system prompt, not something her own profile.md has
// to reference. Read once at module load (this file's content doesn't
// change while the server runs) rather than per adapter creation.
// Covers both the general "this is a live chat, not a terminal session"
// context and channel/group-chat etiquette specifically — see the file
// itself for why: a colleague answering in a channel had no idea any
// other colleague was even there, and the
// per-turn channel-member line in relayChannelMessage (server/index.js)
// only tells her WHO is there right now, not HOW to actually treat that
// — the two are complementary, not duplicates.
const CHAT_UI_SKILL = readFileSync(joinPath(dirname(fileURLToPath(import.meta.url)), 'skills', 'chat-ui.md'), 'utf8');

// Selects by the colleague's own `adapter:` frontmatter field. Note:
// the installer's own tool list (src/tools.js) doesn't offer "Copilot"
// as a choice yet, so no profile.md this repo writes today will
// actually carry that value — this checks for it anyway so the
// adapter is ready the day that list grows, without this file needing
// to change again.
// `model`: the model chosen for this conversation in its settings (Claude
// only; undefined = the SDK's default). Same reason as `resume` for not
// forwarding it to CopilotAdapter: nothing there is wired to a model choice.
// `resume`: the Claude adapter's own saved SDK session id (see
// adapters/claude.js and store.js's adapter_sessions table) — Claude-only
// for now. Not forwarded to CopilotAdapter: its ACP session's own resume
// story hasn't been checked against this codebase, and passing an unused
// option silently would be a claim about behavior nobody verified.
export function createAdapter(colleague, { targetDir, resume, model }) {
  const ownProfile = readProfileBody(targetDir, colleague.id) ?? `You are ${colleague.name}.`;
  const systemPrompt = `${ownProfile}\n\n${CHAT_UI_SKILL}`;
  const wantsCopilot = colleague.adapter.some((a) => a.toLowerCase().includes('copilot'));
  return wantsCopilot
    ? new CopilotAdapter(colleague, { cwd: targetDir })
    : new ClaudeAdapter(colleague, { systemPrompt, cwd: targetDir, resume, model });
}
