// Self-contained port of scripts/blog/post-source-utils.js's block parser
// (markdownToBody/serializeBodyBlock). Not imported from there directly:
// this app deploys as its own separate Vercel project rooted at
// sites/mcc-cal-admin, so a relative import reaching outside that root
// wouldn't be included in the deployed function bundle.

function normalizeLineEndings(value) {
  return String(value || '').replace(/\r\n?/g, '\n');
}

function parseMarkdownImage(line) {
  const match = line.match(/^!\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
  if (!match) return null;

  const [, alt, src, caption] = match;
  return { type: 'image', src, alt: alt || undefined, caption: caption || undefined };
}

export function markdownToBody(markdown) {
  const lines = normalizeLineEndings(markdown).split('\n');
  const blocks = [];
  let paragraph = [];
  let quote = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: 'text', content: paragraph.join(' ').trim() });
    paragraph = [];
  };
  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push({ type: 'quote', content: quote.join(' ').trim() });
    quote = [];
  };
  const flushCode = () => {
    if (!code.length) return;
    blocks.push({ type: 'code', content: code.join('\n').replace(/\s+$/, '') });
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
  if (inCode) flushCode();

  return blocks;
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

export function bodyToMarkdown(body) {
  const blocks = Array.isArray(body) ? body : [];
  return blocks.map(serializeBodyBlock).filter(Boolean).join('\n\n');
}
