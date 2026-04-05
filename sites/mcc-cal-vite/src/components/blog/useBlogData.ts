/**
 * useBlogData hook - Manages blog data fetching and state
 */

import { useEffect, useState, useCallback } from 'react';
import type {
  BlogAuthor,
  BlogAuthorsFile,
  BlogManifest,
  BlogManifestPost,
  BlogPostDocument,
} from '@/types/blog';
import {
  BLOG_BASE,
  DEFAULT_AUTHOR_ID,
  FALLBACK_AUTHOR,
  fetchJson,
} from './utils';

export interface UseBlogDataReturn {
  // Manifest data
  manifest: BlogManifest | null;
  authors: BlogAuthor[];
  manifestError: string | null;
  manifestLoading: boolean;

  // Post data
  post: BlogPostDocument | null;
  postError: string | null;
  postLoading: boolean;

  // Helpers
  posts: BlogManifestPost[];
  leadPost: BlogManifestPost | undefined;
  sidebarPosts: BlogManifestPost[];
  gridPosts: BlogManifestPost[];
  manifestPost: BlogManifestPost | null;
  resolvedPost: (BlogManifestPost & Partial<BlogPostDocument>) | null;
  getAuthor: (postLike?: Pick<BlogManifestPost, 'authorId' | 'authorName'> | null) => BlogAuthor;
  resolvedAuthor: BlogAuthor;
  relatedPosts: BlogManifestPost[];

  // Actions
  loadPost: (slug: string) => void;
  clearPost: () => void;
}

export function useBlogData(slug?: string): UseBlogDataReturn {
  const [manifest, setManifest] = useState<BlogManifest | null>(null);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [manifestLoading, setManifestLoading] = useState(true);

  const [post, setPost] = useState<BlogPostDocument | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);

  // Fetch manifest and authors on mount
  useEffect(() => {
    let active = true;

    setManifestLoading(true);
    setManifestError(null);

    fetchJson<BlogManifest>(`${BLOG_BASE}/blog-manifest.json`)
      .then((data) => {
        if (!active) return;
        setManifest(data);
      })
      .catch((error: Error) => {
        if (!active) return;
        setManifestError(error.message);
      })
      .finally(() => {
        if (!active) return;
        setManifestLoading(false);
      });

    fetchJson<BlogAuthorsFile>(`${BLOG_BASE}/authors.json`)
      .then((data) => {
        if (!active) return;
        setAuthors(Array.isArray(data.authors) ? data.authors : []);
      })
      .catch(() => {
        if (!active) return;
        setAuthors([]);
      });

    return () => {
      active = false;
    };
  }, []);

  // Fetch post when slug changes
  useEffect(() => {
    if (!slug) {
      setPost(null);
      setPostError(null);
      setPostLoading(false);
      return;
    }

    let active = true;

    setPostLoading(true);
    setPostError(null);

    fetchJson<BlogPostDocument>(`${BLOG_BASE}/posts/${slug}/post.json`)
      .then((data) => {
        if (!active) return;
        setPost(data);
      })
      .catch((error: Error) => {
        if (!active) return;
        setPost(null);
        setPostError(error.message);
      })
      .finally(() => {
        if (!active) return;
        setPostLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const posts = manifest?.posts ?? [];
  const leadPost = posts[0];
  const sidebarPosts = posts.slice(1, 4);
  const gridPosts = posts.slice(4);
  const manifestPost = slug ? posts.find((entry) => entry.slug === slug) ?? null : null;

  const resolvedPost = post
    ? {
        ...(manifestPost ?? {}),
        ...post,
      }
    : null;

  const getAuthor = useCallback(
    (postLike?: Pick<BlogManifestPost, 'authorId' | 'authorName'> | null): BlogAuthor => {
      if (!postLike) return FALLBACK_AUTHOR;
      const id = postLike.authorId || DEFAULT_AUTHOR_ID;
      const author = authors.find((entry) => entry.id === id);
      if (author) return author;
      if (postLike.authorName) {
        return {
          ...FALLBACK_AUTHOR,
          id,
          name: postLike.authorName,
        };
      }
      return FALLBACK_AUTHOR;
    },
    [authors]
  );

  const resolvedAuthor = getAuthor(resolvedPost);
  const relatedPosts = resolvedPost
    ? posts.filter((entry) => entry.slug !== resolvedPost.slug).slice(0, 3)
    : [];

  const loadPost = useCallback((newSlug: string) => {
    // Handled by useEffect via slug param change
    window.history.pushState(null, '', `/blog/${newSlug}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const clearPost = useCallback(() => {
    setPost(null);
    setPostError(null);
  }, []);

  return {
    manifest,
    authors,
    manifestError,
    manifestLoading,
    post,
    postError,
    postLoading,
    posts,
    leadPost,
    sidebarPosts,
    gridPosts,
    manifestPost,
    resolvedPost,
    getAuthor,
    resolvedAuthor,
    relatedPosts,
    loadPost,
    clearPost,
  };
}
