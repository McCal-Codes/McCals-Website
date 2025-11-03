#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const scriptsRoot = path.join(repoRoot, 'scripts');

function listScriptFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_archived' || e.name === 'node_modules') continue;
      files.push(...listScriptFiles(full));
    } else if (e.isFile() && full.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

function gatherReferences() {
  const refs = new Set();
  // package.json scripts
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  Object.values(pkg.scripts || {}).forEach(s => {
    const m = s.match(/scripts\/[^\s'"\)]+/g);
    if (m) m.forEach(x => refs.add(path.resolve(repoRoot, x)));
  });

  // workflows
  const wfdir = path.join(repoRoot, '.github', 'workflows');
  if (fs.existsSync(wfdir)) {
      const wfEntries = fs.readdirSync(wfdir, { withFileTypes: true });
      for (const entry of wfEntries) {
        if (!entry.isFile()) continue;
        const wf = path.join(wfdir, entry.name);
        if (!/\.ya?ml$/.test(entry.name)) continue;
        const txt = fs.readFileSync(wf, 'utf8');
        const m = txt.match(/scripts\/[^\s'"\)]+/g);
        if (m) m.forEach(x => refs.add(path.resolve(repoRoot, x)));
      }
  }
  return refs;
}

const allScripts = listScriptFiles(scriptsRoot);
const refs = gatherReferences();

const unreferenced = allScripts.filter(f => !refs.has(path.resolve(f)));

if (unreferenced.length === 0) {
  console.log('No unreferenced script files found under scripts/');
} else {
  console.log('Unreferenced script files:');
  unreferenced.forEach(f => console.log(' -', path.relative(repoRoot, f)));
}

// Specific watchers folder audit
const watchersDir = path.join(scriptsRoot, 'watchers');
if (fs.existsSync(watchersDir)) {
  const watcherFiles = fs.readdirSync(watchersDir).filter(f => f.endsWith('.js'));
  const unrefWatchers = watcherFiles.filter(f => !refs.has(path.resolve(watchersDir, f)));
  if (unrefWatchers.length === 0) {
    console.log('No unreferenced watcher scripts in scripts/watchers/');
  } else {
    console.log('Unreferenced watcher scripts:');
    unrefWatchers.forEach(f => console.log(' -', path.join('scripts/watchers', f)));
  }
}
