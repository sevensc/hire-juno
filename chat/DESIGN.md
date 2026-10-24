# Design foundations — hire-juno chat

The measuring stick this interface is built and checked against. It is
descriptive where the interface already made a decision and prescriptive
where it did not: a value written here is the one to reach for, and a
screen that disagrees with it is either a bug or a deliberate exception
that belongs in the "Known deviations" section at the end.

Everything here was read off `chat/public/styles.css` and
`chat/public/index.html` or measured in the running app. Where a number
comes from outside this project, the source is named next to it; where a
number is a proposal rather than an established value, it says so.

---

## Supported browsers and widths

- **Layout is mobile-first, and that includes the dialogs.** The
  unconditional rules in `styles.css` are the phone-width layout.
  The changed-files dialog follows the same rule: its base is a column,
  and the desktop block's `flex-direction: row` / `max-height: none` /
  `border-bottom: none` resets undo it. A two-column base would give a
  320px phone a 256px file tree beside what is left of the diff. Desktop
  is layered on top in a single `@media (min-width: 721px)` block at the
  end of the file — never the other way around.
- **One breakpoint: 721px.** Below it, sidebar and conversation occupy
  the same space and only one is visible at a time (`#app.pane-active`);
  a bottom tab bar carries the destinations the sidebar header holds on
  desktop. At and above it, the two sit side by side in a
  `220px | minmax(0, 1fr)` grid. Narrow tablets fall into the phone
  layout on purpose rather than into a cramped two-column one.
- **Narrowest width checked: 320px.** Verified free of horizontal
  document overflow at 320, 390 and 1440px.
- The app is served over the local network and used in three places
  that behave differently and all need checking: a desktop browser, a
  phone browser, and the phone's standalone home-screen window, which
  has no browser chrome of its own — no address bar, no reload button,
  no back gesture.

## Colour

All colours are CSS custom properties on `:root`, each declared with
`light-dark()` so light and dark come from one declaration. `:root` also
carries `color-scheme: light dark`. Never hard-code a colour in a rule;
add a token.

Which side of each pair is shown is the user's choice under Settings >
Appearance: System (default, follows the device), Light or Dark. A
forced choice sets `data-theme="light"|"dark"` on `<html>`, which pins
`color-scheme` and so every `light-dark()` token at once; System removes
the attribute. The choice is kept in the browser's localStorage
(`hire-juno-chat:theme`) and applied by an inline script in `<head>`
before the first paint, together with `<meta name="color-scheme">`. A
new colour therefore needs no extra rule for the switch, only its
`light-dark()` pair. The control is a segmented row of native radios:
44px-high labels, selected state as a 2px `--accent` border plus bold
text on `--bg-message` (measured 5.26:1 light and 5.86:1 dark against
that fill; label text `--fg` on it 15.08:1 and 12.66:1), focus ring
drawn on the label.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--bg` | `#ffffff` | `#16171a` | Page and conversation background |
| `--bg-sidebar` | `#f3f3f5` | `#1e1f23` | Sidebar, title bars, tab bar |
| `--bg-message` | `#f0f0f2` | `#23242a` | Incoming bubbles, hover fills |
| `--bg-message-you` | `#dbe6ff` | `#2a3a5c` | Own bubbles |
| `--fg` | `#1b1b1f` | `#e8e8ec` | Body text |
| `--fg-muted` | `#6b6b74` | `#8b8b96` | Timestamps, roles, secondary text |
| `--accent` | `#3358d6` | `#7a9bff` | Selection, focus, text and borders |
| `--accent-fill` | `#3358d6` | `#4a6ae6` | Filled surfaces with white text: active row, primary buttons, initials (white on it: 5.99:1 light, 4.67:1 dark) |
| `--border` | `#e2e2e6` | `#2c2d33` | Hairlines and control borders |
| `--auto-mode-bg` / `--auto-mode-border` | `#fff3d6` / `#e0b34d` | `#3a2f14` / `#6b5220` | Auto-mode banner |
| `--hiring-mode-bg` / `--hiring-mode-border` | `#eee6ff` / `#8a63d2` | `#2c2445` / `#8a63d2` | Hiring-mode banner |

Two further tokens are device geometry rather than colour, and exist so
the values can be overridden during inspection on a machine without a
notch (an `env()` cannot be):

| Token | Value |
| --- | --- |
| `--safe-top` | `env(safe-area-inset-top, 0px)` |
| `--safe-bottom` | `env(safe-area-inset-bottom, 0px)` |

Any surface that can reach the top or bottom edge of a standalone
window must consume the matching inset, and must do so on an element
that carries the *bar's* own background — not on a transparent parent,
which leaves a bare strip of page colour above the bar instead of one
surface running up under the status text.

## Type

One family for the interface (`system-ui, sans-serif`) and one for code
and paths (`ui-monospace, SFMono-Regular, Menlo, monospace`). No web
fonts: nothing in this interface is loaded from a remote origin at
runtime.

Sizes in use, in `rem`, with `1rem` = the browser default (16px unless
the reader changed it — never assume 16):

| Step | Size | Used for |
| --- | --- | --- |
| Caption | `0.7rem` – `0.75rem` | Timestamps, tab labels, header stats |
| Small | `0.8rem` – `0.85rem` | Roles, secondary rows, most controls |
| Body | `1rem` | Message text |
| Heading | `1.05rem` – `1.3rem` | Dialog titles, figures |

`-webkit-text-size-adjust: 100%` on `body` keeps the phone's own text
inflation from resizing any of this on rotation.

## Spacing and shape

Spacing is a rem scale in quarter steps: `0.25 / 0.4 / 0.5 / 0.75 / 1`.
Corner radii: `0.4rem` for small controls, `0.5rem` for rows, cards and
inputs, `0.75rem` for bubbles and dialogs, `50%` for avatars.

Line height has no scale yet — the values in use sit between 1.3 and
1.5 without a rule behind which is which. Open; pick one deliberately
rather than adding a sixth value.

## Touch targets

**`2.75rem` (44px at the default root size) is the floor for anything
tapped**, and it holds everywhere, not just on the tab bar and the list
rows: the conversation menu (⋮), the attach button, the send button, the
mobile back button, the discard-attachment control, the permission
card's Allow/Deny row, the mention suggestions, the changed-files rows,
the settings list's buttons, Reset context, Clear chat and the auto-mode
toggle. Check it by measurement across several widths in both themes,
with each dialog open — not by reading the rules.

A minimum on the height alone is not the rule: a single-glyph button
needs `min-width` too, or it comes out 34px wide with a 44px height.
And `min-height` on a `<button>` grows its content box downward — the
glyph ends up at the top of the box unless the button is itself a flex
container with `align-items: center`. It is the stricter of the two published thresholds and
the one to hold here, because the primary device for this app is a
phone:

- 24×24 CSS px is the minimum in WCAG 2.2 SC 2.5.8 Target Size
  (Minimum), Level AA
  (w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Five exceptions apply, including sufficient spacing
  around an undersized target and targets inline in a sentence.
- WCAG 2.2 SC 2.5.5 Target Size (Enhanced) sets 44×44 CSS px at Level
  AAA. Not verified against its own source page here — treat the number
  as the house rule above, which does not depend on it.

## States

Every control needs the full set, not just the resting one: **rest,
hover, focus, pressed, selected, disabled**, plus — for anything that
shows content — **loading, empty and error**.

- **Hover is gated on a pointer that can hover.** All `:hover` rules
  in `styles.css` sit inside `@media (hover: hover)`; recount whenever
  one is added. A touch screen reports `hover: none` for its primary
  input (developer.mozilla.org/en-US/docs/Web/CSS/@media/hover), so without the gate a phone browser leaves the hover
  style on whatever was tapped last: a channel row sat there looking
  grey-selected beside the row that was actually open. Adding a hover
  rule outside the gate reintroduces that.
- **Hover is not a state a finger can be in.** A touch browser leaves
  the hover style on whatever was tapped last, so hover must never be
  the only feedback, and must never outrank a real state. A hover rule
  competing with a selected-state rule has to exclude it explicitly
  (`:hover:not(.is-selected)`), because a two-part hover selector
  otherwise wins on specificity and the selected row loses its colour
  the moment it is touched.
- **Pressed is mandatory on touch surfaces.** The browser's grey tap
  flash is switched off app-wide
  (`-webkit-tap-highlight-color: transparent`), so every control
  provides its own. Two patterns: a `filter: brightness(0.92)` for
  filled and bordered buttons, and an overlay tint —
  `light-dark(rgba(0,0,0,0.14), rgba(255,255,255,0.16))` — for list
  rows and tab items. Use the tint as an **inset box-shadow**, not a
  background, so it darkens a selected row's fill instead of replacing
  it. Measured against the sidebar background, the tint is 1.38:1
  (light) and 1.66:1 (dark) — against 1.03:1 for the hover fill it
  replaces on touch. There is no published threshold for a transient
  pressed state; these are measurements, not a claim of conformance.
- **Focus must be visible on every focusable element.** There is one
  rule for the whole app, near the top of `styles.css`: a 2px
  `--accent` outline at `outline-offset: 2px` on `:focus-visible`, for
  every button, link, field and `tabindex` stop. `:focus-visible`
  rather than `:focus`, so a mouse click or a tap leaves no ring behind.
  The two full-bleed bars (the tab bar, the mobile back button) use a
  negative offset, having nothing outside themselves to draw into.
  Measured at 5.40:1 (light) and 6.24:1 (dark) against
  `--bg-sidebar`, over the 3:1 in the threshold table below.
  Where a control is a bare input inside a styled wrapper, the
  indicator goes on the wrapper with `:focus-within` instead — an
  outline drawn tight around the text reads as a second, misaligned
  box. Suppressing an outline without replacing it is a defect, not a
  style choice.

## Gestures and scrolling

The interface is one viewport-tall shell (`#app` at `100dvh`, with a
`100vh` fallback ahead of it); **the document itself never scrolls.**
Everything that scrolls is an element inside it.

- `html, body { overscroll-behavior: none; }` — no rubber-band bounce
  of the whole shell, no pull-to-reload, no horizontal swipe read as
  browser navigation.
- **Every scrollable element gets `overscroll-behavior: contain`.** It
  keeps the bounce that belongs to that list — the feedback that says
  "this is the end" — while stopping the leftover gesture from moving
  whatever sits behind it. Adding a new scroll container means adding
  it to that rule. Eleven selectors share one grouped
  rule near the top of `styles.css`, and `#sidebar`, `#messages` and
  `#conv-search-results` each carry it at their own rule, where their
  sizing already lives. Count against the file — the grouped rule is
  easy to miss when looking only at the lines around each `overflow`
  declaration.
- **Pull to refresh, on both full-screen scrollers.** Taking the
  browser's own overscroll away (the two rules above) removes its reload
  gesture with it, and a standalone home-screen window has no reload
  button to fall back on. So the app provides the gesture itself: a pull
  past the top of `#sidebar` re-reads the roster, a pull past the top of
  `#messages` re-reads the open conversation, and both revive the
  WebSocket if it is not open. Never a page reload.
  - It sits on **both**, not only the conversation: below the breakpoint
    those are two separate screens, and a gesture that silently does
    nothing on one of them is one nobody tries twice.
  - Travel is damped to 0.45 of the finger's, arms at 56px and stops at
    72px. Only a gesture that *begins* at `scrollTop === 0` counts;
    anything else stays an ordinary scroll.
  - The list itself does not move. `#messages` and `#sidebar` are flex
    children of containers that do not clip, so translating them spills
    over the composer instead of tucking under an edge. What follows the
    finger is an opaque band grown down from the scroller's top edge, in
    that scroller's own surface colour — the list appears to be pushed
    out of the way without being touched. A floating circle over the
    middle of a message bubble would read as something stuck on top of
    the text.
  - A finished refresh scrolls the transcript to its newest message.
    Deliberate: "refresh" in a conversation means "show me what's
    current", and current is the bottom.
  - The spinner ring is measured at 5.99:1 (light) and 6.79:1 (dark)
    against the band behind it, over the 3:1 in the table below. Its
    unfilled track is the light hairline colour and is decorative — the
    accent arc is the part that carries the state.
  - **Not reachable from a keyboard.** No equivalent control was added,
    because nothing is only available through this gesture: the socket
    reconnects on its own, and everything it fetches also arrives over
    that socket. Worth revisiting if that stops being true.
- `touch-action: manipulation` on controls: keeps panning and pinch
  zoom, drops double-tap-to-zoom, and with it the delay a touch browser
  otherwise holds a tap for. (Values per
  developer.mozilla.org/en-US/docs/Web/CSS/touch-action.)
- `user-select: none` on controls and the colleague list, so a press
  and hold does not start a text selection over something about to be
  tapped. **Message text, code blocks and the composer stay
  selectable** — copying out of a conversation is a real task.
- Nothing in this app scrolls horizontally except the usage table, and
  that one says so: it carries a gradient at each edge, painted in the
  scroller's own coordinate space so each side shows only while there is
  content past it. A touch browser hides its overlay scrollbar, so
  without that the table just ended at the edge with columns still to
  the right of it (146px of them at 320px) and nothing to suggest they
  existed.
- **`overflow-x: hidden` on `html`/`body` is a safety net, and it hides
  evidence.** Because of it, an element that overflows does not produce
  a scrollbar — it is silently cropped. "No horizontal document
  overflow" is therefore close to meaningless on its own: check
  `scrollWidth` against `clientWidth` per element, and check every
  element's rect against the viewport, or the finding will not appear.

## Contrast thresholds

Measured with the WCAG relative-luminance formula, against the token
value actually behind the element:

| What | Threshold | Source |
| --- | --- | --- |
| Normal text | 4.5:1 | WCAG 2.2 SC 1.4.3 Contrast (Minimum), Level AA — w3.org/WAI/WCAG22/Understanding/contrast-minimum.html |
| Large text (≥18pt, or ≥14pt bold) | 3:1 | same |
| UI component boundaries, state indicators, meaningful graphics | 3:1 | WCAG 2.2 SC 1.4.11 Non-text Contrast, Level AA — w3.org/WAI/WCAG22/Understanding/non-text-contrast.html |
| Focus indicator | ≥2px perimeter, and ≥3:1 between the focused and unfocused states of the same pixels | WCAG 2.2 SC 2.4.13 Focus Appearance, Level AAA — w3.org/WAI/WCAG22/Understanding/focus-appearance.html |

Both themes are measured, not just the one open at the time. Measured
values: focus ring `--accent` against `--bg-sidebar`,
5.40:1 light and 6.24:1 dark.

These are thresholds to measure against. Meeting them is not a claim
that the interface satisfies a standard or a law — that judgement is
not made in this file.

## Checklist before any change ships

Run all five against every component touched, and note what was
checked. They are reproducible, so work through them rather than
trusting that something will be noticed while building.

1. **States** — rest, hover, focus, pressed, selected, disabled,
   loading, empty, error.
2. **Overlong content** — text at twice the expected length, the
   longest realistic name, a list with many entries, an unbroken path
   or URL with nowhere to wrap.
3. **Width** — narrow and very wide, not only the width being worked
   in. At minimum 320px, a phone width, and a wide desktop window.
4. **Container edges and overflow** — what happens at the ends of a
   scrolling area, and to things that leave their container: dropdowns,
   dialogs, badges, tooltips.
5. **Keyboard and contrast** — tab once through the whole touched area
   and confirm every stop is visible; measure contrast against the
   thresholds above rather than judging it by eye.

On top of those, for anything that will be used in the standalone
home-screen window: check it with the safe-area tokens overridden to
non-zero values, since a development machine reports zero for both and
a missing inset is invisible until it is on the phone.

## Assets

| Asset | Origin | Licence |
| --- | --- | --- |
| Interface icons | Inline SVG authored in `index.html` and `app.js` — stroked paths on a 24×24 grid, `stroke-width: 2`, `currentColor`. One deliberate exception: the ⋮ "more" menu is three filled dots (`fill="currentColor" stroke="none"`) — a ring drawn at this stroke width is nearly invisible at the size a kebab menu needs, and a filled dot is the shape that convention already uses. There is no other glyph in the app: Unicode stand-ins (✕, ⋮, ↻, ↺, 📎) are not used. | Part of this repository; no third-party icon set is used |
| Typefaces | The reader's own system fonts via `system-ui` and `ui-monospace` | None bundled, none fetched |
| `logo.png` | The installed workforce's own file when present, otherwise the built-in mark | Not established here — **open**, resolve before treating the built-in mark as reusable |

No runtime request goes to a foreign origin: no web fonts, no icon CDN,
no analytics, no remote avatars. Anything new gets bundled and served
locally.

## Text size in inputs

Anything typed into is at least `1rem`. A phone browser zooms the page
in when it focuses a field whose text is under 16px, and this app has no
way back out of that zoom — the document itself never scrolls, so the
usual pinch-out does not restore anything. This covers the sidebar search, the in-chat search and the workforce
path field. Labels and secondary text around a field are not
affected; only what receives the caret.

## Truncation chains

A row that truncates does so through a chain, and the chain breaks at
its weakest link. Three separate things have to hold:

1. **The row must be capped.** `width: 100%` was not enough on
   `.colleague`: with a long role tag the row grew past it, `#sidebar`
   gained a horizontal scroll axis, and text ran off the right edge of
   the phone instead of truncating. `max-width: 100%` plus
   `min-width: 0` is what binds.
2. **Every flex ancestor needs `min-width: 0`.** A flex child defaults
   to `min-width: auto`, which refuses to shrink below its content
   width — one such link (`.colleague__role`) pushed the whole row
   outward on an unbroken path.
3. **A child of a `align-items: flex-start` column needs
   `max-width: 100%` of its own.** Such a column sizes its children to
   their own content, not to the column, so `overflow`/`text-overflow`
   on the child never gets a box narrow enough to trigger. This is why
   a colleague row truncated (its name sits inside
   `.colleague__name-line`, which carries the cap) and a channel row did
   not (its name is a direct child, and had no cap).

Scroll axes are declared, not inherited: `#sidebar` sets
`overflow-x: hidden` explicitly rather than relying on `html`/`body`'s
clip, which hides the symptom without preventing the axis.

## Where a number belongs

Two rules the pane header and the usage sections are built against:

- **A figure that changes rarely does not get permanent screen space in
  the place the screen is scarcest.** The account-wide plan usage changes only on Claude's own reset
  windows, so a strip of its own directly above the composer on a phone
  would waste space and, appearing mid-work, shift the layout under the
  reader. It lives in the pane header, beside the model, token and cost
  figures, so everything countable is in one place.
- **In a table too wide for the screen, column order is a priority
  decision.** Whatever sits on the right is what scrolls out of sight.
  The usage table reads `Who | Tokens | Cost | Model | Effort`: the two
  figures the section exists for stay inside the visible area on a
  phone, and the descriptive columns scroll out first.

## A wrapping header still needs a fixed corner

`#pane-header` does not wrap; `.pane-header__entries` inside it does.
The header's three children are the avatar, that wrapper, and the ⋮
button. If the entries and the button were siblings in one wrapping row, the
button — which carries `margin-left: auto` to sit far right — would be
pushed onto a line of its own as soon as the entries filled the first,
leaving a tall header at 320px with a lone ⋮ floating below the stats. Anything anchored to a corner belongs outside the wrapping
container, not inside it.

## Disclosure panels are not modals

`#conv-search-panel` (the in-chat search) is the app's one panel of this kind: a panel that opens inline —
pushing `#messages` down, not covering it — rather than behind a
backdrop. It gets lighter handling than the three real dialogs on
purpose:

- No focus trap and no `inert` on the rest of the page. Nothing is
  covered, so nothing needs to be kept out of reach.
- Escape closes it and returns focus to the toggle button — the one
  thing it does share with a modal, because "how do I get out of this"
  should have the same answer everywhere.
- It does not survive a conversation switch. `renderPaneHeader` calls
  `closeConvSearchPanel()` on every render, since a channel's search
  results are meaningless once the reader has moved to a different
  conversation.
- Its toggle button carries `aria-expanded` (kept in sync by both open
  and close, not just open — a state left half-updated is worse than
  no state), and `aria-controls` naming the panel.

Reach for this pattern before reaching for a modal: a modal is for
something that must block the rest of the screen (a destructive
confirmation, a dialog whose result the rest of the UI depends on). A
search, a filter, an inline detail view — anything the reader might
want open *while* looking at what's behind it — is a disclosure.

## Table markup

Rows appended to a `<table>` with `appendChild` land in an anonymous row
group, **not** in a `<tbody>` element — only the HTML parser creates
one. So `#usage-table tbody tr:nth-child(odd)` would match nothing and
zebra striping would be dead code (`querySelector('tbody')` returns
null). Build a real
`<thead>` and `<tbody>`, and put `scope="col"` on the header cells —
that matters more here than in most tables, because these cells scroll
out of view one at a time and the column a cell belongs to is exactly
what a reader has to recover.

## Icons and pictograms

Two rules keep the app on one icon system (hand-drawn SVGs) rather than
mixing in Unicode characters from the system font. When auditing for
stray glyphs, sweep by Unicode range rather than grepping for
likely-looking patterns: a glyph followed by trailing text, such as
"↺ Reset context", escapes a search for bare `>…<` glyphs.

- **A Unicode symbol is not exempt from the "no font glyph" rule** just
  because it looks like a shape rather than a letter. ✕/⋮/↻/↺ all
  render from whatever font the OS supplies, at whatever weight and
  style that font happens to draw them in — the identical problem the
  asset rule already names for emoji.
- **An icon is drawn from what the feature does, not from the nearest
  generic stand-in.** The Files tab and the diff icon-button both used
  a plain "document" glyph — the same shape a notes app would use — for
  a feature that is a git diff. It is a gutter mark (a `+`-prefixed
  line and a `−`-prefixed one, inside the same file outline), and the
  tab reads "Changes" rather than "Files": the label must not promise a
  file browser for what actually opens.

## Known deviations

- **The mobile tab bar hides while a conversation is open**
  (`#app.pane-active #mobile-tabbar`). That is deliberate and recorded
  in the rule's own comment. The consequence to keep in view: with a
  conversation open on a phone, Changes, Settings, the sidebar's own
  search and "+ New channel" are all two taps away via the back button,
  and none of them is visible. Not a defect — a trade this project made
  knowingly. (Searching the *open* conversation is unaffected — that
  search lives in the pane header, so it is reachable exactly when there
  is something open to search.)
- **"Reset context" and "Clear chat" sit under one "Danger zone"
  heading with no explanation of the difference** — one discards what
  the colleague remembers and keeps the transcript, the other deletes
  the transcript. Only the second is guarded (two-step). Open.
- **The conversation column has no maximum width.** `.message` is
  capped at `min(60ch, 80%)`, but the column holding the bubbles is
  not, so on a 2560px window an incoming bubble sits at the far left
  and the reply to it at the far right with roughly 1800px of nothing
  between them. Open — the cap is a number worth choosing deliberately.
- **The mention list is not announced.** Its keyboard handling is
  complete (arrows, Enter, Tab, Escape), but the markup is a plain
  `<ul>`/`<li>` with `aria-selected` on a `listitem`, where the
  attribute is not valid and is ignored. It needs the combobox pattern
  (`role="listbox"`/`role="option"`, `aria-expanded`,
  `aria-activedescendant`) to reach a screen reader. Open.
- **A conversation switch has no loading or error state.** The fetch
  has no `catch`; on a network failure the header changes to the new
  colleague while the previous conversation stays on screen underneath.
  Open.
- **Channel search must not use `activeConvKey()`.** It is `null` for a
  channel (a channel's transcript lives in `channelMessages`, not
  `history`), so a search built on it reports "No matches" regardless of
  what is on screen. In-chat search reads the channel's own store.
- **The Auto mode list does not list channel autopilot.**
  `renderAutoModeList` reads only the server-side one-to-one auto mode.
  A channel's own "Turn on autopilot" lives in a client-side map and has
  no representation there at all. The empty-state sentence claims only what the list can back —
  but a permission surface that omits an entire mechanism is a gap in
  the mechanism, not in the wording. Open.
- **Date and number formatting disagree.** Reset times go through
  `toLocaleString([])`, i.e. the reader's own locale, so a German device
  renders "So., 16:00" inside an otherwise English sentence; the figures
  beside it come from `toFixed()`, which always uses a dot. Both are
  defensible on their own; together they are neither. Open — it is a
  choice about which language the interface speaks, not a defect with
  one right answer.
- **Four different characters mean "no value"** in the settings dialog
  (en dash, em dash, `?`, and a dash for cost). Pick one.
- **Cost shows four decimal places everywhere**, including on the total
  row, where "$12.3456" is noise with a false air of precision.
- **Nothing tells the reader the connection is down.** The socket now
  reconnects by itself (on close, with backoff; immediately when the
  window becomes visible again) and the pull gesture forces the attempt,
  so the stuck-forever case is gone. What is still missing is the
  *state*: while it is disconnected the window looks exactly like a
  connected one. A quiet indicator in the pane header would close that,
  and would also give the pull gesture something to have visibly
  resolved.
