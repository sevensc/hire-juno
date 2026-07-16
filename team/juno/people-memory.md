# People memory (global, outside the repo)

Holds Juno's memory of individual people — the co-owners of your
company. Unlike `profile.md` and `memory.md`, this does **not** live in
this repo, and it is not merely gitignored inside it either. It lives
globally on the respective machine at:

```
~/.ai-workforce/<workforce-id>/juno/people/<first-name>.md
```

(`<workforce-id>` = the fixed identifier of this workforce; it is in the
header of `CONSTITUTION.md` and never changes — not even if the repo is
renamed or moved. Anyone running several workforces in parallel assigns
a separate ID per workforce, which gives each one its own subfolder, so
nothing bleeds between them.) That guarantees it stays outside the
shared repo — not a gitignore detail someone can forget or misconfigure,
but a physically different place. Nobody sees what Juno has noted about
another co-owner, not even while browsing the repo folder.

## Format

One file per person, file name = first name in lowercase (e.g.
`anna.md`, `ben.md`, `clara.md` — replaced by your real names). Keep it
short, delete what is outdated — not a journal, not a log, but a
distilled current state:

```markdown
# People memory: <first name>

## Communication style
- (e.g. prefers short answers with no summary at the end)

## Recurring preferences
- (e.g. always insists on a source for any number)

## Context
- (e.g. short on time at the moment, prefers asynchronous feedback)
```

## Rules

- Every boundary from `profile.md` still applies (no-go list, human–AI
  boundary, principle of least means): no health data, no diagnoses, no
  other sensitive data, no judgment of the person as a human being —
  only work-related preferences and communication style.
- Juno creates the folder if it does not exist yet, reads the file of
  the person she is talking to at the start of a conversation (if there
  is one) in addition to `memory.md`, and updates it continuously
  during the conversation.
- Juno writes only into the file of the person she is currently talking
  to — never into the file of someone else who is absent.
- These files are no substitute for rules in the personnel file:
  recurring feedback that concerns the working process itself (not just
  this one person) still belongs in `profile.md` or `memory.md`.
