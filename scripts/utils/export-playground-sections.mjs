#!/usr/bin/env node
// Simple export tool: extracts sections marked with <!-- BEGIN_COPY:name --> and <!-- END_COPY:name -->
// Usage: node scripts/utils/export-playground-sections.js [output-dir]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const playgroundPath = path.join(process.cwd(), 'src', 'widgets', 'css-playground', 'versions', 'v1.3.html');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'scripts', 'outbox');

if (!existsSync(playgroundPath)) {
  console.error('Playground file not found:', playgroundPath);
  process.exit(1);
}

const html = readFileSync(playgroundPath, 'utf8');

// Find all BEGIN_COPY markers
const markerRE = /<!--\s*BEGIN_COPY:([a-z0-9_-]+)\s*-->([\s\S]*?)<!--\s*END_COPY:\1\s*-->/gi;
let match;
const exportsArr = [];
while ((match = markerRE.exec(html)) !== null) {
  const name = match[1];
  const content = match[2].trim();
  exportsArr.push({ name, content });
}

if (exportsArr.length === 0) {
  console.log('No marked sections found in', playgroundPath);
  process.exit(0);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

exportsArr.forEach(item => {
  const fileName = `${item.name}.html`;
  const outPath = path.join(outDir, fileName);
  writeFileSync(outPath, item.content + '\n', 'utf8');
  console.log('Wrote', outPath);
});

console.log('Export complete. Inspect files in', outDir);
