#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Scan scripts/ for duplicate basenames and optionally archive non-canonical copies

const ROOT = path.join(process.cwd(), 'scripts');
const ARCHIVE_DIR = path.join(ROOT, '_archived');

function walk(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (it.name === '_archived') continue;
      results.push(...walk(p));
    } else {
      results.push(p);
    }
  }
  return results;
}

function basename(p) {
  return path.basename(p);
}

function ensureArchive() {
  if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

function moveToArchive(p) {
  ensureArchive();
  const name = path.basename(p);
  const dest = path.join(ARCHIVE_DIR, `${name}.archived`);
  let i = 0;
  let final = dest;
  while (fs.existsSync(final)) {
    i++;
    final = path.join(ARCHIVE_DIR, `${name}.archived.${i}`);
  }
  fs.renameSync(p, final);
  return final;
}

function main() {
  const args = process.argv.slice(2);
  const doArchive = args.includes('--archive');

  if (!fs.existsSync(ROOT)) {
    console.error('No scripts/ folder found');
    process.exit(1);
  }

  const files = walk(ROOT).filter(p => p.endsWith('.js') || p.endsWith('.sh') || p.endsWith('.ps1'));
  const map = new Map();
  for (const f of files) {
    const b = basename(f);
    if (!map.has(b)) map.set(b, []);
    map.get(b).push(f);
  }

  const duplicates = [...map.entries()].filter(([, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate script basenames found under scripts/');
    return;
  }

  console.log('Found duplicate script basenames:');
  for (const [name, paths] of duplicates) {
    console.log(`\n• ${name}`);
    paths.forEach(p => console.log('   -', p));

    // Decide canonical path: prefer paths containing /manifest/ or /watchers/ or /utils/ or /admin/
    const prefer = paths.find(p => /scripts[\\/]manifest[\\/]/.test(p) || /scripts[\\/]watchers[\\/]/.test(p) || /scripts[\\/]utils[\\/]/.test(p) || /scripts[\\/]admin[\\/]/.test(p));
    const canonical = prefer || paths[0];
    console.log('   -> Canonical:', canonical);

    for (const p of paths) {
      if (p === canonical) continue;
      if (doArchive) {
        const dest = moveToArchive(p);
        console.log(`   Archived ${p} -> ${dest}`);
      } else {
        console.log(`   To archive: ${p}`);
      }
    }
  }

  if (!doArchive) {
    console.log('\nRun this script with --archive to automatically move non-canonical copies into scripts/_archived/');
  }
}

if (require.main === module) main();
