import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/* global process */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const distRoot = path.join(appRoot, 'dist');
const pageSeoPath = path.join(appRoot, 'src', 'content', 'pageSeoData.json');
const siteUrl = (process.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function absoluteUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function setTitle(html, title) {
  return html.replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
}

function setMeta(html, selector, attr, value) {
  const escapedValue = escapeAttr(value);
  const pattern = new RegExp(`(<meta\\s+${escapeRegex(selector)}[^>]*\\s${attr}=["'])[^"']*(["'][^>]*>)`, 'i');

  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escapedValue}$2`);
  }

  return html;
}

function setLink(html, rel, href) {
  const escapedHref = escapeAttr(href);
  const pattern = new RegExp(`(<link\\s+rel=["']${rel}["'][^>]*\\shref=["'])[^"']*(["'][^>]*>)`, 'i');

  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escapedHref}$2`);
  }

  return html.replace('</head>', `    <link rel="${rel}" href="${escapedHref}" />\n  </head>`);
}

function applyRouteMeta(indexHtml, entry) {
  const url = absoluteUrl(entry.route);
  const image = absoluteUrl(entry.imagePath);
  let html = setTitle(indexHtml, entry.title);

  html = setMeta(html, 'name="description"', 'content', entry.description);
  html = setLink(html, 'canonical', url);
  html = setMeta(html, 'property="og:title"', 'content', entry.ogTitle);
  html = setMeta(html, 'property="og:description"', 'content', entry.ogDescription);
  html = setMeta(html, 'property="og:url"', 'content', url);
  html = setMeta(html, 'property="og:image"', 'content', image);
  html = setMeta(html, 'property="og:image:alt"', 'content', entry.imageAlt);
  html = setMeta(html, 'name="twitter:title"', 'content', entry.ogTitle);
  html = setMeta(html, 'name="twitter:description"', 'content', entry.ogDescription);
  html = setMeta(html, 'name="twitter:image"', 'content', image);
  html = setMeta(html, 'name="twitter:image:alt"', 'content', entry.imageAlt);

  return html;
}

async function generateRouteMeta() {
  const [indexHtml, pageSeoRaw] = await Promise.all([
    fs.readFile(path.join(distRoot, 'index.html'), 'utf8'),
    fs.readFile(pageSeoPath, 'utf8'),
  ]);
  const pageSeo = JSON.parse(pageSeoRaw);
  const routeEntries = Object.entries(pageSeo).filter(([, entry]) => entry.route !== '/');

  await Promise.all(
    routeEntries.map(async ([key, entry]) => {
      const routeDir = path.join(distRoot, entry.route.replace(/^\//, ''));
      await fs.mkdir(routeDir, { recursive: true });
      await fs.writeFile(path.join(routeDir, 'index.html'), applyRouteMeta(indexHtml, entry));
      return key;
    }),
  );

  console.log(`Generated route meta for ${routeEntries.length} pages`);
}

generateRouteMeta().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
