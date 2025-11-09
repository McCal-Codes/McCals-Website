#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const child = require('child_process');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Missing dependency: sharp. Please run `npm install --no-save sharp fast-glob`');
    process.exit(2);
  }

  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.log('Usage: node scripts/optimize-images-local.js [--commit] [--commit-message "msg"] <file|dir> ...');
    console.log('Example: node scripts/optimize-images-local.js src/images/Portfolios/Band/2025-11-01/* --commit');
    process.exit(0);
  }

  const flags = { commit: false, commitMessage: null, allowLossy: false };
  const inputs = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
  if (a === '--commit') { flags.commit = true; continue; }
  if (a === '--commit-message' && argv[i+1]) { flags.commitMessage = argv[i+1]; i++; continue; }
  if (a === '--allow-lossy') { flags.allowLossy = true; continue; }
    inputs.push(a);
  }

  // expand directories/globs using fast-glob if available
  let fg;
  try { fg = require('fast-glob'); } catch (e) { fg = null; }

  const candidates = new Set();
  for (const input of inputs) {
    const full = path.resolve(process.cwd(), input);
    if (fs.existsSync(full)) {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        // gather images in directory
        const pattern = path.join(full, '**/*.{jpg,jpeg,png}');
        if (fg) {
          const entries = fg.sync([pattern], { dot: false });
          entries.forEach(e => candidates.add(path.resolve(e)));
        } else {
          // fallback: simple recursive walk
          (function walk(dir){
            for (const f of fs.readdirSync(dir)) {
              const p = path.join(dir, f);
              const s = fs.statSync(p);
              if (s.isDirectory()) walk(p); else if (/\.(jpe?g|png)$/i.test(p)) candidates.add(path.resolve(p));
            }
          })(full);
        }
      } else if (stat.isFile()) {
        candidates.add(path.resolve(full));
      }
    } else {
      // treat input as glob
      if (fg) {
        const entries = fg.sync([input], { dot: false });
        entries.forEach(e => candidates.add(path.resolve(e)));
      }
    }
  }

  const files = Array.from(candidates).filter(f => fs.existsSync(f) && fs.statSync(f).isFile() && /\.(jpe?g|png)$/i.test(f));
  if (!files.length) {
    console.log('No image files found for optimization. Inputs resolved to:', inputs);
    process.exit(0);
  }

  const changed = [];

  for (const file of files) {
    try {
      const ext = path.extname(file).toLowerCase();
      const origStat = fs.statSync(file);
      const origSize = origStat.size;

      let buffer;
      if (ext === '.jpg' || ext === '.jpeg') {
        buffer = await sharp(file).rotate().jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      } else if (ext === '.png') {
        // try png optimization; avoid lossy conversion for alpha
        const meta = await sharp(file).metadata();
        const hasAlpha = !!meta.hasAlpha || (meta.channels && meta.channels > 3);
        if (flags.allowLossy && !hasAlpha) {
          // convert PNG without alpha to JPEG for better savings
          buffer = await sharp(file).rotate().jpeg({ quality: 82, mozjpeg: true }).toBuffer();
        } else {
          buffer = await sharp(file).rotate().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
        }
      } else {
        console.log('Skipping unsupported format:', file);
        continue;
      }

      const newSize = buffer.length;
      if (newSize < origSize) {
        // write to temp then replace
        if (ext === '.png' && flags.allowLossy) {
          // we converted to JPEG; write as .jpg and remove original PNG
          const newFile = file.replace(/\.png$/i, '.jpg');
          const tmp = newFile + '.opt.tmp';
          fs.writeFileSync(tmp, buffer);
          fs.renameSync(tmp, newFile);
          try { fs.unlinkSync(file); } catch (e) { /* ignore */ }
          changed.push({ file: newFile, origSize, newSize });
          console.log(`Optimized (png->jpg) ${path.relative(process.cwd(), newFile)}: ${Math.round(origSize/1024)}KB -> ${Math.round(newSize/1024)}KB`);
        } else {
          const tmp = file + '.opt.tmp';
          fs.writeFileSync(tmp, buffer);
          fs.renameSync(tmp, file);
          changed.push({ file, origSize, newSize });
          console.log(`Optimized ${path.relative(process.cwd(), file)}: ${Math.round(origSize/1024)}KB -> ${Math.round(newSize/1024)}KB`);
        }
      } else {
        console.log(`No size win for ${path.relative(process.cwd(), file)}: ${Math.round(origSize/1024)}KB -> ${Math.round(newSize/1024)}KB (skipped)`);
      }
    } catch (err) {
      console.error('Failed optimizing', file, err.message || err);
    }
  }

  if (changed.length) {
    console.log('\nReplaced originals for', changed.length, 'files.');
    if (flags.commit) {
      try {
        const filesToAdd = changed.map(c => c.file);

        // Determine affected portfolio types (e.g., Concert, Events, Journalism, Portrait, Nature)
        const affectedTypes = new Set();
        for (const c of changed) {
          const rel = path.relative(process.cwd(), c.file).split(path.sep);
          const idx = rel.indexOf('Portfolios');
          if (idx >= 0 && rel.length > idx + 1) {
            affectedTypes.add(rel[idx + 1]);
          }
        }

        // Mapping from portfolio type to npm manifest script
        const manifestMap = {
          'Concert': { script: 'manifest:concert', outputs: ['src/images/Portfolios/Concert/concert-manifest.json'] },
          'Events': { script: 'manifest:events', outputs: ['src/images/Portfolios/Events/events-manifest.json'] },
          'Journalism': { script: 'manifest:journalism', outputs: ['src/images/Portfolios/Journalism/journalism-manifest.json'] },
          'Portrait': { script: 'manifest:portrait', outputs: ['src/images/Portfolios/Portrait/portrait-manifest.json'] },
          'Nature': { script: 'manifest:nature', outputs: ['src/images/Portfolios/Nature/nature-manifest.json'] },
          'Universal': { script: 'manifest:universal', outputs: ['src/images/Portfolios/portfolio-manifest.json'] }
        };

        const manifestsAdded = [];
        for (const t of affectedTypes) {
          const map = manifestMap[t];
          if (!map) {
            console.log('No manifest generator mapped for portfolio type:', t);
            continue;
          }

          try {
            console.log(`Running manifest generator for ${t}: npm run ${map.script}`);
            child.execFileSync('npm', ['run', map.script], { stdio: 'inherit' });
            // Add any generated manifest outputs
            for (const out of map.outputs) {
              const abs = path.resolve(process.cwd(), out);
              if (fs.existsSync(abs)) {
                filesToAdd.push(abs);
                manifestsAdded.push(out);
              }
            }
          } catch (err) {
            console.error(`Manifest generator failed for ${t}:`, err.message || err);
          }
        }

        if (manifestsAdded.length) {
          console.log('Added generated manifests to commit:', manifestsAdded.join(', '));
        }
        child.execFileSync('git', ['add', '--'].concat(filesToAdd), { stdio: 'inherit' });
        const msg = flags.commitMessage || `chore: optimize images (${changed.length} files)`;
        child.execFileSync('git', ['commit', '-m', msg], { stdio: 'inherit' });
        console.log('Created commit with optimized images. You can now push the branch.');
      } catch (err) {
        console.error('Git commit failed:', err.message || err);
      }
    } else {
      console.log('Run with --commit to automatically create a commit with the optimized files.');
    }
  } else {
    console.log('\nNo files were replaced (no size improvements).');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
