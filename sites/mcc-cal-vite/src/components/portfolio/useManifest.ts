import { useState, useEffect, useRef } from 'react';
import type { UseManifestResult } from './types';

const GITHUB_RAW = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes, matching widget behaviour

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getImageUrl(relativePath: string): string {
  const clean = relativePath.startsWith('src/') ? relativePath : `src/images/Portfolios/${relativePath}`;
  return `${GITHUB_RAW}/${encodeURIPath(clean)}`;
}

function encodeURIPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

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
