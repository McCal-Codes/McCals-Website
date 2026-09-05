import { requireAdminSession } from '../../../_lib/auth.js';
import { listAlbumImages } from '../../../_lib/portfolio-images-data.js';

const VALID_PORTFOLIO_TYPES = ['journalism', 'concert', 'portrait', 'events', 'nature'];

function getRouteParams(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);
  // .../api/admin/albums/:type/:collection
  const collection = decodeURIComponent(parts[parts.length - 1] || '');
  const type = decodeURIComponent(parts[parts.length - 2] || '');
  return { type, collection };
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const { type: portfolioType, collection: collectionName } = getRouteParams(req);

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

    const images = await listAlbumImages(portfolioType, collectionName);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: { portfolioType, collectionName, images },
      meta: {
        operator: session.email || session.preferredUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[admin/albums/detail] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_load_album',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
