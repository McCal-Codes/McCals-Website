import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logWarning } from '@/utils/logger';
import type { Database } from '@/lib/database.types';

export type PortfolioImageRow = Database['public']['Tables']['portfolio_images']['Row'];

/**
 * PostgREST refuses to return more rows than its configured maximum, which
 * defaults to 1000, and it does so without an error: the response is simply
 * short. A single `.select()` for a large portfolio therefore returns a
 * truncated gallery that looks completely normal. The events portfolio alone
 * holds 1,635 images, so this is not hypothetical.
 *
 * Paging with `.range()` avoids it regardless of what the limit is set to,
 * because the loop stops on a short page rather than on a count we assume.
 */
const PAGE_SIZE = 500;

/**
 * A stop so a paging bug cannot spin forever against a growing table. Well
 * above any single portfolio today; if a portfolio ever legitimately passes it,
 * the warning below is the signal to paginate in the UI rather than to raise
 * this number.
 */
const MAX_ROWS = 20000;

/**
 * Only the columns the galleries actually read. `select('*')` pulls the focal
 * point, dimensions and migration bookkeeping into every visitor's payload for
 * no benefit.
 */
const COLUMNS = 'portfolio_type,collection_name,storage_path,filename,alt_text,caption,tags,is_featured,sort_order';

/**
 * Reads every image row for one portfolio type, in the order the galleries
 * expect. Never throws: a Supabase outage, a paused project or a missing
 * configuration has to leave the gallery on its static manifest rather than
 * take the page down, so every failure path returns an empty list and the
 * caller treats that as "nothing to merge".
 */
export async function fetchPortfolioRows(
  portfolioType: string,
  signal?: AbortSignal,
): Promise<PortfolioImageRow[]> {
  if (!isSupabaseConfigured()) return [];

  const rows: PortfolioImageRow[] = [];

  try {
    for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
      if (signal?.aborted) return [];

      const query = supabase
        .from('portfolio_images')
        .select(COLUMNS)
        .eq('portfolio_type', portfolioType)
        .order('collection_name', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('filename', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      const { data, error } = signal ? await query.abortSignal(signal) : await query;

      if (error || !data) {
        logWarning(
          `Supabase ${portfolioType} query failed: ${error?.message ?? 'no data returned'}`,
        );
        // Partial results would render as a silently incomplete gallery, which
        // is the failure this whole file exists to prevent. Drop them and let
        // the static manifest answer instead.
        return [];
      }

      rows.push(...(data as unknown as PortfolioImageRow[]));

      // A short page means the end of the table, whatever the server's row cap
      // happens to be.
      if (data.length < PAGE_SIZE) return rows;
    }

    logWarning(
      `Supabase ${portfolioType} returned at least ${MAX_ROWS} rows; results are truncated.`,
    );
    return rows;
  } catch (error) {
    // An abort is the visitor navigating away or the merge timing out, not a
    // fault. Logging it would warn on every ordinary departure from a gallery
    // and bury the failures that matter.
    const aborted = signal?.aborted || (error instanceof Error && error.name === 'AbortError');
    if (aborted) return [];

    logWarning(
      `Supabase ${portfolioType} fetch threw: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
}

/** Groups rows into collections, preserving the order the query established. */
export function groupRowsByCollection(rows: PortfolioImageRow[]): Map<string, PortfolioImageRow[]> {
  const byCollection = new Map<string, PortfolioImageRow[]>();

  for (const row of rows) {
    const bucket = byCollection.get(row.collection_name);
    if (bucket) {
      bucket.push(row);
    } else {
      byCollection.set(row.collection_name, [row]);
    }
  }

  return byCollection;
}

/**
 * Collection names arrive from two pipelines that disagree about punctuation
 * and case, so "Flowers & Plants" from a filesystem folder has to match
 * "Flowers and Plants" typed into an upload. Comparing on a stripped form keeps
 * one shoot from rendering twice.
 */
export function normalizeCollectionName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
