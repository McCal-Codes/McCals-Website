#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { serializeMarkdownPost } = require('./post-source-utils');

const POSTS_ROOT = path.join(__dirname, '../../src/content/blog/posts');
const args = process.argv.slice(2);
const FORCE = args.includes('--force');

function migratePostDirectory(postDir) {
  const slug = path.basename(postDir);
  const jsonPath = path.join(postDir, 'post.json');
  const markdownPath = path.join(postDir, 'post.md');

  if (!fs.existsSync(jsonPath)) {
    return false;
  }

  if (fs.existsSync(markdownPath) && !FORCE) {
    console.log(`Skipped existing Markdown: ${slug}`);
    return false;
  }

  const post = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const markdown = serializeMarkdownPost(post);

  fs.writeFileSync(markdownPath, markdown, 'utf8');
  console.log(`Migrated: ${slug}`);
  return true;
}

function main() {
  if (!fs.existsSync(POSTS_ROOT)) {
    console.error(`Posts directory not found: ${POSTS_ROOT}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(POSTS_ROOT, { withFileTypes: true });
  let migratedCount = 0;

  entries.forEach((entry) => {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      return;
    }

    if (migratePostDirectory(path.join(POSTS_ROOT, entry.name))) {
      migratedCount += 1;
    }
  });

  console.log(`Markdown migration complete: ${migratedCount} post${migratedCount === 1 ? '' : 's'} updated`);
}

main();
