#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const blogRoot = path.join(repoRoot, 'src', 'content', 'blog');
const manifestPath = path.join(blogRoot, 'blog-manifest.json');
const authorsPath = path.join(blogRoot, 'authors.json');
const outJson = path.join(blogRoot, 'feed.json');
const outRss = path.join(blogRoot, 'feed.xml');
const siteBase = (process.env.SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

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

function getAuthor(authors, authorId, authorName) {
  return (
    (authors.authors || []).find((entry) => entry.id === authorId) ||
    (authorName ? { name: authorName } : null)
  );
}

function resolveAssetUrl(assetPath) {
  if (!assetPath) return undefined;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const cleanPath = assetPath.replace(/^\/+/, '');
  const fullPath = cleanPath.startsWith('content/blog/')
    ? cleanPath
    : `content/blog/${cleanPath}`;

  return `${siteBase}/${fullPath}`;
}

const manifest = safeReadJSON(manifestPath) || { posts: [] };
const authors = safeReadJSON(authorsPath) || { authors: [] };

const items = (manifest.posts || []).map((post) => {
  const author = getAuthor(authors, post.authorId, post.authorName);

  return {
    id: post.slug,
    title: post.title,
    url: `${siteBase}/blog/${post.slug}`,
    date_published: post.date,
    summary: post.excerpt || '',
    image: resolveAssetUrl(post.leadImage),
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
