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
const DOCS = [
  { key: 'copilot', file: path.join(ROOT, '.github', 'copilot-instructions.md'), title: 'Copilot instructions' },
  { key: 'canvas',  file: path.join(ROOT, '.github', 'canvas-instructions.md'),  title: 'Canvas instructions' },
  { key: 'codex',   file: path.join(ROOT, '.github', 'codex-instructions.md'),   title: 'Codex instructions'  },
];

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

function takeTopBullets(markdown, heading, max = 3) {
  // Find a heading line that matches exactly or case-insensitive
  const lines = markdown.split(/\r?\n/);
  const idx = lines.findIndex(l => l.trim().toLowerCase() === heading.trim().toLowerCase());
  if (idx === -1) return [];
  // Collect following bullet lines until next blank line or non-bullet section
  const bullets = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      if (bullets.length > 0) break; // stop at first blank after bullets
      continue;
    }
    if (!/^[-*]\s+/.test(line.trim())) break; // stop if not a bullet
    bullets.push(line.trim().replace(/^[-*]\s+/, ''));
    if (bullets.length >= max) break;
  }
  return bullets;
}

function summarizeDoc(key, title, content) {
  const common = {};
  if (key === 'copilot') {
    common.sections = {
      purpose: takeTopBullets(content, 'Purpose and scope', isShort ? 2 : 3),
      pipeline: takeTopBullets(content, 'Images and manifests pipeline (critical)', isShort ? 2 : 4),
      ci: takeTopBullets(content, 'CI automation', isShort ? 2 : 3),
      authoring: takeTopBullets(content, 'Widget authoring conventions', isShort ? 2 : 3),
    };
  } else if (key === 'canvas') {
    common.sections = {
      scope: takeTopBullets(content, 'Scope and intent', isShort ? 2 : 3),
      workflows: takeTopBullets(content, 'Core workflows (Canvas-friendly)', isShort ? 2 : 3),
      manifests: takeTopBullets(content, 'Manifests essentials', isShort ? 2 : 3),
      etiquette: takeTopBullets(content, 'Edit etiquette in Canvas', isShort ? 2 : 3),
    };
  } else if (key === 'codex') {
    common.sections = {
      goal: takeTopBullets(content, 'Goal', 1),
      checklist: takeTopBullets(content, 'Pre-call checklist (30–60 seconds)', isShort ? 2 : 3),
      strategy: takeTopBullets(content, 'Single-pass edit strategy', isShort ? 2 : 3),
      avoids: takeTopBullets(content, 'Avoids', isShort ? 2 : 3),
    };
  }
  return { key, title, ...common };
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

  if (isJSON) {
    console.log(JSON.stringify(outputs, null, 2));
  } else {
    console.log(formatPretty(outputs));
  }
}

if (require.main === module) {
  main();
}
