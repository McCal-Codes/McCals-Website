import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/manifests/[type]
 * Serves portfolio manifest JSON files from the local filesystem
 *
 * Supports: concert, events, journalism, nature, portrait, featured, universal
 *
 * Returns: JSON manifest file contents with proper headers
 */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET requests are allowed
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { type } = req.query;

  // Validate parameters
  if (!type || typeof type !== 'string') {
    res.status(400).json({
      error: 'Invalid request: expected /api/manifests/[type]',
      example: '/api/manifests/events',
    });
    return;
  }

  // Security: Prevent directory traversal attacks
  if (type.includes('..') || type.includes('\0') || type.includes('/')) {
    res.status(400).json({ error: 'Invalid parameters' });
    return;
  }

  try {
    // Determine manifest filename based on type
    const typeMap: Record<string, string> = {
      concert: 'concert-manifest.json',
      concerts: 'concert-manifest.json',
      events: 'events-manifest.json',
      event: 'events-manifest.json',
      journalism: 'journalism-manifest.json',
      photojournalism: 'journalism-manifest.json',
      nature: 'nature-manifest.json',
      portrait: 'portrait-manifest.json',
      portraits: 'portrait-manifest.json',
      featured: 'featured-manifest.json',
      universal: 'portfolio-manifest.json',
    };

    const filename = typeMap[type.toLowerCase()];
    if (!filename) {
      res.status(400).json({
        error: `Unknown manifest type: ${type}`,
        available: Object.keys(typeMap),
      });
      return;
    }

    // Construct path to manifest file
    const manifestPath = path.resolve(
      path.join(
        process.cwd(),
        '..',
        '..',
        'src',
        'images',
        'Portfolios',
        // Map filename back to portfolio type
        type.toLowerCase() === 'concert' || type.toLowerCase() === 'concerts'
          ? 'Concert'
          : type.toLowerCase() === 'events' || type.toLowerCase() === 'event'
            ? 'Events'
            : type.toLowerCase() === 'journalism' || type.toLowerCase() === 'photojournalism'
              ? 'Journalism'
              : type.toLowerCase() === 'nature'
                ? 'Nature'
                : type.toLowerCase() === 'portrait' || type.toLowerCase() === 'portraits'
                  ? 'Portrait'
                  : type.toLowerCase() === 'featured'
                    ? 'Featured'
                    : 'Portfolios', // for universal
        filename,
      ),
    );

    // Security: Verify the path is within the Portfolios directory
    const baseDir = path.resolve(
      path.join(process.cwd(), '..', '..', 'src', 'images', 'Portfolios'),
    );
    const resolvedPath = path.resolve(manifestPath);
    if (!resolvedPath.startsWith(baseDir)) {
      res.status(403).json({ error: 'Access denied: path outside Portfolios directory' });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Manifest not found: ${type} (${resolvedPath}) - [type].ts:102`);
      res.status(404).json({
        error: `Manifest not found: ${type}`,
      });
      return;
    }

    // Read and parse manifest
    const manifestContent = fs.readFileSync(resolvedPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    // Return manifest with appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for dev
    res.status(200).json(manifest);
  } catch (error) {
    console.error(`Error serving manifest ${type}: - [type].ts:120`, error);

    if (error instanceof SyntaxError) {
      res.status(500).json({
        error: 'Invalid JSON in manifest file',
        details: error.message,
      });
    } else if (error instanceof Error) {
      res.status(500).json({
        error: 'Error reading manifest file',
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Unknown error reading manifest file',
      });
    }
  }
}
