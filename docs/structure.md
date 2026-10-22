# Structure

What is in this repository, and — the part that actually matters when
you run the installer — which of it ends up in your own repo and which
of it stays here.

The file list below is checked against the installer's manifest by a
test (`test/structure-doc.test.js`), so it cannot quietly drift out
of date.

**The workforce — this is what you get.** 23 files with Claude Code
selected, 19 with anything else; the four adapters are the difference.

<!-- scaffolded-files:start -->
```
CONSTITUTION.md               Global guardrails every colleague works under
hr/
  hiring.md                   The hiring conversation, step by step
  profile-template.md         Copy template for a new personnel file
  probation.md                Weekly check plus the final decision
  feedback-review.md          Monthly performance review
  ticket-template.md          Fixed ticket structure, each colleague's own voice
  assessment-center/
    process.md                How an examination runs
    examiner-security.md      Role: prompt injection, privilege and role attacks
    examiner-expertise.md     Role: provoke hallucinations in the candidate's field
    examiner-brand.md         Role: provoke PR and legal disasters
    examiner-template.md      Copy template for a further examiner, if a role needs one
    reports/
      report-template.md      What the panel's findings get written into
team/
  roster.md                   One card per colleague — the quick overview
  juno/                       HR — the one colleague who ships with the repo
    profile.md                Her personnel file: mandate, personality, rules, boundaries
    memory.md                 What she has learned working here — empty on day one
    journal.md                Her running log — empty on day one
    people-memory.md          Documents the format and location of the people memory
    juno.png                  Her photo
    skills/
      onboarding.md           A skill, not a rule — pacing for a first-time co-owner
.claude/
  agents/                     Written only if you pick Claude Code
    juno.md                   Makes Juno callable as an agent in the tool
    examiner-security.md      The standard panel, the same three roles as above
    examiner-expertise.md
    examiner-brand.md
```
<!-- scaffolded-files:end -->

**This project's own files.** None of these are copied anywhere; they
govern and build the template rather than belong to a workforce.

```
README.md                     This page
LICENSE                       MIT
CONTRIBUTING.md               How to propose a change, including to the constitution
CODE_OF_CONDUCT.md            Contributor Covenant 2.1
parking-lot.md                Ideas deferred here, with the dates they were parked
team/juno/juno.mp4            Her intro clip, played by the browser wizard only
bin/, src/                    The npx installer that writes the list above
chat/                         hire-juno-chat: a local chat UI for an already-installed team/ (see chat/README.md)
test/                         Tests for the installer and for chat/
docs/diagrams/                Sources and rendered SVGs for the two flow diagrams
scripts/                      One-off tooling for Juno's terminal animation
.github/workflows/            CI and release automation
```

The adapter is the only tool-specific place in the whole repo.
Constitution, personnel files, and the HR process name no tool and no
model — switching to something else costs you that one folder.

The people memory itself (what a colleague remembers about individual
co-owners) does **not** live in this repo. It lives globally on the
respective machine at
`~/.hire-juno/<workforce-id>/<colleague>/people/<first-name>.md` —
physically separate from the repo, not merely hidden by `.gitignore`.
`<workforce-id>` is the fixed identifier from the header of
`CONSTITUTION.md` (§0), not the folder name.

Juno is the only colleague included. Everyone else is someone you hire,
so `team/` grows with your work instead of starting with figures you
have to delete first. Her file is **filled in, not blank**: it shows
what a personality, a rule set, and access rights look like in
practice. Journal and memory are deliberately empty — she hasn't worked
for you yet, that comes with use. Her `skills/` folder isn't empty
though: a skill is a reusable how-to for a recurring situation rather
than an always-on rule (see `hr/feedback-review.md` for the
distinction), and onboarding a first-time co-owner through the hiring
conversation is exactly that kind of situation — the same mechanism
every future colleague gets, just already populated once for the one
colleague guaranteed to need it on day one.
