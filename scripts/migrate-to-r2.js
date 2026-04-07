#!/usr/bin/env node
/**
 * Migration script: Upload hero images to Cloudflare R2
 *
 * Usage:
 *   1. Set up R2 bucket first: npx wrangler r2 bucket create mccal-media-images
 *   2. Configure wrangler.toml with R2 bucket bindings
 *   3. Run: node scripts/migrate-to-r2.js
 *
 * Or use Wrangler CLI directly for each file:
 *   npx wrangler r2 object put mccal-media-images/hero/obama-rally.jpg -f ./path/to/file.jpg
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Image mapping: Squarespace URL -> Local file path
const IMAGES_TO_MIGRATE = [
  {
    name: 'obama-rally',
    squarespaceId: 'eedc836b-ce05-4452-b29c-8ab2a64f384e',
    localPath: 'src/images/Portfolios/Journalism/Politics/obama-speaks-pitt/101024_Obama Speaks at Pittsburgh_CAL3364.jpg',
    r2Path: 'hero/obama-rally-1920.webp',
  },
  {
    name: 'pittsburgh-bridge',
    squarespaceId: '62dcd231-e0e8-402b-abf4-cc34e995ea58',
    localPath: 'src/images/Portfolios/Nature/Landscapes/Downtown Pittsburgh/IMGP7209.jpg',
    r2Path: 'hero/pittsburgh-bridge-1920.webp',
  },
  {
    name: 'corporate-event',
    squarespaceId: 'abf749ae-bd3d-45a0-9d6a-690a8cf0055d',
    localPath: 'src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp',
    r2Path: 'hero/corporate-event-1920.webp',
  },
  {
    name: 'haven-concert',
    squarespaceId: '2aa375a0-a9b1-4965-9ae2-23e9660f7c3e',
    localPath: 'src/images/Portfolios/Concert/Turtle Park/August 2025/250829_Haven_CAL4401.jpg',
    r2Path: 'hero/haven-concert-1920.webp',
  },
  {
    name: 'cmu-protest',
    squarespaceId: '3a804513-dde2-4a01-b38c-d67528d655f4',
    localPath: 'src/images/Portfolios/Journalism/Politics/cmu-trump-protest/250715_CMU Trump Protest_CAL1573-min.jpg',
    r2Path: 'hero/cmu-protest-1920.webp',
  },
  {
    name: 'sparkler-portrait',
    squarespaceId: 'f75a0ba5-795a-4b29-a86e-eb890ef944a3',
    localPath: 'src/images/Portfolios/Journalism/Events/Boyd Station/6-9-25_Caleb McCartney_134-min.jpg',
    r2Path: 'hero/sparkler-portrait-1920.webp',
  },
  {
    name: 'when-we-were-dead',
    squarespaceId: '9c635526-663e-42ef-ba9c-7dcc8d477190',
    localPath: 'src/images/Portfolios/Concert/Dream The Heavy/October 2025/251025 When We Were Dead_CAL8612_webuse.jpg',
    r2Path: 'hero/when-we-were-dead-1920.webp',
  },
  {
    name: 'guy-hates-musicals',
    squarespaceId: '77807f5b-9895-4444-804d-1b3363d0f1b3',
    localPath: 'src/images/Portfolios/Events/guy-hates-musicals/250319 A Guy Who Hates Musicals - Ghostlight_CAL999.jpg',
    r2Path: 'hero/guy-hates-musicals-1920.webp',
  },
  // MISSING - Need to download from Squarespace:
  // { name: 'senior-portraits', squarespaceId: '8b6c6a68-c922-4e0f-9555-d1eafcf4f47b', localPath: '???', r2Path: 'hero/senior-portraits-1920.webp' },
  // { name: 'nature-landscape', squarespaceId: '0d0b4430-2b38-4518-bb1d-19a8992a6264', localPath: '???', r2Path: 'hero/nature-landscape-1920.webp' },
  // { name: 'honky-tonk', squarespaceId: 'a2b77c48-9cf4-4e5f-b15a-1c373e5fc5c1', localPath: '???', r2Path: 'hero/honky-tonk-1920.webp' },
  // { name: 'nature-flower', squarespaceId: 'f96709e7-3a00-4574-af88-795f26ce432e', localPath: '???', r2Path: 'hero/nature-flower-1920.webp' },
  // { name: 'kamala-erie', squarespaceId: '1757468682503-YXX6ILQYQ1CMH1OT66WD', localPath: '???', r2Path: 'hero/kamala-erie-1920.webp' },
];

const BUCKET_NAME = 'mccal-media-images';
const PROJECT_ROOT = path.resolve(__dirname, '..');

function checkFileExists(localPath) {
  const fullPath = path.join(PROJECT_ROOT, localPath);
  return fs.existsSync(fullPath) ? fullPath : null;
}

function uploadToR2(localPath, r2Path) {
  try {
    console.log(`Uploading: ${localPath} → r2://${BUCKET_NAME}/${r2Path}`);
    execSync(
      `npx wrangler r2 object put ${BUCKET_NAME}/${r2Path} -f "${localPath}"`,
      { stdio: 'inherit', cwd: PROJECT_ROOT }
    );
    return true;
  } catch (error) {
    console.error(`Failed to upload ${r2Path}:`, error.message);
    return false;
  }
}

function generateUrlMapping() {
  console.log('\n=== URL Mapping for Code Updates ===\n');

  IMAGES_TO_MIGRATE.forEach((img) => {
    const fullPath = checkFileExists(img.localPath);
    const status = fullPath ? '✅ Ready' : '❌ Missing';

    console.log(`${img.name}:`);
    console.log(`  Status: ${status}`);
    console.log(`  R2 URL: https://images.mcc-cal.com/${img.r2Path}`);
    console.log(`  OR: https://pub-xxx.r2.dev/${img.r2Path}`);
    console.log('');
  });
}

async function main() {
  const command = process.argv[2];

  if (command === '--map' || command === '-m') {
    generateUrlMapping();
    return;
  }

  if (command === '--upload' || command === '-u') {
    console.log('=== Uploading Images to R2 ===\n');

    let uploaded = 0;
    let failed = 0;

    for (const img of IMAGES_TO_MIGRATE) {
      const fullPath = checkFileExists(img.localPath);

      if (!fullPath) {
        console.log(`⚠️  Skipping ${img.name} - file not found: ${img.localPath}`);
        failed++;
        continue;
      }

      const success = uploadToR2(fullPath, img.r2Path);
      if (success) {
        uploaded++;
      } else {
        failed++;
      }
    }

    console.log(`\n=== Upload Complete ===`);
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Failed: ${failed}`);
    console.log(`\nNext steps:`);
    console.log(`1. Update code to use new R2 URLs`);
    console.log(`2. Test all images load correctly`);
    console.log(`3. Run Lighthouse to verify improvements`);
    return;
  }

  console.log(`
CDN Migration Script

Usage:
  node scripts/migrate-to-r2.js --map     Show URL mapping (dry run)
  node scripts/migrate-to-r2.js --upload  Upload images to R2

Prerequisites:
  1. Install wrangler: npm install -g wrangler
  2. Login to Cloudflare: npx wrangler login
  3. Create R2 bucket: npx wrangler r2 bucket create ${BUCKET_NAME}
  4. Configure custom domain (optional): images.mcc-cal.com

Images to migrate: ${IMAGES_TO_MIGRATE.length}
`);
}

main().catch(console.error);
