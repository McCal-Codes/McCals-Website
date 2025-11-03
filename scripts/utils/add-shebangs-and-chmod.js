#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Recursively find .js files under scripts/ excluding _archived and node_modules
const root = path.resolve(__dirname, '..', '..');
const excludeDirs = new Set(['_archived', 'node_modules', '.git']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (excludeDirs.has(e.name)) continue;
      walk(full);
    } else if (e.isFile() && e.name.endsWith('.js')) {
      tryAddShebang(full);
    }
  }
}

function tryAddShebang(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const firstLine = data.split(/\r?\n/, 1)[0] || '';
  if (firstLine.startsWith('#!')) {
    console.log('Has shebang:', path.relative(root, filePath));
    return;
  }

  // We'll be slightly permissive: skip obvious HTML files only.
  const looksLikeHtml = /<!DOCTYPE html>|<html/.test(data);
  if (looksLikeHtml) {
    console.log('Skipping HTML-like file:', path.relative(root, filePath));
    return;
  }

  // Add shebang
  const newData = '#!/usr/bin/env node\n' + data;
  fs.writeFileSync(filePath, newData, 'utf8');
  console.log('Added shebang to', path.relative(root, filePath));

  // Make executable in git index
  try {
    // Quote the path to handle spaces
    const quoted = '"' + filePath.replace(/"/g, '\\"') + '"';
    execSync(`git update-index --add --chmod=+x ${quoted}`);
    console.log('Marked executable in git index:', path.relative(root, filePath));
  } catch (err) {
    console.warn('git update-index failed for', filePath, err.message);
  }
}

walk(root + '/scripts');
console.log('Shebang pass complete.');
