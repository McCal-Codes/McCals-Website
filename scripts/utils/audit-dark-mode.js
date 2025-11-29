#!/usr/bin/env node
/**
 * Dark mode audit utility
 * Scans widget HTML files for presence of CSS color tokens and dark-mode indicators
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const WIDGETS = path.join(ROOT, 'src', 'widgets');

function listHtmlFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('_')) continue;
    const widgetDir = path.join(dir, name, 'versions');
    if (!fs.existsSync(widgetDir)) continue;
    for (const f of fs.readdirSync(widgetDir)) {
      if (f.endsWith('.html')) out.push(path.join(widgetDir, f));
    }
  }
  return out;
}

function auditFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const hasTokens = /--(bg|text|muted|accent|overlay)\s*:/i.test(content);
  const hasPrefers = /prefers-color-scheme:\s*dark/i.test(content);
  const hasFocusVisible = /:focus-visible\s*\{/i.test(content);
  const hasOverlayContrast = /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*(0\.6|0\.7|0\.8)\s*\)/i.test(content);
  return { file, hasTokens, hasPrefers, hasFocusVisible, hasOverlayContrast };
}

function main() {
  const files = listHtmlFiles(WIDGETS);
  const results = files.map(auditFile);
  const problems = results.filter(r => !(r.hasTokens && r.hasPrefers && r.hasFocusVisible));
  for (const r of results) {
    console.log(`${r.file} - audit-dark-mode.js:40`);
    console.log(`tokens:${r.hasTokens} prefersdark:${r.hasPrefers} focusvisible:${r.hasFocusVisible} overlaycontrast:${r.hasOverlayContrast} - audit-dark-mode.js:41`);
  }
  if (problems.length) {
    console.error(`Dark mode audit: ${problems.length} potential issues. - audit-dark-mode.js:44`);
    process.exitCode = 1;
  } else {
    console.log('Dark mode audit: PASS - audit-dark-mode.js:47');
  }
}

if (require.main === module) main();
