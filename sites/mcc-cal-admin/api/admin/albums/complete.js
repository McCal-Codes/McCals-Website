import { requireAdminSession } from '../../_lib/auth.js';
import { headR2Object } from '../../_lib/r2.js';
import {
  getCollectionPlacement,
  upsertPortfolioImages,
} from '../../_lib/portfolio-images-data.js';
import { slugify } from '../../_lib/slug.js';

const VALID_PORTFOLIO_TYPES = ['journalism', 'concert', 'portrait', 'events', 'nature'];
const MAX_IMAGES_PER_BATCH = 50;

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
    const images = Array.isArray(body.images) ? body.images : [];

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
    if (!images.length) {
      return res.status(400).json({ ok: false, error: 'no_images' });
    }
    if (images.length > MAX_IMAGES_PER_BATCH) {
      return res.status(400).json({ ok: false, error: 'too_many_images', max: MAX_IMAGES_PER_BATCH });
    }

    const collectionSlug = slugify(collectionName);
    const expectedPrefix = `${portfolioType}/${collectionSlug}/`;

    // Defense in depth: never trust storagePath from the client beyond the
    // prefix it was issued a presigned URL for.
    const inScope = images.filter((image) => {
      const path = String(image?.storagePath || '');
      return path.startsWith(expectedPrefix) && !path.includes('..');
    });

    const results = await Promise.all(
      inScope.map(async (image) => {
        const storagePath = String(image.storagePath);
        const filename = storagePath.slice(expectedPrefix.length);

        const object = await headR2Object(storagePath);
        if (!object) {
          return { storagePath, ok: false, error: 'object_not_found_in_r2' };
        }

        return { storagePath, filename, ok: true };
      }),
    );

    const confirmed = results.filter((result) => result.ok);
    let inserted = 0;

    if (confirmed.length) {
      const { existingSortOrder, nextSortOrder } = await getCollectionPlacement(
        portfolioType,
        collectionName,
      );

      // Genuinely new files append after whatever the album already holds; a
      // file that is already here keeps the position it has, so re-uploading a
      // corrected frame does not jump it to the end.
      let appendCursor = nextSortOrder;

      const rows = confirmed.map((result) => ({
        portfolio_type: portfolioType,
        collection_name: collectionName,
        storage_path: result.storagePath,
        filename: result.filename,
        sort_order: existingSortOrder.has(result.storagePath)
          ? existingSortOrder.get(result.storagePath)
          : appendCursor++,
      }));

      // alt_text, caption, tags and is_featured are deliberately absent. The
      // upsert resolves conflicts with merge-duplicates, which overwrites every
      // column present in the payload — sending empty defaults here wiped the
      // captions and tags off any image that was re-uploaded. Omitted, the
      // column defaults apply to new rows and existing editorial metadata
      // survives untouched.
      const upserted = await upsertPortfolioImages(rows);
      inserted = Array.isArray(upserted) ? upserted.length : rows.length;
    }

    const outOfScope = images.length - inScope.length;
    const skipped = results
      .filter((result) => !result.ok)
      .map((result) => ({ storagePath: result.storagePath, error: result.error }));

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: {
        inserted,
        skipped: [
          ...skipped,
          ...(outOfScope > 0 ? [{ error: 'out_of_scope_storage_path', count: outOfScope }] : []),
        ],
      },
      meta: {
        operator: session.email || session.preferredUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[admin/albums/complete] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_complete_upload',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
