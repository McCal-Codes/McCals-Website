import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getR2ImageUrl } from '@/utils/r2ImageUrl';
import { logWarning } from '@/utils/logger';
import type { Database } from '@/lib/database.types';

type PortfolioImageRow = Database['public']['Tables']['portfolio_images']['Row'];

export interface SupabaseJournalismImage {
  filename: string;
  path: string;
  url: string;
  caption?: string;
  description?: string;
}

export interface SupabaseJournalismEvent {
  eventName: string;
  category: string;
  folderPath: string;
  tags?: string[];
  published?: boolean;
  images: SupabaseJournalismImage[];
}

const KNOWN_CATEGORIES = ['Politics', 'Documentary', 'Events', 'Sports', 'Features'];
const FALLBACK_CATEGORY = 'Journalism';

function deriveCategory(tags: string[]): string {
  return tags.find((tag) => KNOWN_CATEGORIES.includes(tag)) ?? FALLBACK_CATEGORY;
}

/**
 * Fetches journalism images uploaded via the R2/Supabase pipeline and shapes
 * them into the same event/image structure the static manifest produces.
 * Never throws — a Supabase outage or misconfiguration should never break
 * the journalism page, it should just fall back to static-only content.
 */
export async function fetchSupabaseJournalismEvents(
  signal?: AbortSignal,
): Promise<SupabaseJournalismEvent[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const query = supabase
      .from('portfolio_images')
      .select('*')
      .eq('portfolio_type', 'journalism')
      .order('collection_name', { ascending: true })
      .order('sort_order', { ascending: true });

    const { data, error } = signal ? await query.abortSignal(signal) : await query;

    if (error || !data) {
      logWarning(`Supabase journalism query failed: ${error?.message ?? 'no data returned'}`);
      return [];
    }

    const byCollection = new Map<string, PortfolioImageRow[]>();
    for (const row of data as PortfolioImageRow[]) {
      const bucket = byCollection.get(row.collection_name);
      if (bucket) {
        bucket.push(row);
      } else {
        byCollection.set(row.collection_name, [row]);
      }
    }

    return Array.from(byCollection.entries()).map(([collectionName, rows]) => {
      const tags = Array.from(new Set(rows.flatMap((row) => row.tags ?? [])));
      return {
        eventName: collectionName,
        category: deriveCategory(tags),
        folderPath: collectionName,
        tags,
        published: true,
        images: rows.map((row) => ({
          filename: row.filename,
          path: row.filename,
          url: getR2ImageUrl(row.storage_path),
          caption: row.caption ?? undefined,
          description: row.alt_text ?? undefined,
        })),
      };
    });
  } catch (error) {
    logWarning(`Supabase journalism fetch threw: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Merges Supabase-sourced journalism events with the static-manifest events.
 * When a static event's name matches a Supabase collection (same event,
 * different pipeline), the static entry is dropped in favor of the Supabase
 * one — Supabase is the more current, more complete source going forward.
 */
export function mergeJournalismEvents<T extends { eventName: string }>(
  staticEvents: T[],
  supabaseEvents: SupabaseJournalismEvent[],
): (T | SupabaseJournalismEvent)[] {
  const supabaseNames = new Set(supabaseEvents.map((event) => normalizeEventName(event.eventName)));
  const keptStatic = staticEvents.filter((event) => !supabaseNames.has(normalizeEventName(event.eventName)));
  return [...keptStatic, ...supabaseEvents];
}
