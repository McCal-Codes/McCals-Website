#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../src/widgets');
function parseVersion(s){
  const m = s.match(/v(\d+(?:\.\d+)*)(?:[-._].*)?/i);
  if(!m) return null;
  return m[1].split('.').map(n=>parseInt(n,10));
}
function cmpVer(a,b){
  for(let i=0;i<Math.max(a.length,b.length);i++){
    const va = a[i]||0, vb = b[i]||0;
    if(va>vb) return 1;
    if(va<vb) return -1;
  }
  return 0;
}

const widgets = {};
if(!fs.existsSync(root)){ console.error('No widgets dir', root); process.exit(1); }
const names = fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isDirectory());
names.forEach(name=>{
  const versionsDir = path.join(root,name,'versions');
  if(!fs.existsSync(versionsDir)) return;
  const files = fs.readdirSync(versionsDir).filter(f=>f.endsWith('.html'));
  let latest = null, latestVer = null;
  files.forEach(f=>{
    const v = parseVersion(f);
    if(!v) return;
    if(!latest || cmpVer(v, latestVer)===1){ latest = f; latestVer = v; }
  });
  if(latest){ widgets[name] = { latestFile: path.join('src/widgets',name,'versions',latest), version: latestVer.join('.') } }
});

console.log(JSON.stringify(widgets, null, 2));
