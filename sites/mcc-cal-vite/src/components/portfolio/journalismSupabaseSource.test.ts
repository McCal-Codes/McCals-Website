import { afterEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => true),
  queryResult: { data: null as unknown, error: null as { message: string } | null },
}));

function createQueryBuilder() {
  const builder: Record<string, unknown> = {};
  // The name is passed at each call site to document which method is being
  // stubbed; the stub itself only ever returns the builder so the chain
  // continues. Underscore-prefixed so it is not flagged as unused.
  const chain = (_methodName: string) => vi.fn((..._args: unknown[]) => builder);
  builder.select = chain('select');
  builder.eq = chain('eq');
  builder.order = chain('order');
  builder.abortSignal = chain('abortSignal');
  builder.then = (
    resolve: (value: typeof supabaseMocks.queryResult) => void,
  ) => Promise.resolve(supabaseMocks.queryResult).then(resolve);
  return builder;
}

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: supabaseMocks.isSupabaseConfigured,
  supabase: {
    from: vi.fn(() => createQueryBuilder()),
  },
}));

vi.mock('@/utils/r2ImageUrl', () => ({
  getR2ImageUrl: (storagePath: string) => `https://images.mcc-cal.com/${storagePath}`,
}));

vi.mock('@/utils/logger', () => ({
  logWarning: vi.fn(),
}));

import { fetchSupabaseJournalismEvents, mergeJournalismEvents } from './journalismSupabaseSource';

function row(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'row-1',
    portfolio_type: 'journalism',
    collection_name: 'Trump Returns Butler',
    storage_path: 'journalism/trump-returns-butler/img1.webp',
    filename: 'img1.webp',
    alt_text: null,
    caption: 'A caption',
    width: null,
    height: null,
    focal_point_x: null,
    focal_point_y: null,
    tags: ['Politics'],
    is_featured: false,
    sort_order: 0,
    migrated_from: null,
    created_at: '2026-06-26T00:00:00Z',
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  supabaseMocks.isSupabaseConfigured.mockReturnValue(true);
  supabaseMocks.queryResult = { data: null, error: null };
});

describe('fetchSupabaseJournalismEvents', () => {
  it('returns [] immediately when Supabase is not configured', async () => {
    supabaseMocks.isSupabaseConfigured.mockReturnValue(false);
    const events = await fetchSupabaseJournalismEvents();
    expect(events).toEqual([]);
  });

  it('returns [] (never throws) when the query errors', async () => {
    supabaseMocks.queryResult = { data: null, error: { message: 'boom' } };
    const events = await fetchSupabaseJournalismEvents();
    expect(events).toEqual([]);
  });

  it('groups rows by collection_name and builds R2 URLs', async () => {
    supabaseMocks.queryResult = {
      data: [
        row({ id: '1', filename: 'a.webp', storage_path: 'journalism/trump-returns-butler/a.webp' }),
        row({ id: '2', filename: 'b.webp', storage_path: 'journalism/trump-returns-butler/b.webp' }),
        row({ id: '3', collection_name: 'Other Shoot', tags: ['Sports'], filename: 'c.webp', storage_path: 'journalism/other-shoot/c.webp' }),
      ],
      error: null,
    };

    const events = await fetchSupabaseJournalismEvents();

    expect(events).toHaveLength(2);
    const trump = events.find((e) => e.eventName === 'Trump Returns Butler');
    expect(trump?.images).toHaveLength(2);
    expect(trump?.images[0].url).toBe('https://images.mcc-cal.com/journalism/trump-returns-butler/a.webp');
    expect(trump?.category).toBe('Politics');
    expect(trump?.published).toBe(true);

    const other = events.find((e) => e.eventName === 'Other Shoot');
    expect(other?.category).toBe('Sports');
  });

  it('falls back to the "Journalism" category bucket when no known tag matches', async () => {
    supabaseMocks.queryResult = {
      data: [row({ tags: ['Unrelated Tag'] })],
      error: null,
    };
    const events = await fetchSupabaseJournalismEvents();
    expect(events[0].category).toBe('Journalism');
  });
});

describe('mergeJournalismEvents', () => {
  it('drops the static event when a Supabase collection has the same normalized name', () => {
    const staticEvents = [{ eventName: 'Trump Returns Butler' }, { eventName: 'Boyd Station' }];
    const supabaseEvents = [
      {
        eventName: 'Trump Returns Butler',
        category: 'Politics',
        folderPath: 'Trump Returns Butler',
        published: true,
        images: [],
      },
    ];

    const merged = mergeJournalismEvents(staticEvents, supabaseEvents);

    expect(merged).toHaveLength(2);
    expect(merged.filter((e) => e.eventName === 'Trump Returns Butler')).toHaveLength(1);
    expect(merged.some((e) => e.eventName === 'Boyd Station')).toBe(true);
  });

  it('matches names across case/punctuation/whitespace differences', () => {
    const staticEvents = [{ eventName: 'Trump-Returns  To Butler!' }];
    const supabaseEvents = [
      {
        eventName: 'trump returns to butler',
        category: 'Politics',
        folderPath: 'x',
        published: true,
        images: [],
      },
    ];

    const merged = mergeJournalismEvents(staticEvents, supabaseEvents);

    expect(merged).toHaveLength(1);
  });

  it('keeps static events untouched when nothing overlaps', () => {
    const staticEvents = [{ eventName: 'Historic Yard Sale 0825' }];
    const merged = mergeJournalismEvents(staticEvents, []);
    expect(merged).toEqual(staticEvents);
  });
});
