/**
 * Shared data client for the Vite site.
 * Portfolio manifests come from the API; blog content comes from /content/blog-static.
 */

import { getLiveSiteFeaturedFallback } from '@/content/liveSiteFallbacks';
import type { HomeFeaturedItem } from '@/content/liveSiteFallbacks';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';
const BLOG_BASE = '/content/blog-static';
const DEFAULT_AUTHOR_ID = 'mccal';

export interface Manifest {
  bands?: Band[];
  events?: Event[];
  stories?: Story[];
  totalImages: number;
  generatedAt?: string;
}

export interface Band {
  bandName: string;
  concerts: Concert[];
}

export interface Concert {
  date: string;
  images: Image[];
}

export interface Event {
  eventName: string;
  category: string;
  images: Image[];
}

export interface Story {
  title: string;
  publication?: string;
  date?: string;
  images: Image[];
}

export interface Image {
  path: string;
  filename: string;
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  headline?: string;
  location?: string;
  links?: {
    label: string;
    href: string;
  }[];
}

export interface BlogAuthorsFile {
  authors: BlogAuthor[];
}

export interface BlogManifestPost {
  slug: string;
  title: string;
  authorId: string;
  authorName?: string | null;
  date: string;
  category?: string;
  excerpt?: string;
  leadImage?: string | null;
  leadImageFallback?: string | null;
  leadImageAlt?: string;
  leadImageCaption?: string;
  published?: boolean;
  readingTime?: number;
  tags?: string[];
}

export interface BlogManifest {
  version: string;
  generated: string;
  total: number;
  posts: BlogManifestPost[];
}

export interface TextContentBlock {
  type: 'text' | 'quote' | 'code';
  content: string;
}

export interface ImageContentBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
}

export type ContentBlock = TextContentBlock | ImageContentBlock;

export interface BlogPostSummary extends BlogManifestPost {
  author: BlogAuthor;
}

export interface BlogPostDocument extends BlogManifestPost {
  body: ContentBlock[];
  sources?: unknown[];
}

export interface BlogPost extends BlogPostSummary {
  body: ContentBlock[];
  sources?: unknown[];
}

export interface FeaturedManifestItemDate {
  display?: string;
}

export interface FeaturedManifestItemImage {
  path?: string;
}

export interface FeaturedManifestItem {
  id?: string;
  name?: string;
  title?: string;
  type?: string;
  category?: string;
  tags?: string[];
  totalImages?: number;
  dateDisplay?: string;
  date?: FeaturedManifestItemDate;
  relativeFolderPath?: string;
  folderPath?: string;
  coverImage?: string | FeaturedManifestItemImage;
}

export interface FeaturedManifest {
  totalItems: number;
  items: FeaturedManifestItem[];
}

const FALLBACK_AUTHOR: BlogAuthor = {
  id: DEFAULT_AUTHOR_ID,
  name: 'Caleb McCartney',
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function resolveBlogAssetUrl(blogBase: string, slug: string, assetPath?: string | null): string | undefined {
  if (!assetPath) return undefined;
  if (assetPath.startsWith('http') || assetPath.startsWith('/')) return assetPath;

  const cleanBase = trimTrailingSlash(blogBase);
  const cleanPath = assetPath.replace(/^\.?\//, '');

  if (cleanPath.startsWith(`posts/${slug}/`)) {
    return `${cleanBase}/${cleanPath}`;
  }

  if (cleanPath.startsWith('images/')) {
    return `${cleanBase}/posts/${slug}/${cleanPath}`;
  }

  return `${cleanBase}/${cleanPath}`;
}

function resolveBlogAuthor(post: Pick<BlogManifestPost, 'authorId' | 'authorName'>, authors: BlogAuthor[]): BlogAuthor {
  const authorId = post.authorId || DEFAULT_AUTHOR_ID;
  const author = authors.find((entry) => entry.id === authorId);

  if (author) return author;
  if (post.authorName) {
    return {
      ...FALLBACK_AUTHOR,
      id: authorId,
      name: post.authorName,
    };
  }

  return FALLBACK_AUTHOR;
}

function normalizeBlogBlock(blogBase: string, slug: string, block: ContentBlock): ContentBlock {
  if (block.type !== 'image') return block;

  return {
    ...block,
    src: resolveBlogAssetUrl(blogBase, slug, block.src) || block.src,
  };
}

function normalizeBlogSummary(post: BlogManifestPost, authors: BlogAuthor[], blogBase: string): BlogPostSummary {
  return {
    ...post,
    leadImage: resolveBlogAssetUrl(blogBase, post.slug, post.leadImage) || post.leadImage,
    leadImageFallback:
      resolveBlogAssetUrl(blogBase, post.slug, post.leadImageFallback) || post.leadImageFallback,
    author: resolveBlogAuthor(post, authors),
  };
}

function resolveFeaturedCoverPath(item: FeaturedManifestItem): string | undefined {
  if (!item.coverImage) return undefined;

  if (typeof item.coverImage === 'object' && item.coverImage.path) {
    return item.coverImage.path;
  }

  if (typeof item.coverImage === 'string' && item.relativeFolderPath) {
    return `src/images/Portfolios/${item.relativeFolderPath}/${item.coverImage}`;
  }

  return undefined;
}

function getFeaturedHref(type?: string): string {
  if (type === 'Concert') return '/concerts';
  if (type === 'Events') return '/events';
  if (type === 'Journalism') return '/journalism';
  return '/featured-work';
}

/**
 * Fetch manifest data for a specific portfolio type
 */
export async function fetchManifest(type: string): Promise<Manifest> {
  const response = await fetch(`${API_BASE}/api/v1/manifests/${type}`, {});

  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} manifest: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch blog authors
 */
export async function fetchBlogAuthors(blogBase: string = BLOG_BASE): Promise<BlogAuthor[]> {
  const data = await fetchJson<BlogAuthorsFile>(`${trimTrailingSlash(blogBase)}/authors.json`);
  return Array.isArray(data.authors) ? data.authors : [];
}

/**
 * Fetch the generated blog manifest
 */
export async function fetchBlogManifest(blogBase: string = BLOG_BASE): Promise<BlogManifest> {
  return fetchJson<BlogManifest>(`${trimTrailingSlash(blogBase)}/blog-manifest.json`);
}

/**
 * Fetch all published blog posts from the canonical content manifest
 */
export async function fetchBlogPosts(blogBase: string = BLOG_BASE): Promise<BlogPostSummary[]> {
  const [manifest, authors] = await Promise.all([
    fetchBlogManifest(blogBase),
    fetchBlogAuthors(blogBase),
  ]);

  return (manifest.posts || []).map((post) => normalizeBlogSummary(post, authors, blogBase));
}

/**
 * Fetch a single blog post document by slug
 */
export async function fetchBlogPost(slug: string, blogBase: string = BLOG_BASE): Promise<BlogPost> {
  if (!slug) {
    throw new Error('A blog slug is required');
  }

  const [manifest, authors, document] = await Promise.all([
    fetchBlogManifest(blogBase),
    fetchBlogAuthors(blogBase),
    fetchJson<BlogPostDocument>(`${trimTrailingSlash(blogBase)}/posts/${slug}/post.json`),
  ]);

  const summary = manifest.posts.find((entry) => entry.slug === slug);
  const merged: BlogPostDocument = {
    ...(summary ?? {
      slug,
      title: document.title,
      authorId: document.authorId || DEFAULT_AUTHOR_ID,
      date: document.date,
    }),
    ...document,
  };

  return {
    ...merged,
    leadImage: resolveBlogAssetUrl(blogBase, slug, merged.leadImage) || merged.leadImage,
    leadImageFallback:
      resolveBlogAssetUrl(blogBase, slug, merged.leadImageFallback) || merged.leadImageFallback,
    body: (merged.body || []).map((block) => normalizeBlogBlock(blogBase, slug, block)),
    author: resolveBlogAuthor(merged, authors),
  };
}

/**
 * Fetch homepage-friendly featured work cards from the curated featured manifest
 */
export async function fetchFeaturedItems(): Promise<HomeFeaturedItem[]> {
  const data = await fetchJson<FeaturedManifest>(`${API_BASE}/api/v1/manifests/featured`);

  return (data.items || []).map((item, index) => {
    const fallback = getLiveSiteFeaturedFallback(item.type);
    const title = item.title || item.name || item.id || fallback?.title || `Featured story ${index + 1}`;
    const coverPath = resolveFeaturedCoverPath(item);
    const meta = [item.category || item.type, item.dateDisplay || item.date?.display]
      .filter(Boolean)
      .join(' / ');

    return {
      id: item.id || title,
      title,
      eyebrow: item.type || fallback?.eyebrow || 'Featured',
      href: fallback?.href || getFeaturedHref(item.type),
      imageUrl: coverPath ? getImageUrl(coverPath) : fallback?.imageUrl,
      meta: meta || fallback?.meta || 'Curated highlight',
    };
  });
}

/**
 * Health check for API
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get absolute image URL
 */
export function getImageUrl(path: string): string {
  if (path.startsWith('http')) return path;

  // Use jsDelivr CDN for GitHub-hosted images
  const baseUrl = 'https://cdn.jsdelivr.net/gh/McCal-Codes/mccal-api@manifests-cdn';
  return `${baseUrl}/${path}`;
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
