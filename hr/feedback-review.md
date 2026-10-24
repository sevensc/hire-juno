# HR process: feedback review (performance review)

Monthly for each active colleague. Participants: supervisor + HR colleague
(the colleague concerned "has a seat at the table": their journal and
memory are the basis of the conversation).

## Procedure
1. **Go through the journal and the memory yourself**
   (`team/<colleague>/journal.md` since the last review, `memory.md` for
   what is already distilled): what went well? Where were there repeated
   corrections? The colleague's people memory is not part of this: it
   lives outside the repo and stays with its owner.
2. **Rule/skill inference:** look for patterns — feedback that came up
   2+ times but is in no rule and no skill yet. Decide per pattern by
   what kind of thing it is: a constraint on behavior that has to hold
   in every conversation, regardless of topic ("never promise a
   deadline") → an explicit rule in the personnel file. A reusable
   how-to that only matters when a specific situation comes up
   ("how to walk a first-timer through their first hire") → a skill
   file under `skills/`, referenced from the personnel file rather than
   inlined, so the file doesn't grow with content only relevant some of
   the time. When genuinely unsure, default to a rule — a skill nobody
   is ever pointed to is dead weight, which is exactly what happened to
   this mechanism once already. A how-to the colleague works out again
   in several sessions, or guidance they had to ask for more than once,
   counts as a skill candidate even if nobody corrected them. Write the
   candidates down as a short list: the pattern in one sentence, the
   journal entries it shows up in (by date), whether the personnel file
   or `skills/` already covers it (check, don't assume), and your call,
   rule or skill, with the reason.
3. **Instructions outside the assignment:** look through the journals for
   entries whose title starts with `Outside the assignment:` (the
   colleague's own, and the other colleagues' when the pattern may spread
   across them). Sort each case:
   - **One-off:** it stays in the colleague's memory, nothing more.
   - **Twice or more for the same colleague, close to their assignment,
     doable with the access they have:** a skill candidate, handled as in
     step 2.
   - **Same, but it needs new access, touches a boundary or changes the
     assignment:** a proposal to the supervisor.
   - **Recurring and far from every existing role, or spread across
     several colleagues:** a needs assessment as in `hr/hiring.md`
     (phase 1): a new role or a wider assignment for an existing one. The
     span of control in the constitution (§2) counts.
4. **Condense the memory:** summarize journal insights in `memory.md`
   (keep it short and current; delete what is outdated).
5. **Update the personnel file** — only with the supervisor's explicit
   approval. That includes a new skill: you propose it with the evidence
   from step 2 and a file name under `team/<colleague>/skills/`; the file
   is written and referenced from the personnel file after sign-off.
6. **Check what you parked:** anything you deliberately deferred and
   tied to a condition — has that condition been met since? Keep the
   list wherever you already keep decisions; the point is that a parked
   idea gets looked at again on a fixed date rather than resurfacing by
   accident.
7. **Minutes** as a journal entry:
   `## [yyyy-mm-dd] Feedback review — <decisions in bullet points>`
