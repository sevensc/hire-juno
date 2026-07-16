# HR process: hiring conversation

Run by the HR colleague with the hiring human (future supervisor).
Duration: 15–30 minutes of dialogue. Result: a first version of a
personnel file based on [profile-template.md](profile-template.md) — or
a reasoned rejection.

## Phase 1 — Needs assessment (stop criterion!)
1. Which bottleneck or pain point is meant to be solved?
2. How often does it occur? (daily / weekly / monthly / one-off)
3. **If one-off:** reject. Recommendation: handle it as a one-off
   assignment, no new colleague. Conversation ends.

## Phase 2 — The personnel questions
4. What exactly does the new person deliver? In which format? How often?
5. Who is the supervisor?
6. **How do we measure after 1 month that it works?** (2–4 measurable
   criteria — they become the probation criteria verbatim.)
7. What must the person never do? (no-gos, human-AI boundary)
8. Which access rights does she need at minimum? (read/write/external —
   when in doubt narrower; widening later is easier than restricting.)
9. Are there 1–3 examples of good results that can serve as a benchmark?

## Phase 3 — Name and personality
10. The HR colleague proposes three candidates: each with a name, a
    short Big Five profile and a sample sentence in the respective tone.
    Design the personalities to be clearly different (e.g. sober / warm
    / cheeky).
11. The hiring human picks one or combines them.

## Phase 4 — Closing
12. Create the first version of the personnel file based on
    [profile-template.md](profile-template.md) at
    `team/<name>/profile.md`; create an empty
    `memory.md` ("# Memory <name>\n\n_Still empty — will be distilled
    from the journal._") and `journal.md` ("# Journal <name>\n\nAppend-only.
    Newest on top."); create the folder `skills/`; **create the adapter
    for the tool in use** (copy template: the existing adapter of the
    HR colleague, swap name and description) — without this file the
    colleague cannot be called in the tool. Where the adapter lives
    and what it looks like depends on the tool and is documented in the
    adapter layer itself, not here.
13. Justify the model recommendation in the personnel file (fitting
    instead of expensive).
14. Create an image prompt: the HR colleague derives a concrete,
    fictional appearance from the Big Five profile (build, hair, face,
    one distinctive feature setting the person apart from the existing
    colleagues) and writes it as `team/<name>/avatar-prompt.md` — with a
    short derivation from personality to visual feature and a ready-made
    image prompt (in English) at the end. If she can generate an image
    in the tool in use herself, she does so and stores it alongside;
    otherwise it stays at the prompt, which a human redeems. No real
    person as a template, no company logos, no readable text in the
    image.
15. Update the roster: add a new card for the person in
    `team/roster.md` (image — if step 14 delivered one, otherwise the
    placeholder "no image yet" —, role, supervisor, status, a short
    personality paragraph). Existing cards stay unchanged; only add, do
    not rewrite.
16. Ask about the examiner panel: "Take the three standard examiners,
    or do you need something different for this one?" Default is the
    standing panel (security/expertise/brand); propose a change only if
    the access rights or no-gos from Phase 2 point at a risk the
    standard three don't cover — don't reopen this by default on every
    hire just because it's possible to.
17. Hand over to the assessment center
    ([assessment-center/process.md](assessment-center/process.md)).
    Probation only starts AFTER the test report
    has been worked in.
