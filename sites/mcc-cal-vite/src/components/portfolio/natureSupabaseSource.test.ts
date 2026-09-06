import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  supabase: { from: vi.fn() },
}));

vi.mock('@/utils/r2ImageUrl', () => ({
  getR2ImageUrl: (storagePath: string) => `https://images.mcc-cal.com/${storagePath}`,
}));

vi.mock('@/utils/logger', () => ({ logWarning: vi.fn() }));

import { mergeNatureCollections, type SupabaseNatureCollection } from './natureSupabaseSource';
import { adaptNature, type NatureManifest } from '@/pages/nature-adapter';

function supabaseCollection(
  overrides: Partial<SupabaseNatureCollection> = {},
): SupabaseNatureCollection {
  return {
    collectionName: 'Steel Strike 2026',
    folderPath: 'Steel Strike 2026',
    totalImages: 1,
    tags: ['industry'],
    images: [
      {
        filename: '260612_Strike_CAL3201.webp',
        url: 'https://images.mcc-cal.com/nature/steel-strike-2026/260612_Strike_CAL3201.webp',
        caption: 'Workers outside the coke works at dawn',
        alt: 'A line of workers silhouetted against stacks',
      },
    ],
    ...overrides,
  };
}

describe('mergeNatureCollections', () => {
  it('keeps static collections that Supabase does not know about', () => {
    const merged = mergeNatureCollections(
      [{ collectionName: 'Wildlife' }, { collectionName: 'Landscapes' }],
      [supabaseCollection()],
    );

    expect(merged.map((entry) => entry.collectionName)).toEqual([
      'Wildlife',
      'Landscapes',
      'Steel Strike 2026',
    ]);
  });

  it('lets Supabase replace a collection published by both pipelines', () => {
    // One shoot arriving twice must render once, not twice, even though the
    // folder name and the typed collection name punctuate it differently.
    const merged = mergeNatureCollections(
      [{ collectionName: 'Flowers & Plants' }],
      [supabaseCollection({ collectionName: 'Flowers and Plants' })],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].collectionName).toBe('Flowers and Plants');
  });

  it('leaves the static list alone when Supabase has nothing', () => {
    const staticCollections = [{ collectionName: 'Wildlife' }];
    expect(mergeNatureCollections(staticCollections, [])).toEqual(staticCollections);
  });
});

describe('adaptNature with a Supabase-published collection', () => {
  /**
   * The 404 this guards against: `imageUrl.nature()` builds a jsDelivr path
   * from the collection's folder name, and a Supabase collection has no folder
   * on disk. Its images carry their own R2 address and the adapter has to use
   * it. The cover matters just as much, because only the static pipeline writes
   * thumbnails under Nature/thumbs/.
   */
  const manifest = {
    version: '1.0.0',
    generated: '2026-09-10T00:00:00.000Z',
    totalCollections: 1,
    collections: [supabaseCollection()],
  } as unknown as NatureManifest;

  it('uses the R2 url rather than building a CDN path', () => {
    const [group] = adaptNature(manifest);

    expect(group.images[0].url).toBe(
      'https://images.mcc-cal.com/nature/steel-strike-2026/260612_Strike_CAL3201.webp',
    );
    expect(group.images[0].url).not.toContain('jsdelivr');
    expect(group.images[0].url).not.toContain('src/images/Portfolios');
  });

  it('does not point the cover at a thumbnail that was never generated', () => {
    const [group] = adaptNature(manifest);

    expect(group.coverImage.url).toBe(
      'https://images.mcc-cal.com/nature/steel-strike-2026/260612_Strike_CAL3201.webp',
    );
    expect(group.coverImage.url).not.toContain('/thumbs/');
  });

  it('prefers alt_text over the caption for alt', () => {
    const [group] = adaptNature(manifest);

    // The adapter resolves alt as `alt ?? caption ?? description`, so alt_text
    // has to arrive as `alt`. Mapped to `description` it would sit behind the
    // caption and a screen reader would read the caption instead of the text
    // written to be the alt. Lightroom fills both, so they really do differ.
    expect(group.images[0].alt).toBe('A line of workers silhouetted against stacks');
    expect(group.images[0].caption).toBe('Workers outside the coke works at dawn');
  });

  it('still builds CDN paths for static collections', () => {
    const staticManifest = {
      version: '1.0.0',
      generated: '2026-09-10T00:00:00.000Z',
      totalCollections: 1,
      collections: [
        {
          collectionName: 'Wildlife',
          folderPath: 'Wildlife/Birds',
          totalImages: 1,
          images: ['CAL_0682.jpg'],
          tags: ['wildlife'],
        },
      ],
    } as unknown as NatureManifest;

    const [group] = adaptNature(staticManifest);

    expect(group.images[0].url).toContain('src/images/Portfolios/Nature/Wildlife/Birds');
    expect(group.images[0].url).toContain('CAL_0682.jpg');
  });
});
