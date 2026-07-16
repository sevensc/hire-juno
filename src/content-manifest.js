// The files scaffolded into a user's own repo. This list is deliberately
// smaller than the whole package: LICENSE, CONTRIBUTING.md, and
// CODE_OF_CONDUCT.md govern contribution to THIS template project and
// have no business in a private company repo, so they never get copied.
// README.md is likewise the template project's own front door, not
// something to hand to an end user's repo — see the outro message in
// prompts.js for what they get instead.

export const CONTENT_FILES = [
  'CONSTITUTION.md',
  'parking-lot.md',
  'hr/hiring.md',
  'hr/probation.md',
  'hr/feedback-review.md',
  'hr/profile-template.md',
  'hr/ticket-template.md',
  'hr/assessment-center/process.md',
  'hr/assessment-center/examiner-security.md',
  'hr/assessment-center/examiner-expertise.md',
  'hr/assessment-center/examiner-brand.md',
  'hr/assessment-center/examiner-template.md',
  'hr/assessment-center/reports/report-template.md',
  'team/juno/profile.md',
  'team/juno/memory.md',
  'team/juno/journal.md',
  'team/juno/people-memory.md',
  'team/juno/skills/onboarding.md',
  'team/roster.md',
];

// Binary assets, copied byte-for-byte — never through CONTENT_FILES,
// whose scaffold() path reads every file as UTF-8 text and runs
// substitute() on it. Doing that to a PNG would decode its bytes as
// text (corrupting anything that isn't valid UTF-8) and hand back a
// broken image; checked by actually trying it against this file
// before writing this list, not assumed.
export const BINARY_FILES = ['team/juno/juno.png'];
