#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseMarkdownPost } = require('./post-source-utils');

const POSTS_ROOT = path.join(__dirname, '../../src/content/blog/posts');

function compilePostDirectory(postDir) {
  const slug = path.basename(postDir);
  const markdownPath = path.join(postDir, 'post.md');
  const jsonPath = path.join(postDir, 'post.json');

  if (!fs.existsSync(markdownPath)) {
    return false;
  }

  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const post = parseMarkdownPost(markdown, slug);

  fs.writeFileSync(jsonPath, `${JSON.stringify(post, null, 2)}\n`, 'utf8');
  console.log(`Compiled: ${slug}`);
  return true;
}

function main() {
  if (!fs.existsSync(POSTS_ROOT)) {
    console.error(`Posts directory not found: ${POSTS_ROOT}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(POSTS_ROOT, { withFileTypes: true });
  let compiledCount = 0;

  entries.forEach((entry) => {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      return;
    }

    if (compilePostDirectory(path.join(POSTS_ROOT, entry.name))) {
      compiledCount += 1;
    }
  });

  console.log(`Markdown post compile complete: ${compiledCount} post${compiledCount === 1 ? '' : 's'} compiled`);
}

main();
