#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DEFAULT_ROOT = 'images/Portfolios/Events';
const OUTPUT_FILE = 'events-manifest.json';
const DEFAULT_SIZES = '(max-width: 680px) 100vw, 300px';

function titleCase(slug){
  return slug.replace(/[_-]+/g,' ').trim().split(/\s+/).map(t=>t[0].toUpperCase()+t.slice(1)).join(' ');
}
function parseDate(text){
  let m = /(20\d{2})[-/_]?(0[1-9]|1[0-2])/.exec(text);
  if(m){ const y=+m[1], mm=+m[2]; return new Date(Date.UTC(y,mm-1,1)); }
  return new Date();
}
async function readDirSafe(p){ try{ return await fsp.readdir(p); }catch{ return []; } }
function deriveCategory(dir){
  const slug = dir.toLowerCase();
  if(/(gala|celebration|festival|party|wedding|graduation)/.test(slug)) return "Celebration";
  if(/(conference|summit|forum|symposium)/.test(slug)) return "Conference";
  if(/(on-location|location|travel|tour)/.test(slug)) return "On-Location";
  if(/(published|press|feature|media)/.test(slug)) return "Published";
  return "Corporate";
}

async function exists(p){ try{ await fsp.access(p, fs.constants.F_OK); return true; }catch{ return false; } }

async function main(){
  const argv = process.argv.slice(2);
  const idx = argv.indexOf('--root');
  const ROOT = (idx>=0 && argv[idx+1]) ? argv[idx+1] : DEFAULT_ROOT;
  const abs = path.resolve(ROOT);
  if(!(await exists(abs))){ console.error('❌ Events root not found:', abs); process.exit(1); }

  const dirs = (await fsp.readdir(abs, {withFileTypes:true})).filter(d=>d.isDirectory()).map(d=>d.name).sort();
  const events = [];
  for(const dir of dirs){
    const files = (await readDirSafe(path.join(abs, dir))).filter(f=>/\.(jpe?g|png|webp|gif)$/i.test(f));
    if(!files.length) continue;
    const images = files.map(f=>({ path: path.posix.join(ROOT.replace(/^.*?src\//,'src/'), dir, f) }));
    events.push({
      eventName: titleCase(dir),
      category: deriveCategory(dir),
      dateDisplay: parseDate(dir).toLocaleString('en-US',{month:'short',year:'numeric',timeZone:'UTC'}),
      images, totalImages: images.length
    });
  }
  // newest first (best-effort)
  const ts = s => Date.parse('01 '+s) || 0;
  events.sort((a,b)=>ts(b.dateDisplay)-ts(a.dateDisplay));

  const outPath = path.join(abs, OUTPUT_FILE);
  await fsp.writeFile(outPath, JSON.stringify({version:'2.5.1',generated:new Date().toISOString().slice(0,10),totalEvents:events.length,events}, null, 2)+'\n','utf8');
  console.log('✅ Wrote manifest:', path.relative(process.cwd(), outPath));
}
main().catch(e=>{ console.error('❌', e && e.stack || e); process.exit(1); });
