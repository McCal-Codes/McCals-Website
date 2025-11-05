#!/usr/bin/env node
/*
 * Lightweight generator for src/widgets/widgets-manifest.json
 * - Scans src/widgets/
 * - Skips `_archived` and dotfiles
 * - Reads README.md and STATUS.md (if present)
 * - Lists versioned files under versions/ and top-level HTML files
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WIDGETS_DIR = path.join(ROOT, 'src', 'widgets');
const OUT_FILE = path.join(WIDGETS_DIR, 'widgets-manifest.json');

function readFirstParagraph(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/).map(l => l.trim());
    let para = [];
    for (const l of lines) {
      if (l === '') break;
      para.push(l.replace(/^#+\s*/, ''));
    }
    return para.join(' ');
  } catch (e) {
    return '';
  }
}

function scan() {
  if (!fs.existsSync(WIDGETS_DIR)) {
    console.error('Widgets directory not found:', WIDGETS_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(WIDGETS_DIR, { withFileTypes: true });
  const widgets = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith('.')) continue;
    if (name === '_archived') continue;

    const widgetPath = path.join(WIDGETS_DIR, name);
    const readmePath = path.join(widgetPath, 'README.md');
    const statusPath = path.join(widgetPath, 'STATUS.md');
    const versionsDir = path.join(widgetPath, 'versions');

    const description = fs.existsSync(readmePath) ? readFirstParagraph(readmePath) : '';
    let status = 'production';
    if (fs.existsSync(statusPath)) {
      const s = readFirstParagraph(statusPath).toLowerCase();
      status = s ? s.split(/[\s\n]/)[0] : 'wip';
    }

    // collect versions
    const versions = [];
    if (fs.existsSync(versionsDir)) {
      const vs = fs.readdirSync(versionsDir, { withFileTypes: true });
      for (const v of vs) if (v.isFile()) versions.push(path.join('versions', v.name));
    }

    // top-level html files (common for widget versioned files)
    const topFiles = fs.readdirSync(widgetPath, { withFileTypes: true });
    for (const f of topFiles) {
      if (f.isFile() && /\.html?$/.test(f.name)) {
        versions.push(f.name);
      }
    }

    widgets.push({
      name,
      path: path.relative(ROOT, widgetPath).replace(/\\/g, '/'),
      description,
      status,
      versions: versions.sort(),
    });
  }

  // sort by name
  widgets.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return widgets;
}

function write(outPath, data) {
  const formatted = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(outPath, formatted, 'utf8');
  console.log('Wrote manifest to', outPath);
}

function main() {
  const widgets = scan();
  write(OUT_FILE, { generatedAt: new Date().toISOString(), count: widgets.length, widgets });
}

main();
