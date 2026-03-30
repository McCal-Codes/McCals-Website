const FRONTMATTER_DELIMITER = '---';

function normalizeLineEndings(value) {
  return String(value || '').replace(/\r\n?/g, '\n');
}

function extractFrontmatter(markdown) {
  const normalized = normalizeLineEndings(markdown);

  if (!normalized.startsWith(`${FRONTMATTER_DELIMITER}\n`)) {
    return {
      frontmatter: {},
      body: normalized.trim(),
    };
  }

  const endMarker = `\n${FRONTMATTER_DELIMITER}\n`;
  const endIndex = normalized.indexOf(endMarker, FRONTMATTER_DELIMITER.length + 1);

  if (endIndex === -1) {
    throw new Error('Unterminated frontmatter block');
  }

  const frontmatterText = normalized.slice(FRONTMATTER_DELIMITER.length + 1, endIndex);
  const body = normalized.slice(endIndex + endMarker.length).trim();

  return {
    frontmatter: parseFrontmatter(frontmatterText),
    body,
  };
}

function parseFrontmatter(text) {
  const lines = normalizeLineEndings(text).split('\n');
  const data = {};
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      index += 1;
      continue;
    }

    const match = line.match(/^([A-Za-z][\w-]*):(.*)$/);
    if (!match) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }

    const [, key, rawValue] = match;
    const value = rawValue.trim();

    if (value) {
      data[key] = parseScalar(value);
      index += 1;
      continue;
    }

    index += 1;
    const blockLines = [];

    while (index < lines.length) {
      const nextLine = lines[index];
      const nextTrimmed = nextLine.trim();

      if (!nextTrimmed) {
        blockLines.push(nextLine);
        index += 1;
        continue;
      }

      if (!/^\s+/.test(nextLine)) {
        break;
      }

      blockLines.push(nextLine);
      index += 1;
    }

    data[key] = parseIndentedBlock(blockLines);
  }

  return data;
}

function parseIndentedBlock(lines) {
  const nonEmpty = lines.filter((line) => line.trim());
  if (nonEmpty.length === 0) return [];

  const minIndent = Math.min(...nonEmpty.map((line) => line.match(/^\s*/)[0].length));
  const normalized = lines.map((line) => line.slice(Math.min(minIndent, line.length)));
  const firstNonEmpty = normalized.find((line) => line.trim());

  if (firstNonEmpty && firstNonEmpty.trim().startsWith('- ')) {
    return parseArrayBlock(normalized);
  }

  return normalized.map((line) => line.trim()).filter(Boolean).join('\n');
}

function parseArrayBlock(lines) {
  const items = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (!trimmed.startsWith('- ')) {
      throw new Error(`Invalid array item: ${line}`);
    }

    const itemText = trimmed.slice(2).trim();

    if (looksLikeObjectEntry(itemText)) {
      const item = {};
      const [firstKey, firstValue] = splitKeyValue(itemText);
      item[firstKey] = parseScalar(firstValue);
      index += 1;

      while (index < lines.length) {
        const nested = lines[index];
        const nestedTrimmed = nested.trim();

        if (!nestedTrimmed) {
          index += 1;
          continue;
        }

        if (nestedTrimmed.startsWith('- ')) {
          break;
        }

        const [nestedKey, nestedValue] = splitKeyValue(nestedTrimmed);
        item[nestedKey] = parseScalar(nestedValue);
        index += 1;
      }

      items.push(item);
      continue;
    }

    items.push(parseScalar(itemText));
    index += 1;
  }

  return items;
}

function splitKeyValue(line) {
  const match = line.match(/^([A-Za-z][\w-]*):(.*)$/);
  if (!match) {
    throw new Error(`Invalid object entry: ${line}`);
  }

  return [match[1], match[2].trim()];
}

function looksLikeObjectEntry(value) {
  return /^[A-Za-z][\w-]*:/.test(value);
}

function parseScalar(value) {
  const trimmed = value.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return unquote(trimmed);
  }

  return trimmed;
}

function unquote(value) {
  if (value.startsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }

  return value
    .slice(1, -1)
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
}

function markdownToBody(markdown) {
  const lines = normalizeLineEndings(markdown).split('\n');
  const blocks = [];
  let paragraph = [];
  let quote = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({
      type: 'text',
      content: paragraph.join(' ').trim(),
    });
    paragraph = [];
  };

  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push({
      type: 'quote',
      content: quote.join(' ').trim(),
    });
    quote = [];
  };

  const flushCode = () => {
    if (!code.length) return;
    blocks.push({
      type: 'code',
      content: code.join('\n').replace(/\s+$/, ''),
    });
    code = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (inCode) {
      if (trimmed.startsWith('```')) {
        flushCode();
        inCode = false;
      } else {
        code.push(line);
      }
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushQuote();
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushQuote();
      inCode = true;
      continue;
    }

    const image = parseMarkdownImage(trimmed);
    if (image) {
      flushParagraph();
      flushQuote();
      blocks.push(image);
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      quote.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }

    paragraph.push(trimmed.replace(/^#{1,6}\s+/, ''));
  }

  flushParagraph();
  flushQuote();

  if (inCode) {
    flushCode();
  }

  return blocks;
}

function parseMarkdownImage(line) {
  const match = line.match(/^!\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
  if (!match) return null;

  const [, alt, src, caption] = match;

  return {
    type: 'image',
    src,
    alt: alt || undefined,
    caption: caption || undefined,
  };
}

function parseMarkdownPost(markdown, fallbackSlug) {
  const { frontmatter, body } = extractFrontmatter(markdown);
  const post = {
    ...frontmatter,
    slug: frontmatter.slug || fallbackSlug,
    published: frontmatter.published === undefined ? true : frontmatter.published,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    body: markdownToBody(body),
  };

  if (Array.isArray(frontmatter.sources)) {
    post.sources = frontmatter.sources;
  }

  return post;
}

function quoteString(value) {
  return JSON.stringify(String(value));
}

function serializeFrontmatterEntry(key, value, lines) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return;
    lines.push(`${key}:`);

    value.forEach((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const entries = Object.entries(item).filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== null && nestedValue !== '');
        if (!entries.length) return;

        const [[firstKey, firstValue], ...rest] = entries;
        lines.push(`  - ${firstKey}: ${serializeScalar(firstValue)}`);
        rest.forEach(([nestedKey, nestedValue]) => {
          lines.push(`    ${nestedKey}: ${serializeScalar(nestedValue)}`);
        });
        return;
      }

      lines.push(`  - ${serializeScalar(item)}`);
    });
    return;
  }

  lines.push(`${key}: ${serializeScalar(value)}`);
}

function serializeScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  return quoteString(value);
}

function serializeMarkdownPost(post) {
  const lines = [FRONTMATTER_DELIMITER];
  const orderedKeys = [
    'slug',
    'title',
    'authorId',
    'date',
    'category',
    'excerpt',
    'leadImage',
    'leadImageAlt',
    'leadImageCaption',
    'published',
    'tags',
    'sources',
  ];

  orderedKeys.forEach((key) => {
    serializeFrontmatterEntry(key, post[key], lines);
  });

  lines.push(FRONTMATTER_DELIMITER, '');

  const bodyBlocks = Array.isArray(post.body) ? post.body : [];
  const bodySections = bodyBlocks.map((block) => serializeBodyBlock(block)).filter(Boolean);

  if (bodySections.length) {
    lines.push(bodySections.join('\n\n'));
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function serializeBodyBlock(block) {
  if (!block || !block.type) return '';

  if (block.type === 'text') {
    return String(block.content || '').trim();
  }

  if (block.type === 'quote') {
    return String(block.content || '')
      .split('\n')
      .map((line) => `> ${line.trim()}`)
      .join('\n');
  }

  if (block.type === 'code') {
    return ['```', String(block.content || '').replace(/\s+$/, ''), '```'].join('\n');
  }

  if (block.type === 'image') {
    const alt = String(block.alt || '');
    const src = String(block.src || '').trim();
    const caption = block.caption ? ` "${String(block.caption).replace(/"/g, '\\"')}"` : '';
    return `![${alt}](${src}${caption})`;
  }

  return '';
}

module.exports = {
  extractFrontmatter,
  markdownToBody,
  parseMarkdownPost,
  serializeMarkdownPost,
};
