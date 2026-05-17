/**
 * Podcast utility functions
 */

import type { Episode, EpisodeTranscript } from './types';
import { FEED_URL, PODCAST_IMAGE, CACHE_KEY, CACHE_TTL, FALLBACK } from './constants';

export function extractGuest(title: string): string {
  const m = title.match(/with\s+([^|–—:-]+)$/i) || title.match(/[–—-]\s*with\s+([^|:-]+)$/i);
  return m ? m[1].replace(/[\s–—-]+$/, '').trim() : '';
}

export function isNew(pubDate: string): boolean {
  return (Date.now() - new Date(pubDate).getTime()) < 7 * 86400000;
}

// Strips HTML tags using a regex — no DOM manipulation, no XSS risk.
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function textContent(item: Element, selector: string): string {
  return item.querySelector(selector)?.textContent?.trim() || '';
}

function tagText(item: Element, tagName: string): string {
  return item.getElementsByTagName(tagName)[0]?.textContent?.trim() || '';
}

function normalizeExplicit(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (['yes', 'true', 'explicit'].includes(normalized)) return true;
  if (['no', 'false', 'clean'].includes(normalized)) return false;
  return undefined;
}

function normalizeEpisodeType(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

function parseTranscripts(item: Element): EpisodeTranscript[] {
  return Array.from(item.getElementsByTagName('podcast:transcript'))
    .map((node) => ({
      url: node.getAttribute('url') || '',
      type: node.getAttribute('type') || '',
      language: node.getAttribute('language') || undefined,
      rel: node.getAttribute('rel') || undefined,
    }))
    .filter((transcript) => transcript.url && transcript.type);
}

function normalizeEpisode(episode: Episode): Episode {
  return {
    ...episode,
    platformUrl: episode.platformUrl || episode.link,
    transcripts: episode.transcripts || [],
  };
}

function normalizeEpisodes(episodes: Episode[]): Episode[] {
  return episodes.map(normalizeEpisode);
}

export function getCached(): Episode[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { episodes, ts } = JSON.parse(raw) as { episodes: Episode[]; ts: number };
    if (!Array.isArray(episodes)) return null;
    if (Date.now() - ts > CACHE_TTL) return normalizeEpisodes(episodes); // stale but usable
    return normalizeEpisodes(episodes);
  } catch {
    return null;
  }
}

export function setCache(episodes: Episode[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ episodes, ts: Date.now() }));
  } catch {
    // Podcast cache is opportunistic.
  }
}

export async function fetchFeed(): Promise<Episode[]> {
  const isDev = import.meta.env.DEV;
  const isLocalBuildPreview = !isDev && import.meta.env.VITE_VERCEL_ENV === 'development';

  if (isLocalBuildPreview) {
    return normalizeEpisodes(FALLBACK);
  }

  if (!isDev) {
    try {
      const response = await fetch('/api/podcast-feed', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const data = (await response.json()) as { episodes?: Episode[] };
        if (Array.isArray(data.episodes) && data.episodes.length > 0) {
          return normalizeEpisodes(data.episodes);
        }
      }
    } catch {
      // Fall back to client-side feed parsing below.
    }
  }

  let xml = '';

  // In dev, use the Vite proxy to avoid CORS issues
  const devProxyUrl = '/dev-rss-proxy/cafeconnectpod/feed.xml';

  if (isDev) {
    try {
      const r = await fetch(devProxyUrl, { signal: AbortSignal.timeout(8000) });
      if (r.ok) { xml = await r.text(); }
      else throw new Error();
    } catch {
      // fall through to public proxies
    }
  }

  if (!xml) {
    try {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) xml = ((await r.json()) as { contents: string }).contents || '';
      else throw new Error();
    } catch {
      const r2 = await fetch(`https://proxy.cors.sh/${FEED_URL}`, {
        headers: { 'x-cors-gratis': 'true' },
        signal: AbortSignal.timeout(8000),
      });
      if (r2.ok) xml = await r2.text();
      else throw new Error('All proxies failed');
    }
  }

  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item'));
  if (!items.length) throw new Error('No items');

  return normalizeEpisodes(items.map((item, i) => {
    const link = textContent(item, 'link');
    return {
      guid: textContent(item, 'guid') || `ep-${i}`,
      title: textContent(item, 'title') || 'Episode',
      description: item.querySelector('description')?.textContent || tagText(item, 'itunes:summary') || '',
      pubDate: textContent(item, 'pubDate'),
      link,
      platformUrl: link,
      audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
      image: item.getElementsByTagName('itunes:image')[0]?.getAttribute('href') || PODCAST_IMAGE,
      duration: tagText(item, 'itunes:duration') || undefined,
      episodeNumber: tagText(item, 'itunes:episode') || undefined,
      episodeType: normalizeEpisodeType(tagText(item, 'itunes:episodeType')),
      explicit: normalizeExplicit(tagText(item, 'itunes:explicit')),
      transcripts: parseTranscripts(item),
    };
  }));
}
