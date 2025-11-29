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
const REQUIRED_DOCS = [
  { key: 'copilot', file: path.join(ROOT, '.github', 'copilot-instructions.md'), title: 'Copilot instructions' },
  { key: 'codex', file: path.join(ROOT, '.github', 'codex-instructions.md'), title: 'Codex instructions' },
  { key: 'canvas', file: path.join(ROOT, '.github', 'canvas-instructions.md'), title: 'Canvas instructions' }
];

// Dynamically discover instruction files in .github to avoid hardcoding and
// to make the preflight tolerant to new/renamed instruction docs.
function discoverDocs() {
  const sources = [
    { dir: path.join(ROOT, '.github'), filter: f => /instructions?/.test(f) && f.endsWith('.md') },
    // Include key standards/docs that drive workspace policies
    { dir: path.join(ROOT, 'docs', 'standards'), filter: f => f.endsWith('.md') && /workspace-organization|versioning|performance-standards|widget-standards|widget-reference/i.test(f) }
  ];
  const out = [];
  for (const src of sources) {
    try {
      const files = fs.readdirSync(src.dir);
      for (const f of files) {
        if (!src.filter(f)) continue;
        out.push({ file: path.join(src.dir, f), name: f });
      }
    } catch (e) {
      // ignore missing dirs
    }
  }
  return out;
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

  const limitShort = isShort ? 1 : 3;
  sections.purpose = tryHeading(['purpose', 'purpose and scope', 'purpose and scope:'], limitShort);
  sections.workflow = tryHeading(['images and manifests pipeline (critical)', 'images and manifests pipeline', 'run/build/deploy workflows', 'local workflow (short)'], limitShort);
  sections.ci = tryHeading(['ci automation', 'ci & health', 'ci & health', 'workflow standards', 'github actions workflow standards'], limitShort);
  sections.authoring = tryHeading(['widget authoring conventions', 'golden rules', 'widgets'], isShort ? 1 : 2);

  // Highlight critical 2025-11 policies
  sections.policies = tryHeading([
    'single-portfolio manifest policy (2025-11)',
    'single-portfolio manifest policy',
    'legacy widget version archival (phase 1 — 2025-11)'
  ], limitShort);
  sections.versioning = tryHeading([
    'versioning',
    'version standardization',
    'version standardization complete (x.x.0 format)'
  ], limitShort);

  const norms = [
    ...tryHeading(['key rules', 'safe-change checklist for agents', 'safe-change checklist'], isShort ? 4 : 6),
    ...tryHeading(['codex summary', 'agent responsibilities'], isShort ? 2 : 3)
  ].slice(0, isShort ? 6 : 8);

  const checklist = tryHeading(['pre-call checklist', 'pre-call checklist (30–60 seconds)', 'safe-change checklist for agents', 'new task checklist'], isShort ? 4 : 7);

  return { key, title, sections, norms, checklist };
}

function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const trimmed = (item || '').trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    out.push(trimmed);
  }
  return out;
}

function formatPretty(results, meta) {
  const lines = [];
  lines.push('🔎 AI Instructions Preflight Summary');
  lines.push('');
  if (meta.missingRequired && meta.missingRequired.length) {
    lines.push('Required instructions missing:');
    meta.missingRequired.forEach(m => lines.push(`- ❌ ${m.title} (${m.file})`));
    lines.push('');
  }

  if (meta.repoNorms && meta.repoNorms.length) {
    lines.push('Repo norms (top signals):');
    meta.repoNorms.forEach(n => lines.push(`- ${n}`));
    lines.push('');
  }

  if (meta.checklist && meta.checklist.length) {
    lines.push('New task checklist:');
    meta.checklist.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

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
    // Show policy highlights if present
    if (r.summary && r.summary.sections && (r.summary.sections.policies?.length || r.summary.sections.versioning?.length)) {
      lines.push(`  - policy-highlights:`);
      (r.summary.sections.policies || []).forEach(b => lines.push(`    • ${b}`));
      (r.summary.sections.versioning || []).forEach(b => lines.push(`    • ${b}`));
    }
    if (r.summary && r.summary.norms && r.summary.norms.length && !isShort) {
      lines.push(`- Norms sample:`);
      r.summary.norms.forEach(n => lines.push(`  • ${n}`));
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
      outputs.push({ key: doc.key, title: doc.title, file: doc.file, error: info.error });
      continue;
    }
    const summary = summarizeDoc(doc.key, doc.title, info.content);
    outputs.push({ key: doc.key, title: doc.title, file: doc.file, mtime: info.mtime, size: info.size, summary });
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

  const missingRequired = REQUIRED_DOCS.filter(req => {
    const matching = outputs.find(o => o.file && path.resolve(o.file) === path.resolve(req.file));
    if (!fs.existsSync(req.file)) return true;
    if (matching && matching.error) return true;
    return false;
  }).map(r => ({ key: r.key, file: r.file, title: r.title }));
  const repoNorms = dedupe(outputs.flatMap(o => (o.summary && o.summary.norms) || [])).slice(0, isShort ? 6 : 10);
  const checklistSeeds = outputs
    .flatMap(o => (o.summary && o.summary.checklist) || [])
    .map(item => item.replace(/\s*[:：]\s*$/, ''))
    .filter(item => item.toLowerCase() !== 'locate the definitive source');
  const defaultChecklist = [
    'Read .github/copilot-instructions.md and .github/codex-instructions.md before editing.',
    'If touching widgets, open the widget README and add a new version file instead of overwriting.',
    'Do not edit generated dist/** or manifest.json files by hand; rerun manifest generators.',
    'If images/manifests change: run npm run manifest:generate or the targeted manifest script.',
    'Plan the minimal validation (lint/tests or widget preview) and mention what you ran.'
  ];
  const checklist = dedupe([...defaultChecklist, ...checklistSeeds]).slice(0, isShort ? 6 : 9);

  const meta = { missingRequired, repoNorms, checklist };

  if (isJSON) {
    console.log(JSON.stringify({ docs: toReport, meta }, null, 2));
  } else {
    console.log(formatPretty(toReport, meta));
  }

  // Non-zero exit if required docs missing to strengthen CI visibility
  const hasMissing = meta.missingRequired && meta.missingRequired.length > 0;

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

  if (hasMissing) {
    process.exitCode = 2;
  }
}

if (require.main === module) {
  main();
}
