import fs from 'fs';
import path from 'path';

const WIDGET_CATEGORIES = ['_admin', '_content', '_navigation', 'portfolios', 'projects'] as const;

/**
 * Auto-detect Widget Versions
 * 
 * Scans the src/widgets/ directory for all widget versions
 * and provides utilities for the dev site to dynamically use
 * the latest version without manual configuration.
 * 
 * Usage:
 * ```typescript
 * import { getLatestWidgetVersion, getAllWidgetVersions } from '@/utils/widgetVersionDetector';
 *
 * // Get the latest version of a widget
 * const version = getLatestWidgetVersion('concert-portfolio', 'portfolios');
 * // Returns: 'v4.7.1-api-optional.html'
 *
 * // Get all versions of a widget
 * const versions = getAllWidgetVersions('concert-portfolio', 'portfolios');
 * // Returns: ['v4.7.0.html', 'v4.7.1-api-optional.html']
 * ```
 */

interface WidgetVersionInfo {
  widget: string;
  version: string;
  path: string;
  timestamp: number;
  size: number;
}

/**
 * Resolve a widget versions directory from the categorized widget tree.
 */
function resolveWidgetVersionsDir(widget: string, category?: string): string | null {
  const widgetsRoot = path.join(process.cwd(), '..', '..', 'src', 'widgets');
  const candidateCategories = category ? [category] : WIDGET_CATEGORIES;

  for (const candidateCategory of candidateCategories) {
    const candidatePath = path.join(widgetsRoot, candidateCategory, widget, 'versions');
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  const legacyPath = path.join(widgetsRoot, widget, 'versions');
  if (fs.existsSync(legacyPath)) {
    return legacyPath;
  }

  return null;
}

/**
 * Get all HTML files in a widget's versions directory.
 */
export function getAllWidgetVersions(widget: string, category?: string): string[] {
  try {
    const widgetPath = resolveWidgetVersionsDir(widget, category);

    if (!widgetPath) {
      console.warn(`Widget versions directory not found: ${widget}`);
      return [];
    }

    const files = fs.readdirSync(widgetPath);
    const htmlFiles = files
      .filter((file) => file.endsWith('.html'))
      .sort()
      .reverse(); // Newest first

    return htmlFiles;
  } catch (error) {
    console.error(`Error reading widget versions for ${widget}:`, error);
    return [];
  }
}

/**
 * Get the latest version of a widget
 * Assumes newer versions are named with higher version numbers
 * e.g., v1.0.0 < v1.1.0 < v2.0.0
 */
export function getLatestWidgetVersion(widget: string, category?: string): string | null {
  const versions = getAllWidgetVersions(widget, category);
  if (versions.length === 0) {
    return null;
  }

  // Sort versions semantically
  const sorted = versions.sort((a, b) => {
    // Extract version numbers: v1.2.3-suffix.html → 1.2.3
    const versionA = extractVersionNumber(a);
    const versionB = extractVersionNumber(b);

    // Compare semantic versions
    const comparison = compareVersions(versionA, versionB);
    return comparison > 0 ? -1 : 1; // Descending order (latest first)
  });

  return sorted[0];
}

/**
 * Extract version number from filename
 * Examples:
 * - 'v1.2.3.html' → '1.2.3'
 * - 'v1.2.3-suffix.html' → '1.2.3'
 * - 'v1.html' → '1'
 */
function extractVersionNumber(filename: string): string {
  const match = filename.match(/v([\d.]+)/);
  return match ? match[1] : '0.0.0';
}

/**
 * Compare two semantic version strings
 * Returns: > 0 if a > b, 0 if equal, < 0 if a < b
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map((x) => parseInt(x, 10));
  const bParts = b.split('.').map((x) => parseInt(x, 10));

  // Pad with zeros
  while (aParts.length < bParts.length) aParts.push(0);
  while (bParts.length < aParts.length) bParts.push(0);

  for (let i = 0; i < aParts.length; i++) {
    if (aParts[i] !== bParts[i]) {
      return aParts[i] - bParts[i];
    }
  }

  return 0;
}

/**
 * Get detailed info about a specific widget version
 */
export function getWidgetVersionInfo(widget: string, version: string): WidgetVersionInfo | null {
  try {
    const versionsDir = resolveWidgetVersionsDir(widget);
    if (!versionsDir) {
      return null;
    }

    const widgetPath = path.join(versionsDir, version);

    if (!fs.existsSync(widgetPath)) {
      return null;
    }

    const stats = fs.statSync(widgetPath);

    return {
      widget,
      version,
      path: widgetPath,
      timestamp: stats.mtimeMs,
      size: stats.size,
    };
  } catch (error) {
    console.error(`Error getting version info for ${widget}/${version}:`, error);
    return null;
  }
}

/**
 * Watch for new widget versions (for future auto-update feature)
 * Returns a cleanup function
 */
export function watchWidgetVersions(
  widget: string,
  callback: (versions: string[]) => void,
  category?: string
): (() => void) | null {
  try {
    const widgetPath = resolveWidgetVersionsDir(widget, category);

    if (!widgetPath) {
      return null;
    }

    // Server-side watching (if running in Node.js)
    if (typeof window === 'undefined') {
      const watcher = fs.watch(widgetPath, () => {
        const versions = getAllWidgetVersions(widget, category);
        callback(versions);
      });

      return () => {
        watcher.close();
      };
    }

    return null;
  } catch (error) {
    console.error(`Error watching widget versions for ${widget}:`, error);
    return null;
  }
}

/**
 * Get all widgets and their latest versions
 * Useful for creating dynamic widget menus
 */
export function getAllWidgetsWithLatestVersions(): Record<string, string> {
  try {
    const widgetsPath = path.join(process.cwd(), '..', '..', 'src', 'widgets');

    if (!fs.existsSync(widgetsPath)) {
      console.warn('Widgets directory not found');
      return {};
    }

    const result: Record<string, string> = {};

    WIDGET_CATEGORIES.forEach((category) => {
      const categoryPath = path.join(widgetsPath, category);
      if (!fs.existsSync(categoryPath)) {
        return;
      }

      const directories = fs
        .readdirSync(categoryPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      directories.forEach((dir) => {
        const latestVersion = getLatestWidgetVersion(dir, category);
        if (latestVersion) {
          result[dir] = latestVersion;
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Error getting all widgets:', error);
    return {};
  }
}
