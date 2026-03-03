#!/usr/bin/env node

/**
 * Validate generated SEO artifacts in dist/ for Google-facing correctness.
 *
 * Checks:
 * - dist/sitemap.xml exists and contains URL entries
 * - sitemap uses canonical domain (mcc-cal.com)
 * - sitemap does not contain legacy domains (mccalmedia.com / mccal.com)
 * - dist/structured-data/*.json files exist and are valid JSON
 * - JSON schemas do not contain legacy domains
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT, 'dist');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');
const STRUCTURED_DATA_DIR = path.join(DIST_DIR, 'structured-data');

const CANONICAL_DOMAIN = 'mcc-cal.com';
const LEGACY_DOMAIN_PATTERNS = [/mccalmedia\.com/gi, /https?:\/\/(?:www\.)?mccal\.com/gi];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

function validateSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    fail(`Missing sitemap: ${SITEMAP_PATH}`);
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  if (!xml.includes('<?xml version="1.0"')) {
    fail('Sitemap XML header is missing or invalid');
  }

  const urlMatches = xml.match(/<loc>/g) || [];
  if (urlMatches.length < 5) {
    warn(`Sitemap contains only ${urlMatches.length} URLs`);
  }

  if (!xml.includes(CANONICAL_DOMAIN)) {
    fail(`Sitemap does not reference canonical domain: ${CANONICAL_DOMAIN}`);
  }

  for (const pattern of LEGACY_DOMAIN_PATTERNS) {
    if (pattern.test(xml)) {
      fail(`Sitemap contains legacy domain pattern: ${pattern}`);
    }
  }

  const imageMatches = xml.match(/<image:loc>/g) || [];
  console.log(`✅ Sitemap validated (${urlMatches.length} URLs, ${imageMatches.length} images)`);
}

function validateStructuredData() {
  if (!fs.existsSync(STRUCTURED_DATA_DIR)) {
    fail(`Missing structured data directory: ${STRUCTURED_DATA_DIR}`);
  }

  const jsonFiles = fs
    .readdirSync(STRUCTURED_DATA_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(STRUCTURED_DATA_DIR, file));

  if (jsonFiles.length === 0) {
    fail('No structured data JSON files found in dist/structured-data');
  }

  for (const filePath of jsonFiles) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      fail(`Invalid JSON in ${path.basename(filePath)}: ${error.message}`);
    }

    const content = JSON.stringify(json);
    if (!content.includes(CANONICAL_DOMAIN)) {
      warn(`${path.basename(filePath)} does not reference canonical domain`);
    }

    for (const pattern of LEGACY_DOMAIN_PATTERNS) {
      if (pattern.test(content)) {
        fail(`${path.basename(filePath)} contains legacy domain pattern: ${pattern}`);
      }
    }
  }

  console.log(`✅ Structured data validated (${jsonFiles.length} JSON files)`);
}

function main() {
  validateSitemap();
  validateStructuredData();
  console.log('🎉 SEO assets validation passed');
}

main();
