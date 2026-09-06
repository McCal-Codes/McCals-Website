import { useState, useEffect, useRef } from 'react';
import type { UseManifestResult } from './types';
import { fetchSupabaseJournalismEvents, mergeJournalismEvents } from './journalismSupabaseSource';
import { fetchSupabaseNatureCollections, mergeNatureCollections } from './natureSupabaseSource';

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

/**
 * Describes how one gallery folds its Supabase-published shoots into the static
 * manifest. Galleries disagree about what the group array is called and what
 * names its entries by, so that is data here rather than a branch: `events`
 * keyed by `eventName` for journalism, `collections` keyed by `collectionName`
 * for nature.
 */
interface SupabaseMergeSpec<Row> {
  /** Key on the manifest holding the array of shoots. */
  groupKey: string;
  fetch: (signal: AbortSignal) => Promise<Row[]>;
  /**
   * `staticGroups` is deliberately `unknown[]`: it comes from a fetched JSON
   * body that nothing validates, so each merge asserts the shape it needs at
   * the registry below rather than this type pretending it was checked.
   */
  merge: (staticGroups: unknown[], rows: Row[]) => unknown[];
}

/**
 * How long the gallery will wait on Supabase before rendering without it. The
 * static manifest has already resolved by this point and holds everything
 * needed to draw the page, so the merge is an enhancement and must never be
 * what the visitor is waiting for. A failing request returns quickly; a
 * *hanging* one, a paused project, a stalled socket, a captive portal, would
 * otherwise hold the page on a skeleton until the browser's own socket
 * timeout, which can be minutes.
 */
const SUPABASE_MERGE_TIMEOUT_MS = 5000;

async function applySupabaseMerge<T, Row>(
  spec: SupabaseMergeSpec<Row>,
  staticData: T,
  signal: AbortSignal,
): Promise<T> {
  const manifest = staticData as unknown as Record<string, unknown>;
  const staticGroups = manifest?.[spec.groupKey];

  // staticData is cast from an unvalidated fetch response. If it is not the
  // shape we expect, fall back to it untouched rather than throwing: the
  // gallery degrading to static-only content is the whole point.
  if (!Array.isArray(staticGroups)) return staticData;

  const controller = new AbortController();
  const abortMerge = () => controller.abort();

  if (signal.aborted) {
    controller.abort();
  } else {
    signal.addEventListener('abort', abortMerge, { once: true });
  }

  const timeout = setTimeout(abortMerge, SUPABASE_MERGE_TIMEOUT_MS);

  try {
    const rows = await spec.fetch(controller.signal);
    if (rows.length === 0) return staticData;

    return {
      ...manifest,
      [spec.groupKey]: spec.merge(staticGroups, rows),
    } as unknown as T;
  } catch {
    // The sources swallow their own failures and return [], so this should be
    // unreachable. It is here because the alternative is not a degraded
    // gallery, it is a thrown manifest fetch and an error page: the static
    // content is already in hand at this point, and losing it to an enhancement
    // that failed would invert the whole point of merging.
    return staticData;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abortMerge);
  }
}

/**
 * Which galleries consult Supabase, keyed by the type string callers pass to
 * `useManifest`. Aliases are listed explicitly: `photojournalism` resolves to
 * the journalism manifest, and before this was a table it was compared against
 * the literal 'journalism', so the alias silently skipped the merge and showed
 * a staler gallery than `/journalism` did.
 *
 * A gallery absent from this table simply renders its static manifest, which is
 * what makes adding one a contained change.
 */
const SUPABASE_MERGES: Record<
  string,
  <T>(staticData: T, signal: AbortSignal) => Promise<T>
> = {
  journalism: (staticData, signal) =>
    applySupabaseMerge(
      {
        groupKey: 'events',
        fetch: fetchSupabaseJournalismEvents,
        merge: (groups, rows) => mergeJournalismEvents(groups as { eventName: string }[], rows),
      },
      staticData,
      signal,
    ),
  photojournalism: (staticData, signal) =>
    applySupabaseMerge(
      {
        groupKey: 'events',
        fetch: fetchSupabaseJournalismEvents,
        merge: (groups, rows) => mergeJournalismEvents(groups as { eventName: string }[], rows),
      },
      staticData,
      signal,
    ),
  nature: (staticData, signal) =>
    applySupabaseMerge(
      {
        groupKey: 'collections',
        fetch: fetchSupabaseNatureCollections,
        merge: (groups, rows) =>
          mergeNatureCollections(groups as { collectionName: string }[], rows),
      },
      staticData,
      signal,
    ),
};

async function fetchManifestJson<T>(type: string, signal: AbortSignal): Promise<T> {
  const apiUrl = `/api/manifests/${type}`;
  const staticFile = getManifestFile(type);

  if (staticFile) {
    const staticData = await fetchStaticManifestJson<T>(staticFile, signal);
    const merge = SUPABASE_MERGES[type.toLowerCase()];
    return merge ? merge(staticData, signal) : staticData;
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
 * Image URL builders, one per manifest type.
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

  /** featured: mixed types, same as concert, uses relativeFolderPath */
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
