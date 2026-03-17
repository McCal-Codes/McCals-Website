import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.resolve(__dirname, '..', '..', '..', 'src', 'images', 'Portfolios');
const DEST = path.resolve(__dirname, '..', 'api', 'manifests', 'data');

const FILES = [
  ['Concert/concert-manifest.json', 'concert-manifest.json'],
  ['Events/events-manifest.json', 'events-manifest.json'],
  ['Journalism/journalism-manifest.json', 'journalism-manifest.json'],
  ['Nature/nature-manifest.json', 'nature-manifest.json'],
  ['Portrait/portrait-manifest.json', 'portrait-manifest.json'],
  ['portfolio-manifest.json', 'portfolio-manifest.json'],
  ['featured-manifest.json', 'featured-manifest.json'],
];

fs.mkdirSync(DEST, { recursive: true });

for (const [src, dest] of FILES) {
  const srcPath = path.join(SRC, src);
  const destPath = path.join(DEST, dest);
  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: manifest not found: ${srcPath}`);
    continue;
  }
  fs.copyFileSync(srcPath, destPath);
  console.log(`Synced: ${dest}`);
}
