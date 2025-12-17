/**
 * Canonical Blog Data Types
 * These types define the single source of truth for blog content.
 * All data sources (JSON, Google Docs, API) must normalize to these shapes.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  excerpt?: string;
  content?: string; // Full post content (HTML or markdown)
  cover?: string;
  authorId: string;
  tags?: string[];
  href: string;
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

/**
 * Resolved post includes author data for rendering
 */
export interface ResolvedPost extends BlogPost {
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
