#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const force = args.includes('--force');
const includeEmpty = args.includes('--include-empty');

const portfoliosRoot = path.join(__dirname, '..', '..', 'src', 'images', 'Portfolios');

function findArrayKey(obj) {
  const candidateKeys = ['collections', 'bands', 'events', 'collections', 'galleries', 'items'];
  for (const k of candidateKeys) {
    if (Array.isArray(obj[k])) return k;
  }
  // fallback: first array value
  for (const k of Object.keys(obj)) {
    if (Array.isArray(obj[k])) return k;
  }
  return null;
}

function makePerFolderManifest(item, manifestVersion) {
  const result = {
    version: manifestVersion || '1.0',
    name: item.collectionName || item.bandName || item.eventName || item.collection || null,
    totalImages: item.totalImages != null ? item.totalImages : (Array.isArray(item.images) ? item.images.length : 0),
    images: Array.isArray(item.images) ? item.images : [],
  };
  if (Array.isArray(item.tags)) result.tags = item.tags;
  return result;
}

function safeWrite(filePath, content, opts = {}) {
  const json = JSON.stringify(content, null, 2) + '\n';
  if (fs.existsSync(filePath) && !opts.force) {
    try {
      const existing = fs.readFileSync(filePath, 'utf8');
      if (existing === json) {
        return { written: false, reason: 'identical' };
      }
    } catch (e) {
      // fallthrough to write
    }
  }
  try {
    fs.writeFileSync(filePath, json, 'utf8');
    return { written: true };
  } catch (e) {
    return { written: false, reason: 'error', error: e };
  }
}

function processAggregate(aggregatePath) {
  const baseDir = path.dirname(aggregatePath);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(aggregatePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse - generate-subfolder-manifests-from-aggregate.js:62', aggregatePath, e.message);
    return { ok: false, error: e };
  }
  const arrayKey = findArrayKey(data);
  if (!arrayKey) {
    console.log('No collectionlike array found in - generate-subfolder-manifests-from-aggregate.js:67', aggregatePath);
    return { ok: true, written: 0 };
  }
  const items = data[arrayKey];
  let written = 0;
  for (const item of items) {
    const folderPath = item.folderPath || item.folder || item.path;
    if (!folderPath) continue;
    const targetDir = path.join(baseDir, folderPath);
    const manifestFile = path.join(targetDir, 'manifest.json');

    const hasImages = Array.isArray(item.images) && item.images.length > 0;
    if (!hasImages && !includeEmpty) {
      // skip empty
      continue;
    }

    const perFolder = makePerFolderManifest(item, data.version || data.generated || '1.0');

    if (dry) {
      console.log(`[dry] Would write: ${manifestFile} (${perFolder.totalImages} images) - generate-subfolder-manifests-from-aggregate.js:87`);
      written++;
      continue;
    }

    // ensure directory exists
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('Created directory - generate-subfolder-manifests-from-aggregate.js:96', targetDir);
      } catch (e) {
        console.error('Failed to create directory - generate-subfolder-manifests-from-aggregate.js:98', targetDir, e.message);
        continue;
      }
    }

    const res = safeWrite(manifestFile, perFolder, { force });
    if (res.written) {
      console.log('Wrote: - generate-subfolder-manifests-from-aggregate.js:105', manifestFile);
      written++;
    } else if (res.reason === 'identical') {
      console.log('Skipped (identical): - generate-subfolder-manifests-from-aggregate.js:108', manifestFile);
    } else {
      console.error('Failed to write: - generate-subfolder-manifests-from-aggregate.js:110', manifestFile, res.error || res.reason);
    }
  }
  return { ok: true, written };
}

function main() {
  if (!fs.existsSync(portfoliosRoot)) {
    console.error('Portfolios root not found: - generate-subfolder-manifests-from-aggregate.js:118', portfoliosRoot);
    process.exit(1);
  }
  const manifests = [];
  const types = fs.readdirSync(portfoliosRoot, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  for (const t of types) {
    const candidate = path.join(portfoliosRoot, t, `${t.toLowerCase()}-manifest.json`);
    if (fs.existsSync(candidate)) manifests.push(candidate);
    else {
      // fallback: any *-manifest.json in the folder
      const files = fs.readdirSync(path.join(portfoliosRoot, t)).filter(f => f.endsWith('-manifest.json'));
      for (const f of files) manifests.push(path.join(portfoliosRoot, t, f));
    }
  }

  if (manifests.length === 0) {
    console.log('No aggregated manifests found under - generate-subfolder-manifests-from-aggregate.js:134', portfoliosRoot);
    return;
  }

  console.log(`Found ${manifests.length} aggregated manifest(s). - generate-subfolder-manifests-from-aggregate.js:138`);
  let totalWritten = 0;
  for (const m of manifests) {
    console.log('Processing - generate-subfolder-manifests-from-aggregate.js:141', m);
    const r = processAggregate(m);
    if (r.ok) totalWritten += r.written || 0;
  }
  if (dry) console.log(`Dryrun complete. ${totalWritten} perfolder manifests would be written. - generate-subfolder-manifests-from-aggregate.js:145`);
  else console.log(`Done. ${totalWritten} perfolder manifests written/updated. - generate-subfolder-manifests-from-aggregate.js:146`);
}

main();
