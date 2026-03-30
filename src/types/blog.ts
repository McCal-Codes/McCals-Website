/**
 * Canonical Blog Data Types
 * These types define the single source of truth for blog content.
 * All blog tooling should normalize to src/content/blog.
 */

export interface BlogPost {
  slug: string;
  title: string;
  authorId: string;
  authorName?: string | null;
  date: string; // YYYY-MM-DD
  category?: string;
  excerpt?: string;
  leadImage?: string | null;
  leadImageAlt?: string;
  leadImageCaption?: string;
  published?: boolean;
  readingTime?: number;
  tags?: string[];
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface QuoteBlock {
  type: 'quote';
  content: string;
}

export interface CodeBlock {
  type: 'code';
  content: string;
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
}

export type BlogBodyBlock = TextBlock | QuoteBlock | CodeBlock | ImageBlock;

export interface BlogPostDocument extends BlogPost {
  body: BlogBodyBlock[];
  sources?: Source[];
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  sourceDoc?: {
    publishedUrl: string;
  };
}

export interface Source {
  title: string;
  url: string;
  publisher?: string;
  publishedDate?: string;
  accessedDate?: string;
  notes?: string;
}

export interface BlogManifest {
  version: string;
  generated: string;
  total: number;
  posts: BlogPost[];
}

export interface BlogAuthorsFile {
  authors: Author[];
}

/**
 * Resolved summary post includes author data for rendering
 */
export interface ResolvedPost extends BlogPost {
  author: Author;
}

export interface ResolvedPostDocument extends BlogPostDocument {
  author: Author;
}

/**
 * Blog widget configuration
 */
export interface BlogWidgetProps {
  limit?: number;
  title?: string;
  showCovers?: boolean;
  className?: string;
}
