/**
 * React Hooks for API Integration
 * 
 * Custom hooks for fetching and managing API data
 * Part of Phase 2: Next.js components implementation
 */

import { useState, useEffect, useCallback } from 'react';
import { Manifest, BlogPost, BlogPostSummary, fetchBlogPost, fetchBlogPosts } from './api-client';
import { loadManifestFromAPI } from './manifestLoader';

export interface UseManifestState {
  data: Manifest | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseBlogPostsState {
  posts: BlogPostSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch manifest data
 */
export function useManifest(type: string, apiUrl?: string): UseManifestState {
  const [data, setData] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const manifest = await loadManifestFromAPI<Manifest>(type, apiUrl, {
        revalidate: true,
      });
      setData(manifest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [type, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to fetch blog posts
 */
export function useBlogPosts(blogBase?: string): UseBlogPostsState {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogPosts(blogBase);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [blogBase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
}

/**
 * Hook to fetch a single blog post
 */
export function useBlogPost(slug?: string, blogBase?: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!slug) {
      setPost(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogPost(slug, blogBase);
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [slug, blogBase]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}

/**
 * Hook to fetch multiple manifests
 */
export function useManifests(types: string[], apiUrl?: string) {
  const [data, setData] = useState<Record<string, Manifest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';
      const results: Record<string, Manifest> = {};

      const promises = types.map(async (type) => {
        try {
          const manifest = await loadManifestFromAPI<Manifest>(type, baseUrl, {
            revalidate: true,
          });
          results[type] = manifest;
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error(`Failed to load ${type} manifest:`, err);
          }
        }
      });

      await Promise.all(promises);
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [types, apiUrl]);

  useEffect(() => {
    if (types.length > 0) {
      fetchData();
    }
  }, [fetchData, types.length]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for API health check
 */
export function useAPIHealth(apiUrl?: string, pollInterval = 30000) {
  const [healthy, setHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';
      const response = await fetch(`${baseUrl}/api/v1/manifests/featured`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      setHealthy(response.ok);
      setLastCheck(new Date());
    } catch (err) {
      setHealthy(false);
      setLastCheck(new Date());
    }
  }, [apiUrl]);

  useEffect(() => {
    // Check health immediately
    checkHealth();

    // Set up polling
    const interval = setInterval(checkHealth, pollInterval);

    return () => clearInterval(interval);
  }, [checkHealth, pollInterval]);

  return {
    healthy,
    lastCheck,
    check: checkHealth,
  };
}
