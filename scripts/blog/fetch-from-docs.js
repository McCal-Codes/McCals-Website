/**
 * Google Docs Blog Ingestion Script
 *
 * Fetches posts from author Google Docs and generates blog.manifest.json
 *
 * Usage: node scripts/blog/fetch-from-docs.js
 */

const fs = require('fs');
const path = require('path');

const AUTHORS_PATH = path.join(__dirname, '../../src/data/blog/authors.json');
const OUTPUT_PATH = path.join(__dirname, '../../src/data/blog/blog.manifest.json');

/**
 * Fetch and parse a Google Doc
 */
async function fetchGoogleDoc(publishedUrl) {
  try {
    const response = await fetch(publishedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - Make sure document is published to web`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch Google Doc:', error.message);
    throw error;
  }
}

/**
 * Parse date from various formats
 */
function parseDate(str) {
  if (!str) return null;

  // Remove extra spaces/formatting
  str = str.trim();

  // MM-DD-YY or MM/DD/YY (with dashes too: 01-10-25)
  const shortDate = str.match(/(\d{1,2})[-\/](\d{1,2})[-\/–](\d{2,4})/);
  if (shortDate) {
    let month = String(shortDate[1]).padStart(2, '0');
    let day = String(shortDate[2]).padStart(2, '0');
    let year = shortDate[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // Natural language (e.g., "10 January 2025" or "16 August 2024")
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Simple HTML parser for Google Docs format
 */
function parseGoogleDocSimple(html, authorId) {
  const posts = [];

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return posts;

  const body = bodyMatch[1];

  // Extract all paragraphs
  const paragraphs = body.match(/<p class=\"[^\"]+\"[^>]*>[\s\S]*?<\/p>/gi) || [];

  let currentPost = null;
  let inContent = false;

  for (const p of paragraphs) {
    // Extract text content
    const textMatch = p.match(/>([^<]+)</);
    if (!textMatch) continue;

    const text = textMatch[1].trim();
    if (!text) continue;

    // Check for POST: marker
    if (text.match(/POST:\s*/i)) {
      // Save previous post
      if (currentPost) {
        posts.push(currentPost);
      }

      // Start new post
      const title = text.replace(/POST:\s*/i, '').trim();
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      currentPost = {
        id: slug,
        slug: slug,
        title: title,
        date: null,
        content: '',
        authorId: authorId,
        tags: [],
        href: `/blog/${slug}`,
      };

      inContent = false;
      continue;
    }

    if (!currentPost) continue;

    // Parse metadata fields
    const dateMatch = text.match(/^date:\s*(.+)/i);
    if (dateMatch) {
      currentPost.date = parseDate(dateMatch[1].trim());
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
        .map((t) => t.trim())
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
      const url = imageMatch[1].trim();
      if (url) currentPost.cover = url;
      continue;
    }

    // Check for Sources section
    if (text.toLowerCase().match(/^sources?\s*$/)) {
      inContent = false;
      continue;
    }

    // Skip empty metadata fields
    if (text.match(/^(date|category|tags|excerpt|image):\s*$/i)) {
      continue;
    }

    // If we hit real content (> 30 chars and not metadata), start collecting
    if (
      text.length > 30 &&
      !text.match(/^(author|avatar|bio|post|date|category|tags|excerpt|image):/i)
    ) {
      inContent = true;
    }

    // Add to content if we're collecting
    if (inContent) {
      // Clean the HTML
      let cleaned = p
        .replace(/\sclass="[^"]*"/g, '')
        .replace(/\sstyle="[^"]*"/g, '')
        .replace(/\sid="[^"]*"/g, '');

      currentPost.content += cleaned;
    }
  }

  // Save last post
  if (currentPost) {
    posts.push(currentPost);
  }

  // Generate excerpts if missing
  posts.forEach((post) => {
    if (!post.excerpt && post.content) {
      const tmp = post.content.replace(/<[^>]*>/g, '').trim();
      post.excerpt = tmp.substring(0, 160) + (tmp.length > 160 ? '...' : '');
    }
  });

  // Sort by date descending
  posts.sort((a, b) => {
    const dA = a.date ? new Date(a.date) : new Date(0);
    const dB = b.date ? new Date(b.date) : new Date(0);
    return dB - dA;
  });

  return posts;
}

/**
 * Main function
 */
async function main() {
  console.log('📖 Fetching blog posts from Google Docs...\n');

  // Load authors
  const authorsData = JSON.parse(fs.readFileSync(AUTHORS_PATH, 'utf-8'));
  const authors = authorsData.authors;

  const allPosts = [];

  for (const author of authors) {
    if (!author.sourceDoc?.publishedUrl) {
      console.log(`⏭️  Skipping ${author.name} (no sourceDoc)`);
      continue;
    }

    console.log(`📥 Fetching posts for ${author.name}...`);
    try {
      const html = await fetchGoogleDoc(author.sourceDoc.publishedUrl);
      const posts = parseGoogleDocSimple(html, author.id);

      console.log(`   ✓ Found ${posts.length} post(s)`);

      posts.forEach((post) => {
        console.log(`     - ${post.title} (${post.date || 'no date'})`);
        console.log(`       Category: ${post.category || 'none'}`);
        console.log(`       Tags: ${post.tags.join(', ') || 'none'}`);
        console.log(`       Content length: ${post.content.length} chars`);
        console.log(`       Has excerpt: ${post.excerpt ? 'yes' : 'no'}`);
      });

      allPosts.push(...posts);
    } catch (error) {
      console.error(`   ✗ Error: ${error.message}`);
    }
  }

  // Write manifest
  const manifest = {
    posts: allPosts,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Generated ${allPosts.length} posts to blog.manifest.json`);
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { fetchGoogleDoc, parseGoogleDocSimple };
