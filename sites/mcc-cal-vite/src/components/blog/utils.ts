/**
 * Blog utilities and constants
 */

import type {
  BlogAuthor,
  BlogManifestPost,
  BlogPostDocument,
  BlogSource,
} from '@/types/blog';

export const BLOG_BASE = '/content/blog-static';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
export const DEFAULT_AUTHOR_ID = 'mccal';

export const FALLBACK_AUTHOR: BlogAuthor = {
  id: DEFAULT_AUTHOR_ID,
  name: 'Caleb McCartney',
};

export function toAssetUrl(assetPath?: string | null): string | null {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath) || assetPath.startsWith('/')) return assetPath;
  return `${BLOG_BASE}/${assetPath.replace(/^\.?\//, '')}`;
}

export function toPostAssetUrl(slug: string, assetPath?: string | null): string | null {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath) || assetPath.startsWith('/')) return assetPath;
  if (assetPath.startsWith(`posts/${slug}/`)) return `${BLOG_BASE}/${assetPath}`;
  return `${BLOG_BASE}/posts/${slug}/${assetPath.replace(/^\.?\//, '')}`;
}

export function toAbsoluteUrl(assetPath?: string | null): string | undefined {
  if (!assetPath) return undefined;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${SITE_URL}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function formatCitation(source: BlogSource): string {
  if (source.citation) return source.citation.trim();

  return [
    source.title,
    source.publisher,
    source.publishedDate ? `Published ${source.publishedDate}` : null,
    source.accessedDate ? `Accessed ${source.accessedDate}` : null,
    source.notes,
    source.url,
  ]
    .filter(Boolean)
    .join('. ');
}

export function copyTextWithFallback(value: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

export function buildIndexJsonLd(
  posts: BlogManifestPost[],
  getAuthor: (post: BlogManifestPost) => BlogAuthor
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'McCal Media Blog',
    description: 'Field notes, visual essays, and reporting from McCal Media.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'McCal Media',
      url: SITE_URL,
    },
    blogPost: posts.slice(0, 8).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
      image: toAbsoluteUrl(toAssetUrl(post.leadImage || post.leadImageFallback)),
      author: {
        '@type': 'Person',
        name: getAuthor(post).name,
      },
    })),
  };
}

export function buildPostJsonLd(
  post: BlogManifestPost & Partial<BlogPostDocument>,
  authorName: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    keywords: post.tags?.join(', '),
    url: `${SITE_URL}/blog/${post.slug}`,
    image,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'McCal Media',
      url: SITE_URL,
    },
  };
}

export function buildBreadcrumbJsonLd(slug?: string, postTitle?: string) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: `${SITE_URL}/blog`,
    },
  ];

  if (slug && postTitle) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: postTitle,
      item: `${SITE_URL}/blog/${slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
