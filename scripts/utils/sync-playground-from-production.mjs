#!/usr/bin/env node
// ESM script: sync-playground-from-production.js
// Scans production widget version HTML files for key selectors and updates
// the corresponding BEGIN_COPY sections in src/widgets/css-playground/versions/v1.3.html

import fs from 'fs/promises';
import path from 'path';

const workspaceRoot = process.cwd();
const playgroundPath = path.join(workspaceRoot, 'src', 'widgets', 'css-playground', 'versions', 'v1.3.html');
const widgetsRoot = path.join(workspaceRoot, 'src', 'widgets');

const sections = [
  { name: 'nav', selector: 'mcc-nav' },
  { name: 'buttons', selector: 'button-row' },
  { name: 'portfolio', selector: 'portfolio-test-grid' },
  { name: 'footer', selector: 'footer-test' }
];

async function findHtmlFiles(dir){
  const results = [];
  async function walk(d){
    const entries = await fs.readdir(d, { withFileTypes: true });
    for(const e of entries){
      const res = path.join(d, e.name);
      if (e.isDirectory()) await walk(res);
      else if (e.isFile() && res.endsWith('.html')) results.push(res);
    }
  }
  await walk(dir);
  return results;
}

function extractBlockAroundSelector(content, selector){
  const idx = content.indexOf(selector);
  if (idx === -1) return null;
  // find start of the tag that contains the selector (search backward for '<')
  const startTagOpen = content.lastIndexOf('<', idx);
  if (startTagOpen === -1) return null;
  // read the tag name
  const tagMatch = content.slice(startTagOpen, startTagOpen + 64).match(/^<\s*([a-z0-9-]+)/i);
  if (!tagMatch) return null;
  const tag = tagMatch[1];
  // scan forward counting nested tags of same name to find close
  let i = startTagOpen;
  let depth = 0;
  const len = content.length;
  const tagOpenRegex = new RegExp('<\\s*' + tag + '(\\s|>|\\/)', 'ig');
  const tagCloseRegex = new RegExp('<\\/\\s*' + tag + '\\s*>', 'ig');
  // We'll iterate using regex exec from startTagOpen
  tagOpenRegex.lastIndex = startTagOpen;
  tagCloseRegex.lastIndex = startTagOpen;
  // find first open
  const firstOpen = tagOpenRegex.exec(content);
  if (!firstOpen) return null;
  depth = 1;
  let lastIndex = tagOpenRegex.lastIndex;
  while(depth > 0){
    const nextOpen = tagOpenRegex.exec(content);
    const nextClose = tagCloseRegex.exec(content);
    if (!nextClose) return null; // malformed
    if (!nextOpen || nextClose.index < nextOpen.index){
      depth -= 1;
      lastIndex = tagCloseRegex.lastIndex;
    } else {
      depth += 1;
      lastIndex = tagOpenRegex.lastIndex;
    }
    // safety
    if (lastIndex > len) break;
  }
  return content.slice(startTagOpen, lastIndex);
}

function trimHtmlWhitespace(s){
  return s.replace(/\n\s+/g, '\n').trim();
}

async function main(){
  console.log('Starting sync: scanning production widget files...');
  const allHtml = await findHtmlFiles(widgetsRoot);
  const playground = await fs.readFile(playgroundPath, 'utf8');
  let updatedPlayground = playground;
  let changes = [];

  for(const sec of sections){
    console.log('\nScanning for section', sec.name, `(selector match: ${sec.selector})`);
    const candidates = allHtml.filter(p => p.includes('/versions/'));
    let found = null;
    for(const f of candidates){
      const text = await fs.readFile(f, 'utf8');
      if (text.indexOf(sec.selector) !== -1){ found = { path: f, text }; break; }
    }
    if (!found){
      console.log('  No production file found containing selector:', sec.selector);
      continue;
    }
    console.log('  Found candidate:', found.path);
    // try to extract block around selector
    const newBlock = extractBlockAroundSelector(found.text, sec.selector);
    if (!newBlock){
      console.log('  Unable to extract block around selector from', found.path);
      continue;
    }
    const newTrim = trimHtmlWhitespace(newBlock);
    // extract existing playground section
    const re = new RegExp('<!--\\s*BEGIN_COPY:' + sec.name + '\\s*-->([\\s\\S]*?)<!--\\s*END_COPY:' + sec.name + '\\s*-->', 'i');
    const m = updatedPlayground.match(re);
    if (!m){
      console.log('  Playground missing BEGIN_COPY markers for', sec.name);
      continue;
    }
    const existing = m[1];
    const existingTrim = trimHtmlWhitespace(existing);
    if (existingTrim === newTrim){
      console.log('  No changes for', sec.name);
      continue;
    }
    // replace
    const replacement = `<!-- BEGIN_COPY:${sec.name} -->\n${newBlock}\n      <!-- END_COPY:${sec.name} -->`;
    updatedPlayground = updatedPlayground.replace(re, replacement);
    changes.push({ section: sec.name, from: found.path });
    console.log('  Updated playground section:', sec.name);
  }

  if (changes.length === 0){
    console.log('\nNo updates applied. Playground up to date.');
    return;
  }

  // backup original
  const backupPath = playgroundPath + `.bak.${Date.now()}`;
  await fs.copyFile(playgroundPath, backupPath);
  await fs.writeFile(playgroundPath, updatedPlayground, 'utf8');
  console.log('\nSync complete. Updated sections:', changes.map(c=>c.section).join(', '));
  console.log('Backup of previous playground saved to', backupPath);
}

main().catch(err=>{ console.error(err); process.exit(1); });
