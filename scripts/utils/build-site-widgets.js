#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipInline = args.includes('--no-inline');

const src = path.join(__dirname, '../../src/widgets/_shared/site-widgets.css');
const widgetsRoot = path.join(__dirname, '../../src/widgets');
const outDir = path.join(__dirname, '../../dist/site-widgets');
const outMin = path.join(outDir, 'site-widgets.min.css');
const outPretty = path.join(outDir, 'site-widgets.css');

const INLINE_START = '<!-- site-widgets:inline:start -->';
const INLINE_END = '<!-- site-widgets:inline:end -->';
const INLINE_SKIP = 'site-widgets:inline:skip';

if (!fs.existsSync(src)) {
  console.error('Source CSS not found:', src);
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');

// Simple minifier: remove comments, collapse whitespace, but keep necessary spaces
function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/[\n\r]+/g, ' ') // newlines to space
    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
    .replace(/\s*([{}:;,])\s*/g, '$1') // tighten around tokens
    .trim();
}

const pretty = raw.trim() + '\n';
const min = minify(raw) + '\n';

fs.mkdirSync(outDir, { recursive: true });
if (!dryRun) {
  fs.writeFileSync(outPretty, pretty, 'utf8');
  fs.writeFileSync(outMin, min, 'utf8');
}

console.log(
  dryRun ? '(dry-run) Built site-widgets CSS in memory' : 'Built site-widgets to ' + outDir,
);
console.log('Files:', outPretty, outMin);

function collectVersionFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.includes('_archived')) continue;
      files.push(...collectVersionFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.html') &&
      fullPath.includes(`${path.sep}versions${path.sep}`)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function inlineSharedCss(css, targetFiles) {
  const block = `${INLINE_START}\n<style data-site-widgets-inline>\n${css.trim()}\n</style>\n${INLINE_END}\n\n`;
  let updated = 0;
  let skipped = 0;

  targetFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    if (content.includes(INLINE_SKIP)) {
      skipped++;
      return;
    }

    const startIdx = content.indexOf(INLINE_START);
    const endIdx = content.indexOf(INLINE_END);
    let nextContent;

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const before = content.slice(0, startIdx);
      const after = content.slice(endIdx + INLINE_END.length);
      nextContent = `${before}${block}${after}`;
    } else {
      const insertIdx = content.indexOf('<style');
      const safeIdx = insertIdx === -1 ? 0 : insertIdx;
      nextContent = `${content.slice(0, safeIdx)}${block}${content.slice(safeIdx)}`;
    }

    if (nextContent !== content) {
      if (!dryRun) {
        fs.writeFileSync(file, nextContent, 'utf8');
      }
      updated++;
      console.log(`${dryRun ? '[dry-run] Would inline' : 'Inlined'} shared CSS in ${file}`);
    }
  });

  return { updated, skipped, total: targetFiles.length };
}

if (!skipInline) {
  const versionFiles = collectVersionFiles(widgetsRoot);
  if (versionFiles.length === 0) {
    console.warn('No widget version files found for inline operation.');
  } else {
    const result = inlineSharedCss(min.trim(), versionFiles);
    console.log(
      `\nShared CSS inline summary: ${result.updated} updated, ${result.skipped} skipped, ${result.total} total scanned${dryRun ? ' (dry-run)' : ''}.`,
    );
  }
} else {
  console.log('Skipping inline step (--no-inline set).');
}
