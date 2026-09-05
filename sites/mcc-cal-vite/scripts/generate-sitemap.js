import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STATIC_PAGE_ROUTES } from '../src/config/public-routes.js';
import pageSeoData from '../src/content/pageSeoData.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://mcc-cal.com';
const MANIFEST = path.resolve(__dirname, '..', 'public-vite', 'content', 'blog-static', 'blog-manifest.json');
const MANIFEST_DIR = path.resolve(__dirname, '..', 'public-vite', 'manifests');
const PAGES_DIR = path.resolve(__dirname, '..', 'src', 'pages');
const OUT = path.resolve(__dirname, '..', 'public-vite', 'sitemap.xml');
const PAGE_SEO = pageSeoData;

/**
 * `lastmod` is the only sitemap signal Google still acts on — it schedules recrawls
 * from it — and it drops the signal entirely for sites that report it inaccurately.
 * So every date below has to be one we can actually stand behind, and a route with
 * no trustworthy date gets no `lastmod` rather than a guess.
 *
 * `changefreq` and `priority` are deliberately not emitted. Google has said for
 * years that it ignores both.
 */

/**
 * Portfolio routes render from a generated manifest, so the manifest's own
 * `generated` stamp is the truthful answer for when that page's content last
 * changed — far better than the page component, which barely ever changes.
 */
const ROUTE_MANIFESTS = {
  '/journalism': 'journalism-manifest.json',
  '/nature': 'nature-manifest.json',
  '/portraits': 'portrait-manifest.json',
  '/events': 'events-manifest.json',
  '/concerts': 'concert-manifest.json',
  '/featured-work': 'featured-manifest.json',
};

/** Routes whose page component filename does not follow from the path. */
const SOURCE_OVERRIDES = {
  '/letting-me-go': 'one-nation-divided.tsx',
};

/**
 * A shallow clone reports the boundary commit for every file that predates it, so
 * `git log` would date most pages identically and wrongly. Detect that once and fall
 * back to omitting rather than emitting a same-date-for-everything lie.
 */
const isShallowClone = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() === 'true';
  } catch {
    return true; // No git available: treat dates as untrustworthy.
  }
})();

function gitLastModified(absolutePath) {
  if (isShallowClone || !fs.existsSync(absolutePath)) return null;
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', absolutePath], {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso || null;
  } catch {
    return null;
  }
}

function manifestGeneratedAt(fileName) {
  const file = path.join(MANIFEST_DIR, fileName);
  if (!fs.existsSync(file)) return null;
  try {
    const { generated } = JSON.parse(fs.readFileSync(file, 'utf8'));
    return generated || null;
  } catch {
    return null;
  }
}

/** Resolves a route to its page component, so static pages can use their commit date. */
function pageSourceFor(route) {
  const override = SOURCE_OVERRIDES[route.path];
  if (override) return path.join(PAGES_DIR, override);

  const fromPath = route.path === '/' ? 'index' : route.path.replace(/^\//, '');
  const fromKey = route.routeKey.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  for (const candidate of [fromPath, fromKey]) {
    const file = path.join(PAGES_DIR, `${candidate}.tsx`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** ISO 8601 date, which is what the sitemap spec wants. */
function toSitemapDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/**
 * Dates already published in the committed sitemap, keyed by URL.
 *
 * The SEO workflow regenerates this file from a full-history checkout, so it holds
 * real commit dates for the static content pages. Vercel builds from a shallow
 * clone and cannot recompute those, so without this they would be dropped on every
 * deploy and the workflow's work would never reach production. Carrying them
 * forward makes the committed sitemap the durable record: each build can improve a
 * date but never silently loses one.
 */
function readPublishedLastmods() {
  if (!fs.existsSync(OUT)) return new Map();
  const xml = fs.readFileSync(OUT, 'utf8');
  const published = new Map();
  for (const block of xml.split('<url>').slice(1)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (loc && lastmod) published.set(loc, lastmod);
  }
  return published;
}

const publishedLastmods = readPublishedLastmods();
let carriedForward = 0;

function lastmodForRoute(route) {
  const loc = `${SITE_URL}${route.path}`;

  const manifest = ROUTE_MANIFESTS[route.path];
  if (manifest) {
    const generated = toSitemapDate(manifestGeneratedAt(manifest));
    if (generated) return generated;
  }

  const source = pageSourceFor(route);
  const fromGit = source ? toSitemapDate(gitLastModified(source)) : null;
  if (fromGit) return fromGit;

  const previous = publishedLastmods.get(loc);
  if (previous) {
    carriedForward += 1;
    return previous;
  }

  return null;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(value) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

function urlEntry({ loc, lastmod, images = [] }) {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  // <image:loc> is the only image tag Google still reads. It removed
  // <image:caption>, <image:title>, <image:license> and <image:geo_location> from
  // its documentation, so emitting them implies coverage that does not exist.
  for (const image of images) {
    if (!image.loc) continue;
    lines.push('    <image:image>');
    lines.push(`      <image:loc>${escapeXml(image.loc)}</image:loc>`);
    lines.push('    </image:image>');
  }
  lines.push(`  </url>`);
  return lines.join('\n');
}

/**
 * Portfolio images, per route, for the image sitemap.
 *
 * Google names image sitemaps as the way to surface "images your site reaches with
 * JavaScript code" — which is exactly this site. The portfolios render client-side,
 * so a crawler that does not execute JavaScript sees none of the photographs. Before
 * this, the sitemap listed one image per page: the Open Graph card.
 *
 * URLs are built the same way the app builds them (see `imageUrl` in
 * src/components/portfolio/useManifest.ts). If the two ever disagree the sitemap
 * points at images that do not exist, which is worse than listing none.
 */
const REPO_CDN_BASE = 'https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main';
const PORTFOLIOS_BASE = 'src/images/Portfolios';

/**
 * The sitemap protocol's own ceiling. Held at the limit rather than below it:
 * this sitemap exists because the portfolios render client-side and a crawler
 * that does not run JavaScript sees none of the photographs, so an image
 * dropped here is an image that cannot be found at all. At 500 the concerts
 * gallery silently lost 87 frames.
 */
const MAX_IMAGES_PER_URL = 1000;

function encodeURIPath(value) {
  return value.split('/').map(encodeURIComponent).join('/');
}

function cdnUrl(repoRelativePath) {
  return `${REPO_CDN_BASE}/${encodeURIPath(repoRelativePath)}`;
}

function readManifest(fileName) {
  const file = path.join(MANIFEST_DIR, fileName);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Each portfolio stores image paths differently, so each needs its own reader
 * rather than one clever generic walk that would silently produce wrong URLs.
 */
const PORTFOLIO_IMAGE_READERS = {
  '/journalism': () => {
    const manifest = readManifest('journalism-manifest.json');
    return (manifest?.events ?? []).flatMap((event) =>
      (event.images ?? [])
        .map((image) => image.filename || image.path)
        .filter(Boolean)
        .map((filename) => `${PORTFOLIOS_BASE}/Journalism/${event.folderPath}/${filename}`),
    );
  },
  '/nature': () => {
    const manifest = readManifest('nature-manifest.json');
    return (manifest?.collections ?? []).flatMap((collection) =>
      (collection.images ?? [])
        .filter((image) => typeof image === 'string')
        .map((filename) => `${PORTFOLIOS_BASE}/Nature/${collection.folderPath}/${filename}`),
    );
  },
  '/portraits': () => {
    const manifest = readManifest('portrait-manifest.json');
    return (manifest?.collections ?? []).flatMap((collection) =>
      (collection.images ?? [])
        .filter((image) => typeof image === 'string')
        .map((filename) => `${PORTFOLIOS_BASE}/Portrait/${collection.folderPath}/${filename}`),
    );
  },
  '/concerts': () => {
    const manifest = readManifest('concert-manifest.json');
    return (manifest?.bands ?? []).flatMap((band) =>
      (band.images ?? [])
        .filter((image) => typeof image === 'string')
        // relativeFolderPath already includes "Concert/<band>/<month>".
        .map((filename) => `${PORTFOLIOS_BASE}/${band.relativeFolderPath}/${filename}`),
    );
  },
  '/events': () => {
    const manifest = readManifest('events-manifest.json');
    return (manifest?.events ?? []).flatMap((event) =>
      // Events already store a full repo-relative path.
      (event.images ?? []).map((image) => image?.path).filter(Boolean),
    );
  },
};

const droppedByRoute = [];

/** Absolute image URLs for a route, deduped and capped. */
function portfolioImagesFor(routePath) {
  const read = PORTFOLIO_IMAGE_READERS[routePath];
  if (!read) return [];

  let paths;
  try {
    paths = read();
  } catch {
    return [];
  }

  const unique = [...new Set(paths)];
  if (unique.length > MAX_IMAGES_PER_URL) {
    droppedByRoute.push({ routePath, listed: MAX_IMAGES_PER_URL, dropped: unique.length - MAX_IMAGES_PER_URL });
  }
  return unique.slice(0, MAX_IMAGES_PER_URL).map((repoPath) => ({ loc: cdnUrl(repoPath) }));
}

const entries = [];

for (const route of STATIC_PAGE_ROUTES) {
  const seoKey = route.seoKey || route.routeKey;
  const seo = PAGE_SEO[seoKey];
  entries.push(
    urlEntry({
      loc: `${SITE_URL}${route.path}`,
      lastmod: lastmodForRoute(route),
      images: (() => {
        const portfolio = portfolioImagesFor(route.path);
        if (portfolio.length > 0) return portfolio;
        // Non-portfolio routes still list their Open Graph image.
        return seo ? [{ loc: absoluteUrl(seo.imagePath) }] : [];
      })(),
    })
  );
}

if (fs.existsSync(MANIFEST)) {
  const { posts = [] } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  for (const post of posts) {
    if (!post.published) continue;
    entries.push(urlEntry({
      loc: `${SITE_URL}/blog/${post.slug}`,
      // Authored publication date — the most trustworthy signal available.
      lastmod: toSitemapDate(post.updated || post.date),
      images: [{ loc: absoluteUrl(post.leadImage || post.leadImageFallback) }],
    }));
  }
  console.log(`Sitemap: added ${posts.filter(p => p.published).length} blog posts`);
} else {
  console.warn('Sitemap: blog manifest not found, skipping blog posts');
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  '',
  entries.join('\n\n'),
  '',
  '</urlset>',
].join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, xml, 'utf8');

const withLastmod = entries.filter((entry) => entry.includes('<lastmod>')).length;
console.log(`Sitemap: written to ${path.relative(process.cwd(), OUT)} (${entries.length} URLs)`);
console.log(`Sitemap: ${withLastmod}/${entries.length} URLs carry a trustworthy lastmod`);

const imageCount = (xml.match(/<image:image>/g) ?? []).length;
console.log(`Sitemap: ${imageCount} images listed`);
for (const { routePath, listed, dropped } of droppedByRoute) {
  console.warn(
    `Sitemap: ${routePath} has more images than the per-URL cap; listed ${listed}, dropped ${dropped}.`,
  );
}
if (carriedForward > 0) {
  console.log(`Sitemap: ${carriedForward} lastmod values carried forward from the committed sitemap`);
}
if (isShallowClone) {
  console.warn(
    'Sitemap: shallow clone detected, so page commit dates were not recomputed. The SEO Auto ' +
      'Update workflow checks out full history and refreshes them.',
  );
}
