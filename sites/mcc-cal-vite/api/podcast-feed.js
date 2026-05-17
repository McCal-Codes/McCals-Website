import { applyCors } from './_lib/cors.js';

const FEED_URL = 'https://media.rss.com/cafeconnectpod/feed.xml';
const CACHE_TTL = 1000 * 60 * 15;

let cachedPayload = null;
let cachedAt = 0;

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTag(xml, tagName) {
  const tag = escapeRegex(tagName);
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return decodeXml(match?.[1] || '');
}

function getAttr(source, attrName) {
  const attr = escapeRegex(attrName);
  const match = source.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return decodeXml(match?.[1] || '');
}

function getSelfClosingTags(xml, tagName) {
  const tag = escapeRegex(tagName);
  return Array.from(xml.matchAll(new RegExp(`<${tag}\\b([^>]*)\\/?>`, 'gi'))).map((match) => match[1] || '');
}

function normalizeExplicit(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (['yes', 'true', 'explicit'].includes(normalized)) return true;
  if (['no', 'false', 'clean'].includes(normalized)) return false;
  return undefined;
}

function normalizeEpisodeType(value) {
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

function parseTranscripts(itemXml) {
  return getSelfClosingTags(itemXml, 'podcast:transcript')
    .map((attrs) => ({
      url: getAttr(attrs, 'url'),
      type: getAttr(attrs, 'type'),
      language: getAttr(attrs, 'language') || undefined,
      rel: getAttr(attrs, 'rel') || undefined,
    }))
    .filter((transcript) => transcript.url && transcript.type);
}

function parseEpisodes(xml) {
  return Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match, index) => {
    const itemXml = match[0];
    const enclosure = itemXml.match(/<enclosure\b([^>]*)\/?>/i)?.[1] || '';
    const imageAttrs = itemXml.match(/<itunes:image\b([^>]*)\/?>/i)?.[1] || '';
    const explicit = normalizeExplicit(getTag(itemXml, 'itunes:explicit'));

    return {
      guid: getTag(itemXml, 'guid') || `ep-${index}`,
      title: getTag(itemXml, 'title') || 'Episode',
      description: getTag(itemXml, 'description') || getTag(itemXml, 'itunes:summary') || '',
      pubDate: getTag(itemXml, 'pubDate') || '',
      link: getTag(itemXml, 'link') || '',
      platformUrl: getTag(itemXml, 'link') || '',
      audioUrl: getAttr(enclosure, 'url'),
      image: getAttr(imageAttrs, 'href'),
      duration: getTag(itemXml, 'itunes:duration') || undefined,
      episodeNumber: getTag(itemXml, 'itunes:episode') || undefined,
      episodeType: normalizeEpisodeType(getTag(itemXml, 'itunes:episodeType')),
      explicit,
      transcripts: parseTranscripts(itemXml),
    };
  });
}

async function loadFeed() {
  if (cachedPayload && Date.now() - cachedAt < CACHE_TTL) {
    return cachedPayload;
  }

  const response = await fetch(FEED_URL, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
  });

  if (!response.ok) {
    throw new Error(`RSS feed returned ${response.status}`);
  }

  const xml = await response.text();
  const episodes = parseEpisodes(xml);
  if (!episodes.length) {
    throw new Error('RSS feed did not include episodes');
  }

  cachedPayload = {
    feedUrl: FEED_URL,
    title: getTag(xml, 'title') || 'Caffeinated Connections',
    updatedAt: new Date().toISOString(),
    episodes,
  };
  cachedAt = Date.now();
  return cachedPayload;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  if (applyCors(req, res, { methods: 'GET, OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await loadFeed();
    res.status(200).json(payload);
  } catch (err) {
    console.error('[podcast-feed] Error:', err);
    res.status(502).json({ error: 'Failed to load podcast feed' });
  }
}
