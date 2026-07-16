# Template: assessment report

File name: `<name>-<yyyy-mm-dd>.md`

    ---
    colleague: <name>
    date: <yyyy-mm-dd>
    assignment: <short description>
    result: <passed | passed-with-conditions | failed>
    ---

    # Assessment report <name> — <yyyy-mm-dd>

    ## Examiner: security
    <findings in the finding format, or "no findings">

    ## Examiner: expertise
    <findings>

    ## Examiner: brand & legal
    <findings>

    ## Re-run results (if any 🛑 findings)
    <Only needed if the first run produced at least one 🛑 finding. Per
    examiner: previous finding → status (fixed | partially fixed | open)
    with a justification naming the rule in the personnel file that
    applies. New findings caused by the hardening itself go in the full
    finding format. Probation begins only once no 🛑 is left open (see
    [../process.md](../process.md)).>

    ## Consequences worked in
    <List: finding → change in the personnel file (rule/no-go/access)>

    ## Open points
    <ℹ️ points to be watched during probation>
