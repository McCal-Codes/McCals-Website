import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => true),
  /** Pages handed back in order, one per .range() call. */
  pages: [] as { data: unknown[] | null; error: { message: string } | null }[],
  rangeCalls: [] as [number, number][],
  logWarning: vi.fn(),
}));

function createQueryBuilder() {
  const builder: Record<string, unknown> = {};
  const chain = () => vi.fn(() => builder);
  builder.select = chain();
  builder.eq = chain();
  builder.order = chain();
  builder.abortSignal = chain();
  builder.range = vi.fn((from: number, to: number) => {
    mocks.rangeCalls.push([from, to]);
    return builder;
  });
  builder.then = (resolve: (value: unknown) => void) => {
    const page = mocks.pages.shift() ?? { data: [], error: null };
    return Promise.resolve(page).then(resolve);
  };
  return builder;
}

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
  supabase: { from: vi.fn(() => createQueryBuilder()) },
}));

vi.mock('@/utils/logger', () => ({ logWarning: mocks.logWarning }));

import { fetchPortfolioRows, normalizeCollectionName } from './supabasePortfolioRows';

/** The page size the reader uses; a full page means "there may be more". */
const PAGE_SIZE = 500;

function rows(count: number, collection = 'Flowers & Plants') {
  return Array.from({ length: count }, (_, index) => ({
    portfolio_type: 'nature',
    collection_name: collection,
    storage_path: `nature/flowers/${index}.webp`,
    filename: `${index}.webp`,
    alt_text: null,
    caption: null,
    tags: null,
    is_featured: false,
    sort_order: index,
  }));
}

beforeEach(() => {
  mocks.pages = [];
  mocks.rangeCalls = [];
  mocks.isSupabaseConfigured.mockReturnValue(true);
  mocks.logWarning.mockClear();
});

describe('fetchPortfolioRows', () => {
  it('returns [] when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured.mockReturnValue(false);
    await expect(fetchPortfolioRows('nature')).resolves.toEqual([]);
  });

  it('stops after a short page', async () => {
    mocks.pages = [{ data: rows(12), error: null }];

    const result = await fetchPortfolioRows('nature');

    expect(result).toHaveLength(12);
    expect(mocks.rangeCalls).toEqual([[0, PAGE_SIZE - 1]]);
  });

  /**
   * The failure this whole module exists to prevent. PostgREST caps a response
   * at its configured maximum, 1000 by default, and reports no error when it
   * does: the gallery simply renders fewer photographs than were uploaded. The
   * events portfolio already holds 1,635 images, so a single unpaged select
   * would drop roughly 600 of them silently.
   */
  it('keeps paging past a full page instead of truncating', async () => {
    mocks.pages = [
      { data: rows(PAGE_SIZE), error: null },
      { data: rows(PAGE_SIZE), error: null },
      { data: rows(135), error: null },
    ];

    const result = await fetchPortfolioRows('events');

    expect(result).toHaveLength(PAGE_SIZE * 2 + 135);
    expect(mocks.rangeCalls).toEqual([
      [0, 499],
      [500, 999],
      [1000, 1499],
    ]);
  });

  it('discards partial results when a later page errors', async () => {
    mocks.pages = [
      { data: rows(PAGE_SIZE), error: null },
      { data: null, error: { message: 'connection reset' } },
    ];

    // Returning the first page would render a gallery that is missing photos
    // and looks complete, which is worse than falling back to the static
    // manifest that still holds all of them.
    await expect(fetchPortfolioRows('events')).resolves.toEqual([]);
    expect(mocks.logWarning).toHaveBeenCalled();
  });

  it('returns [] rather than throwing when the query errors', async () => {
    mocks.pages = [{ data: null, error: { message: 'permission denied' } }];
    await expect(fetchPortfolioRows('nature')).resolves.toEqual([]);
  });

  it('returns [] when the caller has already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    mocks.pages = [{ data: rows(10), error: null }];

    await expect(fetchPortfolioRows('nature', controller.signal)).resolves.toEqual([]);
  });
});

describe('normalizeCollectionName', () => {
  it('matches the same shoot across the two pipelines', () => {
    // A filesystem folder and a typed collection name for one shoot.
    expect(normalizeCollectionName('Flowers & Plants')).toBe(
      normalizeCollectionName('flowers and plants'),
    );
    expect(normalizeCollectionName('Downtown  Pittsburgh')).toBe(
      normalizeCollectionName('Downtown-Pittsburgh'),
    );
  });

  it('keeps genuinely different shoots apart', () => {
    expect(normalizeCollectionName('Wildlife')).not.toBe(normalizeCollectionName('Wildflowers'));
  });
});
