import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

/**
 * Proves the gallery actually consults Supabase, which is the part that was a
 * hardcoded string comparison against 'journalism' and therefore skipped every
 * other gallery, and skipped the 'photojournalism' alias too.
 *
 * The sources themselves are mocked here on purpose: what is under test is the
 * wiring, that asking for a type reaches the right fetch and the right merge
 * and folds the result back under the right key.
 */
const sources = vi.hoisted(() => ({
  fetchNature: vi.fn(),
  fetchJournalism: vi.fn(),
}));

vi.mock('./natureSupabaseSource', async () => {
  const actual = await vi.importActual<typeof import('./natureSupabaseSource')>(
    './natureSupabaseSource',
  );
  return { ...actual, fetchSupabaseNatureCollections: sources.fetchNature };
});

vi.mock('./journalismSupabaseSource', async () => {
  const actual = await vi.importActual<typeof import('./journalismSupabaseSource')>(
    './journalismSupabaseSource',
  );
  return { ...actual, fetchSupabaseJournalismEvents: sources.fetchJournalism };
});

const NATURE_MANIFEST = {
  version: '1.0.0',
  generated: '2026-09-10T00:00:00.000Z',
  totalCollections: 1,
  collections: [{ collectionName: 'Wildlife', folderPath: 'Wildlife', images: [], tags: [] }],
};

const publishedCollection = {
  collectionName: 'Steel Strike 2026',
  folderPath: 'Steel Strike 2026',
  totalImages: 1,
  tags: [],
  images: [{ filename: 'a.webp', url: 'https://images.mcc-cal.com/nature/steel/a.webp' }],
};

beforeEach(() => {
  vi.resetModules();
  sources.fetchNature.mockReset().mockResolvedValue([]);
  sources.fetchJournalism.mockReset().mockResolvedValue([]);

  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(NATURE_MANIFEST),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function loadNature() {
  // Re-imported per test so the hook's module-level 30 minute cache cannot
  // serve one test's merged manifest to the next.
  const { useManifest } = await import('./useManifest');
  const { result } = renderHook(() => useManifest<typeof NATURE_MANIFEST>('nature'));
  await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 3000 });
  return result.current.data;
}

describe('useManifest Supabase merge wiring', () => {
  it('adds a Supabase-published collection to the nature gallery', async () => {
    sources.fetchNature.mockResolvedValue([publishedCollection]);

    const data = await loadNature();

    expect(sources.fetchNature).toHaveBeenCalled();
    expect(data?.collections.map((c) => c.collectionName)).toEqual([
      'Wildlife',
      'Steel Strike 2026',
    ]);
  });

  it('leaves the static manifest untouched when nothing is published', async () => {
    const data = await loadNature();

    // The state today: no nature rows exist yet, so the gallery has to render
    // exactly as it did before any of this was wired up.
    expect(data?.collections.map((c) => c.collectionName)).toEqual(['Wildlife']);
  });

  it('renders the static manifest when the Supabase read fails', async () => {
    sources.fetchNature.mockRejectedValue(new Error('project paused'));

    // A failure has to degrade to static content, not take the gallery down.
    // The static manifest is already in hand by the time the merge runs, so
    // turning an enhancement's failure into an error page would invert the
    // point of merging at all.
    const data = await loadNature();

    expect(data?.collections.map((c) => c.collectionName)).toEqual(['Wildlife']);
  });

  /**
   * The merge is an enhancement, so it must never be what a visitor waits for.
   * Before this, `fetchManifestJson` awaited the merge and the hook only
   * reported success once it settled, so an unreachable Supabase held every
   * dual-sourced gallery on a skeleton until the 5 second timeout fired. The
   * static manifest is already in hand at that point; there is no reason to
   * withhold it.
   */
  it('renders the static manifest while the merge is still in flight', async () => {
    // Never settles, standing in for a paused project or a stalled socket.
    sources.fetchNature.mockReturnValue(new Promise(() => {}));

    const { useManifest } = await import('./useManifest');
    const { result } = renderHook(() => useManifest<typeof NATURE_MANIFEST>('nature'));

    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 1000 });
    expect(result.current.data?.collections.map((c) => c.collectionName)).toEqual(['Wildlife']);
  });

  it('upgrades to the merged manifest once the merge resolves', async () => {
    let release: (value: unknown) => void = () => {};
    sources.fetchNature.mockReturnValue(new Promise((resolve) => { release = resolve; }));

    const { useManifest } = await import('./useManifest');
    const { result } = renderHook(() => useManifest<typeof NATURE_MANIFEST>('nature'));

    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 1000 });
    expect(result.current.data?.collections).toHaveLength(1);

    release([publishedCollection]);

    await waitFor(
      () =>
        expect(result.current.data?.collections.map((c) => c.collectionName)).toEqual([
          'Wildlife',
          'Steel Strike 2026',
        ]),
      { timeout: 1000 },
    );
  });
});
