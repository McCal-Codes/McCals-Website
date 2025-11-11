#!/usr/bin/env node
/**
 * Simulate the guardian workflow logic locally.
 * Usage:
 *   node scripts/ci-simulate-changed.js --changed "<space-separated files>"
 */
const args = process.argv.slice(2);
const getArg = (name, def = '') => {
  const i = args.indexOf(name);
  if (i === -1) return def;
  return args[i + 1] || def;
};

const changedStr = getArg('--changed', '').trim();
if (!changedStr) {
  console.error('Provide changed files, e.g. --changed ".github/copilot-instructions.md src/site/app.js"');
  process.exit(2);
}
const changed = changedStr.split(/\s+/).filter(Boolean);

// Discover instruction docs dynamically from .github to mirror production workflow
const fs = require('fs');
const path = require('path');
function discoverInstructions() {
  const dir = path.join(process.cwd(), '.github');
  try {
    return fs.readdirSync(dir)
      .filter(f => /instructions?/.test(f) && f.endsWith('.md'))
      .map(f => `.github/${f}`);
  } catch (e) {
    return ['.github/copilot-instructions.md', '.github/canvas-instructions.md', '.github/codex-instructions.md'];
  }
}
const instructionsDocs = new Set(discoverInstructions());
const changelogFiles = new Set(['CHANGELOG.md', 'docs/CHANGELOG.md']);

const containsInstructions = changed.some(f => instructionsDocs.has(f));
const changelogChanged = changed.some(f => changelogFiles.has(f));
const needsUpdate = !containsInstructions;
const shouldRequireChangelog = containsInstructions && !changelogChanged;

console.log('changed:', changed.join(' '));
console.log('containsInstructions:', containsInstructions);
console.log('needs_update (workflow output):', String(needsUpdate));
console.log('changelogChanged:', changelogChanged);
console.log('shouldFail(ChangeLog step):', shouldRequireChangelog);
