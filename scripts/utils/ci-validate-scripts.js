#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Validate that scripts referenced in package.json and GitHub workflows exist
// and point to canonical locations under scripts/manifest/, scripts/watchers/, scripts/utils/, scripts/admin/ when appropriate.

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function fileExists(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function gatherWorkflowFiles() {
  const dir = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml')).map(f => path.join(dir, f));
}

function extractScriptPathsFromText(text) {
  const results = new Set();
  const re = /scripts\/[\w\-\/._]+\.js/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    results.add(m[0]);
  }
  return Array.from(results);
}

function main() {
  const repoRoot = process.cwd();
  const pkgPath = path.join(repoRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error('package.json not found - ci-validate-scripts.js:40');
    process.exit(1);
  }

  const pkg = readJSON(pkgPath);
  const scriptTexts = Object.values(pkg.scripts || {}).join('\n');
  const referenced = new Set(extractScriptPathsFromText(scriptTexts));

  // Also parse workflows
  const workflows = gatherWorkflowFiles();
  for (const wf of workflows) {
    const text = fs.readFileSync(wf, 'utf8');
    extractScriptPathsFromText(text).forEach(p => referenced.add(p));
  }

  let failed = false;

  for (const rel of Array.from(referenced).sort()) {
    const abs = path.join(repoRoot, rel);
    if (!fileExists(abs)) {
      console.error(`❌ Missing script referenced: ${rel} - ci-validate-scripts.js:60`);
      failed = true;
    }
  }

  if (failed) {
    console.error('\nOne or more referenced scripts are missing. Please update package.json or workflows to point to canonical paths under scripts/manifest/, scripts/watchers/, scripts/utils/ or scripts/admin/. - ci-validate-scripts.js:66');
    process.exit(2);
  }

  console.log('✅ Script references validated. All referenced script files exist. - ci-validate-scripts.js:70');
}

if (require.main === module) main();
