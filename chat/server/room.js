// Helpers for showing the team room (chat/room/server.js) as a channel in
// a chat instance. Kept apart from server/index.js so they can be tested
// without a running server.

export const ROOM_CHANNEL_ID = 'team-room';

const MENTION = /@([a-z][a-z0-9_-]*)/gi;

// Colleagues this message @mentions by id, in order, without duplicates.
// Only explicit names: "@all"/"@everyone" in the team room address the
// people, so they bring in no colleague.
export function roomMentions(text, roster) {
  const ids = new Set(roster.map((c) => c.id.toLowerCase()));
  const out = [];
  for (const match of String(text).matchAll(MENTION)) {
    const id = match[1].toLowerCase();
    if (ids.has(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

// One room message as a channel history row for this instance's tabs.
// `youId`: the room member this instance belongs to. `knownIds`: the
// colleague ids of this workforce, so a colleague's reply gets her avatar.
export function roomRow(message, youId, knownIds) {
  const base = { text: message.text, created_at: message.createdAt, attachments: null };
  if (message.agent) {
    const onBehalf = message.memberId === youId ? '' : ` · for ${message.memberName}`;
    return {
      ...base,
      sender_id: knownIds.has(message.agent.id) ? message.agent.id : `agent:${message.agent.id}`,
      sender_name: `${message.agent.name}${onBehalf}`,
    };
  }
  if (message.memberId === youId) return { ...base, sender_id: 'you', sender_name: null };
  return { ...base, sender_id: `human:${message.memberId}`, sender_name: message.memberName };
}

// The last few room messages as context lines for a colleague's prompt.
export function roomContextLines(messages) {
  return messages
    .map((m) => `[Team room] ${m.agent ? `${m.agent.name} (for ${m.memberName})` : m.memberName}: ${m.text}`)
    .join('\n');
}
