#!/usr/bin/env node
/**
 * Dry-run scanner for widget versions.
 * Reports active vs legacy counts per widget without failing.
 * Phase 1 scaffolding; Phase 2 will enforce limits via CI.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const WIDGETS_DIR = path.join(ROOT, 'src', 'widgets');
const ARCHIVE_DIR = path.join(WIDGETS_DIR, '_archived', 'Legacy Widgets');

function listDirs(p) {
  try {
    return fs.readdirSync(p).filter(name => fs.statSync(path.join(p, name)).isDirectory());
  } catch (e) {
    return [];
  }
}

function listHtml(p) {
  try {
    return fs.readdirSync(p).filter(name => name.endsWith('.html'));
  } catch (e) {
    return [];
  }
}

function scanWidget(widgetName) {
  const versionsDir = path.join(WIDGETS_DIR, widgetName, 'versions');
  const activeFiles = listHtml(versionsDir);
  const archiveVersionsDir = path.join(ARCHIVE_DIR, widgetName, 'versions');
  const archivedFiles = listHtml(archiveVersionsDir);

  return {
    widget: widgetName,
    activeCount: activeFiles.length,
    archivedCount: archivedFiles.length,
    activeSamples: activeFiles.slice(0, 5),
    archivedSamples: archivedFiles.slice(0, 5),
  };
}

function main() {
  if (!fs.existsSync(WIDGETS_DIR)) {
    console.error('Widgets directory not found:', WIDGETS_DIR);
    process.exitCode = 0;
    return;
  }

  const widgetDirs = listDirs(WIDGETS_DIR).filter(name => name !== '_archived');
  const results = widgetDirs.map(scanWidget);

  console.log('Widget Versions Scan (dry-run)');
  console.log('Policy: ≤2 active versions in live directories; older versions archived.');
  console.log('---');
  for (const r of results) {
    console.log(`${r.widget}: active=${r.activeCount}, archived=${r.archivedCount}`);
    if (r.activeCount > 2) {
      console.log(`  Note: More than 2 active versions detected. Phase 2 will enforce limits.`);
    }
    if (r.activeSamples.length) {
      console.log('  Active samples:', r.activeSamples.join(', '));
    }
    if (r.archivedSamples.length) {
      console.log('  Archived samples:', r.archivedSamples.join(', '));
    }
  }
}

main();
