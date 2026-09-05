#!/usr/bin/env node
/**
 * Upload a new shoot to a portfolio — one command, done.
 *
 *   node scripts/cloudflare/add-shoot.js \
 *     --portfolio=journalism \
 *     --collection="Steel Strike 2026" \
 *     --folder="~/Desktop/shoot"
 *
 *   --portfolio   journalism | concert | portrait | events | nature
 *   --collection  Human-readable event/album name (used as the folder in R2)
 *   --folder      Path to your exported images (JPEG, PNG, WebP)
 *   --tags        Comma-separated tags — skipped if IPTC keywords are present
 *   --dry-run     Preview what would be uploaded, no writes
 *   --concurrency Parallel uploads (default: 6)
 *
 * Captions and keywords are read automatically from embedded IPTC/XMP metadata
 * (what Lightroom writes when you export with metadata). Missing fields are left
 * blank in Supabase — fill them in later via Table Editor → portfolio_images.
 *
 * Images appear on the site immediately after upload. No git, no deploy.
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const crypto = require('crypto');
const os   = require('os');
const { createRequire } = require('module');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VITE_DIR  = path.join(REPO_ROOT, 'sites', 'mcc-cal-vite');

const rootRequire = createRequire(path.join(REPO_ROOT, 'package.json'));
const viteRequire = createRequire(path.join(VITE_DIR, 'package.json'));

const sharp = rootRequire('sharp');
const { createClient } = viteRequire('@supabase/supabase-js');
const ws      = viteRequire('ws');
const dotenv  = viteRequire('dotenv');

dotenv.config({ path: path.join(VITE_DIR, '.env.local') });
dotenv.config({ path: path.join(VITE_DIR, '.env') });

const CF_ACCOUNT_ID     = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY     = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY     = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET         = process.env.R2_BUCKET || 'portfolio-images';
const R2_PUBLIC_URL     = (process.env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');
const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; })
);

const PORTFOLIO    = args.portfolio;
const COLLECTION   = args.collection;
const DRY_RUN      = !!args['dry-run'];
const CONCURRENCY  = parseInt(args.concurrency || '6', 10);
const CLI_TAGS     = args.tags ? args.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

const VALID = ['journalism', 'concert', 'portrait', 'events', 'nature'];

if (!PORTFOLIO || !VALID.includes(PORTFOLIO)) {
  console.error(`\nMissing or invalid --portfolio. Choose: ${VALID.join(' | ')}\n`);
  process.exit(1);
}
if (!COLLECTION) {
  console.error('\nMissing --collection="Event Name"\n');
  process.exit(1);
}
if (!args.folder) {
  console.error('\nMissing --folder=/path/to/images\n');
  process.exit(1);
}

const FOLDER = args.folder.replace(/^~/, os.homedir());
if (!fs.existsSync(FOLDER)) {
  console.error(`\nFolder not found: ${FOLDER}\n`);
  process.exit(1);
}

if (!DRY_RUN) {
  const missing = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    .filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`\nMissing env vars in .env.local:\n  ${missing.join('\n  ')}\n`);
    process.exit(1);
  }
}

// ─── IPTC parser ─────────────────────────────────────────────────────────────
// Reads embedded metadata that Lightroom/Photoshop write when you export JPEG.

function parseIptc(buf) {
  const result = { caption: '', headline: '', keywords: [], byline: '', copyright: '' };
  if (!buf || buf.length < 5) return result;

  // Scan for IPTC IIM record 2 fields
  for (let i = 0; i < buf.length - 4; i++) {
    if (buf[i] !== 0x1c) continue;
    const record  = buf[i + 1];
    const dataset = buf[i + 2];

    // Length: if top bit set → 4-byte extended length, else 2-byte
    const lenHi = buf[i + 3];
    let len, valueStart;
    if (lenHi & 0x80) {
      const extraBytes = lenHi & 0x7f;
      len = 0;
      for (let b = 0; b < extraBytes; b++) len = (len << 8) | buf[i + 4 + b];
      valueStart = i + 4 + extraBytes;
    } else {
      len = (lenHi << 8) | buf[i + 4];
      valueStart = i + 5;
    }

    if (record === 2 && valueStart + len <= buf.length) {
      const value = buf.slice(valueStart, valueStart + len).toString('utf8').trim();
      switch (dataset) {
        case 120: result.caption   = value; break; // Caption/Abstract
        case 105: result.headline  = value; break; // Headline
        case  25: if (value) result.keywords.push(value); break; // Keywords (repeatable)
        case  80: result.byline    = value; break; // By-line
        case 116: result.copyright = value; break; // Copyright Notice
      }
    }

    // Advance past this field
    const skipLen = lenHi & 0x80 ? ((lenHi & 0x7f) + len + 4) : (len + 5);
    i += skipLen - 1; // -1 because loop does i++
  }

  return result;
}

// ─── XMP fallback ─────────────────────────────────────────────────────────────
// XMP is XML embedded in the image. Lightroom writes captions/keywords here too.

function parseXmp(buf) {
  if (!buf) return { caption: '', keywords: [] };
  const xmp = buf.toString('utf8');

  // Caption: try dc:description → rdf:Alt → rdf:li, then photoshop:Caption
  const captionMatch =
    xmp.match(/<dc:description[^>]*>\s*<rdf:Alt[^>]*>\s*<rdf:li[^>]*>([^<]+)<\/rdf:li>/i) ||
    xmp.match(/<photoshop:Caption[^>]*>([^<]+)<\/photoshop:Caption>/i) ||
    xmp.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i);
  const caption = captionMatch ? captionMatch[1].trim() : '';

  // Keywords: dc:subject list
  const keywords = [];
  const subjectBlock = xmp.match(/<dc:subject[^>]*>([\s\S]*?)<\/dc:subject>/i);
  if (subjectBlock) {
    const liMatches = subjectBlock[1].matchAll(/<rdf:li[^>]*>([^<]+)<\/rdf:li>/gi);
    for (const m of liMatches) keywords.push(m[1].trim());
  }

  return { caption, keywords };
}

// ─── Extract metadata from image buffer ──────────────────────────────────────

async function readImageMeta(localPath) {
  const buf  = fs.readFileSync(localPath);
  const meta = await sharp(buf).metadata();

  const iptc = parseIptc(meta.iptc);
  const xmp  = parseXmp(meta.xmp);

  // Prefer IPTC caption; fall back to XMP
  const caption  = iptc.caption  || xmp.caption  || '';
  const headline = iptc.headline || '';
  // Alt text: caption is best; headline is second; leave blank otherwise
  const altText  = caption || headline || '';
  // Keywords: prefer IPTC, then XMP, then CLI --tags
  const keywords = iptc.keywords.length ? iptc.keywords
    : xmp.keywords.length              ? xmp.keywords
    : CLI_TAGS;

  return { caption, altText, keywords, width: meta.width, height: meta.height };
}

// ─── AWS SigV4 for R2 ────────────────────────────────────────────────────────

function hmac(key, data)     { return crypto.createHmac('sha256', key).update(data).digest(); }
function sha256Hex(data)     { return crypto.createHash('sha256').update(data).digest('hex'); }
function signingKey(secret, date) {
  return hmac(hmac(hmac(hmac('AWS4' + secret, date), 'auto'), 's3'), 'aws4_request');
}

async function r2Put(storagePath, body, contentType, meta = {}) {
  const host        = `${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const encodedKey  = storagePath.split('/').map(encodeURIComponent).join('/');
  const now         = new Date();
  const amzDate     = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp   = amzDate.slice(0, 8);
  const bodyHash    = sha256Hex(body);

  const metaHeaders = Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [`x-amz-meta-${k}`, String(v)])
  );
  const headers = {
    'cache-control': 'public, max-age=31536000, immutable',
    'content-disposition': 'inline',
    'content-type': contentType,
    'host': host,
    'x-amz-content-sha256': bodyHash,
    'x-amz-date': amzDate,
    ...metaHeaders,
  };
  const sortedKeys      = Object.keys(headers).sort();
  const canonicalHdrs   = sortedKeys.map(k => `${k}:${headers[k]}`).join('\n') + '\n';
  const signedHdrs      = sortedKeys.join(';');
  const canonicalReq    = `PUT\n/${R2_BUCKET}/${encodedKey}\n\n${canonicalHdrs}\n${signedHdrs}\n${bodyHash}`;
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign    = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256Hex(canonicalReq)}`;
  const sig             = crypto.createHmac('sha256', signingKey(R2_SECRET_KEY, dateStamp)).update(stringToSign).digest('hex');
  const authorization   = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHdrs}, Signature=${sig}`;

  const res = await fetch(`https://${host}/${R2_BUCKET}/${encodedKey}`, {
    method: 'PUT',
    headers: { ...headers, Authorization: authorization },
    body,
  });
  if (!res.ok) throw new Error(`R2 PUT failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

// ─── Concurrency limiter ──────────────────────────────────────────────────────

async function withConcurrency(tasks, limit) {
  const active = new Set();
  const queue  = [...tasks];
  const results = [];
  const run = task => {
    const p = task().finally(() => active.delete(p));
    active.add(p);
    results.push(p);
    return p;
  };
  while (queue.length || active.size) {
    while (active.size < limit && queue.length) run(queue.shift());
    if (active.size) await Promise.race(active);
  }
  return Promise.allSettled(results);
}

function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function safeFilename(f) { return f.replace(/\s+/g, '_'); }

// R2 object metadata is sent as a raw HTTP header value, which rejects non-ASCII and
// control characters (smart quotes, em dashes, etc. from IPTC captions crash the whole
// upload). Normalize common typography, then strip anything outside printable ASCII —
// the full-fidelity caption still goes to Supabase untouched, this is metadata-only.
function sanitizeHeaderValue(s) {
  return s
    .normalize('NFKD')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  const files = fs.readdirSync(FOLDER)
    .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (!files.length) {
    console.error(`\nNo images found in: ${FOLDER}\n`);
    process.exit(1);
  }

  const collectionSlug = slugify(COLLECTION);

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`Portfolio : ${PORTFOLIO}`);
  console.log(`Collection: ${COLLECTION}`);
  console.log(`Folder    : ${FOLDER}`);
  console.log(`Images    : ${files.length}`);
  if (DRY_RUN) console.log(`Mode      : DRY RUN (no uploads)`);
  console.log(`─────────────────────────────────────────────\n`);

  if (DRY_RUN) {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const localPath = path.join(FOLDER, f);
      const { caption, altText, keywords } = await readImageMeta(localPath);
      const outFile = safeFilename(f).replace(/\.(jpg|jpeg|png)$/i, '.webp');
      console.log(`[${i + 1}/${files.length}] ${f}`);
      console.log(`     → ${PORTFOLIO}/${collectionSlug}/${outFile}`);
      if (caption)  console.log(`     Caption : ${caption.slice(0, 100)}`);
      if (keywords.length) console.log(`     Keywords: ${keywords.join(', ')}`);
      if (!altText) console.log(`     Alt text: (blank — fill in Supabase later)`);
      console.log('');
    }
    console.log('Dry run complete. Run without --dry-run to upload.\n');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SVC_KEY, { realtime: { transport: ws } });

  // Skip already-uploaded images (resume support)
  const { data: existing } = await supabase
    .from('portfolio_images')
    .select('storage_path')
    .eq('portfolio_type', PORTFOLIO)
    .like('storage_path', `${PORTFOLIO}/${collectionSlug}/%`);
  const done = new Set((existing || []).map(r => r.storage_path));
  if (done.size) console.log(`Skipping ${done.size} already-uploaded images\n`);

  const counts = { ok: 0, skipped: 0, error: 0 };
  let idx = 0;

  const tasks = files.map(filename => async () => {
    const i       = idx++;
    const prefix  = `[${i + 1}/${files.length}]`;
    const local   = path.join(FOLDER, filename);
    const safe    = safeFilename(filename);
    const isJpeg  = /\.(jpg|jpeg)$/i.test(filename);
    const isPng   = /\.png$/i.test(filename);
    const outFile = (isJpeg || isPng) ? safe.replace(/\.(jpg|jpeg|png)$/i, '.webp') : safe;
    const storagePath = `${PORTFOLIO}/${collectionSlug}/${outFile}`;

    if (done.has(storagePath)) {
      process.stdout.write(`${prefix} SKIP  ${outFile}\n`);
      counts.skipped++;
      return;
    }

    try {
      // Read image + metadata in one shot
      const rawBuf = fs.readFileSync(local);
      const { caption, altText, keywords, width, height } = await readImageMeta(local);

      let imgBuf, mimeType;
      if (isJpeg || isPng) {
        imgBuf   = await sharp(rawBuf).webp({ quality: 82 }).toBuffer();
        mimeType = 'image/webp';
      } else {
        imgBuf   = rawBuf;
        mimeType = 'image/webp';
      }

      // Upload to R2
      await r2Put(storagePath, imgBuf, mimeType, {
        'portfolio-type': PORTFOLIO,
        'collection': COLLECTION,
        ...(altText ? { 'alt-text': sanitizeHeaderValue(altText).slice(0, 200) } : {}),
      });

      // Write metadata to Supabase
      const { error: dbErr } = await supabase.from('portfolio_images').upsert({
        portfolio_type: PORTFOLIO,
        collection_name: COLLECTION,
        storage_path: storagePath,
        filename: outFile,
        alt_text: altText,
        caption,
        width:  width  || null,
        height: height || null,
        tags: keywords,
        is_featured: false,
        sort_order: i,
      }, { onConflict: 'storage_path' });

      if (dbErr) {
        process.stdout.write(`${prefix} DB ERROR  ${outFile} — ${dbErr.message}\n`);
        counts.error++;
        return;
      }

      const kb   = Math.round(imgBuf.length / 1024);
      const meta = caption ? ` | "${caption.slice(0, 60)}${caption.length > 60 ? '…' : ''}"` : ' | (no caption)';
      process.stdout.write(`${prefix} OK  ${outFile}  ${kb}KB${meta}\n`);
      counts.ok++;
    } catch (err) {
      process.stdout.write(`${prefix} ERROR  ${filename} — ${err.message}\n`);
      counts.error++;
    }
  });

  await withConcurrency(tasks, CONCURRENCY);

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`Uploaded : ${counts.ok}`);
  console.log(`Skipped  : ${counts.skipped}`);
  console.log(`Errors   : ${counts.error}`);

  if (counts.ok > 0) {
    console.log(`\nLive at  : ${R2_PUBLIC_URL}/${PORTFOLIO}/${collectionSlug}/`);
    console.log(`\nTo add missing alt text and captions:`);
    console.log(`  Supabase → Table Editor → portfolio_images`);
    console.log(`  Filter: portfolio_type = ${PORTFOLIO} AND collection_name = ${COLLECTION}`);
  }
  console.log('');
}

main().catch(err => { console.error('\n' + err.message + '\n'); process.exit(1); });
