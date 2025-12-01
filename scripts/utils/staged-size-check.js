#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

// Default threshold: 5 MB
const DEFAULT_THRESHOLD = 5 * 1024 * 1024;
// simple arg parse: --threshold N or -t N
const rawArgs = process.argv.slice(2);
let threshold = DEFAULT_THRESHOLD;
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a === '--threshold' || a === '-t') {
    const v = rawArgs[i+1];
    if (v) { threshold = parseInt(v, 10); }
    i++;
  }
}

function listStagedFiles() {
  // List added/modified/copied files in the index
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    console.error('Failed to list staged files:', err.message);
    return [];
  }
}

function checkFiles(files) {
  const violating = [];
  for (const f of files) {
    // Skip .git, node_modules, and non-portfolio image paths
    if (!f || f.startsWith('.git') || f.includes('node_modules')) continue;
    // Only check portfolio images (src/images/Portfolios/**)
    if (!f.startsWith('src/images/Portfolios/')) continue;
    try {
      const stat = fs.statSync(f);
      if (stat.isFile() && stat.size > threshold) violating.push({ path: f, size: stat.size });
    } catch (e) {
      // If file not present (deleted), ignore
    }
  }
  return violating;
}

function human(n) {
  const units = ['B','KB','MB','GB','TB'];
  let i = 0;
  while (n >= 1024 && i < units.length-1) { n/=1024; i++; }
  return `${n.toFixed(2)} ${units[i]}`;
}

function main() {
  const files = listStagedFiles();
  if (files.length === 0) {
    process.exit(0);
  }
  const viol = checkFiles(files);
  if (viol.length > 0) {
    console.error('\nERROR: Commit blocked. The following staged files exceed the size threshold:');
    for (const v of viol) console.error(` - ${v.path}: ${human(v.size)}`);
    console.error(`\nThreshold: ${human(threshold)}. To bypass locally, run: git commit --no-verify (not recommended)`);
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) main();
