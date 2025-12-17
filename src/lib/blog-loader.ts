import type { Author, BlogPost, ResolvedPost } from '@/types/blog';
import blogManifest from '@/data/blog/blog.manifest.json';
import authorsData from '@/data/blog/authors.json';

/**
 * Blog Data Loader
 *
 * This is the single abstraction layer for all blog data.
 * Swapping data sources (JSON → Docs → API) should only require
 * changes to this file, never to UI components.
 */

const FALLBACK_AUTHOR: Author = {
  id: 'unknown',
  name: 'Unknown Author',
  bio: 'This author could not be found.',
};

/**
 * Get all authors
 */
export function getAuthors(): Author[] {
  return authorsData.authors as Author[];
}

/**
 * Get author by ID
 */
export function getAuthor(authorId: string): Author {
  const authors = getAuthors();
  const author = authors.find((a) => a.id === authorId);
  return author || FALLBACK_AUTHOR;
}

/**
 * Get all posts (unresolved)
 */
export function getPosts(): BlogPost[] {
  return blogManifest.posts as BlogPost[];
}

/**
 * Resolve a post with its author data
 */
export function resolvePost(post: BlogPost): ResolvedPost {
  return {
    ...post,
    author: getAuthor(post.authorId),
  };
}

/**
 * Get all posts with author data resolved
 */
export function getResolvedPosts(): ResolvedPost[] {
  const posts = getPosts();
  return posts.map(resolvePost).sort((a, b) => {
    // Sort by date descending
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): ResolvedPost | null {
  const posts = getPosts();
  const post = posts.find((p) => p.slug === slug);
  return post ? resolvePost(post) : null;
}

/**
 * Get recent posts (limited)
 */
export function getRecentPosts(limit: number = 10): ResolvedPost[] {
  const posts = getResolvedPosts();
  return posts.slice(0, limit);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): ResolvedPost[] {
  const posts = getResolvedPosts();
  return posts.filter((p) => p.tags?.includes(tag));
}

/**
 * Get posts by author
 */
export function getPostsByAuthor(authorId: string): ResolvedPost[] {
  const posts = getResolvedPosts();
  return posts.filter((p) => p.authorId === authorId);
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const posts = getPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}
