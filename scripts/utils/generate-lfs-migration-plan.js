#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Scans the working tree for files larger than threshold and emits a JSON plan
const DEFAULT_THRESHOLD = 5 * 1024 * 1024; // 5 MB
const args = process.argv.slice(2);
let threshold = DEFAULT_THRESHOLD;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--threshold' || args[i] === '-t') {
    threshold = parseInt(args[i+1], 10) || DEFAULT_THRESHOLD; i++;
  }
}

function findLargeFiles(root) {
  const results = [];
  function walk(dir) {
    const names = fs.readdirSync(dir);
    for (const n of names) {
      const p = path.join(dir, n);
      try {
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          if (n === '.git' || n === 'node_modules') continue;
          walk(p);
        } else if (s.isFile()) {
          if (s.size >= threshold) results.push({ path: p, size: s.size });
        }
      } catch (e) {
        // ignore
      }
    }
  }
  walk(root);
  return results;
}

function human(n) {
  const u = ['B','KB','MB','GB']; let i=0; while(n>=1024 && i<u.length-1){n/=1024;i++;} return `${n.toFixed(2)} ${u[i]}`;
}

function main() {
  const root = process.cwd();
  console.log(`Scanning ${root} for files >= ${human(threshold)}...`);
  const large = findLargeFiles(root).sort((a,b)=>b.size-a.size);
  const plan = {
    generatedAt: new Date().toISOString(),
    thresholdBytes: threshold,
    files: large.map(f=>({ path: f.path.replace(root+path.sep,''), size: f.size }))
  };
  const out = 'lfs-migration-plan.json';
  fs.writeFileSync(out, JSON.stringify(plan,null,2));
  console.log(`Wrote ${out} (${plan.files.length} files).`);
  if (plan.files.length>0) {
    console.log('\nTop files:');
    plan.files.slice(0,10).forEach(f=>console.log(` - ${f.path} (${human(f.size)})`));
    console.log('\nSuggested .gitattributes entries:');
    // suggest grouping by extension
    const exts = new Set(plan.files.map(f=>path.extname(f.path).toLowerCase()));
    exts.forEach(e=>console.log(`  *${e} filter=lfs diff=lfs merge=lfs -text`));
  } else {
    console.log('No large files found.');
  }
}

if (require.main===module) main();
