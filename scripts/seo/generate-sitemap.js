#!/usr/bin/env node

/**
 * Generate XML sitemap entries from portfolio manifests and the canonical blog manifest.
 *
 * - Prefers API data for portfolio manifests; falls back to local manifest files.
 * - Reads blog URLs from src/content/blog/blog-manifest.json.
 * - Includes per-item image entries with captions/titles where available.
 * - CLI filters: --type <portfolio|blog>, --images=<n>, --preview.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const SITE_URL = (process.env.SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const OUTPUT_PATH = path.join(ROOT, 'dist', 'sitemap.xml');

const PORTFOLIO_TYPES = ['concert', 'events', 'journalism', 'portrait', 'nature'];
const BLOG_TYPE = 'blog';
const SUPPORTED_TYPES = [...PORTFOLIO_TYPES, BLOG_TYPE];

const PORTFOLIO_BASE = path.join(ROOT, 'src/images/Portfolios');
const PORTFOLIO_ROOTS = {
  concert: path.join(PORTFOLIO_BASE, 'Concert'),
  events: path.join(PORTFOLIO_BASE, 'Events'),
  journalism: path.join(PORTFOLIO_BASE, 'Journalism'),
  portrait: path.join(PORTFOLIO_BASE, 'Portrait'),
  nature: path.join(PORTFOLIO_BASE, 'Nature'),
};
const LOCAL_MANIFESTS = {
  concert: path.join(PORTFOLIO_ROOTS.concert, 'concert-manifest.json'),
  events: path.join(PORTFOLIO_ROOTS.events, 'events-manifest.json'),
  journalism: path.join(PORTFOLIO_ROOTS.journalism, 'journalism-manifest.json'),
  portrait: path.join(PORTFOLIO_ROOTS.portrait, 'portrait-manifest.json'),
  nature: path.join(PORTFOLIO_ROOTS.nature, 'nature-manifest.json'),
};

const BLOG_ROOT = path.join(ROOT, 'src', 'content', 'blog');
const BLOG_MANIFEST_PATH = path.join(BLOG_ROOT, 'blog-manifest.json');

const DEFAULT_OPTIONS = {
  imagesPerItem: 5,
  preview: false,
};

function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--type' && argv[index + 1]) {
      options.type = argv[index + 1].toLowerCase();
      index += 1;
      continue;
    }

    if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1].toLowerCase();
      continue;
    }

    if (arg.startsWith('--images=')) {
      const value = Number.parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(value)) options.imagesPerItem = value;
      continue;
    }

    if (arg === '--preview') {
      options.preview = true;
    }
  }

  return options;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function encodeSegments(relativePath) {
  return relativePath.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function toPortfolioImageUrl(localPath) {
  if (!localPath) return null;

  const relativePath = path.relative(PORTFOLIO_BASE, localPath).split(path.sep).join('/');
  if (relativePath.startsWith('..')) return null;

  return `${SITE_URL}/images/Portfolios/${encodeSegments(relativePath)}`;
}

function toBlogAssetUrl(assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const relativePath = String(assetPath)
    .replace(/^\/+/, '')
    .replace(/^content\/blog\//, '');

  return `${SITE_URL}/content/blog/${encodeSegments(relativePath)}`;
}

function resolveImageCandidate(type, item, image) {
  const base = PORTFOLIO_ROOTS[type];
  const filename =
    typeof image === 'string'
      ? image
      : image?.filename || image?.name || path.basename(image?.path || image?.relativePath || '');

  let localPath = null;

  if (image && image.path) {
    localPath = path.isAbsolute(image.path) ? image.path : path.join(ROOT, image.path);
  } else if (item.folderPath) {
    localPath = base ? path.join(base, item.folderPath, filename) : null;
  } else if (item.path) {
    localPath = base ? path.join(base, item.path, filename) : null;
  } else if (base && filename) {
    localPath = path.join(base, filename);
  }

  return {
    url: toPortfolioImageUrl(localPath),
    filename,
  };
}

function normalizePortfolioImages(type, item, imagesPerItem) {
  const images = Array.isArray(item.images) ? item.images : [];

  return images
    .slice(0, imagesPerItem)
    .map((image) => {
      const resolved = resolveImageCandidate(type, item, image);
      const title = `${(item.bandName || item.eventName || item.collectionName || item.title || item.name || 'Portfolio').trim()}${item.dateDisplay ? ` - ${item.dateDisplay}` : ''}`;
      const caption =
        (typeof image === 'object' && (image.caption || image.description)) ||
        item.venue ||
        item.description ||
        '';

      return {
        loc: resolved.url,
        title,
        caption,
      };
    })
    .filter((image) => Boolean(image.loc));
}

function normalizeBlogImages(post) {
  const leadImageUrl = toBlogAssetUrl(post.leadImage);
  if (!leadImageUrl) return [];

  return [
    {
      loc: leadImageUrl,
      title: post.title,
      caption: post.leadImageCaption || post.excerpt || '',
    },
  ];
}

function selectItemsForType(type, data) {
  if (!data) return [];
  if (type === 'concert') return data.bands || data.items || [];
  if (type === 'events') return data.events || data.collections || data.items || [];
  if (type === 'journalism') return data.events || data.journalism || data.items || [];
  if (type === 'portrait') return data.collections || data.portraits || data.items || [];
  if (type === 'nature') return data.collections || data.items || [];
  return data.items || [];
}

function itemDate(item, fallback) {
  return item.concertDate?.iso || item.dateISO || item.eventDate?.iso || item.eventDate || item.date || item.dateDisplay || fallback;
}

function escapeXml(text) {
  if (text === undefined || text === null) return '';

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadPortfolioManifest(type) {
  const apiUrl = `${API_BASE}/api/v1/manifests/${type}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      return {
        source: 'api',
        payload: await response.json(),
      };
    }

    console.warn(`[seo:sitemap] ${type}: HTTP ${response.status}, using local manifest`);
  } catch (error) {
    console.warn(`[seo:sitemap] ${type}: API fetch failed (${error.message}), using local manifest`);
  }

  const localPath = LOCAL_MANIFESTS[type];
  if (!localPath || !fs.existsSync(localPath)) {
    return null;
  }

  try {
    return {
      source: 'local',
      payload: JSON.parse(fs.readFileSync(localPath, 'utf8')),
    };
  } catch (error) {
    console.warn(`[seo:sitemap] ${type}: failed reading local manifest (${error.message})`);
    return null;
  }
}

function loadBlogManifest() {
  if (!fs.existsSync(BLOG_MANIFEST_PATH)) {
    console.warn(`[seo:sitemap] blog: missing manifest at ${BLOG_MANIFEST_PATH}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(BLOG_MANIFEST_PATH, 'utf8'));
  } catch (error) {
    console.warn(`[seo:sitemap] blog: failed reading manifest (${error.message})`);
    return null;
  }
}

function generateSitemapXml(urls) {
  const urlEntries = urls
    .map((entry) => {
      let xml = '  <url>\n';
      xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
      if (entry.lastmod) xml += `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n`;
      if (entry.changefreq) xml += `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>\n`;
      if (typeof entry.priority === 'number') xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;

      if (entry.images && entry.images.length) {
        entry.images.forEach((image) => {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${escapeXml(image.loc)}</image:loc>\n`;
          if (image.title) xml += `      <image:title>${escapeXml(image.title)}</image:title>\n`;
          if (image.caption) xml += `      <image:caption>${escapeXml(image.caption)}</image:caption>\n`;
          xml += '    </image:image>\n';
        });
      }

      xml += '  </url>\n';
      return xml;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}</urlset>`;
}

async function generateSitemap(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const types = (opts.type ? [opts.type] : SUPPORTED_TYPES).filter((type) => SUPPORTED_TYPES.includes(type));

  if (!types.length) {
    console.error('[seo:sitemap] No valid content types requested');
    return null;
  }

  console.log('[seo:sitemap] Generating sitemap...');

  const urls = [];
  let totalImages = 0;
  const today = new Date().toISOString().split('T')[0];

  const addStatic = (loc, priority, changefreq = 'monthly') => {
    urls.push({
      loc,
      priority,
      changefreq,
      lastmod: today,
    });
  };

  addStatic(SITE_URL, 1.0, 'daily');
  addStatic(`${SITE_URL}/about`, 0.8);
  addStatic(`${SITE_URL}/contact`, 0.7);

  for (const type of types) {
    if (type === BLOG_TYPE) {
      const manifest = loadBlogManifest();
      if (!manifest) {
        console.warn('[seo:sitemap] Skipping blog: no manifest data');
        continue;
      }

      const posts = Array.isArray(manifest.posts) ? manifest.posts.filter((post) => post?.slug) : [];
      const generated = (manifest.generated || new Date().toISOString()).slice(0, 10);

      urls.push({
        loc: `${SITE_URL}/blog`,
        lastmod: generated,
        changefreq: 'weekly',
        priority: 0.9,
      });

      posts.forEach((post) => {
        const images = normalizeBlogImages(post);
        totalImages += images.length;

        urls.push({
          loc: `${SITE_URL}/blog/${post.slug}`,
          lastmod: String(post.date || generated).slice(0, 10),
          changefreq: 'monthly',
          priority: 0.7,
          images,
        });
      });

      console.log(`[seo:sitemap] blog: ${posts.length} posts from local manifest`);
      continue;
    }

    const manifest = await loadPortfolioManifest(type);
    if (!manifest) {
      console.warn(`[seo:sitemap] Skipping ${type}: no data`);
      continue;
    }

    const data = manifest.payload.data || manifest.payload;
    const items = selectItemsForType(type, data);
    const generated = data.generated || new Date().toISOString();

    urls.push({
      loc: `${SITE_URL}/${type}`,
      lastmod: String(generated).slice(0, 10),
      changefreq: 'weekly',
      priority: 0.9,
    });

    let itemCount = 0;

    items.forEach((item) => {
      const name = item.bandName || item.eventName || item.collectionName || item.title || item.name;
      if (!name) return;

      const images = normalizePortfolioImages(type, item, opts.imagesPerItem);
      totalImages += images.length;

      urls.push({
        loc: `${SITE_URL}/${type}/${slugify(name)}`,
        lastmod: String(itemDate(item, generated)).slice(0, 10),
        changefreq: 'monthly',
        priority: 0.7,
        images,
      });
      itemCount += 1;
    });

    console.log(`[seo:sitemap] ${type}: ${itemCount} items, up to ${opts.imagesPerItem} images per item from ${manifest.source}`);
  }

  const xml = generateSitemapXml(urls);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

  console.log(`[seo:sitemap] Wrote ${OUTPUT_PATH}`);
  console.log(`[seo:sitemap] URLs: ${urls.length}`);
  console.log(`[seo:sitemap] Images: ${totalImages}`);

  if (opts.preview) {
    console.log('[seo:sitemap] Preview:');
    urls.slice(0, 10).forEach((entry) => console.log(entry.loc));
  }

  return { urls, totalImages };
}

if (require.main === module) {
  const cliOptions = parseArgs(process.argv.slice(2));
  generateSitemap(cliOptions).catch((error) => {
    console.error(`[seo:sitemap] Failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { generateSitemap };
