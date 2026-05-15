import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyCors } from '../_lib/cors.js';

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
  if (applyCors(req, res, { methods: 'GET, OPTIONS' })) {
    return;
  }

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

  const candidateDirs = [
    path.resolve(__dirname, 'data'),
    path.resolve(__dirname, '..', '..', 'public-vite', 'manifests'),
  ];
  const manifestPath = candidateDirs
    .map((baseDir) => ({
      baseDir,
      manifestPath: path.resolve(baseDir, mapping),
    }))
    .find((candidate) => (
      candidate.manifestPath.startsWith(candidate.baseDir) &&
      fs.existsSync(candidate.manifestPath)
    ))?.manifestPath;

  if (!manifestPath) {
    res.status(404).json({ error: `Manifest not found: ${type}` });
    return;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(manifest);
  } catch {
    res.status(500).json({ error: 'Error reading manifest' });
  }
}
