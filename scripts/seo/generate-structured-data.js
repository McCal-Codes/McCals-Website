#!/usr/bin/env node

/**
 * Generate Structured Data (JSON-LD) for portfolio pages.
 *
 * - Pulls manifests from the API when available; falls back to local manifest files.
 * - Emits richer @graph nodes (page, gallery, breadcrumbs, widget descriptor, image objects).
 * - Adds width/height and key EXIF hints when available for sampled images.
 * - Provides a quick preview mode for copy/paste into a page or validator.
 *
 * Usage:
 *   node scripts/seo/generate-structured-data.js           # build all portfolios to dist/structured-data
 *   node scripts/seo/generate-structured-data.js --type concert --preview
 *   node scripts/seo/generate-structured-data.js --items=4 --images=2
 */

const fs = require('fs');
const path = require('path');
const exifParser = require('exif-parser');

const ROOT = path.resolve(__dirname, '../..');
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const SITE_URL = process.env.SITE_URL || 'https://mccalmedia.com';
const OUTPUT_DIR = path.join(ROOT, 'dist/structured-data');

const PORTFOLIOS = ['concert', 'events', 'journalism', 'portrait'];
const DEFAULT_OPTIONS = {
  itemsLimit: 6,
  imagesPerItem: 2,
  preview: false
};

const PORTFOLIO_BASE = path.join(ROOT, 'src/images/Portfolios');
const PORTFOLIO_ROOTS = {
  concert: path.join(PORTFOLIO_BASE, 'Concert'),
  events: path.join(PORTFOLIO_BASE, 'Events'),
  journalism: path.join(PORTFOLIO_BASE, 'Journalism'),
  portrait: path.join(PORTFOLIO_BASE, 'Portrait')
};

const LOCAL_MANIFESTS = {
  concert: path.join(PORTFOLIO_ROOTS.concert, 'concert-manifest.json'),
  events: path.join(PORTFOLIO_ROOTS.events, 'events-manifest.json'),
  journalism: path.join(PORTFOLIO_ROOTS.journalism, 'journalism-manifest.json'),
  portrait: path.join(PORTFOLIO_ROOTS.portrait, 'portrait-manifest.json')
};

const PORTFOLIO_WIDGETS = {
  concert: 'concert-portfolio',
  events: 'event-portfolio',
  journalism: 'photojournalism-portfolio',
  portrait: 'portrait-portfolio'
};

function parseArgs(argv) {
  const opts = { ...DEFAULT_OPTIONS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--type' && argv[i + 1]) {
      opts.type = argv[++i].toLowerCase();
    } else if (arg.startsWith('--type=')) {
      opts.type = arg.split('=')[1].toLowerCase();
    } else if (arg === '--preview') {
      opts.preview = true;
    } else if (arg.startsWith('--items=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val)) opts.itemsLimit = val;
    } else if (arg.startsWith('--images=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(val)) opts.imagesPerItem = val;
    }
  }
  return opts;
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
  return { localPath, url, filename };
}

function getImageMeta(localPath) {
  if (!localPath || !fs.existsSync(localPath)) return {};
  try {
    const buffer = fs.readFileSync(localPath);
    const result = exifParser.create(buffer).parse();
    const size = result.imageSize || {};
    const tags = result.tags || {};
    return {
      width: size.width,
      height: size.height,
      iso: tags.ISO,
      model: tags.Model,
      lens: tags.LensModel,
      exposure: tags.ExposureTime,
      aperture: tags.FNumber,
      taken: tags.DateTimeOriginal || tags.CreateDate
    };
  } catch (err) {
    console.warn(`⚠️  EXIF parse failed for ${localPath}: ${err.message}`);
    return {};
  }
}

function normalizeImages(type, item) {
  const imgs = Array.isArray(item.images) ? item.images : [];
  return imgs.map(img => {
    const candidate = resolveImageCandidate(type, item, img);
    const description = (typeof img === 'object' && (img.description || img.caption)) || item.description || item.venue || '';
    const tags = (typeof img === 'object' && img.tags) || item.tags || [];
    return { ...candidate, description, tags };
  }).filter(entry => entry.url || entry.localPath);
}

function selectItemsForType(type, data) {
  if (!data) return [];
  if (type === 'concert') return data.bands || data.items || [];
  if (type === 'events') return data.events || data.collections || data.items || [];
  if (type === 'journalism') return data.events || data.journalism || data.items || [];
  if (type === 'portrait') return data.collections || data.portraits || data.items || [];
  return data.items || [];
}

function describeItem(type, item) {
  const name = item.bandName || item.eventName || item.collectionName || item.title || item.name || 'Portfolio item';
  const date = item.concertDate?.iso || item.dateISO || item.eventDate?.iso || item.eventDate || item.date || item.dateDisplay;
  const description = item.venue || item.description || item.caption || `${capitalize(type)} photography`;
  return { name, date, description };
}

function buildImageNodes(type, items, generatedDate, options, personId) {
  const images = [];
  const perItem = Math.max(1, options.imagesPerItem || DEFAULT_OPTIONS.imagesPerItem);
  const maxItems = Math.max(1, options.itemsLimit || DEFAULT_OPTIONS.itemsLimit);

  items.slice(0, maxItems).forEach((item, itemIdx) => {
    const normalizedImages = normalizeImages(type, item).slice(0, perItem);
    const itemMeta = describeItem(type, item);
    normalizedImages.forEach((img, imgIdx) => {
      const meta = getImageMeta(img.localPath);
      const id = `${SITE_URL}/${type}#image-${itemIdx + 1}-${imgIdx + 1}`;
      const additionalProperty = [];
      if (meta.iso) additionalProperty.push({ '@type': 'PropertyValue', name: 'ISO', value: meta.iso });
      if (meta.model) additionalProperty.push({ '@type': 'PropertyValue', name: 'Camera', value: meta.model });
      if (meta.lens) additionalProperty.push({ '@type': 'PropertyValue', name: 'Lens', value: meta.lens });
      if (meta.exposure) additionalProperty.push({ '@type': 'PropertyValue', name: 'Exposure', value: meta.exposure });
      if (meta.aperture) additionalProperty.push({ '@type': 'PropertyValue', name: 'Aperture', value: meta.aperture });

      images.push({
        id,
        url: img.url,
        node: {
          '@type': 'ImageObject',
          '@id': id,
          contentUrl: img.url,
          url: img.url,
          name: itemMeta.date ? `${itemMeta.name} — ${itemMeta.date}` : itemMeta.name,
          description: img.description || itemMeta.description,
          creator: { '@id': personId },
          datePublished: itemMeta.date || generatedDate,
          inLanguage: 'en',
          ...(meta.width && meta.height ? { width: meta.width, height: meta.height } : {}),
          ...(meta.taken ? { dateCreated: meta.taken } : {}),
          ...(additionalProperty.length ? { additionalProperty } : {})
        }
      });
    });
  });

  return images;
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

async function loadPortfolio(type) {
  const apiUrl = `${API_BASE}/api/v1/manifests/${type}`;
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const json = await response.json();
      return { source: 'api', payload: json };
    }
    console.warn(`⚠️  API responded with ${response.status} for ${type}, falling back to local manifest`);
  } catch (err) {
    console.warn(`⚠️  API fetch failed for ${type}: ${err.message}`);
  }

  const localPath = LOCAL_MANIFESTS[type];
  if (localPath && fs.existsSync(localPath)) {
    try {
      const content = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      return { source: 'local', payload: content };
    } catch (err) {
      console.warn(`⚠️  Failed to read local manifest for ${type}: ${err.message}`);
    }
  }
  return null;
}

function normalizePortfolioData(type, payload) {
  if (!payload) return null;
  const data = payload.data || payload;
  if (!data) return null;

  const items = selectItemsForType(type, data);
  const totalImages = data.totalImages || items.reduce((sum, item) => {
    if (typeof item.totalImages === 'number') return sum + item.totalImages;
    if (Array.isArray(item.images)) return sum + item.images.length;
    return sum;
  }, 0);

  const generated = data.generated || payload.generated || new Date().toISOString();
  return { items, totalImages, generated };
}

function getLatestWidgetVersion(widgetSlug) {
  if (!widgetSlug) return null;
  const versionDir = path.join(ROOT, 'src/widgets', widgetSlug, 'versions');
  if (!fs.existsSync(versionDir)) return null;
  const versions = fs.readdirSync(versionDir).filter(f => f.endsWith('.html'));
  if (!versions.length) return null;
  const sortKey = file => {
    const match = file.match(/v(\d+(?:\.\d+)*)(?=[^\d]|$)/i);
    if (!match) return [0];
    return match[1].split('.').map(n => parseInt(n, 10));
  };
  versions.sort((a, b) => {
    const av = sortKey(a);
    const bv = sortKey(b);
    const len = Math.max(av.length, bv.length);
    for (let i = 0; i < len; i++) {
      const diff = (bv[i] || 0) - (av[i] || 0);
      if (diff !== 0) return diff;
    }
    return b.localeCompare(a);
  });
  const latest = versions[0];
  const versionMatch = latest.match(/v(\d+(?:\.\d+)*[^\s]*)/i);
  const rawVersion = versionMatch ? versionMatch[1] : latest.replace(/\.html$/, '');
  return rawVersion.replace(/\.html$/, '');
}

function buildWidgetNode(type, personId) {
  const slug = PORTFOLIO_WIDGETS[type];
  if (!slug) return null;
  const version = getLatestWidgetVersion(slug);
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#${slug}`,
    name: `${capitalize(type)} portfolio widget`,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    creator: { '@id': personId },
    url: `${SITE_URL}/${type}`,
    ...(version ? { softwareVersion: version } : {})
  };
}

async function generateSchema(type, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const portfolio = await loadPortfolio(type);
  if (!portfolio) {
    console.error(`✗ No data found for ${type}`);
    return null;
  }

  const normalized = normalizePortfolioData(type, portfolio.payload);
  if (!normalized) {
    console.error(`✗ Unable to normalize data for ${type}`);
    return null;
  }

  const { items, totalImages, generated } = normalized;
  const entityLabel = type === 'concert' ? 'bands' : type === 'events' ? 'events' : type === 'journalism' ? 'stories' : 'collections';
  const pageUrl = `${SITE_URL}/${type}`;
  const pageId = `${pageUrl}#page`;
  const galleryId = `${pageUrl}#gallery`;
  const breadcrumbId = `${pageUrl}#breadcrumbs`;
  const itemListId = `${pageUrl}#items`;
  const websiteId = `${SITE_URL}#website`;
  const personId = `${SITE_URL}#caleb-mccartney`;

  const imageNodes = buildImageNodes(type, items, generated, opts, personId);
  const imageUrls = imageNodes.map(n => n.url).filter(Boolean);
  const widgetNode = buildWidgetNode(type, personId);

  const pageDescription = `Professional ${type} photography featuring ${items.length} ${entityLabel} and ${totalImages} images.`;

  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: SITE_URL,
      name: 'McCal Media'
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Caleb McCartney',
      jobTitle: 'Photographer & Photojournalist',
      url: SITE_URL
    },
    {
      '@type': 'CollectionPage',
      '@id': pageId,
      name: `${capitalize(type)} Photography Portfolio`,
      url: pageUrl,
      description: pageDescription,
      isPartOf: { '@id': websiteId },
      breadcrumb: { '@id': breadcrumbId },
      mainEntity: { '@id': galleryId },
      inLanguage: 'en',
      datePublished: generated
    },
    {
      '@type': 'ImageGallery',
      '@id': galleryId,
      name: `${capitalize(type)} Photography`,
      description: pageDescription,
      url: pageUrl,
      image: imageUrls.slice(0, 24),
      associatedMedia: imageNodes.map(n => ({ '@id': n.id })),
      creator: { '@id': personId },
      numberOfItems: totalImages,
      genre: `${capitalize(type)} Photography`,
      inLanguage: 'en'
    },
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: capitalize(type), item: pageUrl }
      ]
    },
    {
      '@type': 'ItemList',
      '@id': itemListId,
      numberOfItems: imageNodes.length,
      itemListElement: imageNodes.map((node, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: { '@id': node.id }
      }))
    },
    ...imageNodes.map(n => n.node)
  ];

  if (widgetNode) graph.splice(2, 0, widgetNode);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': graph
  };

  console.log(`  ✓ Generated schema for ${type} (${portfolio.source}, ${items.length} ${entityLabel}, ${imageNodes.length} image objects)`);
  return schema;
}

async function generateAllSchemas(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const types = (opts.type ? [opts.type] : PORTFOLIOS).filter(t => PORTFOLIOS.includes(t));

  if (!types.length) {
    console.error('✗ No valid portfolio types requested.');
    return null;
  }

  console.log('📊 Generating structured data from manifests...\n');
  const schemas = {};

  for (const type of types) {
    const schema = await generateSchema(type, opts);
    if (schema) schemas[type] = schema;
  }

  if (!Object.keys(schemas).length) {
    console.error('✗ No schemas generated.');
    return null;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const [type, schema] of Object.entries(schemas)) {
    const outputPath = path.join(OUTPUT_DIR, `${type}-schema.json`);
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    console.log(`✓ Wrote ${type} schema: ${outputPath}`);
  }

  const combinedPath = path.join(OUTPUT_DIR, 'all-schemas.json');
  fs.writeFileSync(combinedPath, JSON.stringify(schemas, null, 2));
  console.log(`\n✅ Structured data generated!`);
  console.log(`   📁 Directory: ${OUTPUT_DIR}`);
  console.log(`   📄 Files: ${Object.keys(schemas).length + 1}`);

  if (opts.preview) {
    const previewType = opts.type && schemas[opts.type] ? opts.type : types[0];
    const previewSchema = schemas[previewType];
    if (previewSchema) {
      console.log('\n🔍 Preview JSON-LD:');
      console.log('<script type="application/ld+json">');
      console.log(JSON.stringify(previewSchema, null, 2));
      console.log('</script>');
    }
  }

  console.log(`\n💡 Test your schemas: https://search.google.com/test/rich-results\n`);
  return schemas;
}

if (require.main === module) {
  const cliOptions = parseArgs(process.argv.slice(2));
  generateAllSchemas(cliOptions).catch(err => {
    console.error('❌ Schema generation failed:', err.message);
    process.exit(1);
  });
}

module.exports = { generateAllSchemas, generateSchema };
