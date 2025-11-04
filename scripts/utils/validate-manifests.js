#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '../../src/images/Portfolios');
let errors = 0;
let checked = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && (e.name === 'manifest.json' || e.name.endsWith('-manifest.json') || e.name.endsWith('manifest.json'))) {
      checked++;
      try {
        const raw = fs.readFileSync(full, 'utf8');
        const obj = JSON.parse(raw);
        // Basic shape checks
        if (obj.collections) {
          if (!Array.isArray(obj.collections)) {
            console.error(`ERR: ${full} -> collections is not an array`);
            errors++;
          }
        }
        if (obj.images) {
          if (!Array.isArray(obj.images)) {
            console.error(`ERR: ${full} -> images is not an array`);
            errors++;
          }
        }
        if (Object.prototype.hasOwnProperty.call(obj, 'totalImages')) {
          if (typeof obj.totalImages !== 'number') {
            console.error(`ERR: ${full} -> totalImages is not a number`);
            errors++;
          }
        }
      } catch (err) {
        console.error(`ERR: Failed to parse ${full}: ${err.message}`);
        errors++;
      }
    }
  }
}

console.log(`Validating manifests under: ${BASE}`);
if (!fs.existsSync(BASE)) {
  console.error('Base manifests folder not found:', BASE);
  process.exit(2);
}
walk(BASE);
console.log(`Checked ${checked} manifest files. Errors: ${errors}`);
process.exit(errors > 0 ? 1 : 0);
