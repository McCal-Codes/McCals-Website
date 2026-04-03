/**
 * Formatting utilities for dates, strings, and display values
 */

/**
 * Format a date string to a long readable format (e.g., "January 1, 2024")
 * Used for blog posts and author pages
 */
export function formatDateLong(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string to relative time (e.g., "Today", "Yesterday", "3 days ago")
 * Falls back to short date format for older dates
 * Used for podcast episodes
 */
export function formatDateRelative(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    const diff = Date.now() - d.getTime();
    const day = 86400000;
    if (diff < day) return 'Today';
    if (diff < day * 2) return 'Yesterday';
    if (diff < day * 7) return `${Math.floor(diff / day)} days ago`;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ep';
}

/**
 * Format seconds into MM:SS time format
 * Used for audio/video timestamps
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '--:--';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

/**
 * Format reading time in minutes to a readable label
 */
export function readingTimeLabel(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  return `${minutes} min read`;
}
