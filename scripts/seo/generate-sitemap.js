#!/usr/bin/env node

/**
 * Generate XML Sitemap from portfolio manifests.
 *
 * - Prefers API data; falls back to local manifest files.
 * - Encodes image URLs correctly (handles spaces/apostrophes).
 * - Includes per-item image entries with captions/titles.
 * - CLI filters: --type <portfolio>, --images=<n>, --preview.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const SITE_URL = process.env.SITE_URL || 'https://mcc-cal.com';
const OUTPUT_PATH = path.join(ROOT, 'dist', 'sitemap.xml');

const PORTFOLIOS = ['concert', 'events', 'journalism', 'portrait', 'nature'];
const PORTFOLIO_BASE = path.join(ROOT, 'src/images/Portfolios');
const PORTFOLIO_ROOTS = {
  concert: path.join(PORTFOLIO_BASE, 'Concert'),
  events: path.join(PORTFOLIO_BASE, 'Events'),
  journalism: path.join(PORTFOLIO_BASE, 'Journalism'),
  portrait: path.join(PORTFOLIO_BASE, 'Portrait'),
  nature: path.join(PORTFOLIO_BASE, 'Nature')
};
const LOCAL_MANIFESTS = {
  concert: path.join(PORTFOLIO_ROOTS.concert, 'concert-manifest.json'),
  events: path.join(PORTFOLIO_ROOTS.events, 'events-manifest.json'),
  journalism: path.join(PORTFOLIO_ROOTS.journalism, 'journalism-manifest.json'),
  portrait: path.join(PORTFOLIO_ROOTS.portrait, 'portrait-manifest.json'),
  nature: path.join(PORTFOLIO_ROOTS.nature, 'nature-manifest.json')
};

const DEFAULT_OPTIONS = {
  imagesPerItem: 5,
  preview: false
};

function parseArgs(argv) {
  const opts = { ...DEFAULT_OPTIONS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--type' && argv[i + 1]) {
      opts.type = argv[++i].toLowerCase();
    } else if (arg.startsWith('--type=')) {
      opts.type = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--images=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val)) opts.imagesPerItem = val;
    } else if (arg === '--preview') {
      opts.preview = true;
    }
  }
  return opts;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function encodeSegments(relPath) {
  return relPath.split('/').map(encodeURIComponent).join('/');
}

function toWebUrl(localPath) {
  if (!localPath) return null;
  const rel = path.relative(PORTFOLIO_BASE, localPath).split(path.sep).join('/');
  if (rel.startsWith('..')) return null;
  return `${SITE_URL}/images/Portfolios/${encodeSegments(rel)}`;
}

function resolveImageCandidate(type, item, img) {
  const base = PORTFOLIO_ROOTS[type];
  const filename = typeof img === 'string'
    ? img
    : img?.filename || img?.name || path.basename(img?.path || img?.relativePath || '');

  let localPath = null;
  if (img && img.path) {
    localPath = path.isAbsolute(img.path) ? img.path : path.join(ROOT, img.path);
  } else if (item.folderPath) {
    localPath = base ? path.join(base, item.folderPath, filename) : null;
  } else if (item.path) {
    localPath = base ? path.join(base, item.path, filename) : null;
  } else if (base && filename) {
    localPath = path.join(base, filename);
  }

  const url = toWebUrl(localPath);
  return { url, filename };
}

function normalizeImages(type, item, imagesPerItem) {
  const imgs = Array.isArray(item.images) ? item.images : [];
  return imgs.slice(0, imagesPerItem).map(img => {
    const resolved = resolveImageCandidate(type, item, img);
    const title = `${(item.bandName || item.eventName || item.collectionName || item.title || item.name || 'Portfolio').trim()}${item.dateDisplay ? ' - ' + item.dateDisplay : ''}`;
    const caption = (typeof img === 'object' && (img.caption || img.description)) || item.venue || item.description || '';
    return {
      loc: resolved.url,
      title,
      caption
    };
  }).filter(img => !!img.loc);
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

async function loadManifest(type) {
  const apiUrl = `${API_BASE}/api/v1/manifests/${type}`;
  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const json = await res.json();
      return { source: 'api', payload: json };
    }
    console.warn(`⚠️  ${type}: HTTP ${res.status}, using local manifest - generate-sitemap.js:140`);
  } catch (err) {
    console.warn(`⚠️  ${type}: API fetch failed (${err.message}), using local manifest - generate-sitemap.js:142`);
  }

  const localPath = LOCAL_MANIFESTS[type];
  if (localPath && fs.existsSync(localPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      return { source: 'local', payload };
    } catch (err) {
      console.warn(`⚠️  ${type}: failed reading local manifest (${err.message}) - generate-sitemap.js:151`);
    }
  }
  return null;
}

function generateSitemapXML(urls) {
  const urlEntries = urls.map(entry => {
    let xml = `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    if (entry.changefreq) xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    if (typeof entry.priority === 'number') xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;

    if (entry.images && entry.images.length) {
      entry.images.forEach(img => {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${img.loc}</image:loc>\n`;
        if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        if (img.caption) xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        xml += `    </image:image>\n`;
      });
    }

    xml += `  </url>\n`;
    return xml;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}</urlset>`;
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

async function generateSitemap(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const types = (opts.type ? [opts.type] : PORTFOLIOS).filter(t => PORTFOLIOS.includes(t));
  if (!types.length) {
    console.error('✗ No valid portfolio types requested. - generate-sitemap.js:199');
    return null;
  }

  console.log('🗺️  Generating sitemap from manifests...\n - generate-sitemap.js:203');

  const urls = [];
  let totalImages = 0;

  const today = new Date().toISOString().split('T')[0];
  const addStatic = (loc, priority, changefreq = 'monthly') => urls.push({ loc, priority, changefreq, lastmod: today });
  addStatic(SITE_URL, 1.0, 'daily');
  addStatic(`${SITE_URL}/about`, 0.8);
  addStatic(`${SITE_URL}/contact`, 0.7);

  for (const type of types) {
    const manifest = await loadManifest(type);
    if (!manifest) {
      console.warn(`⚠️  Skipping ${type}: no data - generate-sitemap.js:217`);
      continue;
    }
    const data = manifest.payload.data || manifest.payload;
    const items = selectItemsForType(type, data);
    const generated = data.generated || new Date().toISOString();

    urls.push({
      loc: `${SITE_URL}/${type}`,
      lastmod: generated.split('T')[0],
      changefreq: 'weekly',
      priority: 0.9
    });

    let itemCount = 0;
    items.forEach(item => {
      const name = item.bandName || item.eventName || item.collectionName || item.title || item.name;
      if (!name) return;

      const images = normalizeImages(type, item, opts.imagesPerItem);
      totalImages += images.length;

      const slug = slugify(name);
      urls.push({
        loc: `${SITE_URL}/${type}/${slug}`,
        lastmod: (itemDate(item, generated) || generated).toString().slice(0, 10),
        changefreq: 'monthly',
        priority: 0.7,
        images
      });
      itemCount++;
    });

    console.log(`✓ ${type}: ${itemCount} items, up to ${opts.imagesPerItem} images per item from ${manifest.source} - generate-sitemap.js:250`);
  }

  const xml = generateSitemapXML(urls);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

  console.log('\n✅ Sitemap generated successfully! - generate-sitemap.js:257');
  console.log(`📄 File: ${OUTPUT_PATH} - generate-sitemap.js:258`);
  console.log(`🔗 URLs: ${urls.length} - generate-sitemap.js:259`);
  console.log(`📸 Images: ${totalImages} - generate-sitemap.js:260`);
  console.log(`\n💡 Submit to search engines: - generate-sitemap.js:261`);
  console.log(`Google: https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')} - generate-sitemap.js:262`);
  console.log(`Bing: Use Webmaster Tools to submit - generate-sitemap.js:263`);

  if (opts.preview) {
    console.log('\n🔍 Preview (first 10 URLs): - generate-sitemap.js:266');
    urls.slice(0, 10).forEach(u => console.log(`${u.loc} - generate-sitemap.js:267`));
  }

  return { urls, totalImages };
}

if (require.main === module) {
  const cliOptions = parseArgs(process.argv.slice(2));
  generateSitemap(cliOptions).catch(err => {
    console.error('❌ Sitemap generation failed: - generate-sitemap.js:276', err.message);
    process.exit(1);
  });
}

module.exports = { generateSitemap };
