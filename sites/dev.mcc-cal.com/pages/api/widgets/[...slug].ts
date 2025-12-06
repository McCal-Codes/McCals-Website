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
 * Examples:
 * - GET /api/widgets/photojournalism-portfolio/v5.2.0-performance-optimized.html
 * - GET /api/widgets/concert-portfolio/v4.7.1-api-optional.html
 * 
 * Returns: HTML content from src/widgets/[widget]/versions/[version]
 */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET requests are allowed
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { slug } = req.query;

  // Validate parameters
  if (!slug || !Array.isArray(slug) || slug.length < 2) {
    res.status(400).json({ error: 'Invalid request: expected /api/widgets/[widget]/[version]' });
    return;
  }

  const widget = slug[0];
  const version = slug.slice(1).join('/'); // Handle versions with slashes (shouldn't happen, but be safe)

  if (typeof widget !== 'string' || typeof version !== 'string') {
    res.status(400).json({ error: 'Invalid widget or version parameter' });
    return;
  }

  // Security: Prevent directory traversal attacks
  const securityCheck = (str: string) => {
    return str.includes('..') || str.includes('\0') || str.includes('//');
  };

  if (securityCheck(widget) || securityCheck(version)) {
    res.status(400).json({ error: 'Invalid widget or version name' });
    return;
  }

  try {
    // Construct the path to the widget file
    const widgetPath = path.join(
      process.cwd(),
      '..',
      '..',
      'src',
      'widgets',
      widget,
      'versions',
      version
    );

    // Resolve and validate the path
    const resolvedPath = path.resolve(widgetPath);
    const baseDir = path.resolve(path.join(process.cwd(), '..', '..', 'src', 'widgets'));
    
    // Verify the resolved path is within the widgets directory (security check)
    if (!resolvedPath.startsWith(baseDir)) {
      res.status(403).json({ error: 'Access denied: path outside widgets directory' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Widget file not found: ${resolvedPath}`);
      res.status(404).json({ error: `Widget not found: ${widget}/${version}` });
      return;
    }

    // Read the widget file
    const html = fs.readFileSync(resolvedPath, 'utf-8');

    // Set appropriate headers for development (no caching)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error serving widget:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
