/**
 * Enhanced Manifest Loader
 * 
 * Loads manifest data from the API with caching and error handling
 * Part of Phase 2: Next.js components implementation
 */

const MANIFEST_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface ManifestLoaderOptions {
  cacheTtl?: number;
  revalidate?: boolean;
  timeout?: number;
}

/**
 * Load a manifest from the API with optional caching
 */
export async function loadManifest<T>(
  path: string,
  remoteUrl?: string,
  options: ManifestLoaderOptions = {}
): Promise<T> {
  const { cacheTtl = CACHE_TTL, revalidate = false, timeout = 10000 } = options;
  const url = remoteUrl || path;
  const cacheKey = url;

  // Check cache first (unless revalidate is true)
  if (!revalidate && MANIFEST_CACHE.has(cacheKey)) {
    const cached = MANIFEST_CACHE.get(cacheKey)!;
    if (Date.now() - cached.timestamp < cacheTtl) {
      return cached.data as T;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json() as T;

    // Cache the result
    MANIFEST_CACHE.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Failed to fetch manifest from ${url}: Network error`);
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Manifest fetch timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Load manifest from API endpoint
 */
export async function loadManifestFromAPI<T>(
  type: string,
  apiUrl?: string,
  options?: ManifestLoaderOptions
): Promise<T> {
  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';
  const url = `${baseUrl}/api/v1/manifests/${type}`;
  return loadManifest<T>(url, undefined, options);
}

/**
 * Load multiple manifests in parallel
 */
export async function loadManifests<T extends Record<string, any>>(
  types: string[],
  apiUrl?: string,
  options?: ManifestLoaderOptions
): Promise<Record<string, any>> {
  const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';

  const results: Record<string, any> = {};
  const errors: Record<string, Error> = {};

  const promises = types.map(async (type) => {
    try {
      const data = await loadManifestFromAPI<any>(type, baseUrl, options);
      results[type] = data;
    } catch (error) {
      errors[type] = error as Error;
    }
  });

  await Promise.all(promises);

  // If there are errors, throw a combined error
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.entries(errors)
      .map(([type, error]) => `${type}: ${error.message}`)
      .join('\n');
    throw new Error(`Failed to load some manifests:\n${errorMessages}`);
  }

  return results as T;
}

/**
 * Clear the manifest cache
 */
export function clearManifestCache(path?: string): void {
  if (path) {
    MANIFEST_CACHE.delete(path);
  } else {
    MANIFEST_CACHE.clear();
  }
}

/**
 * Get cache statistics
 */
export function getManifestCacheStats(): {
  size: number;
  entries: Array<{ key: string; age: number }>;
} {
  const now = Date.now();
  const entries = Array.from(MANIFEST_CACHE.entries()).map(([key, { timestamp }]) => ({
    key,
    age: now - timestamp,
  }));

  return {
    size: MANIFEST_CACHE.size,
    entries,
  };
}
