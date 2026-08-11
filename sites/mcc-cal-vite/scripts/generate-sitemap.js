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
  for (const image of images) {
    if (!image.loc) continue;
    lines.push('    <image:image>');
    lines.push(`      <image:loc>${escapeXml(image.loc)}</image:loc>`);
    if (image.title) lines.push(`      <image:title>${escapeXml(image.title)}</image:title>`);
    if (image.caption) lines.push(`      <image:caption>${escapeXml(image.caption)}</image:caption>`);
    lines.push('    </image:image>');
  }
  lines.push(`  </url>`);
  return lines.join('\n');
}

const entries = [];

for (const route of STATIC_PAGE_ROUTES) {
  const seoKey = route.seoKey || route.routeKey;
  const seo = PAGE_SEO[seoKey];
  entries.push(
    urlEntry({
      loc: `${SITE_URL}${route.path}`,
      lastmod: lastmodForRoute(route),
      images: seo
        ? [
            {
              loc: absoluteUrl(seo.imagePath),
              title: seo.ogTitle || seo.title,
              caption: seo.imageAlt,
            },
          ]
        : [],
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
      images: [
        {
          loc: absoluteUrl(post.leadImage || post.leadImageFallback),
          title: post.title,
          caption: post.leadImageCaption || post.leadImageAlt || post.excerpt,
        },
      ],
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
if (carriedForward > 0) {
  console.log(`Sitemap: ${carriedForward} lastmod values carried forward from the committed sitemap`);
}
if (isShallowClone) {
  console.warn(
    'Sitemap: shallow clone detected, so page commit dates were not recomputed. The SEO Auto ' +
      'Update workflow checks out full history and refreshes them.',
  );
}
