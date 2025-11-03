#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const workflowsDir = path.join(repoRoot, '.github', 'workflows');

if (!fs.existsSync(workflowsDir)) {
  console.error('No workflows directory found: - ci-validate-workflows.js:9', workflowsDir);
  process.exit(1);
}

const wfFiles = fs.readdirSync(workflowsDir).filter(f => /\.ya?ml$/.test(f));

function walkRepo(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      out.push(...walkRepo(full));
    } else if (e.isFile()) out.push(full);
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function globToRegex(glob) {
  let g = toPosix(glob);
  // Escape regex special chars except *
  g = g.replace(/([.+^=!:${}()|])/g, '\\$1');
  // Replace ** with .* and * with [^/]*
  g = g.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
  return new RegExp('^' + g + '$');
}

const allFiles = walkRepo(repoRoot).map(f => toPosix(path.relative(repoRoot, f)));

let missingScripts = [];
let npmInstallFound = [];
let cacheMissing = [];
let checkoutMissing = [];

for (const wf of wfFiles) {
  const wfPath = path.join(workflowsDir, wf);
  const txt = fs.readFileSync(wfPath, 'utf8');

  // Find script references like scripts/whatever.js or globs like scripts/manifest/**
  const scriptMatches = txt.match(/scripts\/[\w\-\.\/\*\{\}\[\]]+/g) || [];
  for (const sRaw of scriptMatches) {
    const s = sRaw.trim();
    if (/[*?\{\[]/.test(s)) {
      const re = globToRegex(s);
      const found = allFiles.some(f => re.test(f));
      if (!found) missingScripts.push({ wf, script: s });
    } else {
      const rel = toPosix(s);
      const p = path.resolve(repoRoot, rel);
      if (!fs.existsSync(p)) {
        missingScripts.push({ wf, script: s });
      }
    }
  }

  // Detect npm install vs npm ci
  if (/npm install/.test(txt) && !/npm ci/.test(txt)) {
    npmInstallFound.push(wf);
  }

  // Consider cache present if actions/cache is used OR setup-node with cache: npm is present
  const hasActionsCache = /uses:\s*actions\/cache@/m.test(txt);
  const hasSetupNodeCache = /setup-node@[^\n]*[\s\S]*?cache\s*:\s*['"]?npm['"]?/m.test(txt);
  if (!(hasActionsCache || hasSetupNodeCache)) {
    cacheMissing.push(wf);
  }

  if (!/uses:\s*actions\/checkout/.test(txt)) {
    checkoutMissing.push(wf);
  }
}

if (missingScripts.length === 0) {
  console.log('✅ All workflow script references point to existing files. - ci-validate-workflows.js:87');
} else {
  console.error('❌ Missing script references found in workflows: - ci-validate-workflows.js:89');
  missingScripts.forEach(m => console.error(`${m.wf}: ${m.script} - ci-validate-workflows.js:90`));
}

if (npmInstallFound.length > 0) {
  console.warn('⚠️  Workflows using `npm install` found (prefer `npm ci`): - ci-validate-workflows.js:94', npmInstallFound.join(', '));
}

if (cacheMissing.length > 0) {
  console.warn('⚠️  Workflows missing caching step (consider caching npm or heavy assets): - ci-validate-workflows.js:98', cacheMissing.join(', '));
}

if (checkoutMissing.length > 0) {
  console.warn('⚠️  Workflows missing actions/checkout step: - ci-validate-workflows.js:102', checkoutMissing.join(', '));
}

if (missingScripts.length > 0) process.exit(2);
process.exit(0);
