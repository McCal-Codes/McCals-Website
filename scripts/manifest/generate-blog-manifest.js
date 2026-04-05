// Blog Manifest Generator
//
// Reads compiled src/content/blog/posts/*/post.json files and writes
// src/content/blog/blog-manifest.json - the index used by the Vite site.
// Reads src/content/blog/authors.json to resolve author metadata.
// Preferred authored source is post.md, compiled by scripts/blog/compile-post-sources.js.
//
// post.json shape:
// {
//   "slug": "my-story",
//   "title": "My Story Title",
//   "authorId": "mccal",
//   "date": "2025-03-30",
//   "category": "Feature",
//   "excerpt": "One-sentence hook.",
//   "leadImage": "images/lead.jpg",
//   "leadImageAlt": "AP description",
//   "leadImageCaption": "AP caption.",
//   "published": true,
//   "body": [
//     { "type": "text", "content": "Paragraph..." },
//     { "type": "image", "src": "images/photo.jpg", "alt": "...", "caption": "AP caption." },
//     { "type": "quote", "content": "Pull quote." }
//   ]
// }
//
// Usage:
//   node scripts/manifest/generate-blog-manifest.js [--force] [--include-drafts] [--skip-notify]
//   npm run manifest:blog

const fs = require('fs').promises;
const path = require('path');
const { notify } = require('../utils/manifest-webhook');

const POSTS_DIR = path.resolve(__dirname, '../../src/content/blog/posts');
const MANIFEST_OUT = path.resolve(__dirname, '../../src/content/blog/blog-manifest.json');
const AUTHORS_PATH = path.resolve(__dirname, '../../src/content/blog/authors.json');
const DEFAULT_AUTHOR_ID = 'mccal';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const INCLUDE_DRAFTS = args.includes('--include-drafts');
const SKIP_NOTIFY = args.includes('--skip-notify');

function log(message) {
  console.log(`[blog:manifest] ${message}`);
}

function ok(message) {
  console.log(`[blog:manifest] ${message}`);
}

function warn(message) {
  console.warn(`[blog:manifest] ${message}`);
}

function fail(message) {
  console.error(`[blog:manifest] ${message}`);
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadAuthors() {
  if (!(await exists(AUTHORS_PATH))) {
    warn(`No authors.json found at ${AUTHORS_PATH}`);
    return new Map();
  }

  try {
    const authorsFile = JSON.parse(await fs.readFile(AUTHORS_PATH, 'utf8'));
    const authors = Array.isArray(authorsFile?.authors) ? authorsFile.authors : [];
    return new Map(authors.map((author) => [author.id, author]));
  } catch (error) {
    fail(`Invalid authors.json: ${error.message}`);
    return new Map();
  }
}

function estimateReadingTime(body) {
  const words = body
    .filter((block) => block.type === 'text' || block.type === 'quote')
    .map((block) => (block.content || '').trim().split(/\s+/).filter(Boolean).length)
    .reduce((total, count) => total + count, 0);

  return Math.max(1, Math.round(words / 200));
}

function resolveManifestImage(slug, sourcePath) {
  if (!sourcePath) return null;
  if (String(sourcePath).startsWith('http')) return sourcePath;
  return `posts/${slug}/${String(sourcePath).replace(/^\.?\//, '')}`;
}

async function processPost(postDir, authors) {
  const postJsonPath = path.join(postDir, 'post.json');

  if (!(await exists(postJsonPath))) {
    warn(`No post.json in ${path.basename(postDir)}, skipping`);
    return null;
  }

  let post;

  try {
    post = JSON.parse(await fs.readFile(postJsonPath, 'utf8'));
  } catch (error) {
    fail(`Invalid post.json in ${path.basename(postDir)}: ${error.message}`);
    return null;
  }

  if (!post.published && !INCLUDE_DRAFTS) {
    log(`Skipping draft: ${post.slug || path.basename(postDir)}`);
    return null;
  }

  if (!post.slug) {
    warn(`Missing slug in ${path.basename(postDir)}, using folder name`);
    post.slug = path.basename(postDir);
  }

  let authorId = post.authorId || DEFAULT_AUTHOR_ID;
  let author = authors.get(authorId);

  if (!post.authorId) {
    log(`No authorId set for ${post.slug}, defaulting to ${DEFAULT_AUTHOR_ID}`);
  } else if (!author) {
    warn(`Unknown authorId "${post.authorId}" in ${post.slug}`);
    authorId = DEFAULT_AUTHOR_ID;
    author = authors.get(authorId);
  }

  const { body, ...meta } = post;

  return {
    ...meta,
    authorId,
    authorName: author?.name || null,
    leadImage: resolveManifestImage(post.slug, post.leadImage),
    leadImageFallback: resolveManifestImage(post.slug, post.leadImageFallback),
    readingTime: estimateReadingTime(body || []),
  };
}

async function generate() {
  log('Generating blog manifest...');

  if (!(await exists(POSTS_DIR))) {
    fail(`Posts directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  const entries = await fs.readdir(POSTS_DIR);
  const posts = [];
  const authors = await loadAuthors();

  for (const entry of entries) {
    const entryPath = path.join(POSTS_DIR, entry);
    const stat = await fs.stat(entryPath);

    if (!stat.isDirectory() || entry.startsWith('.')) {
      continue;
    }

    const post = await processPost(entryPath, authors);
    if (post) {
      posts.push(post);
    }
  }

  posts.sort((left, right) => new Date(right.date) - new Date(left.date));

  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    total: posts.length,
    posts,
  };

  await fs.writeFile(MANIFEST_OUT, JSON.stringify(manifest, null, 2), 'utf8');

  if (!SKIP_NOTIFY) {
    try {
      await notify('blog', { path: MANIFEST_OUT, written: true });
    } catch (error) {
      warn(`Failed to notify webhook: ${error?.message}`);
    }
  }

  ok(`Blog manifest written: ${posts.length} post${posts.length === 1 ? '' : 's'}`);
  posts.forEach((post) => log(`- [${post.category || 'Uncategorized'}] ${post.title} (${post.date})`));
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Blog Manifest Generator

Usage:
  node scripts/manifest/generate-blog-manifest.js [options]
  npm run manifest:blog

Options:
  --force           Overwrite existing manifest (always overwrites by default)
  --include-drafts  Include posts where "published": false
  --skip-notify     Skip webhook notification
  --help            Show this help

Post folder structure:
  src/content/blog/posts/
  my-story/
    post.md
    post.json
    images/
      lead.jpg
      photo.jpg
`);
  process.exit(0);
}

if (FORCE) {
  log('Force mode requested');
}

generate().catch((error) => {
  fail(error.message);
  process.exit(1);
});
