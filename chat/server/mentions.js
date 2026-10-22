// Slack-style "@name" mentions, matched against a channel's own member
// ids — not a general-purpose mention parser, just enough to decide
// who a channel message is actually for. Case-insensitive since typing
// "@Nora" should work the same as "@nora"; ids themselves are always
// lowercase (folder names).
const MENTION_PATTERN = /@([a-z][a-z0-9_-]*)/gi;

// Two reserved words that address every member at once instead of one
// by name, so that addressing everyone individually isn't necessary.
// Neither is ever a real colleague id (folder names), so there's
// no collision to worry about.
const ALL_KEYWORDS = new Set(['all', 'everyone']);

// Returns the subset of `memberIds` mentioned in `text`, in the order
// they first appear, without duplicates. A member who mentions herself
// is excluded via `excludeId` (the message's own sender) — mentioning
// yourself isn't a request for a reply. `@all`/`@everyone` short-circuits
// to every other member, regardless of which specific names also appear
// alongside it.
export function extractMentions(text, memberIds, excludeId) {
  const memberSet = new Set(memberIds.map((id) => id.toLowerCase()));
  const seen = new Set();
  const mentioned = [];
  let mentionsEveryone = false;
  for (const match of text.matchAll(MENTION_PATTERN)) {
    const id = match[1].toLowerCase();
    if (id === excludeId) continue;
    if (ALL_KEYWORDS.has(id)) {
      mentionsEveryone = true;
      continue;
    }
    if (seen.has(id) || !memberSet.has(id)) continue;
    seen.add(id);
    mentioned.push(id);
  }
  if (mentionsEveryone) {
    return memberIds.filter((id) => id.toLowerCase() !== excludeId);
  }
  return mentioned;
}

// A colleague addressing another one directly, by plain name, the way a
// person actually talks instead of typing "@name" (e.g. "Rami — du
// hattest ... angeboten"). Without this the addressed colleague would
// never be dispatched, because such a line has no "@" in it at all. Recognized only at the very start of a paragraph
// (text.matchAll with the 'm' flag's `^` — a fresh line, not a name
// mentioned in passing mid-sentence: "das hat schon Rami geprüft" must
// NOT trigger her, or a reply crediting a name anywhere in its text
// would re-open the colleague-to-colleague loop server/index.js's
// relayChannelMessage deliberately shut down for anything short of an
// explicit address), immediately followed by the punctuation a person
// naturally addresses someone with — "Rami — ", "Rami, ", "Rami: ".
// Deterministic, same as `@name`, not the AI relevance classifier
// (gatekeeper.js) — this only recognizes a structurally explicit
// address spelled a different way, it doesn't guess at relevance.
const VOCATIVE_PATTERN = /^([\p{L}][\p{L} '-]*?)\s*[—,:]\s/gmu;

// `names`: Map<lowercase display name, colleague id> — this module
// otherwise only ever sees ids (folder names), never the display names
// a person actually writes ("Rami" vs. the colleague id, which happens
// to match here but isn't guaranteed to elsewhere).
export function extractVocativeAddresses(text, names, memberIds, excludeId) {
  const memberSet = new Set(memberIds.map((id) => id.toLowerCase()));
  const seen = new Set();
  const addressed = [];
  for (const match of text.matchAll(VOCATIVE_PATTERN)) {
    const id = names.get(match[1].trim().toLowerCase());
    if (!id || id === excludeId || seen.has(id) || !memberSet.has(id.toLowerCase())) continue;
    seen.add(id);
    addressed.push(id);
  }
  return addressed;
}
