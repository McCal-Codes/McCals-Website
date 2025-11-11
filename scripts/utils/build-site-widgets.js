#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../../src/widgets/_shared/site-widgets.css');
const outDir = path.join(__dirname, '../../dist/site-widgets');
const outMin = path.join(outDir, 'site-widgets.min.css');
const outPretty = path.join(outDir, 'site-widgets.css');

if (!fs.existsSync(src)) {
  console.error('Source CSS not found:', src);
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');

// Simple minifier: remove comments, collapse whitespace, but keep necessary spaces
function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/[\n\r]+/g, ' ') // newlines to space
    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
    .replace(/\s*([{}:;,])\s*/g, '$1') // tighten around tokens
    .trim();
}

const pretty = raw.trim() + '\n';
const min = minify(raw) + '\n';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPretty, pretty, 'utf8');
fs.writeFileSync(outMin, min, 'utf8');

console.log('Built site-widgets to', outDir);
console.log('Files:', outPretty, outMin);
