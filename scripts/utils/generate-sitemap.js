#!/usr/bin/env node
/*
  Simple sitemap generator for McCal Media workspace
  - Scans `src/site` and `src/widgets` for HTML files
  - Produces an XML sitemap at the provided output path (default: dist/sitemap.xml)
  - Also writes a copy to repository root `sitemap.xml` for convenience

  Usage:
    node scripts/utils/generate-sitemap.js --base https://example.com --out dist/sitemap.xml

  Notes:
    - If `--base` is omitted, defaults to https://mccalmedia.com
    - File paths are turned into site paths by removing leading `src/site` or `src` prefixes
*/
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import process from 'process';

const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('--')) {
    const key = a.replace(/^--/, '');
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    argMap[key] = val;
    if (val !== true) i++;
  }
}

const BASE = String(argMap.base || 'https://mcc-cal.com').replace(/\/$/, '');
const OUT = String(argMap.out || 'dist/sitemap.xml');
const ROOT_COPY = 'sitemap.xml';

const repoRoot = process.cwd();

async function walk(dir, results = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, results);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        results.push(full);
      }
    }
  } catch (err) {
    // ignore missing directories
  }
  return results;
}

function toUrl(filePath) {
  // Normalize to posix-style forward slashes
  const rel = path.relative(repoRoot, filePath).split(path.sep).join('/');

  // Common transforms:
  //  - src/site/index.html -> /
  //  - src/site/about.html -> /about.html
  //  - src/widgets/... -> /widgets/...
  if (rel.startsWith('src/site/')) {
    const remainder = rel.replace('src/site/', '');
    if (remainder === 'index.html') return '/';
    return '/' + remainder;
  }

  // Remove leading src/ when present
  if (rel.startsWith('src/')) return '/' + rel.replace('src/', '');

  // Default: use the relative path with leading slash
  return '/' + rel;
}

async function fileLastMod(filePath) {
  try {
    const st = await fs.stat(filePath);
    return st.mtime.toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}

function makeUrlEntry(loc, lastmod) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}

function escapeXml(str) {
  return str.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
    }
  });
}

async function main() {
  console.log('[sitemap] Base URL:', BASE);
  console.log('[sitemap] Searching for HTML files...');

  const candidates = new Set();

  // scan these directories (best-effort)
  const scanDirs = ['src/site', 'src/widgets', 'dist'];
  for (const d of scanDirs) {
    const full = path.join(repoRoot, d);
    if (!existsSync(full)) continue;
    const files = await walk(full);
    files.forEach(f => candidates.add(f));
  }

  // Always ensure index.html at root of src/site is included if present
  const possibleIndex = path.join(repoRoot, 'src', 'site', 'index.html');
  if (existsSync(possibleIndex)) candidates.add(possibleIndex);

  const list = Array.from(candidates).sort();
  if (list.length === 0) {
    console.warn('[sitemap] No HTML files found in scanned directories. Nothing to write.');
  }

  const urlEntries = [];
  for (const file of list) {
    const urlPath = toUrl(file);
    const fullUrl = BASE + urlPath;
    const lastmod = await fileLastMod(file);
    urlEntries.push(makeUrlEntry(fullUrl, lastmod));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urlEntries.join('\n')}\n</urlset>\n`;

  // ensure out dir exists
  const outDir = path.dirname(OUT);
  if (outDir && outDir !== '.') await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(OUT, xml, 'utf8');
  console.log(`[sitemap] Wrote sitemap to ${OUT} (${urlEntries.length} entries)`);

  // write a copy at repo root for Search Console convenience
  await fs.writeFile(path.join(repoRoot, ROOT_COPY), xml, 'utf8');
  console.log(`[sitemap] Also wrote copy to ${ROOT_COPY}`);
}

main().catch(err => {
  console.error('[sitemap] Error:', err);
  process.exit(1);
});
