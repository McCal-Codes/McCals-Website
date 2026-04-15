import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://mcc-cal.com';
const MANIFEST = path.resolve(__dirname, '..', 'public-vite', 'content', 'blog-static', 'blog-manifest.json');
const OUT = path.resolve(__dirname, '..', 'public-vite', 'sitemap.xml');

// Static routes: [path, changefreq, priority]
const STATIC_ROUTES = [
  ['/',                 'weekly',  '1.0'],
  ['/about',           'monthly', '0.9'],
  ['/contact-us',      'monthly', '0.8'],
  ['/request-a-quote', 'monthly', '0.8'],
  ['/featured-work',   'weekly',  '0.9'],
  ['/letting-me-go',   'monthly', '0.75'],
  ['/journalism',      'weekly',  '0.8'],
  ['/portraits',       'monthly', '0.8'],
  ['/nature',          'monthly', '0.7'],
  ['/video',           'monthly', '0.7'],
  ['/events',          'weekly',  '0.8'],
  ['/concerts',        'weekly',  '0.7'],
  ['/blog',            'weekly',  '0.8'],
  ['/authors',         'monthly', '0.6'],
  ['/authors/mccal',   'monthly', '0.6'],
  ['/podcast',         'weekly',  '0.7'],
  ['/book-a-podcast',  'monthly', '0.7'],
  ['/grab-a-coffee',   'monthly', '0.7'],
  ['/faq',             'monthly', '0.6'],
  ['/design-systems',  'monthly', '0.5'],
  ['/projects',        'monthly', '0.6'],
  ['/terranova',       'monthly', '0.5'],
  ['/policies-legal',  'yearly',  '0.3'],
];

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join('\n');
}

const entries = [];

for (const [route, changefreq, priority] of STATIC_ROUTES) {
  entries.push(urlEntry({ loc: `${SITE_URL}${route}`, changefreq, priority }));
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
