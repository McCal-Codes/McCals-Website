#!/usr/bin/env node
/**
 * Generates feed.json/feed.xml from Supabase's blog_posts table (written
 * through the admin app — see sites/mcc-cal-admin/api/admin/blog/posts).
 */
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const repoRoot = path.resolve(__dirname, '../..');
const viteDir = path.join(repoRoot, 'sites', 'mcc-cal-vite');
const blogRoot = path.join(repoRoot, 'src', 'content', 'blog');
const authorsPath = path.join(blogRoot, 'authors.json');
const outJson = path.join(blogRoot, 'feed.json');
const outRss = path.join(blogRoot, 'feed.xml');
const siteBase = (process.env.SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const viteRequire = createRequire(path.join(viteDir, 'package.json'));
const dotenv = viteRequire('dotenv');
dotenv.config({ path: path.join(viteDir, '.env.local') });
dotenv.config({ path: path.join(viteDir, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

function safeReadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(value) {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(
      '\nMissing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY in sites/mcc-cal-vite/.env.local — skipping feed generation.\n',
    );
    process.exit(0);
  }

  const { createClient } = viteRequire('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const authors = safeReadJSON(authorsPath) || { authors: [] };

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug,title,date,excerpt,lead_image,author_id,tags')
    .eq('published', true)
    .order('date', { ascending: false });

  if (error) {
    console.error('\nFailed to fetch blog_posts from Supabase: ' + error.message + '\n');
    process.exit(1);
  }

  const items = (posts || []).map((post) => {
    const author = (authors.authors || []).find((entry) => entry.id === post.author_id);
    return {
      id: post.slug,
      title: post.title,
      url: `${siteBase}/blog/${post.slug}`,
      date_published: post.date,
      summary: post.excerpt || '',
      image: post.lead_image || undefined,
      authors: author ? [{ name: author.name }] : undefined,
      tags: post.tags || [],
    };
  });

  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'McCal Media Blog',
    home_page_url: `${siteBase}/blog`,
    feed_url: `${siteBase}/content/blog/feed.json`,
    items,
  };

  ensureDir(outJson);
  fs.writeFileSync(outJson, JSON.stringify(jsonFeed, null, 2), 'utf8');
  console.log('Wrote', outJson);

  const rssItems = items
    .map((item) => {
      const authorName = item.authors?.[0]?.name;
      return [
        '  <item>',
        `    <title>${escapeXml(item.title)}</title>`,
        `    <link>${escapeXml(item.url)}</link>`,
        `    <guid isPermaLink="true">${escapeXml(item.url)}</guid>`,
        `    <pubDate>${new Date(item.date_published).toUTCString()}</pubDate>`,
        `    <description>${escapeXml(item.summary)}</description>`,
        authorName ? `    <author>${escapeXml(authorName)}</author>` : null,
        item.image ? `<enclosure url="${escapeXml(item.image)}" type="image/jpeg" />` : null,
        '  </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>McCal Media Blog</title>\n  <link>${siteBase}/blog</link>\n  <description>Field notes, visual essays, and reporting from McCal Media.</description>\n  <atom:link href="${siteBase}/content/blog/feed.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />\n${rssItems}\n</channel>\n</rss>`;

  ensureDir(outRss);
  fs.writeFileSync(outRss, rss, 'utf8');
  console.log('Wrote', outRss);
}

main().catch((err) => {
  console.error('\n' + (err.stack || err.message) + '\n');
  process.exit(1);
});
