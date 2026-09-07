import { getR2ImageUrl } from '@/utils/r2ImageUrl';
import {
  fetchPortfolioRows,
  groupRowsByCollection,
  normalizeCollectionName,
} from './supabasePortfolioRows';

export interface SupabaseNatureImage {
  filename: string;
  /**
   * Already resolved against R2. The nature adapter prefers this over
   * `imageUrl.nature()`, which builds a jsDelivr path out of the folder name.
   * A Supabase collection has no such folder, so building a path from its
   * display name would produce a 404.
   */
  url: string;
  caption?: string;
  /**
   * From the `alt_text` column, mapped to `alt` rather than `description`
   * because the adapter resolves alt as `alt ?? caption ?? description`. Mapped
   * to description it would sit behind the caption and the screen reader would
   * hear the caption instead of the text written to be the alt.
   */
  alt?: string;
}

export interface SupabaseNatureCollection {
  collectionName: string;
  folderPath: string;
  totalImages: number;
  tags: string[];
  images: SupabaseNatureImage[];
}

/**
 * Reads nature collections uploaded through `scripts/cloudflare/add-shoot.js`
 * and shapes them like the entries in nature-manifest.json, so the gallery can
 * render both without knowing which pipeline a shoot came from.
 *
 * Returns an empty list on any failure. A collection that cannot be read has to
 * leave the static manifest in charge rather than empty the page.
 */
export async function fetchSupabaseNatureCollections(
  signal?: AbortSignal,
): Promise<SupabaseNatureCollection[]> {
  const rows = await fetchPortfolioRows('nature', signal);
  if (rows.length === 0) return [];

  return Array.from(groupRowsByCollection(rows).entries()).map(([collectionName, group]) => ({
    collectionName,
    // The adapter builds a group id from this and never resolves it as a path,
    // because every image below carries its own url.
    folderPath: collectionName,
    totalImages: group.length,
    tags: Array.from(new Set(group.flatMap((row) => row.tags ?? []))),
    images: group.map((row) => ({
      filename: row.filename,
      url: getR2ImageUrl(row.storage_path),
      caption: row.caption || undefined,
      alt: row.alt_text || undefined,
    })),
  }));
}

/**
 * Merges Supabase collections over the static ones. A shoot present in both is
 * the same shoot arriving by two pipelines, so the Supabase copy wins: it is
 * the more current source and its images are optimised WebP on R2 rather than
 * the originals on jsDelivr. Static collections with no Supabase counterpart
 * are kept untouched, which is what lets this land without migrating anything.
 */
export function mergeNatureCollections<T extends { collectionName: string }>(
  staticCollections: T[],
  supabaseCollections: SupabaseNatureCollection[],
): (T | SupabaseNatureCollection)[] {
  const supabaseNames = new Set(
    supabaseCollections.map((collection) => normalizeCollectionName(collection.collectionName)),
  );

  const keptStatic = staticCollections.filter(
    (collection) => !supabaseNames.has(normalizeCollectionName(collection.collectionName)),
  );

  return [...keptStatic, ...supabaseCollections];
}
