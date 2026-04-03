/**
 * Blog type definitions shared across components
 */

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
  authorId?: string;
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
}

export interface BlogManifest {
  version: string;
  generated: string;
  total: number;
  posts: BlogManifestPost[];
}

export interface BlogTextBlock {
  type: 'text' | 'quote' | 'code';
  content: string;
}

export interface BlogImageBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
}

export type BlogBodyBlock = BlogTextBlock | BlogImageBlock;

export interface BlogPostDocument extends BlogManifestPost {
  body: BlogBodyBlock[];
  sources?: BlogSource[];
  tags?: string[];
}

export interface BlogSource {
  citation?: string;
  title?: string;
  url?: string;
  publisher?: string;
  publishedDate?: string;
  accessedDate?: string;
  notes?: string;
}
