#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(process.cwd(), 'src', 'images', 'Portfolios');

function isManifest(file) {
  return file.toLowerCase() === 'manifest.json';
}

function walkAndRemove(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // Recurse
      walkAndRemove(full);
    } else if (e.isFile() && isManifest(e.name)) {
      // Skip root-level portfolio manifests (e.g., portrait-manifest.json, concert-manifest.json are at portfolio root, not named manifest.json)
      // Only remove manifest.json files that live in subfolders (e.g., src/images/Portfolios/Portrait/Studio/manifest.json)
      const rel = path.relative(BASE, full);
      const parts = rel.split(path.sep);
      if (parts.length >= 3) {
        try {
          fs.unlinkSync(full);
          console.log(`Removed: ${full}`);
        } catch (err) {
          console.error(`Failed to remove ${full}: ${err.message}`);
        }
      }
    }
  }
}

if (!fs.existsSync(BASE)) {
  console.error('Base portfolios path not found:', BASE);
  process.exit(1);
}

console.log('Removing per-subfolder manifest.json files under', BASE);
walkAndRemove(BASE);
console.log('Done. Review changes and commit if desired.');
