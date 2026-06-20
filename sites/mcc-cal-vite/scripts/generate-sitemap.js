import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STATIC_PAGE_ROUTES } from '../src/config/public-routes.js';
import pageSeoData from '../src/content/pageSeoData.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://mcc-cal.com';
const MANIFEST = path.resolve(__dirname, '..', 'public-vite', 'content', 'blog-static', 'blog-manifest.json');
const OUT = path.resolve(__dirname, '..', 'public-vite', 'sitemap.xml');
const PAGE_SEO = pageSeoData;

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

function urlEntry({ loc, lastmod, changefreq, priority, images = [] }) {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority}</priority>`);
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
      changefreq: route.changefreq,
      priority: route.priority,
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
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7',
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
console.log(`Sitemap: written to ${path.relative(process.cwd(), OUT)} (${entries.length} URLs)`);
