import { useState, useEffect, useRef } from 'react';
import type { UseManifestResult } from './types';
import { fetchSupabaseJournalismEvents, mergeJournalismEvents } from './journalismSupabaseSource';

const REPO_CDN_BASE = 'https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main';
const PORTFOLIOS_BASE = 'src/images/Portfolios';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes, matching widget behaviour
const MANIFEST_FILE_MAP: Record<string, string> = {
  concert: 'concert-manifest.json',
  concerts: 'concert-manifest.json',
  events: 'events-manifest.json',
  event: 'events-manifest.json',
  journalism: 'journalism-manifest.json',
  photojournalism: 'journalism-manifest.json',
  nature: 'nature-manifest.json',
  portrait: 'portrait-manifest.json',
  portraits: 'portrait-manifest.json',
  featured: 'featured-manifest.json',
  universal: 'portfolio-manifest.json',
};

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

// Use local images in development, CDN in production
const IS_DEV = import.meta.env.DEV;

function encodeURIPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function toGithubUrl(repoRelativePath: string): string {
  return `${REPO_CDN_BASE}/${encodeURIPath(repoRelativePath)}`;
}

function toLocalUrl(repoRelativePath: string): string {
  // Use raw path - Vite plugin will handle decoding
  const url = `/${repoRelativePath}`;
  if (IS_DEV) {
    // Debug logging in development only
    // console.log(`Local URL: ${url}`);
  }
  return url;
}

function getManifestFile(type: string): string | undefined {
  return MANIFEST_FILE_MAP[type.toLowerCase()];
}

async function parseJsonResponse<T>(response: Response, source: string): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.replace(/\s+/g, ' ').slice(0, 80);
    const contentType = response.headers.get('content-type') || 'unknown content type';
    throw new Error(
      `Expected JSON from ${source}, received ${contentType}${preview ? `: ${preview}` : ''}`,
    );
  }
}

async function fetchStaticManifestJson<T>(
  staticFile: string,
  signal: AbortSignal,
  apiError?: unknown,
): Promise<T> {
  const staticUrl = `/manifests/${staticFile}`;
  const response = await fetch(staticUrl, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const apiMessage = apiError instanceof Error ? `; API error: ${apiError.message}` : '';
    throw new Error(`Manifest fallback failed: ${response.status}${apiMessage}`);
  }

  return parseJsonResponse<T>(response, staticUrl);
}

interface JournalismLikeManifest {
  events: { eventName: string }[];
  categories?: string[];
}

/**
 * How long the gallery will wait on Supabase before rendering without it. The
 * static manifest has already resolved by this point and holds everything
 * needed to draw the page, so the merge is an enhancement and must never be
 * what the visitor is waiting for. A failing request returns quickly; a
 * *hanging* one — a paused project, a stalled socket, a captive portal — would
 * otherwise hold the page on a skeleton until the browser's own socket
 * timeout, which can be minutes.
 */
const SUPABASE_MERGE_TIMEOUT_MS = 5000;

async function mergeJournalismWithSupabase<T>(staticData: T, signal: AbortSignal): Promise<T> {
  const manifest = staticData as unknown as JournalismLikeManifest;

  // staticData is cast from an unvalidated fetch response. If it is not the
  // shape we expect, fall back to it untouched rather than throwing: the
  // journalism page degrading to static-only content is the whole point.
  if (!Array.isArray(manifest.events)) return staticData;

  const controller = new AbortController();
  const abortMerge = () => controller.abort();

  if (signal.aborted) {
    controller.abort();
  } else {
    signal.addEventListener('abort', abortMerge, { once: true });
  }

  const timeout = setTimeout(abortMerge, SUPABASE_MERGE_TIMEOUT_MS);

  try {
    const supabaseEvents = await fetchSupabaseJournalismEvents(controller.signal);
    if (supabaseEvents.length === 0) return staticData;

    return {
      ...manifest,
      events: mergeJournalismEvents(manifest.events, supabaseEvents),
    } as unknown as T;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abortMerge);
  }
}

async function fetchManifestJson<T>(type: string, signal: AbortSignal): Promise<T> {
  const apiUrl = `/api/manifests/${type}`;
  const staticFile = getManifestFile(type);

  if (staticFile) {
    const staticData = await fetchStaticManifestJson<T>(staticFile, signal);
    if (type.toLowerCase() === 'journalism') {
      return mergeJournalismWithSupabase(staticData, signal);
    }
    return staticData;
  }

  let apiError: unknown;

  try {
    const response = await fetch(apiUrl, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Manifest fetch failed: ${response.status}`);
    }

    return await parseJsonResponse<T>(response, apiUrl);
  } catch (error) {
    apiError = error;
  }

  if (!staticFile) {
    throw apiError instanceof Error ? apiError : new Error('Unknown manifest error');
  }

  return fetchStaticManifestJson<T>(staticFile, signal, apiError);
}

/**
 * Image URL builders — one per manifest type.
 * Each matches the exact path pattern its manifest uses.
 */
export const imageUrl = {
  /** journalism: image.path is filename only; folderPath is relative to Portfolios/Journalism/ */
  journalism(folderPath: string, filename: string): string {
    const path = `${PORTFOLIOS_BASE}/Journalism/${folderPath}/${filename}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },

  /** concerts: image is filename only; relativeFolderPath already includes "Concert/Band/Month" */
  concert(relativeFolderPath: string, filename: string): string {
    const path = `${PORTFOLIOS_BASE}/${relativeFolderPath}/${filename}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },

  /** events: image.path is already a full repo-relative path starting with "src/images/..." */
  event(fullPath: string): string {
    return IS_DEV ? toLocalUrl(fullPath) : toGithubUrl(fullPath);
  },

  /** portraits: image is filename (may include album subfolder); folderPath is relative to Portfolios/Portrait/ */
  portrait(folderPath: string, imageFilename: string): string {
    const path = `${PORTFOLIOS_BASE}/Portrait/${folderPath}/${imageFilename}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },

  /** nature: image is filename only; folderPath is relative to Portfolios/Nature/ */
  nature(folderPath: string, filename: string): string {
    const path = `${PORTFOLIOS_BASE}/Nature/${folderPath}/${filename}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },

  /** nature thumbs: prebuilt webp thumbnails mirrored under Portfolios/Nature/thumbs/ */
  natureThumb(folderPath: string, filename: string): string {
    const thumbFilename = filename.replace(/_webuse(?=\.[^.]+$)/i, '').replace(/\.[^.]+$/, '.webp');
    const path = `${PORTFOLIOS_BASE}/Nature/thumbs/${folderPath}/${thumbFilename}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },

  /** featured: mixed types — same as concert, uses relativeFolderPath */
  featured(relativeFolderPath: string, filename: string): string {
    const path = `${PORTFOLIOS_BASE}/${relativeFolderPath}/${filename}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },
};

export function useManifest<T>(type: string): UseManifestResult<T> {
  const [status, setStatus] = useState<UseManifestResult<T>['status']>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!type) return;

    let controller: AbortController | null = null;
    const timer = window.setTimeout(() => {
      const cached = memoryCache.get(type) as CacheEntry<T> | undefined;
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        setData(cached.data);
        setStatus('success');
        return;
      }

      abortRef.current?.abort();
      controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      setError(null);

      fetchManifestJson<T>(type, controller.signal)
        .then((json) => {
          memoryCache.set(type, { data: json, fetchedAt: Date.now() });
          setData(json);
          setStatus('success');
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setError(err.message ?? 'Unknown error');
          setStatus('error');
        });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller?.abort();
    };
  }, [type]);

  return { data, status, error };
}
