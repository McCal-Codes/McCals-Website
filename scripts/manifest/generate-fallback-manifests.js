#!/usr/bin/env node
/**
 * generate-fallback-manifests.js
 * Purpose: Produce minimal resilient fallback manifest JSON files so widgets can gracefully degrade
 * when primary manifest sources (API, GitHub raw, local path) are unreachable or invalid.
 *
 * Output files (written alongside primary manifests):
 *   - src/images/Portfolios/Events/events-manifest.fallback.json
 *   - src/images/Portfolios/Concert/concert-manifest.fallback.json
 *
 * Shape principles:
 *   Keep property names that widgets probe (version, generated, events/bands arrays) but keep arrays empty.
 *   Widgets are already coded to show "Coming Soon" or equivalent when no items exist.
 *
 * CLI flags:
 *   --force   Regenerate even if fallback file already exists
 *   --verbose Print extra logging
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');

function log(...msg){ if(VERBOSE) console.log('[fallback]', ...msg); }
function writeJSON(fp, obj){
  const data = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(fp, data, 'utf8');
  log('wrote', fp);
}

const today = new Date().toISOString().split('T')[0];

const targets = [
  {
    primary: 'src/images/Portfolios/Events/events-manifest.json',
    fallback: 'src/images/Portfolios/Events/events-manifest.fallback.json',
    type: 'events',
    versionPrefix: 'fallback-events',
    shape: () => ({
      version: 'fallback-events',
      generated: today,
      totalEvents: 0,
      events: []
    })
  },
  {
    primary: 'src/images/Portfolios/Concert/concert-manifest.json',
    fallback: 'src/images/Portfolios/Concert/concert-manifest.fallback.json',
    type: 'concert',
    versionPrefix: 'fallback-concert',
    shape: () => ({
      version: 'fallback-concert',
      generated: today,
      totalBands: 0,
      bands: []
    })
  }
];

let created = 0;
let skipped = 0;

for(const t of targets){
  const fallbackPath = path.resolve(t.fallback);
  const exists = fs.existsSync(fallbackPath);
  if(exists && !FORCE){
    skipped++;
    log('skip existing', t.fallback);
    continue;
  }
  // Ensure directory exists
  fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
  writeJSON(fallbackPath, t.shape());
  created++;
}

console.log(`✅ Fallback manifests complete. Created: ${created}, Skipped: ${skipped}. Use --force to overwrite.`);
