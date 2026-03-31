import { useState, useEffect, useRef } from 'react';
import type { UseManifestResult } from './types';

const GITHUB_RAW = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main';
const PORTFOLIOS_BASE = 'src/images/Portfolios';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes, matching widget behaviour

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function encodeURIPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function toGithubUrl(repoRelativePath: string): string {
  return `${GITHUB_RAW}/${encodeURIPath(repoRelativePath)}`;
}

/**
 * Image URL builders — one per manifest type.
 * Each matches the exact path pattern its manifest uses.
 */
export const imageUrl = {
  /** journalism: image.path is filename only; folderPath is relative to Portfolios/Journalism/ */
  journalism(folderPath: string, filename: string): string {
    return toGithubUrl(`${PORTFOLIOS_BASE}/Journalism/${folderPath}/${filename}`);
  },

  /** concerts: image is filename only; relativeFolderPath already includes "Concert/Band/Month" */
  concert(relativeFolderPath: string, filename: string): string {
    return toGithubUrl(`${PORTFOLIOS_BASE}/${relativeFolderPath}/${filename}`);
  },

  /** events: image.path is already a full repo-relative path starting with "src/images/..." */
  event(fullPath: string): string {
    return toGithubUrl(fullPath);
  },

  /** portraits: image is filename (may include album subfolder); folderPath is relative to Portfolios/Portrait/ */
  portrait(folderPath: string, imageFilename: string): string {
    return toGithubUrl(`${PORTFOLIOS_BASE}/Portrait/${folderPath}/${imageFilename}`);
  },

  /** nature: image is filename only; folderPath is relative to Portfolios/Nature/ */
  nature(folderPath: string, filename: string): string {
    return toGithubUrl(`${PORTFOLIOS_BASE}/Nature/${folderPath}/${filename}`);
  },

  /** featured: mixed types — same as concert, uses relativeFolderPath */
  featured(relativeFolderPath: string, filename: string): string {
    return toGithubUrl(`${PORTFOLIOS_BASE}/${relativeFolderPath}/${filename}`);
  },
};

export function useManifest<T>(type: string): UseManifestResult<T> {
  const [status, setStatus] = useState<UseManifestResult<T>['status']>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!type) return;

    const cached = memoryCache.get(type) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setData(cached.data);
      setStatus('success');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);

    fetch(`/api/manifests/${type}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
        return res.json() as Promise<T>;
      })
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

    return () => controller.abort();
  }, [type]);

  return { data, status, error };
}
