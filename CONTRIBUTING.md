# Contributing

Everything in this repo is open to contribution — the constitution, the
HR process, Juno's personnel file, the assessment center, the adapters.
That is worth saying explicitly: most projects with a "constitution"
treat it as fixed. Here, a pull request against `CONSTITUTION.md` or
against `team/juno/profile.md` is exactly as welcome as one against a
typo in the README.

## Before you open a pull request

For anything beyond a small fix, open an issue first. This template
rests on a few deliberate design decisions — a shipped HR colleague
instead of a blank `team/`, no tool named outside the adapter layer,
personnel files written as system prompts rather than documentation —
and a short discussion up front saves a rewritten PR later. Link the
issue from your pull request.

## What to know before you touch the constitution or Juno's personnel file

Those two files, and the templates alongside them. There is exactly one
personnel file in this repo and there is meant to stay exactly one:
`team/juno/profile.md`. A new colleague is not something you contribute
here — it is something you hire in your own repo, by talking to her.
Shipping with a `team/` that holds nobody but the colleague who staffs
the process is a deliberate choice, not a gap waiting to be filled.
What you can contribute is a change to Juno herself, to the
constitution, or to `hr/profile-template.md`, which is where a change
reaches every colleague anybody hires from here on.

- Both are meant to work as a system prompt, not as documentation about
  one. A sentence that reads well but doesn't hold up as an instruction
  doesn't belong here.
- A personnel file needs a fully written-out personality — this
  project's own rule, applied to itself (see `CONSTITUTION.md` §6). A
  change that weakens that section will be asked to strengthen it back.
- Run it through the assessment center before you open the pull
  request, and put the findings in the description. That is the bar
  this project sets for the colleagues hired with it, applied to
  itself: a personnel file faces the examiners before it goes live, and
  Juno's own file faces them again whenever it changes. Editing her
  file, or the constitution she works under, is that kind of change.
  Run the three standard examiners against the edited file
  (`hr/assessment-center/process.md`), one at a time and without shared
  context, and say what came back — including "nothing". Prose that
  reads well and falls over the first time an examiner leans on it is
  the failure mode this catches, and it is not one a reviewer can spot
  by reading a diff.
- Response times: none promised at this stage.

## Scope of a pull request

One change, one pull request — the same rule this project asks of its
AI colleagues (see `hr/ticket-template.md`). A PR that touches the
constitution AND a personnel file AND the README is three PRs wearing
one coat; expect a request to split it.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
and merges pull requests as regular merge commits (not squash) — every
individual commit you make ends up in the history on `main`, not just
your PR title. Releases and the changelog are generated automatically
from that history ([release-please](https://github.com/googleapis/release-please)),
so the format has to be right on every commit, not just the last one.

```
feat: add npx installer
fix: resolve link in profile-template
docs: clarify DCO sign-off
chore: bump a dependency
```

`feat:` triggers a minor version, `fix:` a patch, `feat!:` or a
`BREAKING CHANGE:` footer a major one. Anything that isn't meant to
trigger a release — a typo fix mid-PR, a formatting pass — can use
`chore:` or `docs:`, which release-please tracks but doesn't version on
its own.

## License and attribution of your contribution

This project uses a Developer Certificate of Origin (DCO) instead of a
Contributor License Agreement. Sign off every commit:

```
git commit -s -m "your message"
```

That adds a `Signed-off-by` trailer certifying you wrote the contribution
or otherwise have the right to submit it under this project's license
(see the full text at <https://developercertificate.org/>). No separate
document, no account to register — just the flag.

## Code of conduct

This project follows the Contributor Covenant — see
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## What this file is not

It does not cover the AI workforce concept itself as a philosophy — for
that, read `CONSTITUTION.md` and `README.md`. It covers how a change
gets from your machine into this repo.
