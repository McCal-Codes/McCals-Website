#!/usr/bin/env node
/**
 * AI Instructions Preflight
 * Summarizes Copilot/Canvas/Codex instruction docs to validate awareness before agent usage.
 * 
 * Usage:
 *   node scripts/ai-instructions-preflight.js           # pretty text summary
 *   node scripts/ai-instructions-preflight.js --short   # tighter summary
 *   node scripts/ai-instructions-preflight.js --json    # JSON output
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

// Dynamically discover instruction files in .github to avoid hardcoding and
// to make the preflight tolerant to new/renamed instruction docs.
function discoverDocs() {
  const dir = path.join(ROOT, '.github');
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(f => /instructions?/.test(f) && f.endsWith('.md'))
      .map(f => ({ file: path.join(dir, f), name: f }));
  } catch (e) {
    return [];
  }
}

const DISCOVERED = discoverDocs();

const DOCS = DISCOVERED.map(d => {
  // make a friendly key/title from filename
  const key = d.name.replace(/\.md$/i, '').replace(/[^a-z0-9]+/ig, '-').toLowerCase();
  const title = d.name.replace(/[-_]/g, ' ').replace(/\.md$/i, '');
  return { key, file: d.file, title };
});

const args = new Set(process.argv.slice(2));
const isJSON = args.has('--json');
const isShort = args.has('--short');

function readFileSafe(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const stat = fs.statSync(file);
    return { ok: true, content, mtime: stat.mtime, size: stat.size };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function findHeadingIndex(lines, heading) {
  const want = heading.trim().toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    // match markdown heading like '# Heading' or '## Heading' or a plain line 'Heading'
    const mdMatch = l.replace(/^#+\s*/, '').trim().toLowerCase();
    if (mdMatch === want) return i;
    if (l.toLowerCase() === want) return i;
  }
  return -1;
}

function takeTopBullets(markdown, heading, max = 3) {
  const lines = markdown.split(/\r?\n/);
  const idx = findHeadingIndex(lines, heading);
  if (idx === -1) return [];
  const bullets = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      if (bullets.length > 0) break;
      continue;
    }
    const trimmed = line.trim();
    if (/^[-*\d\.]+\s+/.test(trimmed)) {
      // bullet or numbered list
      bullets.push(trimmed.replace(/^[-*\d\.]+\s+/, ''));
      if (bullets.length >= max) break;
      continue;
    }
    // stop if we hit another markdown heading
    if (/^#{1,6}\s+/.test(trimmed)) break;
    // if it's a paragraph line and we have no bullets yet, collect first paragraph as fallback
    if (bullets.length === 0) {
      // collect following paragraph lines
      let para = trimmed;
      for (let j = i + 1; j < lines.length; j++) {
        const l2 = lines[j].trim();
        if (!l2) break;
        if (/^#{1,6}\s+/.test(l2)) break;
        para += ' ' + l2;
      }
      bullets.push(para.slice(0, 240)); // limit length
    }
    break;
  }
  return bullets;
}

function summarizeDoc(key, title, content) {
  // Attempt to extract useful sections heuristically. This keeps the preflight robust
  // even if headings change slightly between instruction files.
  const sections = {};
  const tryHeading = (variants, max) => {
    for (const h of variants) {
      const out = takeTopBullets(content, h, max);
      if (out && out.length) return out;
    }
    return [];
  };

  sections.purpose = tryHeading(['purpose', 'purpose and scope', 'purpose and scope:'], isShort ? 1 : 3);
  sections.workflow = tryHeading(['images and manifests pipeline (critical)', 'images and manifests pipeline', 'run/build/deploy workflows', 'local workflow (short)'], isShort ? 1 : 3);
  sections.ci = tryHeading(['ci automation', 'ci & health', 'ci & health'], isShort ? 1 : 3);
  sections.authoring = tryHeading(['widget authoring conventions', 'golden rules', 'widgets'], isShort ? 1 : 2);

  return { key, title, sections };
}

function formatPretty(results) {
  const lines = [];
  lines.push('🔎 AI Instructions Preflight Summary');
  lines.push('');
  for (const r of results) {
    lines.push(`## ${r.title}`);
    if (r.error) {
      lines.push(`- Status: ❌ Missing (${r.error})`);
      lines.push('');
      continue;
    }
    lines.push(`- Status: ✅ Found`);
    lines.push(`- Last updated: ${r.mtime.toISOString()}`);
    lines.push(`- Size: ${r.size} bytes`);
    if (r.summary && r.summary.sections) {
      for (const [name, bullets] of Object.entries(r.summary.sections)) {
        if (!bullets || bullets.length === 0) continue;
        lines.push(`  - ${name}:`);
        bullets.forEach(b => lines.push(`    • ${b}`));
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

function main() {
  const outputs = [];
  for (const doc of DOCS) {
    const info = readFileSafe(doc.file);
    if (!info.ok) {
      outputs.push({ key: doc.key, title: doc.title, error: info.error });
      continue;
    }
    const summary = summarizeDoc(doc.key, doc.title, info.content);
    outputs.push({ key: doc.key, title: doc.title, mtime: info.mtime, size: info.size, summary });
  }

  // If --changed is provided, only show docs with newer mtimes than cache
  const changedOnly = args.has('--changed');
  const cacheFile = path.join(ROOT, '.cache', 'ai-preflight.json');
  let cache = {};
  try {
    if (fs.existsSync(cacheFile)) cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) || {};
  } catch (e) { cache = {}; }

  const toReport = changedOnly ? outputs.filter(o => {
    if (o.error) return true;
    const prev = cache[o.key] && new Date(cache[o.key]);
    return !prev || new Date(o.mtime) > prev;
  }) : outputs;

  if (isJSON) {
    console.log(JSON.stringify(toReport, null, 2));
  } else {
    console.log(formatPretty(toReport));
  }

  // update cache mtimes for next run
  try {
    const dir = path.dirname(cacheFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const toSave = {};
    for (const o of outputs) if (!o.error) toSave[o.key] = o.mtime;
    fs.writeFileSync(cacheFile, JSON.stringify(toSave, null, 2), 'utf8');
  } catch (e) {
    // non-fatal
  }
}

if (require.main === module) {
  main();
}
