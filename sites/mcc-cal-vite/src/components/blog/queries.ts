/**
 * React Query hooks for blog data fetching
 */

import { useQuery } from '@tanstack/react-query';
import type {
  BlogAuthor,
  BlogAuthorsFile,
  BlogManifest,
  BlogPostDocument,
} from '@/types/blog';
import {
  BLOG_BASE,
  DEFAULT_AUTHOR_ID,
  FALLBACK_AUTHOR,
  fetchJson,
} from './utils';

// Query keys
export const blogKeys = {
  all: ['blog'] as const,
  manifest: () => [...blogKeys.all, 'manifest'] as const,
  authors: () => [...blogKeys.all, 'authors'] as const,
  post: (slug: string) => [...blogKeys.all, 'post', slug] as const,
};

// Fetch functions
async function fetchManifest(): Promise<BlogManifest> {
  return fetchJson<BlogManifest>(`${BLOG_BASE}/blog-manifest.json`);
}

async function fetchAuthors(): Promise<BlogAuthor[]> {
  const data = await fetchJson<BlogAuthorsFile>(`${BLOG_BASE}/authors.json`);
  return Array.isArray(data.authors) ? data.authors : [];
}

async function fetchPost(slug: string): Promise<BlogPostDocument> {
  return fetchJson<BlogPostDocument>(`${BLOG_BASE}/posts/${slug}/post.json`);
}

// React Query hooks
export function useBlogManifest() {
  return useQuery({
    queryKey: blogKeys.manifest(),
    queryFn: fetchManifest,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBlogAuthors() {
  return useQuery({
    queryKey: blogKeys.authors(),
    queryFn: fetchAuthors,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: blogKeys.post(slug || ''),
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

// Combined hook for blog page
export interface UseBlogPageDataReturn {
  // Manifest data
  manifest: BlogManifest | undefined;
  authors: BlogAuthor[] | undefined;
  manifestError: Error | null;
  manifestLoading: boolean;

  // Post data
  post: BlogPostDocument | undefined;
  postError: Error | null;
  postLoading: boolean;

  // Helpers
  posts: BlogManifest['posts'];
  leadPost: BlogManifest['posts'][number] | undefined;
  sidebarPosts: BlogManifest['posts'];
  gridPosts: BlogManifest['posts'];
  manifestPost: BlogManifest['posts'][number] | undefined;
  resolvedPost: (BlogManifest['posts'][number] & Partial<BlogPostDocument>) | null;
  resolvedAuthor: BlogAuthor;
  relatedPosts: BlogManifest['posts'];
  getAuthor: (postLike?: { authorId?: string; authorName?: string | null } | null) => BlogAuthor;
}

export function useBlogPageData(slug?: string): UseBlogPageDataReturn {
  const { data: manifest, error: manifestError, isLoading: manifestLoading } = useBlogManifest();
  const { data: authors, isLoading: authorsLoading } = useBlogAuthors();
  const { data: post, error: postError, isLoading: postLoading } = useBlogPost(slug);

  const posts = manifest?.posts ?? [];
  const leadPost = posts[0];
  const sidebarPosts = posts.slice(1, 4);
  const gridPosts = posts.slice(4);
  const manifestPost = slug ? posts.find((entry) => entry.slug === slug) : undefined;

  const resolvedPost = post && manifestPost
    ? { ...manifestPost, ...post }
    : manifestPost
    ? { ...manifestPost }
    : null;

  const getAuthor = (postLike?: { authorId?: string; authorName?: string | null } | null): BlogAuthor => {
    if (!postLike) return FALLBACK_AUTHOR;
    const id = postLike.authorId || DEFAULT_AUTHOR_ID;
    const author = authors?.find((entry) => entry.id === id);
    if (author) return author;
    if (postLike.authorName) {
      return { ...FALLBACK_AUTHOR, id, name: postLike.authorName };
    }
    return FALLBACK_AUTHOR;
  };

  const resolvedAuthor = getAuthor(resolvedPost);

  const relatedPosts = resolvedPost
    ? posts.filter((entry) => entry.slug !== resolvedPost.slug).slice(0, 3)
    : [];

  return {
    manifest,
    authors,
    manifestError,
    manifestLoading: manifestLoading || authorsLoading,
    post,
    postError,
    postLoading,
    posts,
    leadPost,
    sidebarPosts,
    gridPosts,
    manifestPost,
    resolvedPost,
    resolvedAuthor,
    relatedPosts,
    getAuthor,
  };
}
