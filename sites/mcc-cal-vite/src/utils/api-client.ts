/**
 * API Client for McCal Media API
 * Handles all interactions with api.mcc-cal.com
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';

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

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: ContentBlock[];
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'quote' | 'code';
  content: string;
}

/**
 * Fetch manifest data for a specific portfolio type
 */
export async function fetchManifest(type: string): Promise<Manifest> {
  const response = await fetch(`${API_BASE}/api/v1/manifests/${type}`, {
    
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} manifest: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all blog posts
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${API_BASE}/api/v1/blog/posts`, {
    
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
  }

  const data = await response.json();
  return data.posts || [];
}

/**
 * Fetch a single blog post by ID
 */
export async function fetchBlogPost(id: string): Promise<BlogPost> {
  const response = await fetch(`${API_BASE}/api/v1/blog/posts/${id}`, {
    
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog post ${id}: ${response.statusText}`);
  }

  return response.json();
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
