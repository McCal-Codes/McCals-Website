import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel Serverless Function: /api/manifests/[type]
 * Serves portfolio manifest JSON files from the repository filesystem.
 */

const TYPE_MAP = {
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

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { type } = req.query;
  if (!type || typeof type !== 'string') {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  if (type.includes('..') || type.includes('\0') || type.includes('/')) {
    res.status(400).json({ error: 'Invalid parameters' });
    return;
  }

  const mapping = TYPE_MAP[type.toLowerCase()];
  if (!mapping) {
    res.status(400).json({ error: `Unknown manifest type: ${type}`, available: Object.keys(TYPE_MAP) });
    return;
  }

  const baseDir = path.resolve(__dirname, 'data');
  const manifestPath = path.resolve(baseDir, mapping);

  if (!manifestPath.startsWith(baseDir)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!fs.existsSync(manifestPath)) {
    res.status(404).json({ error: `Manifest not found: ${type}` });
    return;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(manifest);
  } catch (error) {
    res.status(500).json({ error: 'Error reading manifest' });
  }
}
