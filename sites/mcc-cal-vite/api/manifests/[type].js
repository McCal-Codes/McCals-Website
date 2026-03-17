import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel Serverless Function: /api/manifests/[type]
 * Serves portfolio manifest JSON files from the repository filesystem.
 */

const TYPE_MAP = {
  concert: { dir: 'Concert', file: 'concert-manifest.json' },
  concerts: { dir: 'Concert', file: 'concert-manifest.json' },
  events: { dir: 'Events', file: 'events-manifest.json' },
  event: { dir: 'Events', file: 'events-manifest.json' },
  journalism: { dir: 'Journalism', file: 'journalism-manifest.json' },
  photojournalism: { dir: 'Journalism', file: 'journalism-manifest.json' },
  nature: { dir: 'Nature', file: 'nature-manifest.json' },
  portrait: { dir: 'Portrait', file: 'portrait-manifest.json' },
  portraits: { dir: 'Portrait', file: 'portrait-manifest.json' },
  featured: { dir: 'Featured', file: 'featured-manifest.json' },
  universal: { dir: 'Portfolios', file: 'portfolio-manifest.json' },
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

  const baseDir = path.resolve(__dirname, '..', '..', '..', '..', 'src', 'images', 'Portfolios');
  const manifestPath = path.resolve(path.join(baseDir, mapping.dir, mapping.file));

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
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(manifest);
  } catch (error) {
    res.status(500).json({ error: 'Error reading manifest', details: String(error) });
  }
}
