#!/usr/bin/env node
// Read s3-upload-map.json produced by upload-to-s3.js and update manifest JSON files to reference CDN URLs
const fs = require('fs');
const path = require('path');

const mapFile = 's3-upload-map.json';
if (!fs.existsSync(mapFile)) { console.error('Missing', mapFile); process.exit(2); }
const map = JSON.parse(fs.readFileSync(mapFile,'utf8'));
const lookup = new Map(map.map(m=>[path.normalize(m.local), m.url]));

function findManifests(root) {
  return fs.readdirSync(root).filter(n=>n.endsWith('-manifest.json') || n.endsWith('manifest.json')).map(n=>path.join(root,n));
}

function updateFile(file) {
  const orig = fs.readFileSync(file,'utf8');
  let json;
  try { json = JSON.parse(orig); } catch(e){ console.error('Skipping non-json', file); return; }
  let updated = false;

  function walkObj(obj) {
    if (Array.isArray(obj)) return obj.map(walkObj);
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === 'string') {
          const candidate = path.normalize(v);
          if (lookup.has(candidate)) { obj[k] = lookup.get(candidate); updated = true; }
        } else if (typeof v === 'object' && v !== null) walkObj(v);
      }
    }
    return obj;
  }

  walkObj(json);
  if (updated) {
    fs.writeFileSync(file, JSON.stringify(json,null,2));
    console.log('Updated manifest:', file);
  } else {
    console.log('No changes for', file);
  }
}

const roots = ['src/images/Portfolios'];
for (const r of roots) {
  if (!fs.existsSync(r)) continue;
  const manifests = findManifests(r);
  for (const m of manifests) updateFile(m);
}
