#!/usr/bin/env node
/**
 * Widget version scanner and enforcement tool.
 * Recursively finds all 'versions' directories in src/widgets and checks for policy compliance.
 * Policy: ≤ 2 active versions per widget.
 * Usage: node scripts/utils/scan-widget-versions.js [--fail]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const WIDGETS_DIR = path.join(ROOT, 'src', 'widgets');

// Parse arguments
const args = process.argv.slice(2);
const FAIL_ON_VIOLATION = args.includes('--fail') || args.includes('--fail-overlimit');
let limitIndex = args.indexOf('--limit');
if (limitIndex === -1) limitIndex = args.indexOf('--fail-overlimit'); // Alias used in some legacy workflows

const LIMIT = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : 2;

function findVersionsDirs(dir, found = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file === 'versions') {
          found.push(fullPath);
        } else if (file !== '_archived' && file !== 'node_modules' && file !== '.git') {
          findVersionsDirs(fullPath, found);
        }
      }
    }
  } catch {
    // Ignore errors during recursive directory scan
  }
  return found;
}

function listHtml(p) {
  try {
    return fs.readdirSync(p).filter((name) => name.endsWith('.html'));
  } catch {
    return [];
  }
}

function main() {
  if (!fs.existsSync(WIDGETS_DIR)) {
    console.error('Widgets directory not found:', WIDGETS_DIR);
    process.exit(0);
  }

  const versionsDirs = findVersionsDirs(WIDGETS_DIR);
  let violations = 0;

  console.log('--- Widget Versions Compliance Scan ---');
  console.log(`Policy: ≤ ${LIMIT} active versions per widget.\n`);

  for (const vDir of versionsDirs) {
    const widgetPath = path.relative(WIDGETS_DIR, path.dirname(vDir));
    const files = listHtml(vDir);
    const count = files.length;

    if (count > 0) {
      const status = count <= LIMIT ? '✅' : '❌';
      console.log(`${status} ${widgetPath}: ${count} versions`);
      if (count > LIMIT) {
        violations++;
        console.log(`   └─ Violation: ${files.join(', ')}`);
      } else {
        console.log(`   └─ Active: ${files.join(', ')}`);
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total Widgets Scanned: ${versionsDirs.length}`);
  console.log(`Total Violations: ${violations}`);

  if (violations > 0 && FAIL_ON_VIOLATION) {
    console.error(
      '\nFAIL: Policy violation detected (too many versions). Please archive older versions.',
    );
    process.exit(1);
  } else if (violations > 0) {
    console.log('\nNOTE: Run with --fail to enforce policy in CI.');
  } else {
    console.log('\nPASS: All widgets comply with version limits.');
  }
}

main();
