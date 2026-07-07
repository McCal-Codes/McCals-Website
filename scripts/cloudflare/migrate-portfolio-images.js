#!/usr/bin/env node
/**
 * Migrate portfolio images to Cloudflare R2 + Supabase portfolio_images metadata.
 *
 * Usage:
 *   node scripts/cloudflare/migrate-portfolio-images.js --portfolio=journalism [--dry-run]
 *
 * Portfolios: journalism | concert | portrait | events | nature
 *
 * Requires in sites/mcc-cal-vite/.env.local:
 *   CLOUDFLARE_ACCOUNT_ID=xxx
 *   R2_ACCESS_KEY_ID=xxx         (R2 API token access key)
 *   R2_SECRET_ACCESS_KEY=xxx     (R2 API token secret)
 *   R2_BUCKET=portfolio-images
 *   VITE_R2_PUBLIC_URL=https://pub-xxx.r2.dev   (or your custom domain)
 *   VITE_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=xxx
 *
 * R2 setup (Cloudflare dashboard):
 *   1. Create R2 bucket "portfolio-images"
 *   2. For PRODUCTION: attach a custom domain (R2 → bucket → Settings → Custom Domains).
 *      The r2.dev URL is rate-limited and intended for development only.
 *      Custom domain unlocks Cloudflare Cache, WAF, Smart Tiered Cache, bot management.
 *   3. Create an R2 API token with "Object Read & Write" permission on that bucket
 *
 * Best practices applied:
 *   - Cache-Control: public, max-age=31536000, immutable set on every R2 object
 *   - Content-Disposition: inline set on every object (browser renders, not downloads)
 *   - Custom metadata (x-amz-meta-*) stored on object for self-describing assets
 *   - Resume support: already-uploaded storage_paths are skipped (safe to re-run)
 *   - JPEG→WebP conversion via sharp at quality 82
 *   - Concurrent uploads (default 8, tune with --concurrency=N)
 *
 * Vercel Image Optimization applies width/format transforms at delivery time via
 * /_vercel/image?url={r2-public-url}&w={width}&q=80.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createRequire } = require('module');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VITE_DIR = path.join(REPO_ROOT, 'sites', 'mcc-cal-vite');
const IMAGES_ROOT = path.join(REPO_ROOT, 'src', 'images', 'Portfolios');
const MANIFESTS_DIR = path.join(VITE_DIR, 'public-vite', 'manifests');

// Load packages from available node_modules
const rootRequire = createRequire(path.join(REPO_ROOT, 'package.json'));
const viteRequire = createRequire(path.join(VITE_DIR, 'package.json'));

const sharp = rootRequire('sharp');
const { createClient } = viteRequire('@supabase/supabase-js');
const ws = viteRequire('ws');
const dotenv = viteRequire('dotenv');

dotenv.config({ path: path.join(VITE_DIR, '.env.local') });
dotenv.config({ path: path.join(VITE_DIR, '.env') });

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'portfolio-images';
const R2_PUBLIC_URL = (process.env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- CLI args ---

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; })
);

const PORTFOLIO = args.portfolio;
const DRY_RUN = !!args['dry-run'];
const CONCURRENCY = parseInt(args.concurrency || '8', 10);
const LIMIT = args.limit ? parseInt(args.limit, 10) : null;

const VALID_PORTFOLIOS = ['journalism', 'concert', 'portrait', 'events', 'nature'];

if (!PORTFOLIO || !VALID_PORTFOLIOS.includes(PORTFOLIO)) {
  console.error(`Usage: node migrate-portfolio-images.js --portfolio=<${VALID_PORTFOLIOS.join('|')}> [--dry-run] [--concurrency=8]`);
  process.exit(1);
}

if (!DRY_RUN) {
  const missing = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    .filter(k => !process.env[k]);
  if (missing.length) {
    console.error('Missing env vars in sites/mcc-cal-vite/.env.local:', missing.join(', '));
    process.exit(1);
  }
}

// --- AWS Signature V4 for R2 ---

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function getSigningKey(secret, dateStamp) {
  const kDate = hmac('AWS4' + secret, dateStamp);
  const kRegion = hmac(kDate, 'auto');
  const kService = hmac(kRegion, 's3');
  return hmac(kService, 'aws4_request');
}

async function r2Put(storagePath, bodyBuffer, contentType, customMeta = {}) {
  const host = `${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const encodedKey = storagePath.split('/').map(encodeURIComponent).join('/');
  const url = `https://${host}/${R2_BUCKET}/${encodedKey}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  const bodyHash = sha256Hex(bodyBuffer);
  const canonicalUri = `/${R2_BUCKET}/${encodedKey}`;

  // Build sorted header map (canonical headers must be sorted alphabetically)
  const metaHeaders = Object.fromEntries(
    Object.entries(customMeta).map(([k, v]) => [`x-amz-meta-${k}`, String(v)])
  );
  const allHeaders = {
    'cache-control': 'public, max-age=31536000, immutable',
    'content-disposition': 'inline',
    'content-type': contentType,
    'host': host,
    'x-amz-content-sha256': bodyHash,
    'x-amz-date': amzDate,
    ...metaHeaders,
  };
  const sortedKeys = Object.keys(allHeaders).sort();
  const canonicalHeaders = sortedKeys.map(k => `${k}:${allHeaders[k]}`).join('\n') + '\n';
  const signedHeaders = sortedKeys.join(';');

  const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${bodyHash}`;
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`;

  const signingKey = getSigningKey(R2_SECRET_KEY, dateStamp);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...allHeaders, 'Authorization': authorization },
    body: bodyBuffer,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`R2 PUT ${storagePath} failed (${response.status}): ${text.slice(0, 200)}`);
  }
}

// --- Concurrency limiter ---

async function runWithConcurrency(tasks, limit) {
  const results = [];
  const active = new Set();
  const queue = [...tasks];

  const run = async (task) => {
    const p = task();
    active.add(p);
    const result = await p.finally(() => active.delete(p));
    return result;
  };

  while (queue.length > 0 || active.size > 0) {
    while (active.size < limit && queue.length > 0) {
      results.push(run(queue.shift()));
    }
    if (active.size > 0) {
      await Promise.race(active);
    }
  }

  return Promise.all(results);
}

// --- Helpers ---

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function safeFilename(filename) {
  return filename.replace(/\s+/g, '_');
}

function readManifest(name) {
  return JSON.parse(fs.readFileSync(path.join(MANIFESTS_DIR, `${name}-manifest.json`), 'utf8'));
}

// --- Manifest parsers ---

function buildJournalismList() {
  const { events } = readManifest('journalism');
  return events.flatMap(event =>
    event.images.map(img => ({
      localPath: path.join(IMAGES_ROOT, 'Journalism', event.folderPath, img.filename),
      storagePath: `journalism/${slugify(event.eventName)}/${safeFilename(img.filename)}`,
      collectionName: event.eventName,
      filename: safeFilename(img.filename),
      altText: img.description || null,
      caption: img.caption || null,
      tags: img.tags || [],
    }))
  );
}

function buildConcertList() {
  const { bands } = readManifest('concert');
  return bands.flatMap(band =>
    band.images.map(imgFilename => ({
      localPath: path.join(REPO_ROOT, 'src', 'images', 'Portfolios', band.relativeFolderPath, imgFilename),
      storagePath: `concert/${slugify(band.bandName)}/${safeFilename(imgFilename)}`,
      collectionName: band.bandName,
      filename: safeFilename(imgFilename),
      altText: null,
      caption: null,
      tags: [],
    }))
  );
}

function buildPortraitList() {
  const { collections } = readManifest('portrait');
  return collections.flatMap(coll =>
    coll.images.map(imgPath => {
      const originalFilename = path.basename(imgPath);
      return {
        localPath: path.join(IMAGES_ROOT, 'Portrait', coll.folderPath, imgPath),
        storagePath: `portrait/${slugify(coll.collectionName)}/${safeFilename(originalFilename)}`,
        collectionName: coll.collectionName,
        filename: safeFilename(originalFilename),
        altText: null,
        caption: null,
        tags: coll.tags || [],
      };
    })
  );
}

function buildEventsList() {
  const { events } = readManifest('events');
  return events.flatMap(event =>
    event.images.map(img => {
      const originalFilename = path.basename(img.path);
      return {
        localPath: path.join(REPO_ROOT, img.path),
        storagePath: `events/${slugify(event.eventName)}/${safeFilename(originalFilename)}`,
        collectionName: event.eventName,
        filename: safeFilename(originalFilename),
        altText: null,
        caption: null,
        tags: event.tags || [],
      };
    })
  );
}

function buildNatureList() {
  const { collections } = readManifest('nature');
  return collections.flatMap(coll =>
    coll.images.map(imgFilename => ({
      localPath: path.join(IMAGES_ROOT, 'Nature', coll.folderPath, imgFilename),
      storagePath: `nature/${slugify(coll.collectionName)}/${safeFilename(imgFilename)}`,
      collectionName: coll.collectionName,
      filename: safeFilename(imgFilename),
      altText: null,
      caption: null,
      tags: coll.tags || [],
    }))
  );
}

function buildImageList(portfolioType) {
  const builders = { journalism: buildJournalismList, concert: buildConcertList, portrait: buildPortraitList, events: buildEventsList, nature: buildNatureList };
  return builders[portfolioType]();
}

// --- Process single image ---

async function processImage(entry, supabase, portfolioType, index, total, alreadyDone = new Set()) {
  const { localPath, storagePath, collectionName, filename, altText, caption, tags } = entry;
  const logPrefix = `[${index + 1}/${total}]`;

  if (!fs.existsSync(localPath)) {
    process.stdout.write(`${logPrefix} SKIP (not found): ${path.relative(REPO_ROOT, localPath)}\n`);
    return { status: 'skipped' };
  }

  // Derive the final storage path (JPEG→WebP rename) before the skip check
  const isJpegCheck = /\.(jpg|jpeg)$/i.test(filename);
  const finalStoragePathCheck = isJpegCheck ? storagePath.replace(/\.(jpg|jpeg)$/i, '.webp') : storagePath;
  if (alreadyDone.has(finalStoragePathCheck)) {
    process.stdout.write(`${logPrefix} SKIP (already uploaded): ${finalStoragePathCheck}\n`);
    return { status: 'skipped' };
  }

  try {
    const rawBuffer = fs.readFileSync(localPath);
    const sharpInstance = sharp(rawBuffer);
    const metadata = await sharpInstance.metadata();

    const isJpeg = isJpegCheck;
    let imageBuffer, mimeType, finalFilename, finalStoragePath;

    if (isJpeg) {
      imageBuffer = await sharpInstance.webp({ quality: 82 }).toBuffer();
      mimeType = 'image/webp';
      finalFilename = filename.replace(/\.(jpg|jpeg)$/i, '.webp');
      finalStoragePath = storagePath.replace(/\.(jpg|jpeg)$/i, '.webp');
    } else {
      imageBuffer = rawBuffer;
      mimeType = /\.webp$/i.test(filename) ? 'image/webp' : 'image/jpeg';
      finalFilename = filename;
      finalStoragePath = storagePath;
    }

    const sizeKB = (imageBuffer.length / 1024).toFixed(0);

    if (DRY_RUN) {
      process.stdout.write(`${logPrefix} DRY-RUN  ${finalStoragePath}  (${sizeKB}KB${isJpeg ? ', converted to webp' : ''})\n`);
      return { status: 'dry-run', storagePath: finalStoragePath };
    }

    // Upload to R2 with Cache-Control + custom metadata on the object itself
    await r2Put(finalStoragePath, imageBuffer, mimeType, {
      'portfolio-type': portfolioType,
      'collection': collectionName,
      ...(altText ? { 'alt-text': altText } : {}),
    });

    // Upsert metadata to Supabase
    const { error: dbError } = await supabase
      .from('portfolio_images')
      .upsert({
        portfolio_type: portfolioType,
        collection_name: collectionName,
        storage_path: finalStoragePath,
        filename: finalFilename,
        alt_text: altText,
        caption,
        width: metadata.width || null,
        height: metadata.height || null,
        tags,
        migrated_from: path.relative(REPO_ROOT, localPath),
      }, { onConflict: 'storage_path' });

    if (dbError) {
      process.stdout.write(`${logPrefix} DB ERROR: ${finalStoragePath} — ${dbError.message}\n`);
      return { status: 'db-error', error: dbError.message };
    }

    process.stdout.write(`${logPrefix} OK  ${finalStoragePath}  (${sizeKB}KB)\n`);
    return { status: 'ok' };

  } catch (err) {
    process.stdout.write(`${logPrefix} ERROR: ${storagePath} — ${err.message}\n`);
    return { status: 'error', error: err.message };
  }
}

// --- Main ---

async function main() {
  console.log(`\nPortfolio: ${PORTFOLIO}${DRY_RUN ? '  (DRY RUN — no writes)' : `  → R2 bucket: ${R2_BUCKET}`}\n`);

  const allImages = buildImageList(PORTFOLIO);
  const images = LIMIT ? allImages.slice(0, LIMIT) : allImages;
  const limitNote = LIMIT ? `  (limited to ${LIMIT}/${allImages.length})` : '';
  console.log(`Found ${allImages.length} images in manifest${limitNote}\n`);

  if (DRY_RUN) {
    for (let i = 0; i < images.length; i++) {
      await processImage(images[i], null, PORTFOLIO, i, images.length);
    }
    console.log(`\nDry run complete. ${images.length} images would be processed.`);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    realtime: { transport: ws },
  });

  // Load already-migrated paths so we can skip them (resume support)
  process.stdout.write('Checking for already-migrated images...\n');
  const { data: existing } = await supabase
    .from('portfolio_images')
    .select('storage_path')
    .eq('portfolio_type', PORTFOLIO);
  const alreadyDone = new Set((existing || []).map(r => r.storage_path));
  if (alreadyDone.size > 0) {
    process.stdout.write(`Skipping ${alreadyDone.size} already-uploaded images\n\n`);
  } else {
    process.stdout.write('No existing uploads found — starting fresh\n\n');
  }

  const counts = { ok: 0, skipped: 0, error: 0 };
  let index = 0;

  const tasks = images.map(entry => async () => {
    const i = index++;
    const result = await processImage(entry, supabase, PORTFOLIO, i, images.length, alreadyDone);
    counts[result.status === 'ok' ? 'ok' : result.status === 'skipped' ? 'skipped' : 'error']++;
    return result;
  });

  await runWithConcurrency(tasks, CONCURRENCY);

  console.log(`\nDone. ${counts.ok} uploaded, ${counts.skipped} skipped, ${counts.error} errors.`);
  if (R2_PUBLIC_URL) {
    console.log(`\nImages available at: ${R2_PUBLIC_URL}/${PORTFOLIO}/{collection}/{file}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
