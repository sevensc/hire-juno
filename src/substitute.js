// Literal, exact-string substitution — never a blind <...> strip.
//
// The scaffolded files carry two different kinds of angle-bracket
// placeholder: a handful of setup placeholders this installer knows how
// to fill in (<workforce-id>, <company>, ...), and many more that are
// meant to stay literal — future-hire template slots in
// hr/profile-template.md, deliberately-unresolved cross-references,
// runtime instructions like <first-name-of-the-person-you-are-talking-to>
// in the adapter files. Replacing only known, exact keys is what keeps
// those untouched.

export function substitute(content, values) {
  let out = content;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(key).join(value);
  }
  return out;
}

// The co-owners placeholder in CONSTITUTION.md spans two lines in the
// source file. Keeping the exact string in one place avoids a subtle
// mismatch between this and the file on disk.
export const CO_OWNERS_PLACEHOLDER =
  '<name all co-owners/founders, e.g. "the three co-owners Anna\n' +
  'Example, Ben Example, Clara Example">';

// Note on what is deliberately NOT in here: the product repo a
// colleague opens tickets in. The installer asks for a remote for the
// workforce repo it is creating — which is a different repo from the
// product one, and equating the two would fill in a confident wrong
// answer. `hr/ticket-template.md` therefore describes that repo in
// words instead of carrying a placeholder nobody ever resolves.
export function buildSubstitutions({
  workforceId,
  company,
  supervisor,
  toolLabel,
  hiredDate,
  useCase,
  language,
}) {
  return {
    '<workforce-id>': workforceId,
    '<company>': company,
    '<supervisor>': supervisor,
    [CO_OWNERS_PLACEHOLDER]: supervisor,
    '<the day you put this template into service>': hiredDate,
    '<your-tool>': toolLabel,
    '<use-case>': useCase,
    '<language>': language,
  };
}
