import { requireAdminSession } from '../../../_lib/auth.js';
import { updatePortfolioImage } from '../../../_lib/portfolio-images-data.js';

const EDITABLE_FIELDS = ['caption', 'alt_text', 'tags', 'is_featured', 'sort_order'];

function getImageId(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function pickEditableFields(body) {
  const fields = {};
  for (const key of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      fields[key] = body[key];
    }
  }
  return fields;
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const id = getImageId(req);

    if (!isValidUuid(id)) {
      return res.status(400).json({ ok: false, error: 'invalid_image_id' });
    }

    const fields = pickEditableFields(req.body || {});
    const updated = await updatePortfolioImage(id, fields);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: updated,
      meta: {
        operator: session.email || session.preferredUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[admin/albums/images] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_update_image',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
