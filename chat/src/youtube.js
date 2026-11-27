// YouTube links in a message: their video ids, so the message can show a
// player under the text. Only real YouTube addresses count (youtube.com
// with watch, shorts, live or embed, m./music./www., youtu.be); the id is
// always the 11 characters YouTube uses, nothing else gets through.

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

export function youtubeId(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  let id = null;
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1];
  } else if (HOSTS.has(host)) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'live', 'embed'].includes(parts[0])) id = parts[1];
  }
  return id && ID.test(id) ? id : null;
}

// Start second from ?t= / &start= (e.g. "90", "1m30s"), or 0.
export function youtubeStart(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return 0;
  }
  const raw = url.searchParams.get('t') || url.searchParams.get('start') || '';
  if (/^\d+s?$/.test(raw)) return parseInt(raw, 10);
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m && raw ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) : 0;
}

// The videos linked in a text, in order, each once, at most `max`.
export function youtubeVideos(text, max = 3) {
  const out = [];
  for (const match of String(text || '').matchAll(/https?:\/\/[^\s<>()"'\]]+/g)) {
    const id = youtubeId(match[0]);
    if (id && !out.some((v) => v.id === id)) out.push({ id, start: youtubeStart(match[0]) });
    if (out.length >= max) break;
  }
  return out;
}

// The player address: the privacy-enhanced domain (no cookies until the
// video plays), started right away because the tap that asked for it is
// the user's gesture, inline on phones.
export function youtubeEmbedUrl({ id, start = 0 }) {
  const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0' });
  if (start) params.set('start', String(start));
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export function youtubeThumbnail(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
