// The "who's this for?" classifier for a channel message that carries
// no explicit @mention. Colleagues should be able to recognize
// themselves as relevant instead of always being tagged by name. Doing that by actually running every member's own turn just to
// ask "is this yours?" would mean N full, billed replies per message —
// exactly the cost problem explicit @mention was there to avoid. This
// is the cheap alternative: one small, stateless, tool-less classifier
// call (Haiku, no thinking, a single turn) that reads the message and
// the channel's own member list and decides who — if anyone — would
// naturally speak up, the way a real colleague only jumps into a
// channel when a message is actually theirs to answer.
//
// Explicit @mention (see mentions.js) never goes through this at all —
// it's the free, deterministic, unambiguous path. This only runs as
// the fallback for a message that named no one.
//
// `outputFormat: {type: 'json_schema', ...}` (verified against the
// SDK's own type declarations — `sdk.d.ts`'s `JsonSchemaOutputFormat`
// and the `structured_output` field on a success result) forces a
// strictly-shaped answer instead of parsing free text, so there's
// nothing here to misparse.
import { query } from '@anthropic-ai/claude-agent-sdk';

const RELEVANCE_SCHEMA = {
  type: 'object',
  properties: {
    relevant: {
      type: 'array',
      items: { type: 'string' },
      description: 'ids of the members who would naturally respond to this message — empty if none would',
    },
  },
  required: ['relevant'],
};

// Same shape claude.js's own summarizeUsage() produces, duplicated
// rather than imported — this is the only other place that reads a
// result message's modelUsage, and importing across adapters/
// boundaries for four lines felt like the wrong coupling.
function summarizeUsage(message) {
  const modelUsage = message.modelUsage || {};
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheTokens = 0;
  for (const usage of Object.values(modelUsage)) {
    inputTokens += usage.inputTokens || 0;
    outputTokens += usage.outputTokens || 0;
    cacheTokens += (usage.cacheReadInputTokens || 0) + (usage.cacheCreationInputTokens || 0);
  }
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens + cacheTokens,
    costUsd: message.total_cost_usd,
  };
}

// `members` is `[{id, name, role}]` for everyone eligible to answer
// (the sender herself is already excluded by the caller). Returns
// `{ relevant, usage }`: `relevant` is an array of member ids, always
// a subset of `members` — never more, and [] on any failure (a broken
// classifier should mean silence, not a spray of unwanted replies;
// fails closed like the rest of this feature's permission handling
// does). `usage` is the classifier call's own token/cost cost, so it
// can be surfaced; null when the call never got a result (the fail-
// closed path) so a caller can tell "no answer" apart from "answer
// cost nothing".
// `recentTurns` is a short, already-formatted trailing slice of the
// channel's history (oldest first, newest last) — plain display-name-
// prefixed lines, the same shape the dispatch prompt itself uses.
// A message that's a bare reply to a still-open question
// ("1. ja go. 2. ok gut.") carries no self-contained signal at all —
// no name, no visible task — when the classifier only ever sees that
// one line in isolation. It read as addressed to nobody and got
// silently dropped (this call's own fail-closed design means that
// looks exactly like a healthy "nothing to say", not an error), even
// though it was plainly an answer to the two numbered questions a
// colleague had just asked. A few lines of trailing context are enough
// for the classifier to recognize "this continues the open thread",
// without turning this back into a full-history call on every message.
export async function decideRelevance({ senderName, text, members, recentTurns = [] }) {
  if (members.length === 0) return { relevant: [], usage: null };

  const roster = members.map((m) => `- ${m.id}: ${m.name} (${m.role})`).join('\n');
  const context = recentTurns.length
    ? `Recent channel history, oldest first (for context only — the message to decide on is the last line below):\n` +
      recentTurns.join('\n') +
      `\n\n`
    : '';
  const prompt =
    `A message just arrived in a group chat. Decide which of these people, if any, ` +
    `would naturally respond to it — the way a real colleague only speaks up when a ` +
    `message is actually about their area or clearly meant for them, not every ` +
    `message in every channel they're a member of.\n\n` +
    `Members:\n${roster}\n\n` +
    context +
    `Message from ${senderName}: ${text}\n\n` +
    `A short reply with no addressee of its own ("ja, mach das", "1. go 2. ok", ` +
    `"passt so") that directly continues an open question or offer from the ` +
    `history above is addressed to whoever asked it — treat that continuation as ` +
    `the addressing signal, the same as a name would be, rather than judging the ` +
    `line in isolation and finding no one it's for.\n\n` +
    `First check whether the message is actually addressed to the group at all — ` +
    `that's the real signal, not something to override with a role guess. A plain ` +
    `social opener directed at everyone ("Moin zusammen", "hallo alle", "guten ` +
    `Morgen team") still counts as addressed even with no concrete task attached — ` +
    `and so does a bare one-word greeting with no explicit collective marker at ` +
    `all ("Hi", "Hey", "Hallo", "Moin" on its own): posted into a channel with no ` +
    `other addressee named or implied, it has nowhere else to be directed *but* ` +
    `the group, the same as if "zusammen"/"alle"/"team" had been said out loud — ` +
    `don't read the absence of that word as the absence of an addressee. ` +
    `Staying silent after being directly greeted reads as rude in a real workplace, ` +
    `so include the members who'd naturally acknowledge it — for a small channel ` +
    `that's usually everyone present, a greeting isn't role-specific. Only a remark ` +
    `with no addressee at all ("nice weather today", thinking out loud) or something ` +
    `clearly meant only for the human running the chat resolves to nobody.\n\n` +
    `For an actual task or question, plural or collective address ("you all", ` +
    `"könntet ihr", "zusammen", "team", "Leute", "alle") still means more than one ` +
    `person is meant, but now filtered by who the task is actually for: when ` +
    `several members' roles plausibly fit (e.g. a review request and several ` +
    `members do that kind of work), include all of them rather than picking just ` +
    `the closest single match — under-including a group request is exactly the ` +
    `failure mode this check exists to avoid. When only one member's role fits, ` +
    `the plural address doesn't stretch to include the others just because they're ` +
    `in the channel. Singular or clearly individual address ("kannst du", one name ` +
    `implied by context) is the case for staying narrow regardless of who else is ` +
    `present.\n\n` +
    `Don't guess generously beyond what the message itself is actually asking for ` +
    `or addressed to: a false positive costs someone a real, billed reply she had ` +
    `nothing to say — but a false negative leaves someone who was genuinely ` +
    `addressed without any response at all, which is the worse failure mode ` +
    `(for a task as well as for a plain greeting).`;

  try {
    const session = query({
      prompt,
      options: {
        model: 'haiku',
        // No maxTurns cap: a `json_schema` outputFormat
        // turn sometimes takes two internal turns (thinking, then the
        // end-turn tool call that actually carries the structured
        // output) even for a one-shot prompt like this — capping it at
        // 1 made an otherwise-successful classification throw
        // "Reached maximum number of turns" instead of returning an
        // answer, non-deterministically (a shorter completion fit in
        // one turn, a longer one didn't). Letting the turn finish
        // naturally costs nothing extra: the model still stops as soon
        // as it has an answer.
        outputFormat: { type: 'json_schema', schema: RELEVANCE_SCHEMA },
      },
    });
    for await (const message of session) {
      if (message.type === 'result' && message.subtype === 'success') {
        const usage = summarizeUsage(message);
        const ids = message.structured_output?.relevant;
        if (!Array.isArray(ids)) return { relevant: [], usage };
        const known = new Set(members.map((m) => m.id));
        return { relevant: ids.filter((id) => known.has(id)), usage };
      }
    }
    return { relevant: [], usage: null };
  } catch {
    return { relevant: [], usage: null };
  }
}
