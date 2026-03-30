#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseMarkdownPost } = require('./post-source-utils');

const BLOG_ROOT = path.join(__dirname, '../../src/content/blog');
const AUTHORS_PATH = path.join(BLOG_ROOT, 'authors.json');
const POSTS_ROOT = path.join(BLOG_ROOT, 'posts');
const AUTHOR_ID_PATTERN = /^[a-z0-9-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function log(message) {
  console.log(`[blog:validate] ${message}`);
}

function warn(message) {
  console.warn(`[blog:validate] WARN ${message}`);
}

function fail(message) {
  console.error(`[blog:validate] ERROR ${message}`);
}

function fileExists(targetPath) {
  return fs.existsSync(targetPath);
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value) {
  if (!DATE_PATTERN.test(String(value || '').trim())) {
    return false;
  }

  const [yearText, monthText, dayText] = String(value).split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    Number.isFinite(year) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

function normalizeText(value) {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

function normalizeBlock(block) {
  if (!block || typeof block !== 'object') {
    return {};
  }

  if (block.type === 'image') {
    return {
      type: 'image',
      src: normalizeText(block.src),
      ...(normalizeText(block.alt) ? { alt: block.alt.trim() } : {}),
      ...(normalizeText(block.caption) ? { caption: block.caption.trim() } : {}),
    };
  }

  return {
    type: normalizeText(block.type),
    ...(normalizeText(block.content) ? { content: block.content.trim() } : {}),
  };
}

function normalizeSource(source) {
  return {
    ...(normalizeText(source?.title) ? { title: source.title.trim() } : {}),
    ...(normalizeText(source?.url) ? { url: source.url.trim() } : {}),
    ...(normalizeText(source?.publisher) ? { publisher: source.publisher.trim() } : {}),
    ...(normalizeText(source?.publishedDate) ? { publishedDate: source.publishedDate.trim() } : {}),
    ...(normalizeText(source?.accessedDate) ? { accessedDate: source.accessedDate.trim() } : {}),
    ...(normalizeText(source?.notes) ? { notes: source.notes.trim() } : {}),
  };
}

function normalizePost(post) {
  const normalized = {
    slug: normalizeText(post?.slug),
    title: normalizeText(post?.title),
    authorId: normalizeText(post?.authorId),
    date: normalizeText(post?.date),
    ...(normalizeText(post?.category) ? { category: post.category.trim() } : {}),
    ...(normalizeText(post?.excerpt) ? { excerpt: post.excerpt.trim() } : {}),
    ...(normalizeText(post?.leadImage) ? { leadImage: post.leadImage.trim() } : {}),
    ...(normalizeText(post?.leadImageAlt) ? { leadImageAlt: post.leadImageAlt.trim() } : {}),
    ...(normalizeText(post?.leadImageCaption) ? { leadImageCaption: post.leadImageCaption.trim() } : {}),
    published: post?.published === undefined ? true : post.published,
    tags: Array.isArray(post?.tags)
      ? post.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    body: Array.isArray(post?.body) ? post.body.map(normalizeBlock) : [],
  };

  if (Array.isArray(post?.sources) && post.sources.length) {
    normalized.sources = post.sources.map(normalizeSource);
  }

  return normalized;
}

function assetPathForDisplay(postSlug, assetPath) {
  return `${postSlug}/${assetPath}`;
}

function validateLocalAssetPath(assetPath, label, postDir, postSlug, errors, warnings, strict) {
  if (!isNonEmptyString(assetPath)) {
    return;
  }

  if (isHttpUrl(assetPath)) {
    return;
  }

  if (assetPath.trim().startsWith('/')) {
    const message = `${label} must use a relative path, received "${assetPath}"`;
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
    return;
  }

  const resolvedPath = path.resolve(postDir, assetPath);
  if (!fileExists(resolvedPath)) {
    const message = `${label} not found: ${assetPathForDisplay(postSlug, assetPath)}`;
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }
}

function validateSources(post, errors, warnings, strict) {
  if (!Array.isArray(post.sources)) {
    return;
  }

  post.sources.forEach((source, index) => {
    const prefix = `sources[${index}]`;

    if (!isNonEmptyString(source?.title)) {
      const message = `${prefix}.title is required`;
      if (strict) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    if (!isNonEmptyString(source?.url)) {
      const message = `${prefix}.url is required`;
      if (strict) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
      return;
    }

    if (source.url === '#') {
      warnings.push(`${prefix}.url is a placeholder (#)`);
    }
  });
}

function validateBody(post, postDir, errors, warnings, strict) {
  if (!Array.isArray(post.body) || post.body.length === 0) {
    const message = 'body must include at least one content block';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
    return;
  }

  const validTypes = new Set(['text', 'quote', 'code', 'image']);

  post.body.forEach((block, index) => {
    const prefix = `body[${index}]`;
    const type = normalizeText(block?.type);

    if (!validTypes.has(type)) {
      errors.push(`${prefix}.type must be one of text, quote, code, image`);
      return;
    }

    if (type === 'image') {
      if (!isNonEmptyString(block?.src)) {
        errors.push(`${prefix}.src is required`);
      } else {
        validateLocalAssetPath(block.src, `${prefix}.src`, postDir, post.slug, errors, warnings, strict);
      }

      if (!isNonEmptyString(block?.alt)) {
        const message = `${prefix}.alt is required for accessibility`;
        if (strict) {
          errors.push(message);
        } else {
          warnings.push(message);
        }
      }

      return;
    }

    if (!isNonEmptyString(block?.content)) {
      errors.push(`${prefix}.content is required`);
    }
  });
}

function validateAuthors() {
  if (!fileExists(AUTHORS_PATH)) {
    throw new Error(`authors.json not found: ${AUTHORS_PATH}`);
  }

  let authorsFile;
  try {
    authorsFile = JSON.parse(fs.readFileSync(AUTHORS_PATH, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid authors.json: ${error.message}`);
  }

  if (!Array.isArray(authorsFile?.authors)) {
    throw new Error('authors.json must contain an "authors" array');
  }

  const seen = new Set();
  const authorMap = new Map();
  const errors = [];
  const warnings = [];

  authorsFile.authors.forEach((author, index) => {
    const prefix = `authors[${index}]`;
    const id = normalizeText(author?.id);
    const name = normalizeText(author?.name);

    if (!id) {
      errors.push(`${prefix}.id is required`);
    } else {
      if (!AUTHOR_ID_PATTERN.test(id)) {
        errors.push(`${prefix}.id must match ${AUTHOR_ID_PATTERN}`);
      }

      if (seen.has(id)) {
        errors.push(`${prefix}.id duplicates "${id}"`);
      }

      seen.add(id);
    }

    if (!name) {
      errors.push(`${prefix}.name is required`);
    }

    if (author?.avatar !== undefined && !isNonEmptyString(author.avatar)) {
      warnings.push(`${prefix}.avatar should be a non-empty string when set`);
    }

    if (author?.bio !== undefined && !isNonEmptyString(author.bio)) {
      warnings.push(`${prefix}.bio should be a non-empty string when set`);
    }

    if (author?.sourceDoc?.publishedUrl !== undefined) {
      if (!isNonEmptyString(author.sourceDoc.publishedUrl) || !isHttpUrl(author.sourceDoc.publishedUrl)) {
        errors.push(`${prefix}.sourceDoc.publishedUrl must be an http(s) URL`);
      }
    }

    if (id) {
      authorMap.set(id, author);
    }
  });

  return { authorMap, errors, warnings };
}

function validatePostDirectory(postDir, authorMap) {
  const folderName = path.basename(postDir);
  const errors = [];
  const warnings = [];
  const markdownPath = path.join(postDir, 'post.md');
  const jsonPath = path.join(postDir, 'post.json');

  if (!fileExists(markdownPath)) {
    errors.push('post.md is required for canonical authoring');
  }

  if (!fileExists(jsonPath)) {
    errors.push('post.json is missing; run npm run blog:compile');
  }

  let sourcePost = null;
  let compiledPost = null;

  if (fileExists(markdownPath)) {
    try {
      const markdown = fs.readFileSync(markdownPath, 'utf8');
      sourcePost = normalizePost(parseMarkdownPost(markdown, folderName));
    } catch (error) {
      errors.push(`Invalid post.md: ${error.message}`);
    }
  }

  if (fileExists(jsonPath)) {
    try {
      compiledPost = normalizePost(JSON.parse(fs.readFileSync(jsonPath, 'utf8')));
    } catch (error) {
      errors.push(`Invalid post.json: ${error.message}`);
    }
  }

  if (sourcePost && compiledPost) {
    if (JSON.stringify(sourcePost) !== JSON.stringify(compiledPost)) {
      errors.push('post.json is out of date; run npm run blog:compile');
    }
  }

  const post = sourcePost || compiledPost;
  if (!post) {
    return { slug: folderName, errors, warnings };
  }

  const isPublished = post.published !== false;
  const strict = isPublished;

  if (!isNonEmptyString(post.slug)) {
    errors.push('slug is required');
  } else if (post.slug !== folderName) {
    errors.push(`folder name "${folderName}" must match slug "${post.slug}"`);
  }

  if (!isNonEmptyString(post.title)) {
    const message = 'title is required';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (typeof post.published !== 'boolean') {
    errors.push('published must be a boolean');
  }

  if (!isNonEmptyString(post.authorId)) {
    const message = 'authorId is required';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  } else if (!authorMap.has(post.authorId)) {
    const message = `authorId "${post.authorId}" is not defined in authors.json`;
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!isNonEmptyString(post.date) || !isValidDateString(post.date)) {
    const message = 'date must be a valid YYYY-MM-DD string';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!isNonEmptyString(post.excerpt)) {
    const message = 'excerpt is required';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!isNonEmptyString(post.leadImage)) {
    const message = 'leadImage is required';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  } else {
    validateLocalAssetPath(post.leadImage, 'leadImage', postDir, post.slug || folderName, errors, warnings, strict);
  }

  if (!isNonEmptyString(post.leadImageAlt)) {
    const message = 'leadImageAlt is required for accessibility';
    if (strict) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!Array.isArray(post.tags)) {
    errors.push('tags must be an array when provided');
  } else {
    const duplicates = post.tags.filter((tag, index) => post.tags.indexOf(tag) !== index);
    duplicates.forEach((tag) => warnings.push(`tags contains duplicate "${tag}"`));
  }

  validateSources(post, errors, warnings, strict);
  validateBody(post, postDir, errors, warnings, strict);

  return { slug: post.slug || folderName, errors, warnings };
}

function main() {
  if (!fileExists(POSTS_ROOT)) {
    fail(`Posts directory not found: ${POSTS_ROOT}`);
    process.exit(1);
  }

  const { authorMap, errors: authorErrors, warnings: authorWarnings } = validateAuthors();
  const postDirs = fs
    .readdirSync(POSTS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(POSTS_ROOT, entry.name));

  const errors = [...authorErrors];
  const warnings = [...authorWarnings];

  if (postDirs.length === 0) {
    warnings.push('No blog posts found under src/content/blog/posts');
  }

  postDirs.forEach((postDir) => {
    const result = validatePostDirectory(postDir, authorMap);
    result.errors.forEach((message) => {
      errors.push(`[${result.slug}] ${message}`);
    });
    result.warnings.forEach((message) => {
      warnings.push(`[${result.slug}] ${message}`);
    });
  });

  warnings.forEach((message) => warn(message));

  if (errors.length > 0) {
    errors.forEach((message) => fail(message));
    fail(`Validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}`);
    process.exit(1);
  }

  log(`Validation passed for ${postDirs.length} post${postDirs.length === 1 ? '' : 's'}`);
  if (warnings.length > 0) {
    log(`Completed with ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Blog Content Validator

Usage:
  node scripts/blog/validate-blog-content.js
  npm run blog:validate

Validates:
  - src/content/blog/authors.json
  - src/content/blog/posts/<slug>/post.md
  - src/content/blog/posts/<slug>/post.json
  - referenced local lead/body image paths

Published posts fail on missing metadata or broken assets.
Drafts are validated more leniently and emit warnings where possible.
`);
  process.exit(0);
}

main();
