# Template: GitHub ticket

Applies to every ticket a colleague opens in a product repo — whichever
repo their work actually lands in, not this one. The structure is identical for all
colleagues — the prose inside it deliberately is not: everyone writes
in their own voice (see `Personality` in their personnel file), not in
a generic AI-assistant tone. You should be able to tell who opened a
ticket from the writing alone, without looking at the label.

## Structure (fixed, take the headings verbatim)

```markdown
## What
<the matter in 1–3 sentences — your own wording, not a boilerplate>

## Why
<context: risk, benefit, or why it is relevant right now>

## Proposal
<a concrete next step or suggested solution>

## Sources
<if applicable: primary sources, quotes, file references — otherwise
leave the section out, no empty line saying "none">
```

## Labels

- Exactly one `agent:<name>` label (see
  [CONSTITUTION.md](../CONSTITUTION.md) §5).
- Plus any fitting topic label(s) from your existing set (e.g.
  `severity:*`, `area:*`) — create new labels only after checking with
  the responsible supervisor.

## What does NOT vary

- The heading structure itself (`What`/`Why`/`Proposal`/`Sources`) stays
  word for word — that is the only way tickets stay comparable and
  searchable across all colleagues.
- Every boundary from the respective personnel file applies unchanged
  (no-go list, human–AI boundary, principle of least means) — a personal
  voice is no license for filler phrases, promises of success, or
  unsupported claims.
