#!/usr/bin/env node
// Widget HTML Validation Script
// Scans all widget HTML files in src/widgets/*/versions/ and validates:
//   - HTML syntax (basic check)
//   - Namespace wrapper and data-widget-version
//   - All CSS/JS is inline (no <link> or <script src=...>)
//   - Optionally: accessibility check placeholder
//
// Usage: node scripts/utils/validate-widgets.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const WIDGETS_DIR = path.join(__dirname, '../../src/widgets');
const VERSION_GLOB = '**/versions/*.html';

function validateWidgetHtml(filePath) {
  const errors = [];
  const html = fs.readFileSync(filePath, 'utf8');

  // Basic HTML syntax check (very minimal)
  if (!html.trim().startsWith('<')) {
    errors.push('File does not start with an HTML tag.');
  }

  // Check for namespace wrapper and data-widget-version
  const wrapperMatch = html.match(/<div[^>]+class=["'][^"']+["'][^>]+data-widget-version=["'][^"']+["'][^>]*>/);
  if (!wrapperMatch) {
    errors.push('Missing namespace wrapper <div> with data-widget-version attribute.');
  }

  // Check for external CSS/JS
  if (/<link[^>]+rel=["']stylesheet["'][^>]*>/.test(html)) {
    errors.push('External <link rel="stylesheet"> found. All CSS must be inline.');
  }
  if (/<script[^>]+src=["'][^"']+["'][^>]*>/.test(html)) {
    errors.push('External <script src=...> found. All JS must be inline.');
  }

  // Optionally: check for inline <style> and <script>
  if (!/<style[\s>]/.test(html)) {
    errors.push('No <style> tag found (inline CSS required).');
  }
  if (!/<script[\s>]/.test(html)) {
    errors.push('No <script> tag found (inline JS required).');
  }

  // Placeholder for accessibility check (axe-core integration)
  // TODO: Integrate axe-core or Playwright accessibility check

  return errors;
}

function main() {
  const files = glob.sync(VERSION_GLOB, { cwd: WIDGETS_DIR, absolute: true });
  let hasError = false;
  files.forEach(file => {
    const relPath = path.relative(process.cwd(), file);
    const errors = validateWidgetHtml(file);
    if (errors.length > 0) {
      hasError = true;
      console.error(`\n❌ ${relPath} - validate-widgets.js:62`);
      errors.forEach(e => console.error(`${e} - validate-widgets.js:63`));
    } else {
      console.log(`✅ ${relPath} - validate-widgets.js:65`);
    }
  });
  if (hasError) {
    process.exit(1);
  } else {
    console.log('\nAll widget HTML files passed validation. - validate-widgets.js:71');
  }
}

if (require.main === module) {
  main();
}
