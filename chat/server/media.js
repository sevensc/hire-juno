// Shared media of one conversation, or of all of them: the pictures, the
// links and the documents (team room transcripts and documents) that were
// shared, newest first, each saying where and by whom. Pure, so it can be
// tested without a running server; server/index.js gathers the inputs.

const URL_PATTERN = /https?:\/\/[^\s<>()"'`\]]+/g;
const LIMIT = 300;

// The web addresses in a text, each once, without trailing punctuation.
export function linksIn(text) {
  const out = [];
  for (const match of String(text || '').matchAll(URL_PATTERN)) {
    const url = match[0].replace(/[.,;:!?*_]+$/, '');
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') continue;
    } catch {
      continue;
    }
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

// `stored`: store.media(...) for the conversations kept in this chat.
// `roomMessages`: the team room's messages (only when the team room is in
// scope). `where(item)` and `who(item)` turn ids into labels.
export function buildMedia({ stored = { pictures: [], linkMessages: [] }, roomMessages = [], where, who }) {
  const pictures = stored.pictures.map((p) => ({
    url: `api/attachment?id=${p.id}`,
    name: p.name,
    createdAt: p.createdAt,
    where: where(p),
    who: who(p),
  }));
  const links = [];
  const seen = new Set();
  const addLinks = (item, text) => {
    for (const url of linksIn(text)) {
      if (seen.has(url)) continue; // newest first: the first one wins
      seen.add(url);
      links.push({ url, createdAt: item.createdAt, where: where(item), who: who(item) });
    }
  };
  const docs = [];
  const room = roomMessages.map((m) => ({ ...m, channelId: 'team-room', createdAt: m.createdAt })).reverse();
  for (const m of room) {
    for (const a of m.attachments || []) {
      pictures.push({ url: `api/room-attachment?id=${a.id}`, name: a.name, createdAt: m.createdAt, where: where(m), who: who(m) });
    }
    if (m.artifact) docs.push({ id: m.artifact.id, kind: m.artifact.kind, title: m.artifact.title || m.text, createdAt: m.createdAt, where: where(m), who: who(m) });
  }
  const linkSources = [...stored.linkMessages, ...room.filter((m) => !m.artifact && /https?:\/\//.test(m.text || ''))];
  linkSources.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  for (const item of linkSources) addLinks(item, item.text);
  const newest = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt));
  return {
    pictures: pictures.sort(newest).slice(0, LIMIT),
    links: links.slice(0, LIMIT),
    docs: docs.sort(newest).slice(0, LIMIT),
  };
}
