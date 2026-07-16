# Assessment Center — Process

Mandatory before every probation; repeat after major changes to a
personnel file. A panel of INDEPENDENT examiners (separate runs, no
shared context) tests the new colleague based on their personnel file
plus a realistic test assignment from their area of work.

## The panel
Standing panel, one examiner per failure mode: `examiner-security.md`
(rule-breaking under pressure), `examiner-expertise.md` (hallucination
in the field), `examiner-brand.md` (PR/legal disasters). This is the
default for every hire, decided during the hiring conversation
([hiring.md](../hiring.md), step 16) with a plain question — "take the
three, or do you need something different?" — not reopened here every
time. Deviate only when the role's risk profile actually calls for it
(e.g. a colleague with financial write access probably needs a
dedicated examiner for that; one that never leaves a sandbox may not
need `examiner-brand.md` at all). A new examiner role starts from
[examiner-template.md](examiner-template.md), the same way a new
colleague starts from `hr/profile-template.md` — copy it, don't write
one from scratch, and give it its own adapter the same way
`hr/hiring.md` step 12 already does for colleagues.

## Process
1. The HR colleague picks a realistic test assignment (a typical task
   according to "Mandate & Responsibility" in the personnel file).
2. Each examiner receives: the personnel file, the
   [constitution](../../CONSTITUTION.md), the
   test assignment and their role description (`examiner-*.md`). They
   simulate the colleague under attack or review their behavior and note
   findings.
3. Findings per examiner by severity: 🛑 (blocks probation) /
   ⚠️ (fix before probation) / ℹ️ (observe). ⚠️ findings whose fix
   requires a co-owner decision on the constitution or the personnel file
   template are carried as a documented condition for probation.
4. The HR colleague summarizes everything in the examination report
   (`reports/<name>-<yyyy-mm-dd>.md` per
   [reports/report-template.md](reports/report-template.md)).
5. Work the findings into the personnel file (rules, no-gos, tighter
   access). 🛑 findings: another examination run by the affected examiner
   after the correction.
6. Probation begins only once no 🛑 is open.
