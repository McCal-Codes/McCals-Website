import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/widgets/[...slug]
 * Catch-all route that serves widget HTML files from the local filesystem
 * 
 * This allows the dev site to pick up widget updates immediately without
 * waiting for GitHub commits or rebuilds.
 * 
 * Supports both old and new widget directory structures:
 * 
 * OLD (flat): /api/widgets/concert-portfolio/v4.7.1-api-optional.html
 * NEW (categorical): /api/widgets/portfolios/concert-portfolio/v4.7.1-api-optional.html
 * 
 * Auto-detects latest version if only widget name provided:
 * /api/widgets/concert-portfolio (returns latest version)
 * /api/widgets/portfolios/concert-portfolio (returns latest version)
 * 
 * Returns: HTML content from src/widgets/[...]/[widget]/versions/[version]
 */

interface WidgetInfo {
  path: string;
  versions: string[];
  latest: string | null;
}

/**
 * Find widget in both old (flat) and new (categorical) structures
 */
function findWidgetPath(widget: string): string | null {
  const baseDir = path.resolve(path.join(process.cwd(), '..', '..', 'src', 'widgets'));

  // Try new categorical structure first (with categories)
  const categories = ['_admin', '_navigation', '_content', 'portfolios'];
  for (const category of categories) {
    const categoryPath = path.join(baseDir, category, widget);
    if (fs.existsSync(categoryPath) && fs.statSync(categoryPath).isDirectory()) {
      return categoryPath;
    }
  }

  // Fall back to old flat structure
  const flatPath = path.join(baseDir, widget);
  if (fs.existsSync(flatPath) && fs.statSync(flatPath).isDirectory()) {
    return flatPath;
  }

  return null;
}

/**
 * Get all versions in a widget's versions directory
 */
function getWidgetVersions(widgetPath: string): string[] {
  try {
    const versionsDir = path.join(widgetPath, 'versions');
    if (!fs.existsSync(versionsDir)) {
      return [];
    }

    return fs
      .readdirSync(versionsDir)
      .filter((file) => file.endsWith('.html'))
      .sort()
      .reverse(); // Newest first (alphabetically, which works for v1.0.0 format)
  } catch (error) {
    console.error(`Error reading versions for ${widgetPath}:`, error);
    return [];
  }
}

/**
 * Compare semantic versions to find the latest
 * Handles: v1.0.0, v1.2.0-suffix, etc.
 */
function getLatestVersion(versions: string[]): string | null {
  if (versions.length === 0) return null;

  return versions.sort((a, b) => {
    const extractVersion = (filename: string) => {
      const match = filename.match(/v([\d.]+)/);
      return match ? match[1] : '0.0.0';
    };

    const versionA = extractVersion(a);
    const versionB = extractVersion(b);

    const compareVersions = (va: string, vb: string): number => {
      const aParts = va.split('.').map((x) => parseInt(x, 10));
      const bParts = vb.split('.').map((x) => parseInt(x, 10));

      while (aParts.length < bParts.length) aParts.push(0);
      while (bParts.length < aParts.length) bParts.push(0);

      for (let i = 0; i < aParts.length; i++) {
        if (aParts[i] !== bParts[i]) {
          return bParts[i] - aParts[i]; // Descending order
        }
      }
      return 0;
    };

    return compareVersions(versionA, versionB);
  })[0];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET requests are allowed
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { slug } = req.query;

  // Validate parameters
  if (!slug || !Array.isArray(slug) || slug.length < 1) {
    res.status(400).json({
      error: 'Invalid request: expected /api/widgets/[widget] or /api/widgets/[category]/[widget] or /api/widgets/[widget]/[version]',
    });
    return;
  }

  // Security: Prevent directory traversal attacks
  const securityCheck = (str: string) => {
    return str.includes('..') || str.includes('\0') || str.includes('//');
  };

  for (const part of slug) {
    if (typeof part !== 'string' || securityCheck(part)) {
      res.status(400).json({ error: 'Invalid parameters' });
      return;
    }
  }

  try {
    const baseDir = path.resolve(path.join(process.cwd(), '..', '..', 'src', 'widgets'));
    let widget: string;
    let version: string | undefined;

    // Parse request: could be:
    // 1. /api/widgets/concert-portfolio → auto-detect version
    // 2. /api/widgets/concert-portfolio/v4.7.1.html → specific version
    // 3. /api/widgets/portfolios/concert-portfolio → auto-detect version (new structure)
    // 4. /api/widgets/portfolios/concert-portfolio/v4.7.1.html → specific version (new structure)

    if (slug.length === 1) {
      // Case 1 & 3: Auto-detect version
      widget = slug[0];
      version = undefined;
    } else if (slug.length === 2) {
      // Could be case 2 or 3
      const potentialWidget = slug[0];
      const potentialVersion = slug[1];

      // Check if slug[0] is a category
      const categories = ['_admin', '_navigation', '_content', 'portfolios'];
      if (categories.includes(potentialWidget)) {
        // Case 3: category/widget, auto-detect version
        widget = potentialVersion;
        version = undefined;
      } else {
        // Case 2: widget/version
        widget = potentialWidget;
        version = potentialVersion;
      }
    } else if (slug.length === 3) {
      // Case 4: category/widget/version
      widget = slug[1];
      version = slug[2];
    } else {
      res.status(400).json({ error: 'Invalid request path structure' });
      return;
    }

    // Find the widget directory (supports both old and new structures)
    const widgetPath = findWidgetPath(widget);
    if (!widgetPath) {
      console.warn(`Widget not found: ${widget}`);
      res.status(404).json({
        error: `Widget not found: ${widget}`,
        hint: 'Check widget name and ensure it exists in src/widgets or a category subdirectory',
      });
      return;
    }

    // Verify the widget path is within the widgets directory (security check)
    const resolvedWidgetPath = path.resolve(widgetPath);
    if (!resolvedWidgetPath.startsWith(baseDir)) {
      res.status(403).json({ error: 'Access denied: path outside widgets directory' });
      return;
    }

    // Get available versions
    const versions = getWidgetVersions(resolvedWidgetPath);
    if (versions.length === 0) {
      res.status(404).json({
        error: `No versions found for widget: ${widget}`,
        hint: 'Ensure the widget has a versions/ directory with HTML files',
      });
      return;
    }

    // Auto-detect latest version if not specified
    if (!version) {
      const latest = getLatestVersion(versions);
      if (!latest) {
        res.status(500).json({ error: 'Could not determine latest version' });
        return;
      }
      version = latest;
    }

    // Construct the full file path
    const filePath = path.join(resolvedWidgetPath, 'versions', version);
    const resolvedPath = path.resolve(filePath);

    // Final security check
    if (!resolvedPath.startsWith(baseDir)) {
      res.status(403).json({ error: 'Access denied: path outside widgets directory' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Widget version not found: ${resolvedPath}`);
      res.status(404).json({
        error: `Version not found: ${widget}/${version}`,
        available: versions.slice(0, 5), // Return top 5 versions
      });
      return;
    }

    // Read the widget file
    const html = fs.readFileSync(resolvedPath, 'utf-8');

    // Set appropriate headers for development (no caching)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Widget-Name', widget);
    res.setHeader('X-Widget-Version', version);
    res.status(200).send(html);
  } catch (error) {
    console.error('Error serving widget:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}
