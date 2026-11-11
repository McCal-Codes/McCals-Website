import { describe, expect, it, vi } from 'vitest';

vi.mock('@/content/portraitCuration', () => ({
  portraitKeep: { Listed: ['b.jpg'], Hidden: [] },
}));

import { adaptPortraits } from './portraits-adapter';

function album(albumName: string, images: string[]) {
  return {
    albumName,
    folderPath: `Studio/${albumName}`,
    totalImages: images.length,
    images,
    tags: [],
  };
}

describe('adaptPortraits curation', () => {
  it('keeps listed frames, hides empty lists, and leaves unlisted albums whole', () => {
    const groups = adaptPortraits({
      version: '1',
      generated: '2026-11-11T00:00:00.000Z',
      totalCollections: 1,
      totalImages: 6,
      collections: [
        {
          collectionName: 'Studio',
          folderPath: 'Studio',
          totalImages: 6,
          images: [],
          tags: [],
          albums: [
            album('Listed', ['Listed/a.jpg', 'Listed/b.jpg']),
            album('Hidden', ['Hidden/c.jpg']),
            album('Other', ['Other/d.jpg', 'Other/e.jpg']),
          ],
        },
      ],
    });

    const byTitle = Object.fromEntries(
      groups.map((g) => [g.title, g.images.map((i) => i.filename)]),
    );
    expect(byTitle.Listed).toEqual(['b.jpg']);
    expect(byTitle.Hidden).toBeUndefined();
    expect(byTitle.Other).toEqual(['d.jpg', 'e.jpg']);
  });
});
