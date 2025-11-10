#!/usr/bin/env node
/**
 * Auto optimize Events portfolio images.
 * Strategy:
 *  - Scan src/images/Portfolios/Events for JPG/JPEG/PNG > threshold (default 1.2MB)
 *  - For each candidate: recompress using sharp to progressive JPEG at target quality (default 78) unless size gain <5%
 *  - Skip files already containing '-webuse' or '-min' suffix (assumed optimized)
 *  - Keep original temporarily with .orig extension only if --backup provided
 *  - Optionally convert to WebP (flag --webp). WebP saved alongside; manifest generator already supports .webp.
 *  - Produce a JSON report with before/after sizes and aggregate savings
 *  - Safe idempotent: only rewrites when smaller by at least 5% unless --force
 *
 * Usage:
 *    node scripts/utils/auto-optimize-events-images.js [--threshold 1250000] [--quality 78] [--webp] [--force] [--backup] [--dry]
 */
const fs = require('fs');
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch (e) {
  console.error('sharp dependency missing. Install with: npm install sharp - auto-optimize-events-images.js:20');
  process.exit(1);
}

const args = process.argv.slice(2);
function flag(name){return args.includes('--'+name);} 
function val(name, def){const i=args.indexOf('--'+name); if(i>-1 && args[i+1]) return args[i+1]; return def;}

const ROOT = path.join(process.cwd(), 'src/images/Portfolios/Events');
if(!fs.existsSync(ROOT)) { console.error('Events directory not found: - auto-optimize-events-images.js:29', ROOT); process.exit(1); }

const threshold = parseInt(val('threshold', '1250000'),10); // ~1.2MB
const quality = parseInt(val('quality','78'),10);
const doWebp = flag('webp');
const webpOnly = flag('webp-only');
const force = flag('force');
const backup = flag('backup');
const dry = flag('dry');

const candidates = [];
function walk(dir){
  for(const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if(st.isDirectory()) { walk(p); continue; }
  if(!/\.(jpe?g|png)$/i.test(p)) continue;
  // Skip already optimized naming for base optimization, but include for WEBP-only generation
  if(!webpOnly && /(-webuse|-min)\.(jpe?g|png)$/i.test(p)) continue;
    if(st.size < threshold) continue;
    candidates.push({file:p,size:st.size});
  }
}
walk(ROOT);

if(candidates.length===0){
  console.log('No optimization candidates above threshold', threshold, 'bytes.');
  process.exit(0);
}

console.log('Found', candidates.length, 'candidate(s) >', threshold, 'bytes');

const report = [];
let totalBefore=0,totalAfter=0,optimizedCount=0,skipped=0;

async function processAll(){
  for(const c of candidates){
    totalBefore += c.size;
    let buf;
    try { buf = fs.readFileSync(c.file); } catch(e){
      console.warn('Read failed - auto-optimize-events-images.js:67', c.file, e.message);
      report.push({file:c.file,before:c.size,after:c.size,status:'error',error:e.message});
      skipped++; continue;
    }
  const img = sharp(buf, { failOn:'none' });
  const toJpeg = !/\.png$/i.test(c.file);
    let outBuffer;
    try {
      // Resize if extremely large width for additional savings
      let pipeline = img;
      try {
        const meta = await img.metadata();
        if (meta.width && meta.width > 2800) {
          pipeline = img.resize({ width: 2800 });
        }
      } catch (e) { /* metadata not available, skip resize */ }
      outBuffer = await pipeline[toJpeg ? 'jpeg' : 'png']({ quality, progressive: true }).toBuffer();
    } catch (e) {
      console.warn('Failed to recompress - auto-optimize-events-images.js:85', c.file, e.message);
      report.push({file:c.file,before:c.size,after:c.size,status:'error',error:e.message});
      skipped++; continue;
    }
    if(!outBuffer){
      report.push({file:c.file,before:c.size,after:c.size,status:'error',error:'No buffer'}); skipped++; continue;
    }
    if(!force && outBuffer.length >= c.size*0.95){
      report.push({file:c.file,before:c.size,after:c.size,status:'skip-small-gain'}); skipped++; continue;
    }
    // If WEBP-only mode is enabled, skip writing optimized original
    let rec;
    if(webpOnly){
      rec = {file:c.file,before:c.size,after:c.size,status: dry ? 'dry-run-webp-only' : 'webp-only'};
    } else {
      if(dry){
        report.push({file:c.file,before:c.size,after:outBuffer.length,status:'dry-run'}); continue;
      }
      if(backup){
        try { fs.copyFileSync(c.file, c.file + '.orig'); } catch (e) { console.warn('Backup copy failed for', c.file, e.message); }
      }
      try { fs.writeFileSync(c.file, outBuffer); } catch(e){
        report.push({file:c.file,before:c.size,after:c.size,status:'error-write',error:e.message}); skipped++; continue;
      }
      optimizedCount++;
      totalAfter += outBuffer.length;
      rec = {file:c.file,before:c.size,after:outBuffer.length,status:'optimized'};
    }
    if(doWebp){
      try {
        const webpPath = c.file.replace(/\.(jpe?g|png)$/i, '.webp');
        if(!force && fs.existsSync(webpPath)) {
          rec.webp = { path: webpPath, status: 'exists', size: fs.statSync(webpPath).size };
        } else {
          // Generate from original buffer (higher quality) not recompressed JPEG
            const webpBuf = await sharp(buf).webp({ quality: Math.min(quality,82) }).toBuffer();
            if(force || !fs.existsSync(webpPath)) fs.writeFileSync(webpPath, webpBuf);
            rec.webp = {path:webpPath,size:webpBuf.length,status:'generated'};
        }
      } catch(e){ rec.webpError = e.message; }
    }
    report.push(rec);
  }
}

// For skipped (not optimized) add original sizes to totalAfter so savings calc works
if(totalAfter===0) totalAfter = report.filter(r=>r.status!=='optimized').reduce((a,r)=>a+r.before,0);

async function finalize(){
  const savings = totalBefore - totalAfter;
  const pct = savings>0 ? (savings/totalBefore*100).toFixed(2) : '0.00';
  const summary = { timestamp:new Date().toISOString(), threshold, quality, force, backup, dry, candidates:candidates.length, optimized:optimizedCount, skipped, totalBefore, totalAfter, savings, percent:pct };
  const outReportPath = path.join(process.cwd(),'reports','events-image-optimization-report.json');
  try { fs.mkdirSync(path.dirname(outReportPath), {recursive:true}); fs.writeFileSync(outReportPath, JSON.stringify({summary, items:report}, null, 2)); } catch (e) { console.warn('Failed to write report - auto-optimize-events-images.js:132', e.message); }
  console.log('Optimization summary:', summary);
  console.log('Report written to', outReportPath);
}

async function main(){
  await processAll();
  await finalize();
}

main().catch(e=>{ console.error('Optimization failed: - auto-optimize-events-images.js:142', e); process.exit(1); });

if(dry) {
  // processAll already produced dry-run entries; finalize wrote summary.
}

// Removed unused helper to satisfy lint rules
