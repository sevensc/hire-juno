# hire-juno chat

A local, Slack/Discord-shaped chat interface for the colleagues a
`team/` folder already describes — one sidebar entry per colleague,
one conversation each, running on your own machine.

## Run it

Inside a repo that already has a `team/` folder (i.e. after
`npx hire-juno` has run once):

```
npx hire-juno chat
```

No install step, no retrofit — this reads `team/` at runtime and never
writes into the repo, so it works the moment a newer hire-juno adds it,
even in a project set up before it existed. `--dir <path>` points it at
a different repo instead of the current directory (also useful for a
project that predates hire-juno and uses the German-named layout — see
below).

It starts a server bound to `127.0.0.1` only, with a random one-time
token in the URL — the same access-control shape the installer's own
browser step uses (`src/web/server.js`) — and opens it in your default
browser.

## Working on the frontend

`chat/public/app.js` is a generated file (`npm run build:chat`, plain
esbuild, no config beyond the one line in `package.json`'s `scripts`)
— edit `chat/src/app.js` instead and rebuild, or your change gets
silently overwritten the next time someone runs the build (which
`prepublishOnly` also does automatically, so a forgotten rebuild before
a release isn't possible either). `chat/public/index.html` and
`chat/public/styles.css` are still hand-edited directly, same as
always — only `app.js` goes through this step.

## What's real here

Live, two-way conversations with real agents, not a placeholder:

- **Claude**, via the official `@anthropic-ai/claude-agent-sdk`, in
  process — no wrapper, no ACP. One persistent session per colleague,
  system prompt straight from her own `profile.md`, token-level
  streaming, extended-thinking text shown as its own muted block, real
  tool-call permission prompts (Allow/Deny), and a nested, closable
  panel for any subagent she spawns whose type happens to name another
  real colleague.
- **Copilot**, via the official Agent Client Protocol SDK
  (`copilot --acp`) — the adapter for colleagues whose `adapter:`
  field says so. Built against the SDK's shipped types; not yet run
  against a real `copilot --acp` process end to end.

`agentAdapter.js` picks between them per colleague and is the seam a
third backend (Gemini, also over its own native `--acp`) would plug
into without touching the server, roster, store, or frontend.

Also real: colleague photos (`team/<name>/<name>.png`, the same
convention Juno's own file already uses), image attachments, and
persisted history outside the repo
(`~/.hire-juno/<workforce-id>/chat/chat.db`, or the equivalent root for
the older `mitarbeiter/`+`verfassung.md` layout —
`~/.ki-belegschaft/<belegschaft-id>/chat/chat.db`).

Also real, added after the first working slice:

- **The workforce switcher** — the sidebar header carries the name of
  the workforce you're in, and clicking it opens the list of every one
  this machine knows about (`~/.hire-juno/known-workforces.json`, filled
  in by the installer and by every chat launch — nobody types a path to
  get on it), with add and remove in the same menu. Picking one starts a
  second server against it and sends this tab there; the old instance
  closes itself. One workforce is active at a time, by design — and
  "active" now outlives the process: the registry remembers the last one
  switched to, so a bare `hire-juno-chat` started anywhere that isn't
  itself a workforce opens it again instead of falling back to a folder
  with no colleagues in it. Standing *inside* a workforce still wins
  over the remembered one, and an explicit `--dir` wins over both (see
  `chat/bin/chat.js`, which is where that order lives).
- **Group channels** — freely composed (you pick the members, not one
  fixed "everyone" channel), `@name`/`@all`/`@everyone` to address
  someone directly, and a small classifier (`gatekeeper.js`, one cheap
  Haiku call, no tools) that decides who — if anyone — should answer a
  message that named no one, so colleagues can "recognize themselves"
  as relevant instead of needing to be tagged every time. Colleagues
  can mention each other and reply directly, capped at
  `MAX_RELAY_DEPTH` hops so a conversation can't loop forever on its
  own. Channel turns get the exact same streaming/tool-use/permission
  treatment as a 1:1 chat, plus a live "who's typing" indicator per
  member.
- **Model/effort/token stats** per colleague (and per channel member),
  read straight from the SDK's own `system`/`init` and `result`
  messages — shown in a header above the message list.
- **Parallel sessions** — a colleague isn't limited to one standing
  conversation; "+ New session with `<name>`" in her ⋮ dialog starts an
  independent one (own history, own adapter/SDK session, own
  tool-permission state), so two different topics with the same
  colleague don't have to share one thread. The same dialog lists all
  of her sessions and switches between them; the sidebar keeps one row
  per colleague (carrying the unread/draft state of every session, and
  returning to the one you were last in), and the pane header names the
  open session when it isn't her main conversation. Nested rows in the
  sidebar are for subagent exchanges only.
- **Model choice** per conversation — a dropdown in the conversation
  settings (⋮ in the pane header), 1:1 only. The list is what this
  account can use, as the SDK reports it for that colleague's own
  session, so opening the dialog starts that session if it isn't
  running yet. The choice is applied to the running session, remembered
  per colleague and session in the chat database, and survives a
  server restart and a context reset. "Default" removes the choice.
  A channel turn runs on each member's main-conversation session, so
  its model is the one set in that session's dialog. Not available for
  the Copilot adapter (the section hides itself).
- **Auto mode** ("allow all") — a per-session toggle in the pane header
  that skips the permission-prompt round trip and auto-approves every
  tool call for that specific conversation, checked fresh on every
  request so flipping it mid-conversation takes effect immediately.
  Scoped to 1:1 sessions only for now — a channel turn always still
  prompts.
- **Markdown rendering** in message bubbles (bold/italic/code/fenced
  code/links/headings/lists) — a small hand-rolled, escape-first
  renderer, not a dependency, since the frontend stays intentionally
  vanilla (see below).
- **Desktop notifications** when a message arrives for a conversation
  that isn't the one on screen, or while the tab isn't focused at all.
  Best-effort permission request on load plus an explicit
  "🔔 Enable notifications" button for browsers that only grant it off
  a real click.
- **"Einstellungsprozess-Modus"** — a colleague's message containing
  the literal line `:::mode hiring-process:start` visually detaches
  that conversation (a banner, a tinted background) until a later
  `:::mode hiring-process:end` line closes it again, both lines
  stripped from what's actually shown. Juno's own `profile.md`
  (`team/juno/profile.md`) instructs her to emit these — start once
  the needs assessment has actually cleared and the process really
  begins, end once probation begins or she's told to stop; the exact
  end point is a first attempt, expected to move once it's been used
  for real. Scoped to Juno only in this repo — a
  different HR colleague in a different install would need the same
  instruction added to her own profile.

## Known gaps

- Auto mode and the gatekeeper are two separate permission stories
  that haven't been reconciled: a channel turn always prompts, even
  for a colleague whose 1:1 sessions are in auto mode. Not extending
  auto mode to channels was a deliberate scope call, not an oversight,
  but it's worth revisiting.
- No history limit or rotation: every message ever sent stays in the
  SQLite file forever.
- The Copilot adapter is untested against a live process, and doesn't
  emit `session_info`/`usage` (no stats shown for those colleagues) or
  support sessions/auto mode (both are Claude-adapter-shaped features
  for now).
- A colleague's live session can get stuck mid-turn — no reply, no
  error, ever, on that (colleague, session) again — and it doesn't
  clear on its own. The shape: a turn ends without a proper `message`
  event (for example an empty-text reply), and the SDK session id `adapters/claude.js` reports via `onSessionId`
  (saved by `server/index.js` into `store.js`'s `adapter_sessions`
  table) is itself what's broken —
  every later message resumes straight back into it and hangs the same
  way, silently, with nothing surfacing to either the browser or the
  server's own console. Recovery: "Reset context" now clears that
  saved session id, not just the in-memory adapter object (see
  `server/index.js`'s own comment on that handler for why the fix
  needed both) — a plain reconnect or server restart does **not**
  recover it, since the resume pointer survives in the SQLite file
  either way. Not understood yet: what makes a turn end this way in the first
  place; long/complex turns are the one pattern observed so far, not
  confirmed as the cause.
- The frontend's source now lives in `chat/src/app.js`, not
  `chat/public/app.js` — that's the built output (`npm run build:chat`,
  esbuild, also run automatically before `npm publish` — see
  `prepublishOnly`), so installing this package still never requires a
  build step. Migration to Preact + htm is underway but only one slice
  so far: the message list (`renderMessages`/`renderChannelMessages`,
  plus the components they render — bubbles, tool-use detail,
  permission cards) is Preact-owned, which is also where the actual
  duplication lived (two near-identical hand-built DOM trees for one
  bubble shape). Everything else — sidebar, composer, the settings/
  diff modals, socket handling, all the keyed-Map state — is still the
  same hand-written vanilla DOM code it always was. Migrating those is
  follow-up work, not done in one pass.
