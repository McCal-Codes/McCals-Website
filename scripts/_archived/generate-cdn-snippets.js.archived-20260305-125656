#!/usr/bin/env node
"use strict";
// Generate per-widget CDN embed snippets (non-destructive)
// Writes snippet files to src/widgets/_cdn/snippets/<widget>.html

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const widgetsDir = path.join(repoRoot, 'src', 'widgets');
const outDir = path.join(widgetsDir, '_cdn', 'snippets');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function findLatestVersionFile(versionsPath) {
  try {
    const files = fs.readdirSync(versionsPath).filter(f => f.endsWith('.html'));
    if (!files.length) return null;
    // prefer files that start with 'v' and sort by name (simple heuristic)
    files.sort();
    return files[files.length - 1];
  } catch (e) {
    return null;
  }
}

function main() {
  ensureDir(outDir);
  const widgets = fs.readdirSync(widgetsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== '_cdn')
    .map(d => d.name);

  widgets.forEach(widgetName => {
    const versionsPath = path.join(widgetsDir, widgetName, 'versions');
    if (!fs.existsSync(versionsPath)) return; // skip widgets without versions
    const latest = findLatestVersionFile(versionsPath);
    if (!latest) return;

    const dataPath = path.posix.join('src', 'widgets', widgetName, 'versions', latest);
    const snippet = `<!-- Auto-generated CDN snippet for widget: ${widgetName} -->\n<div class="mccal-widget" data-repo="McCal-Codes/McCals-Website" data-path="${dataPath}" data-version="${latest.split('-')[0] || ''}" data-fallback="/${dataPath}">\n  <div class="mccal-widget-placeholder">Loading ${widgetName}…</div>\n</div>\n<script src="/src/widgets/cdn/jsdelivr-loader.js" async></script>\n`;

    const outPath = path.join(outDir, widgetName + '.html');
    fs.writeFileSync(outPath, snippet, 'utf8');
    console.log('Wrote snippet for', widgetName, '->', outPath);
  });

  console.log('Done. Snippets are in', outDir);
}

main();
