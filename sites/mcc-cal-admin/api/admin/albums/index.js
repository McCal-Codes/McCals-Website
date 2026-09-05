import { requireAdminSession } from '../../_lib/auth.js';
import { listAlbums } from '../../_lib/portfolio-images-data.js';

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const albums = await listAlbums();

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: albums,
      meta: {
        operator: session.email || session.preferredUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[admin/albums] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_load_albums',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
