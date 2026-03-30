/**
 * Google Docs Blog Ingestion Script
 *
 * Fetches posts from author Google Docs and writes preferred
 * src/content/blog/posts/<slug>/post.md files, then regenerates
 * compiled post.json documents plus src/content/blog/blog-manifest.json.
 *
 * Usage: node scripts/blog/fetch-from-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { serializeMarkdownPost } = require('./post-source-utils');

const AUTHORS_PATH = path.join(__dirname, '../../src/content/blog/authors.json');
const POSTS_ROOT = path.join(__dirname, '../../src/content/blog/posts');
const COMPILE_SCRIPT = path.join(__dirname, './compile-post-sources.js');
const VALIDATE_SCRIPT = path.join(__dirname, './validate-blog-content.js');
const MANIFEST_SCRIPT = path.join(__dirname, '../manifest/generate-blog-manifest.js');
const FEED_SCRIPT = path.join(__dirname, './generate-blog-feed.js');

async function fetchGoogleDoc(publishedUrl) {
  const response = await fetch(publishedUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - Make sure document is published to web`);
  }
  return response.text();
}

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-');
}

function stripHtml(html) {
  return decodeHtml(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseDate(value) {
  if (!value) return null;

  const normalized = value.trim();
  const shortDate = normalized.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  if (shortDate) {
    const month = String(shortDate[1]).padStart(2, '0');
    const day = String(shortDate[2]).padStart(2, '0');
    const year = shortDate[3].length === 2 ? `20${shortDate[3]}` : shortDate[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

function finalizePost(post) {
  if (!post.excerpt) {
    const preview = post.body
      .filter((block) => block.type === 'text')
      .map((block) => block.content)
      .join(' ')
      .trim();

    if (preview) {
      post.excerpt = preview.slice(0, 160) + (preview.length > 160 ? '...' : '');
    }
  }

  return post;
}

function parseGoogleDocSimple(html, authorId) {
  const posts = [];
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return posts;

  const paragraphs = bodyMatch[1].match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];

  let currentPost = null;
  let inSources = false;

  for (const paragraph of paragraphs) {
    const text = stripHtml(paragraph);
    if (!text) continue;

    if (/^POST:\s*/i.test(text)) {
      if (currentPost) posts.push(finalizePost(currentPost));

      const title = text.replace(/^POST:\s*/i, '').trim();
      currentPost = {
        slug: slugify(title),
        title,
        authorId,
        date: null,
        category: undefined,
        excerpt: '',
        leadImage: undefined,
        published: true,
        tags: [],
        body: [],
      };
      inSources = false;
      continue;
    }

    if (!currentPost) continue;

    const dateMatch = text.match(/^date:\s*(.+)/i);
    if (dateMatch) {
      currentPost.date = parseDate(dateMatch[1]);
      continue;
    }

    const categoryMatch = text.match(/^category:\s*(.+)/i);
    if (categoryMatch) {
      currentPost.category = categoryMatch[1].trim();
      continue;
    }

    const tagsMatch = text.match(/^tags:\s*(.+)/i);
    if (tagsMatch) {
      currentPost.tags = tagsMatch[1]
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      continue;
    }

    const excerptMatch = text.match(/^excerpt:\s*(.+)/i);
    if (excerptMatch) {
      currentPost.excerpt = excerptMatch[1].replace(/^["']|["']$/g, '');
      continue;
    }

    const imageMatch = text.match(/^image:\s*(.+)/i);
    if (imageMatch) {
      currentPost.leadImage = imageMatch[1].trim();
      continue;
    }

    const publishedMatch = text.match(/^published:\s*(.+)/i);
    if (publishedMatch) {
      currentPost.published = !/^(false|no|draft)$/i.test(publishedMatch[1].trim());
      continue;
    }

    if (/^sources?\s*$/i.test(text)) {
      inSources = true;
      if (!currentPost.sources) currentPost.sources = [];
      continue;
    }

    if (inSources) {
      currentPost.sources.push({
        title: text,
        url: '#',
        notes: text,
      });
      continue;
    }

    if (text.toLowerCase() === currentPost.title.toLowerCase()) continue;
    if (/^By\s+/i.test(text)) continue;
    if (/^(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})$/.test(text)) continue;
    if (/^(author|avatar|bio|post|date|category|tags|excerpt|image|published):/i.test(text)) continue;

    currentPost.body.push({
      type: 'text',
      content: text,
    });
  }

  if (currentPost) posts.push(finalizePost(currentPost));
  return posts;
}

function writePosts(posts) {
  fs.mkdirSync(POSTS_ROOT, { recursive: true });

  posts.forEach((post) => {
    const postDir = path.join(POSTS_ROOT, post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'post.md'), serializeMarkdownPost(post));
  });
}

async function main() {
  console.log('Fetching blog posts from Google Docs...\n');

  const authorsData = JSON.parse(fs.readFileSync(AUTHORS_PATH, 'utf-8'));
  const authors = authorsData.authors || [];
  let totalPosts = 0;

  for (const author of authors) {
    if (!author.sourceDoc?.publishedUrl) {
      console.log(`Skipping ${author.name} (no sourceDoc)`);
      continue;
    }

    console.log(`Fetching posts for ${author.name}...`);

    try {
      const html = await fetchGoogleDoc(author.sourceDoc.publishedUrl);
      const posts = parseGoogleDocSimple(html, author.id);
      writePosts(posts);

      console.log(`  Wrote ${posts.length} post(s)`);
      posts.forEach((post) => {
        console.log(`   - ${post.slug} (${post.date || 'no date'})`);
      });

      totalPosts += posts.length;
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\nCompiling Markdown posts...');
  execFileSync(process.execPath, [COMPILE_SCRIPT], { stdio: 'inherit' });

  console.log('\nValidating blog content...');
  execFileSync(process.execPath, [VALIDATE_SCRIPT], { stdio: 'inherit' });

  console.log('\nRegenerating blog manifest...');
  execFileSync(process.execPath, [MANIFEST_SCRIPT], { stdio: 'inherit' });

  console.log('\nRegenerating blog feeds...');
  execFileSync(process.execPath, [FEED_SCRIPT], { stdio: 'inherit' });
  console.log(`\nDone. Processed ${totalPosts} post(s).`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fetchGoogleDoc, parseGoogleDocSimple };
