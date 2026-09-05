import { requireAdminSession } from '../../_lib/auth.js';
import { createPresignedPutUrl } from '../../_lib/r2.js';
import { slugify } from '../../_lib/slug.js';

const VALID_PORTFOLIO_TYPES = ['journalism', 'concert', 'portrait', 'events', 'nature'];
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const CONTENT_TYPE_BY_EXTENSION = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_FILES_PER_BATCH = 50;
const PRESIGN_TTL_SECONDS = 600;

// Strips any path segments and disallowed characters from a client-supplied
// filename before it's ever used to build a storage key.
export function safeFilename(filename) {
  const base = String(filename ?? '').split(/[\\/]/).pop() || '';
  const sanitized = base
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^[._]+/, '');
  return sanitized || 'file';
}

function getExtension(filename) {
  const match = /\.[a-z0-9]+$/i.exec(filename);
  return match ? match[0].toLowerCase() : '';
}

function dedupeFilename(filename, used) {
  if (!used.has(filename)) {
    used.add(filename);
    return filename;
  }

  const extension = getExtension(filename);
  const base = extension ? filename.slice(0, -extension.length) : filename;
  let counter = 2;
  let candidate = `${base}-${counter}${extension}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}${extension}`;
  }
  used.add(candidate);
  return candidate;
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const body = req.body || {};
    const portfolioType = String(body.portfolioType || '');
    const collectionName = String(body.collectionName || '').trim();
    const files = Array.isArray(body.files) ? body.files : [];

    if (!VALID_PORTFOLIO_TYPES.includes(portfolioType)) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_portfolio_type',
        validTypes: VALID_PORTFOLIO_TYPES,
      });
    }
    if (!collectionName) {
      return res.status(400).json({ ok: false, error: 'missing_collection_name' });
    }
    if (!files.length) {
      return res.status(400).json({ ok: false, error: 'no_files' });
    }
    if (files.length > MAX_FILES_PER_BATCH) {
      return res.status(400).json({ ok: false, error: 'too_many_files', max: MAX_FILES_PER_BATCH });
    }

    const collectionSlug = slugify(collectionName);
    if (!collectionSlug) {
      return res.status(400).json({ ok: false, error: 'invalid_collection_name' });
    }

    const usedFilenames = new Set();
    const results = files.map((file) => {
      const extension = getExtension(safeFilename(file?.filename));
      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return { filename: String(file?.filename ?? ''), ok: false, error: 'unsupported_file_type' };
      }

      const size = Number(file?.size) || 0;
      if (size <= 0 || size > MAX_FILE_SIZE_BYTES) {
        return { filename: String(file?.filename ?? ''), ok: false, error: 'file_too_large' };
      }

      const filename = dedupeFilename(safeFilename(file?.filename), usedFilenames);
      const storagePath = `${portfolioType}/${collectionSlug}/${filename}`;
      const contentType = CONTENT_TYPE_BY_EXTENSION[extension];

      try {
        const uploadUrl = createPresignedPutUrl({ storagePath, expiresInSeconds: PRESIGN_TTL_SECONDS });
        return { filename, ok: true, storagePath, uploadUrl, contentType };
      } catch (err) {
        return { filename, ok: false, error: err.code || 'presign_failed' };
      }
    });

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: { portfolioType, collectionName, collectionSlug, files: results },
    });
  } catch (err) {
    console.error('[admin/albums/presign] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_presign',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
