#!/usr/bin/env node
/**
 * Widget README Audit
 * Scans widget README files under src/widgets and compares listed versions
 * against files in each widget's versions directory.
 * Reports inconsistencies (missing current version, legacy versions still listed, non x.x.0 format).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const WIDGETS_DIR = path.join(ROOT, 'src', 'widgets');

function listWidgets() {
  const names = fs.readdirSync(WIDGETS_DIR).filter(n => !n.startsWith('_'));
  return names.map(name => ({ name, dir: path.join(WIDGETS_DIR, name) }));
}

function readReadme(dir) {
  const f = path.join(dir, 'README.md');
  try { return fs.readFileSync(f, 'utf8'); } catch { return null; }
}

function listVersionFiles(dir) {
  const vdir = path.join(dir, 'versions');
  try {
    return fs.readdirSync(vdir).filter(f => f.endsWith('.html'));
  } catch {
    return [];
  }
}

function extractVersionsFromReadme(md) {
  if (!md) return [];
  const re = /v(\d+\.\d+\.\d+)[^\s)\n]*/gi;
  const out = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    out.push(m[1]);
  }
  return Array.from(new Set(out));
}

function versionFromFile(file) {
  const m = file.match(/v(\d+\.\d+\.\d+)/i);
  return m ? m[1] : null;
}

function main() {
  const widgets = listWidgets();
  const report = [];
  for (const w of widgets) {
    const md = readReadme(w.dir);
    const versionsListed = extractVersionsFromReadme(md);
    const files = listVersionFiles(w.dir);
    const versionsFiles = files.map(versionFromFile).filter(Boolean);

    const latest = versionsFiles.map(v => v.split('.').map(Number)).sort((a,b)=>{
      for (let i=0;i<3;i++) { if (a[i]!==b[i]) return b[i]-a[i]; }
      return 0;
    })[0];
    const latestStr = latest ? latest.join('.') : null;

    const nonSemver = files.filter(f => !versionFromFile(f));
    const missingLatest = latestStr && !versionsListed.includes(latestStr);
    const legacyListed = versionsListed.filter(v => !versionsFiles.includes(v));

    report.push({
      widget: w.name,
      latest: latestStr,
      versionsListed,
      versionsFiles,
      missingLatest,
      legacyListed,
      nonSemverFiles: nonSemver
    });
  }

  const problems = report.filter(r => r.missingLatest || r.legacyListed.length || r.nonSemverFiles.length);
  if (problems.length) {
    console.log('Widget README Audit: issues found - widget-readme-audit.js:82');
    for (const p of problems) {
      console.log(`${p.widget} - widget-readme-audit.js:84`);
      if (p.missingLatest) console.log(`• README missing latest version ${p.latest} - widget-readme-audit.js:85`);
      if (p.legacyListed.length) console.log(`• README lists legacy versions not present: ${p.legacyListed.join(', ')} - widget-readme-audit.js:86`);
      if (p.nonSemverFiles.length) console.log(`• Version files not in x.x.0 format: ${p.nonSemverFiles.join(', ')} - widget-readme-audit.js:87`);
    }
    process.exitCode = 1;
  } else {
    console.log('Widget README Audit: PASS - widget-readme-audit.js:91');
  }
}

if (require.main === module) main();
