#!/usr/bin/env node
/**
 * Orphan Script Audit Utility
 * Scans the scripts directory for .js files not referenced by package.json scripts or workflows.
 * Outputs JSON report to stdout.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const workflowsDir = path.join(root, '.github', 'workflows');
const scriptsDir = path.join(root, 'scripts');

function readJSON(p){try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch(e){return null;}}
const pkg = readJSON(pkgPath) || {scripts:{}};
const packageScriptBodies = Object.values(pkg.scripts||{});

function collectJsFiles(dir){
  let results=[];
  for(const entry of fs.readdirSync(dir)){
    const full=path.join(dir,entry);
    const stat=fs.statSync(full);
    if(stat.isDirectory()){
      if(entry === '_archived') continue; // ignore archived folder
      results=results.concat(collectJsFiles(full));
    } else if(entry.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

function workflowContents(){
  if(!fs.existsSync(workflowsDir)) return [];
  return fs.readdirSync(workflowsDir)
    .filter(f=>f.endsWith('.yml')||f.endsWith('.yaml'))
    .map(f=>fs.readFileSync(path.join(workflowsDir,f),'utf8'));
}

function resolveLocalScriptImport(fromFile, relSpecifier) {
  const base = path.resolve(path.dirname(fromFile), relSpecifier);
  const candidates = [
    base,
    `${base}.js`,
    path.join(base, 'index.js'),
  ];

  for (const candidate of candidates) {
    if (!candidate.startsWith(scriptsDir)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

const workflows = workflowContents();
const workflowText = workflows.join('\n');

const scriptFiles = collectJsFiles(scriptsDir);
const referenced = new Set();

for(const body of packageScriptBodies){
  scriptFiles.forEach(f=>{ if(body.includes(path.basename(f))) referenced.add(f); });
}
scriptFiles.forEach(f=>{ if(workflowText.includes(path.basename(f))) referenced.add(f); });

// Also treat local require/import usage inside scripts/** as a reference.
const localRequireRe = /require\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;
const localImportRe = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;

for (const scriptFile of scriptFiles) {
  let source = '';
  try {
    source = fs.readFileSync(scriptFile, 'utf8');
  } catch {
    continue;
  }

  const specs = [];
  let m;
  while ((m = localRequireRe.exec(source)) !== null) specs.push(m[1]);
  while ((m = localImportRe.exec(source)) !== null) specs.push(m[1]);

  for (const spec of specs) {
    const resolved = resolveLocalScriptImport(scriptFile, spec);
    if (resolved) referenced.add(resolved);
  }
}

const orphans = scriptFiles.filter(f=>!referenced.has(f));

const report = {
  generated: new Date().toISOString(),
  totalScripts: scriptFiles.length,
  referencedCount: referenced.size,
  orphanCount: orphans.length,
  orphans: orphans.map(f=>path.relative(root,f)).sort(),
  note: "Archived folder ignored. Presence of a script here does not guarantee production usage; manual review recommended."
};

process.stdout.write(JSON.stringify(report,null,2)+"\n");
