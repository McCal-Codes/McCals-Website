#!/usr/bin/env node
/*
 * sync-sites.js
 *
 * Pulls live metadata for the websites listed in src/content/websites.ts.
 *
 * For a product the repository is the evidence, and sync-github.js handles it.
 * For a website the evidence is that it is live and looks right, so the source
 * here is the site itself: its <title>, its description, and its Open Graph
 * image, which is the one preview a site publishes about itself.
 *
 * Previews come from one of two places, in order of preference:
 *
 *   1. A screenshot of the rendered homepage, with --shots. This is what you
 *      actually want for a website portfolio: the real page as a visitor sees it.
 *      Needs Playwright, which the monorepo already depends on.
 *   2. The site's own og:image, if it publishes one. Often a logo rather than the
 *      design, so it is the fallback rather than the default.
 *
 * Either way the image is stored locally rather than hotlinked. Hotlinking would
 * widen the CSP to third-party origins, break whenever a client redesigns, and
 * bill their bandwidth for our traffic.
 *
 * Failure is never fatal. A site that is slow, down, or blocking us keeps its
 * previous record and is marked unreachable, because a client site going down
 * should not break this build.
 *
 * Usage:
 *   node scripts/sync-sites.js            # metadata only, fast
 *   node scripts/sync-sites.js --shots    # metadata + rendered screenshots
 *   node scripts/sync-sites.js --dry-run
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '..', 'src', 'content', 'sites.json');
const IMAGE_DIR = path.resolve(here, '..', 'public', 'site-previews');

/** Identifies the crawler and points at the operator. Standard courtesy. */
const USER_AGENT =
  'mccal-dev-portfolio/1.0 (+https://dev.mcc-cal.com; portfolio preview sync)';

const REQUEST_TIMEOUT_MS = 25_000;
/** Rendering a heavy hosted site takes longer than fetching its markup. */
const SCREENSHOT_TIMEOUT_MS = 60_000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/**
 * Sites to track, keyed by the slug in websites.ts.
 * Hosted-platform sites have no repo and that is expected, not a gap.
 */
const TARGETS = [
  { slug: 'courtroom-kyle', url: 'https://www.courtroomkyle.com/' },
  { slug: 'allegheny-hyp-club', url: 'https://allegheny-hyp-club.vercel.app' },
  { slug: 'divine-eyth', url: null },
];

async function withTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, ...(init.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** One retry. Hosted builders are routinely slow on a cold hit. */
async function fetchWithRetry(url, init) {
  try {
    return await withTimeout(url, init);
  } catch {
    return withTimeout(url, init);
  }
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** Reads a meta tag by property or name, with the attribute order either way round. */
function readMeta(html, key) {
  const escaped = key.replace(/[:]/g, '\\:');
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`,
      'i',
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeEntities(match[1]);
  }
  return null;
}

function readTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]) : null;
}

/** Best-effort platform detection from markup fingerprints. */
function detectPlatform(html) {
  const generator = readMeta(html, 'generator');
  if (generator) {
    if (/wix/i.test(generator)) return 'Wix';
    if (/squarespace/i.test(generator)) return 'Squarespace';
    if (/wordpress/i.test(generator)) return 'WordPress';
    if (/webflow/i.test(generator)) return 'Webflow';
  }
  const lower = html.toLowerCase();
  if (lower.includes('/_next/')) return 'Next.js';
  if (lower.includes('/_nuxt/')) return 'Nuxt';
  if (lower.includes('wp-content')) return 'WordPress';
  if (lower.includes('cdn.shopify')) return 'Shopify';
  return null;
}

async function downloadPreview(slug, imageUrl, pageUrl) {
  const absolute = new URL(imageUrl, pageUrl).toString();
  const response = await fetchWithRetry(absolute);
  if (!response.ok) throw new Error(`image HTTP ${response.status}`);

  const type = response.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`not an image: ${type || 'unknown'}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`image too large: ${Math.round(buffer.byteLength / 1024)}kB`);
  }

  const extension = type.includes('png')
    ? 'png'
    : type.includes('webp')
      ? 'webp'
      : type.includes('avif')
        ? 'avif'
        : 'jpg';

  await fs.mkdir(IMAGE_DIR, { recursive: true });
  const filename = `${slug}.${extension}`;
  await fs.writeFile(path.join(IMAGE_DIR, filename), buffer);
  return { path: `/site-previews/${filename}`, bytes: buffer.byteLength };
}

/**
 * Screenshots the rendered homepage.
 *
 * Playwright is imported lazily so the default metadata-only run never pays for
 * loading it, and so a missing install degrades to "no shot" rather than a crash.
 */
async function captureScreenshot(slug, url) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('playwright not installed');
  }

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      // 1200x630 matches the OG ratio the layout already reserves.
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 2,
      userAgent: USER_AGENT,
      // Client sites are not ours; do not carry state between captures.
      storageState: undefined,
    });
    const page = await context.newPage();

    // Deliberately not 'networkidle': hosted builders (Wix in particular) poll
    // analytics forever, so the network never goes idle and the wait always times
    // out. Wait for load, then give the page a fixed settle budget instead.
    await page.goto(url, { waitUntil: 'load', timeout: SCREENSHOT_TIMEOUT_MS });

    // Pull the whole page past the viewport so lazy-loaded hero imagery commits,
    // then return to the top for the capture.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      window.scrollTo(0, 0);
    });

    // Entrance animations are near-universal on these platforms. Let them finish.
    await page.waitForTimeout(3000);

    await fs.mkdir(IMAGE_DIR, { recursive: true });
    const filename = `${slug}.png`;
    await page.screenshot({ path: path.join(IMAGE_DIR, filename), type: 'png' });

    const { size } = await fs.stat(path.join(IMAGE_DIR, filename));
    return { path: `/site-previews/${filename}`, bytes: size };
  } finally {
    await browser.close();
  }
}

async function fetchSite(target, previous, withShots) {
  if (!target.url) {
    return {
      slug: target.slug,
      url: null,
      reachable: false,
      note: 'No live URL on record.',
      checkedAt: new Date().toISOString().slice(0, 10),
    };
  }

  const response = await fetchWithRetry(target.url);
  const html = await response.text();

  const record = {
    slug: target.slug,
    url: target.url,
    reachable: response.ok,
    status: response.status,
    // The final URL after redirects. Reveals a bare domain silently forwarding.
    resolvedUrl: response.url || target.url,
    title: readTitle(html),
    description: readMeta(html, 'og:description') || readMeta(html, 'description'),
    detectedPlatform: detectPlatform(html),
    preview: previous?.preview ?? null,
    checkedAt: new Date().toISOString().slice(0, 10),
  };

  // A rendered screenshot beats a social card, so try it first when asked.
  if (withShots) {
    try {
      const shot = await captureScreenshot(target.slug, target.url);
      record.preview = shot.path;
      record.previewSource = 'screenshot';
      process.stdout.write(`shot ${Math.round(shot.bytes / 1024)}kB `);
      return record;
    } catch (error) {
      record.previewError = error.message;
      process.stdout.write(`(shot failed: ${error.message}) `);
    }
  }

  const ogImage = readMeta(html, 'og:image');
  if (ogImage) {
    try {
      const saved = await downloadPreview(target.slug, ogImage, target.url);
      record.preview = saved.path;
      record.previewSource = ogImage;
      process.stdout.write(`og ${Math.round(saved.bytes / 1024)}kB `);
    } catch (error) {
      // Keep whatever preview we already had rather than dropping to nothing.
      record.previewError = error.message;
      process.stdout.write(`(og image failed: ${error.message}) `);
    }
  } else if (!withShots && !record.preview) {
    record.previewError = 'no og:image published; run with --shots to capture one';
  }

  return record;
}

async function readPrevious() {
  try {
    const raw = await fs.readFile(OUT, 'utf8');
    const parsed = JSON.parse(raw);
    return new Map((parsed.sites || []).map((site) => [site.slug, site]));
  } catch {
    return new Map();
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const withShots = process.argv.includes('--shots');
  const previous = await readPrevious();
  const sites = [];

  for (const target of TARGETS) {
    process.stdout.write(`${target.slug} ... `);
    try {
      sites.push(await fetchSite(target, previous.get(target.slug), withShots));
      process.stdout.write('ok\n');
    } catch (error) {
      const stale = previous.get(target.slug);
      sites.push({
        ...(stale || { slug: target.slug, url: target.url }),
        reachable: false,
        error: error.message,
        checkedAt: new Date().toISOString().slice(0, 10),
      });
      process.stdout.write(`unreachable (${error.message}) — kept previous record\n`);
    }
  }

  const payload = {
    generatedBy: 'sites/mcc-cal-dev/scripts/sync-sites.js',
    generatedAt: new Date().toISOString(),
    sites,
  };

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${sites.length} sites)`);
}

main().catch((error) => {
  console.error(`sync-sites failed: ${error.message}`);
  process.exitCode = 1;
});
