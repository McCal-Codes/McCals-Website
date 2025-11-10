#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'src', 'site', 'blog', 'manifest.json');
const authorsPath = path.join(repoRoot, 'src', 'site', 'blog', 'authors.json');
const outJson = path.join(repoRoot, 'src', 'site', 'blog', 'feed.json');
const outRss = path.join(repoRoot, 'src', 'site', 'blog', 'feed.xml');

function safeReadJSON(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')) }catch(e){ return null } }
function ensureDir(p){ const d = path.dirname(p); if(!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); }

const manifest = safeReadJSON(manifestPath) || {posts:[]};
const authors = safeReadJSON(authorsPath) || {authors:[]};

function getAuthor(aid){ return (authors.authors||[]).find(x=>x.id===aid) }

const siteBase = '/'; // adjust if you host under a subpath

// Try to extract hero image from post frontmatter if available
function extractHeroFromMarkdown(mdPath){
  try{
    if(!fs.existsSync(mdPath)) return null;
    const raw = fs.readFileSync(mdPath,'utf8');
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if(!m) return null;
    const fm = m[1];
    // Look for common keys: image, hero_image, cover, hero
    const re = /^(?:image|hero_image|cover|hero):\s*(?:"|'|)?(.+?)(?:"|'|)?\s*$/gmi;
    let match;
    while((match = re.exec(fm)) !== null){
      let img = match[1].trim();
      if(!img) continue;
      // Resolve relative paths: if not absolute, make it relative to the markdown file
      if(!img.startsWith('/') && !img.match(/^https?:\/\//)){
        const abs = path.resolve(path.dirname(mdPath), img);
        // convert to site-root relative path if inside src/ or assets
        const rel = path.relative(repoRoot, abs).split(path.sep).join('/');
        return '/' + rel;
      }
      return img;
    }
    return null;
  }catch(e){ return null }
}

const items = (manifest.posts||[]).map(p=>{
  const author = getAuthor(p.author) || null;
  // attempt to find markdown by p.path or by conventional posts folder + slug
  let mdPath = null;
  if(p.path){ mdPath = path.resolve(repoRoot, p.path.replace(/^\//,'')); }
  if(!mdPath){
    const candidate = path.join(repoRoot, 'src','site','blog','posts', (p.slug || '') + '.md');
    if(fs.existsSync(candidate)) mdPath = candidate;
  }
  const image = mdPath ? extractHeroFromMarkdown(mdPath) : null;
  return {
    id: p.slug || p.path || p.title,
    title: p.title || p.slug,
    url: `${siteBase}blog/${p.slug}`,
    date_published: p.date,
    author: author? { name: author.name, url: author.website || undefined } : undefined,
    summary: p.summary || '',
    image: image || undefined
  };
});

const feed = {
  version: 'https://jsonfeed.org/version/1',
  title: 'McCal Media Blog',
  home_page_url: siteBase,
  feed_url: `${siteBase}src/site/blog/feed.json`,
  items
};

ensureDir(outJson);
fs.writeFileSync(outJson, JSON.stringify(feed, null, 2), 'utf8');
console.log('Wrote', outJson);

// Simple RSS builder
function esc(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
const rssItems = items.map(it=>{
  return `  <item>\n    <title>${esc(it.title)}</title>\n    <link>${esc(it.url)}</link>\n    <guid isPermaLink="false">${esc(it.id)}</guid>\n    <pubDate>${new Date(it.date_published).toUTCString()}</pubDate>\n    <description>${esc(it.summary)}</description>\n  </item>`;
}).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>McCal Media Blog</title>\n  <link>${siteBase}</link>\n  <description>Blog feed generated from manifest.json</description>\n${rssItems}\n</channel>\n</rss>`;

ensureDir(outRss);
fs.writeFileSync(outRss, rss, 'utf8');
console.log('Wrote', outRss);

process.exit(0);
