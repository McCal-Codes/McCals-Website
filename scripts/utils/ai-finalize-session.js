#!/usr/bin/env node
/**
 * AI Finalize Session
 * - Appends a short summary to each instructions file under a "Recent updates" section
 * - Bumps version if requested (package.json version and optional widget version file naming is manual)
 * - Appends a Docs/Meta entry to CHANGELOG.md
 *
 * Usage:
 *   node scripts/ai-finalize-session.js --summary "What changed" [--bump patch|minor|major]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Discover all instruction docs in .github dynamically so this script is tolerant
// to new files or renames (keeps behavior aligned with ai-instructions-preflight).
function discoverInstructions() {
  const dir = path.join(ROOT, '.github');
  try {
    return fs.readdirSync(dir)
      .filter(f => /instructions?/.test(f) && f.endsWith('.md'))
      .map(f => path.join(dir, f));
  } catch (e) {
    return [];
  }
}

const INSTRUCTIONS = discoverInstructions();
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md');
const PKG = path.join(ROOT, 'package.json');


const autoCheck = require('./auto-check-todo.js');
const args = process.argv.slice(2);
function argVal(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
const summary = argVal('--summary') || 'Session complete.';
const bump = argVal('--bump'); // patch|minor|major|none
const commitMsg = argVal('--commit') || summary;
const changedFiles = argVal('--changed') ? argVal('--changed').split(',') : [];

function bumpSemver(v, type) {
  const [major, minor, patch] = v.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${(patch || 0) + 1}`; // patch default
}

function appendRecentUpdate(file) {
  try {
    let txt = fs.readFileSync(file, 'utf8');
    const marker = 'Recent updates';
    const idx = txt.indexOf(marker);
    const entry = `- ${new Date().toISOString()} — ${summary}\n`;
    if (idx === -1) {
      // append a section
      txt += `\n\n${marker}\n\n${entry}`;
    } else {
      // insert after marker line
      const lines = txt.split(/\r?\n/);
      const mLine = lines.findIndex(l => l.trim() === marker);
      if (mLine !== -1) {
        // find first blank after marker; insert after marker or directly after heading
        lines.splice(mLine + 2, 0, entry.trim());
        txt = lines.join('\n');
      } else {
        txt += `\n${entry}`;
      }
    }
    fs.writeFileSync(file, txt);
    console.log(`✅ Updated recent updates in ${path.relative(ROOT, file)} - ai-finalize-session.js:75`);
  } catch (e) {
    console.warn(`⚠️  Could not update ${file}: ${e.message} - ai-finalize-session.js:77`);
  }
}

function updateChangelog() {
  try {
    const exists = fs.existsSync(CHANGELOG);
    if (!exists) return;
    const now = new Date().toISOString().slice(0, 10);
    const line = `- ${now}: AI session — ${summary}`;
    let txt = fs.readFileSync(CHANGELOG, 'utf8');
    const target = '## [1.6.2] - Unreleased';
    const idx = txt.indexOf(target);
    if (idx !== -1) {
      // Insert under Docs/Meta section if present; else add one
      if (!/### Docs\/Meta/.test(txt)) {
        txt = txt.replace(target, `${target}\n### Docs/Meta\n${line}`);
      } else {
        txt = txt.replace(/### Docs\/Meta[\s\S]*?(?=\n## |$)/, (block) => {
          // append line to the block
          return block.trimEnd() + `\n${line}`;
        });
      }
      fs.writeFileSync(CHANGELOG, txt);
      console.log('✅ CHANGELOG updated - ai-finalize-session.js:101');
    }
  } catch (e) {
    console.warn(`⚠️  Could not update CHANGELOG: ${e.message} - ai-finalize-session.js:104`);
  }
}

function bumpPackageVersion() {
  if (!bump || bump === 'none') return;
  try {
    const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
    const next = bumpSemver(pkg.version || '0.0.0', bump);
    pkg.version = next;
    fs.writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ package.json version bumped to ${next} - ai-finalize-session.js:115`);
  } catch (e) {
    console.warn(`⚠️  Could not bump version: ${e.message} - ai-finalize-session.js:117`);
  }
}


function main() {
  // Auto-check TODOs in updates/todo.md if commitMsg or changedFiles are present
  if (commitMsg || changedFiles.length) {
    autoCheck.autoCheckTodos({ commitMsg, changedFiles });
  }
  INSTRUCTIONS.forEach(f => appendRecentUpdate(f));
  updateChangelog();
  bumpPackageVersion();
}

if (require.main === module) {
  main();
}
