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
  // Pictures stay in the room; `url` is where this instance's tabs fetch them.
  const attachments = (message.attachments || []).map((a) => ({ id: a.id, name: a.name, mimeType: a.mimeType, url: `api/room-attachment?id=${a.id}` }));
  const base = { text: message.text, created_at: message.createdAt, attachments: attachments.length ? attachments : null, artifact: message.artifact || null };
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

// A person's @handle in the team room: the name in lower case, letters,
// digits, - and _ only. Matches personHandle in the browser code.
export function personHandle(name) {
  return String(name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]/g, '');
}

export function mentionsPerson(text, name) {
  const handle = personHandle(name);
  if (!handle) return false;
  return [...String(text || '').matchAll(MENTION)].some((m) => m[1].toLowerCase() === handle);
}

// Which team room messages notify this person (their choice in the chat):
// all | mentions (addressed to them: @name or a reply quoting them) |
// people (from people, not colleagues) | mine (colleagues' answers to
// what this person asked). `message` is the room message, `you` the room
// member this chat belongs to.
export const TEAM_NOTIFY_MODES = ['all', 'mentions', 'people', 'mine'];

export function shouldNotify(mode, message, you) {
  if (!message || message.memberId === you?.id && !message.agent) return false; // own messages
  switch (mode) {
    case 'mentions': {
      const quoted = String(message.text || '').match(/^> \*\*(.+?):\*\*/);
      return mentionsPerson(message.text, you?.name) || Boolean(quoted && quoted[1].toLowerCase() === String(you?.name || '').toLowerCase());
    }
    case 'people':
      return !message.agent;
    case 'mine':
      return Boolean(message.agent) && message.memberId === you?.id;
    default:
      return true;
  }
}

// The last few room messages as context lines for a colleague's prompt.
export function roomContextLines(messages) {
  return messages
    .map((m) => `[Team room] ${m.agent ? `${m.agent.name} (for ${m.memberName})` : m.memberName}: ${m.text}`)
    .join('\n');
}
