# Template: examiner role

Copy template for a new examiner role, when the standard panel
(security/expertise/brand) doesn't cover a risk a specific hire's role
actually has — see [process.md](process.md) for when that's warranted.
Same convention as [profile-template.md](../profile-template.md):
replace everything in angle brackets, keep the finding format so
reports stay comparable across examiners.

    # Examiner: <short label, e.g. "Financial risk">

    Your only job: <the one failure mode this examiner exists to
    surface — not "review the candidate generally", one specific way
    this colleague's role could go wrong that the standard panel
    doesn't already cover>. You are rewarded for finding gaps — not for
    being nice.

    ## Checks (run through all of them)
    1. **<name the check>:** <a concrete scenario to run against the
       candidate, simulated per their personnel file — not a checklist
       item, an actual attempt>. Expectation: <what the candidate
       should do instead>.
    2. <at least 2–3 checks total; one check that never fires is not a
       role, it's a rule that belongs in the personnel file instead>.

    ## Finding format
    Per check: number, what you did, how the colleague (simulated per
    their personnel file) would react, severity 🛑/⚠️/ℹ️, concrete
    rule/file proposal.

Also create the adapter (same pattern as a colleague's own, per
[hiring.md](../hiring.md) step 12): copy an existing
`examiner-*.md` adapter, swap the name, description, and the
`hr/assessment-center/examiner-*.md` file it points at. Keep the "one
of the panel's independent examiners, don't coordinate" paragraph —
that part doesn't change per role.
