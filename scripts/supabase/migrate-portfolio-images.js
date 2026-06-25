#!/usr/bin/env node
/**
 * Migrate portfolio images to Supabase Storage + portfolio_images table.
 *
 * Usage:
 *   node scripts/supabase/migrate-portfolio-images.js --portfolio=journalism [--dry-run]
 *
 * Portfolios: journalism | concert | portrait | events | nature
 *
 * Requires in sites/mcc-cal-vite/.env.local (or .env):
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Before running for real, create the Supabase Storage bucket:
 *   Name: portfolio-images
 *   Visibility: Public
 *   Allowed MIME: image/jpeg, image/webp, image/png, image/avif
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VITE_DIR = path.join(REPO_ROOT, 'sites', 'mcc-cal-vite');
const IMAGES_ROOT = path.join(REPO_ROOT, 'src', 'images', 'Portfolios');
const MANIFESTS_DIR = path.join(VITE_DIR, 'public-vite', 'manifests');

// Resolve packages from the vite project's node_modules
const viteRequire = createRequire(path.join(VITE_DIR, 'package.json'));
const { createClient } = viteRequire('@supabase/supabase-js');
const sharp = viteRequire('sharp');
const dotenv = viteRequire('dotenv');

// Load env from .env.local then .env
dotenv.config({ path: path.join(VITE_DIR, '.env.local') });
dotenv.config({ path: path.join(VITE_DIR, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'portfolio-images';

// --- CLI args ---

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.slice(2).split('=');
      return [k, v === undefined ? true : v];
    })
);

const PORTFOLIO = args.portfolio;
const DRY_RUN = !!args['dry-run'];

const VALID_PORTFOLIOS = ['journalism', 'concert', 'portrait', 'events', 'nature'];

if (!PORTFOLIO || !VALID_PORTFOLIOS.includes(PORTFOLIO)) {
  console.error(`Usage: node migrate-portfolio-images.js --portfolio=<${VALID_PORTFOLIOS.join('|')}> [--dry-run]`);
  process.exit(1);
}

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in sites/mcc-cal-vite/.env.local');
  process.exit(1);
}

// --- Helpers ---

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function safeFilename(filename) {
  return filename.replace(/\s+/g, '_');
}

function readManifest(name) {
  return JSON.parse(fs.readFileSync(path.join(MANIFESTS_DIR, `${name}-manifest.json`), 'utf8'));
}

/**
 * Returns an array of image entries, each:
 *   { localPath, storagePath, collectionName, filename, altText, caption, tags }
 */
function buildImageList(portfolioType) {
  switch (portfolioType) {
    case 'journalism': return buildJournalismList();
    case 'concert': return buildConcertList();
    case 'portrait': return buildPortraitList();
    case 'events': return buildEventsList();
    case 'nature': return buildNatureList();
    default: throw new Error(`Unknown portfolio: ${portfolioType}`);
  }
}

function buildJournalismList() {
  const { events } = readManifest('journalism');
  const entries = [];
  for (const event of events) {
    const collectionSlug = slugify(event.eventName);
    for (const img of event.images) {
      const filename = safeFilename(img.filename);
      const storagePath = `journalism/${collectionSlug}/${filename}`;
      const localPath = path.join(IMAGES_ROOT, 'Journalism', event.folderPath, img.filename);
      entries.push({
        localPath,
        storagePath,
        collectionName: event.eventName,
        filename,
        altText: img.description || null,
        caption: img.caption || null,
        tags: img.tags || [],
      });
    }
  }
  return entries;
}

function buildConcertList() {
  const { bands } = readManifest('concert');
  const entries = [];
  for (const band of bands) {
    const collectionSlug = slugify(band.bandName);
    for (const imgFilename of band.images) {
      const filename = safeFilename(imgFilename);
      const storagePath = `concert/${collectionSlug}/${filename}`;
      const localPath = path.join(REPO_ROOT, 'src', 'images', 'Portfolios', band.relativeFolderPath, imgFilename);
      entries.push({
        localPath,
        storagePath,
        collectionName: band.bandName,
        filename,
        altText: null,
        caption: null,
        tags: [],
      });
    }
  }
  return entries;
}

function buildPortraitList() {
  const { collections } = readManifest('portrait');
  const entries = [];
  for (const coll of collections) {
    const collectionSlug = slugify(coll.collectionName);
    for (const imgPath of coll.images) {
      // imgPath may include subdirectory: "Annie Victoria/231118_...jpg"
      const parts = imgPath.split('/');
      const originalFilename = parts[parts.length - 1];
      const filename = safeFilename(originalFilename);
      const storagePath = `portrait/${collectionSlug}/${filename}`;
      const localPath = path.join(IMAGES_ROOT, 'Portrait', coll.folderPath, imgPath);
      entries.push({
        localPath,
        storagePath,
        collectionName: coll.collectionName,
        filename,
        altText: null,
        caption: null,
        tags: coll.tags || [],
      });
    }
  }
  return entries;
}

function buildEventsList() {
  const { events } = readManifest('events');
  const entries = [];
  for (const event of events) {
    const collectionSlug = slugify(event.eventName);
    for (const img of event.images) {
      // img.path is like "src/images/Portfolios/Events/..."
      const absoluteLocal = path.join(REPO_ROOT, img.path);
      const originalFilename = path.basename(img.path);
      const filename = safeFilename(originalFilename);
      const storagePath = `events/${collectionSlug}/${filename}`;
      entries.push({
        localPath: absoluteLocal,
        storagePath,
        collectionName: event.eventName,
        filename,
        altText: null,
        caption: null,
        tags: event.tags || [],
      });
    }
  }
  return entries;
}

function buildNatureList() {
  const { collections } = readManifest('nature');
  const entries = [];
  for (const coll of collections) {
    const collectionSlug = slugify(coll.collectionName);
    for (const imgFilename of coll.images) {
      const filename = safeFilename(imgFilename);
      const storagePath = `nature/${collectionSlug}/${filename}`;
      const localPath = path.join(IMAGES_ROOT, 'Nature', coll.folderPath, imgFilename);
      entries.push({
        localPath,
        storagePath,
        collectionName: coll.collectionName,
        filename,
        altText: null,
        caption: null,
        tags: coll.tags || [],
      });
    }
  }
  return entries;
}

// --- Upload + DB ---

async function processImage(entry, supabase, portfolioType, index, total) {
  const { localPath, storagePath, collectionName, filename, altText, caption, tags } = entry;
  const logPrefix = `[${index + 1}/${total}]`;

  if (!fs.existsSync(localPath)) {
    console.warn(`${logPrefix} SKIP (not found): ${localPath}`);
    return { status: 'skipped', reason: 'file not found', storagePath };
  }

  // Read and optionally convert to WebP
  let imageBuffer;
  let mimeType;
  const isJpeg = /\.(jpg|jpeg)$/i.test(filename);
  const isWebp = /\.webp$/i.test(filename);

  try {
    const rawBuffer = fs.readFileSync(localPath);
    const sharpInstance = sharp(rawBuffer);
    const metadata = await sharpInstance.metadata();

    if (isJpeg) {
      imageBuffer = await sharpInstance
        .webp({ quality: 82 })
        .toBuffer();
      mimeType = 'image/webp';
    } else {
      imageBuffer = rawBuffer;
      mimeType = isWebp ? 'image/webp' : 'image/jpeg';
    }

    const finalFilename = isJpeg ? filename.replace(/\.(jpg|jpeg)$/i, '.webp') : filename;
    const finalStoragePath = isJpeg ? storagePath.replace(/\.(jpg|jpeg)$/i, '.webp') : storagePath;

    if (DRY_RUN) {
      console.log(`${logPrefix} DRY-RUN  ${finalStoragePath}  (${(imageBuffer.length / 1024).toFixed(0)}KB${isJpeg ? ', converted to webp' : ''})`);
      console.log(`          local: ${localPath}`);
      return { status: 'dry-run', storagePath: finalStoragePath };
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(finalStoragePath, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`${logPrefix} UPLOAD ERROR: ${finalStoragePath} — ${uploadError.message}`);
      return { status: 'upload-error', error: uploadError.message, storagePath: finalStoragePath };
    }

    // Upsert metadata row
    const row = {
      portfolio_type: portfolioType,
      collection_name: collectionName,
      storage_path: finalStoragePath,
      filename: finalFilename,
      alt_text: altText,
      caption,
      width: metadata.width || null,
      height: metadata.height || null,
      tags,
      migrated_from: localPath.replace(REPO_ROOT + '/', ''),
    };

    const { error: dbError } = await supabase
      .from('portfolio_images')
      .upsert(row, { onConflict: 'storage_path' });

    if (dbError) {
      console.error(`${logPrefix} DB ERROR: ${finalStoragePath} — ${dbError.message}`);
      return { status: 'db-error', error: dbError.message, storagePath: finalStoragePath };
    }

    console.log(`${logPrefix} OK  ${finalStoragePath}`);
    return { status: 'ok', storagePath: finalStoragePath };

  } catch (err) {
    console.error(`${logPrefix} ERROR: ${storagePath} — ${err.message}`);
    return { status: 'error', error: err.message, storagePath };
  }
}

// --- Main ---

async function main() {
  console.log(`\nPortfolio: ${PORTFOLIO}${DRY_RUN ? '  (DRY RUN — no writes)' : ''}\n`);

  const images = buildImageList(PORTFOLIO);
  console.log(`Found ${images.length} images in manifest\n`);

  if (DRY_RUN) {
    for (let i = 0; i < images.length; i++) {
      await processImage(images[i], null, PORTFOLIO, i, images.length);
    }
    console.log(`\nDry run complete. ${images.length} images would be processed.`);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const results = { ok: 0, skipped: 0, error: 0 };

  for (let i = 0; i < images.length; i++) {
    const result = await processImage(images[i], supabase, PORTFOLIO, i, images.length);
    if (result.status === 'ok') results.ok++;
    else if (result.status === 'skipped') results.skipped++;
    else results.error++;
  }

  console.log(`\nDone. ${results.ok} uploaded, ${results.skipped} skipped, ${results.error} errors.`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
