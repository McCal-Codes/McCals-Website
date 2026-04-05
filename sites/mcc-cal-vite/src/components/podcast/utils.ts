/**
 * Podcast utility functions
 */

import type { Episode } from './types';
import { FEED_URL, PODCAST_IMAGE, CACHE_KEY, CACHE_TTL } from './constants';

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

export function getCached(): Episode[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { episodes, ts } = JSON.parse(raw) as { episodes: Episode[]; ts: number };
    if (!Array.isArray(episodes)) return null;
    if (Date.now() - ts > CACHE_TTL) return episodes; // stale but usable
    return episodes;
  } catch {
    return null;
  }
}

export function setCache(episodes: Episode[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ episodes, ts: Date.now() })); } catch {}
}

export async function fetchFeed(): Promise<Episode[]> {
  let xml = '';

  // In dev, use the Vite proxy to avoid CORS issues
  const devProxyUrl = '/dev-rss-proxy/cafeconnectpod/feed.xml';
  const isDev = import.meta.env.DEV;

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

  return items.map((item, i) => ({
    guid: item.querySelector('guid')?.textContent?.trim() || `ep-${i}`,
    title: item.querySelector('title')?.textContent?.trim() || 'Episode',
    description: item.querySelector('description')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
    audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
    image: item.querySelector('itunes\\:image')?.getAttribute('href') || PODCAST_IMAGE,
  }));
}
