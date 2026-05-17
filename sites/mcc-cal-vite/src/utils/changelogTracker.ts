/**
 * Changelog Tracker
 * Automatically tracks widget updates and generates changelog entries
 */
import { logWarning } from './logger';

export interface ChangelogEntry {
  timestamp: string;
  date: string;
  widget: string;
  version: string;
  action: 'update' | 'add' | 'view';
  notes?: string;
}

const CHANGELOG_STORAGE_KEY = 'dev-site-changelog';
const MAX_ENTRIES = 50;

/**
 * Check if we're in browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Get all changelog entries
 */
export function getChangelog(): ChangelogEntry[] {
  if (!isBrowser) return [];
  try {
    const stored = localStorage.getItem(CHANGELOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    logWarning('Failed to read changelog from localStorage');
    return [];
  }
}

/**
 * Add a changelog entry
 */
export function addChangelogEntry(
  widget: string,
  version: string,
  action: 'update' | 'add' | 'view' = 'view',
  notes?: string
): ChangelogEntry {
  const now = new Date();
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  const entry: ChangelogEntry = {
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('en-US', dateFormatOptions),
    widget,
    version,
    action,
    notes,
  };

  if (isBrowser) {
    try {
      const changelog = getChangelog();
      changelog.unshift(entry);
      // Keep only the last MAX_ENTRIES
      const trimmed = changelog.slice(0, MAX_ENTRIES);
      localStorage.setItem(CHANGELOG_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      logWarning('Failed to write changelog to localStorage');
    }
  }

  return entry;
}

/**
 * Clear changelog
 */
export function clearChangelog(): void {
  if (isBrowser) {
    try {
      localStorage.removeItem(CHANGELOG_STORAGE_KEY);
    } catch {
      logWarning('Failed to clear changelog');
    }
  }
}

/**
 * Export changelog as text
 */
export function exportChangelogAsText(): string {
  const entries = getChangelog();
  if (entries.length === 0) return 'No changelog entries yet.';

  const header = '# Dev Site Changelog\n\n';
  const items = entries
    .map(entry => {
      const action = entry.action.toUpperCase();
      const notes = entry.notes ? ` - ${entry.notes}` : '';
      return `- **${entry.date}** [${action}] ${entry.widget} (${entry.version})${notes}`;
    })
    .join('\n');

  return header + items;
}

/**
 * Export changelog as JSON
 */
export function exportChangelogAsJSON(): string {
  return JSON.stringify(getChangelog(), null, 2);
}
