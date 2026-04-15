import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STATIC_PAGE_ROUTES } from '../src/config/public-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://mcc-cal.com';
const MANIFEST = path.resolve(__dirname, '..', 'public-vite', 'content', 'blog-static', 'blog-manifest.json');
const OUT = path.resolve(__dirname, '..', 'public-vite', 'sitemap.xml');

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join('\n');
}

const entries = [];

for (const route of STATIC_PAGE_ROUTES) {
  entries.push(
    urlEntry({
      loc: `${SITE_URL}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
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
    }));
  }
  console.log(`Sitemap: added ${posts.filter(p => p.published).length} blog posts`);
} else {
  console.warn('Sitemap: blog manifest not found, skipping blog posts');
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '',
  entries.join('\n\n'),
  '',
  '</urlset>',
].join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, xml, 'utf8');
console.log(`Sitemap: written to ${path.relative(process.cwd(), OUT)} (${entries.length} URLs)`);
