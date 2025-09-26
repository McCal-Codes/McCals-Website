#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DEFAULT_ROOT = 'images/Portfolios/Events';
const OUTPUT_FILE = 'events-manifest.json';

function titleCase(slug) {
  return slug.replace(/[_-]+/g, ' ').trim().split(/\s+/).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

function parseDate(text) {
  const match = /(20\d{2})[-/_]?(0[1-9]|1[0-2])/.exec(text);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    return new Date(Date.UTC(year, month - 1, 1));
  }
  return new Date();
}

async function readDirSafe(dir) {
  try { return await fsp.readdir(dir); }
  catch { return []; }
}

function deriveCategory(dir) {
  const slug = dir.toLowerCase();
  if (/(gala|celebration|festival|party|wedding|graduation)/.test(slug)) return 'Celebration';
  if (/(conference|summit|forum|symposium)/.test(slug)) return 'Conference';
  if (/(on-location|location|travel|tour)/.test(slug)) return 'On-Location';
  if (/(published|press|feature|media)/.test(slug)) return 'Published';
  return 'Corporate';
}

async function exists(target) {
  try {
    await fsp.access(target, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const rootDir = (rootFlag >= 0 && argv[rootFlag + 1]) ? argv[rootFlag + 1] : DEFAULT_ROOT;
  const absRoot = path.resolve(rootDir);

  if (!(await exists(absRoot))) {
    console.error('[ERR] Events root not found:', absRoot);
    process.exit(1);
  }

  const entries = await fsp.readdir(absRoot, { withFileTypes: true });
  const dirs = entries.filter(d => d.isDirectory()).map(d => d.name).sort();

  const events = [];
  for (const dir of dirs) {
    const files = (await readDirSafe(path.join(absRoot, dir))).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
    if (!files.length) continue;

    const images = files.map(file => ({
      path: path.posix.join(rootDir.replace(/^.*?src\//, 'src/'), dir, file)
    }));

    events.push({
      eventName: titleCase(dir),
      category: deriveCategory(dir),
      dateDisplay: parseDate(dir).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      images,
      totalImages: images.length
    });
  }

  const stamp = value => Date.parse('01 ' + value) || 0;
  events.sort((a, b) => stamp(b.dateDisplay) - stamp(a.dateDisplay));

  const manifest = {
    version: '2.5.3',
    generated: new Date().toISOString().slice(0, 10),
    totalEvents: events.length,
    events
  };

  const outFile = path.join(absRoot, OUTPUT_FILE);
  await fsp.writeFile(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('[OK] Wrote manifest:', path.relative(process.cwd(), outFile));
}

main().catch(err => {
  console.error('[ERR]', err && err.stack || err);
  process.exit(1);
});