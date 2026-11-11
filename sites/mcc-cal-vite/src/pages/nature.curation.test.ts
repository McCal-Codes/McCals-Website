import { describe, expect, it, vi } from 'vitest';

vi.mock('@/content/natureCuration', () => ({
  natureKeep: { Listed: ['b.jpg'], Hidden: [] },
}));

import { adaptNature } from './nature-adapter';

function item(collectionName: string, images: string[]) {
  return {
    collectionName,
    folderPath: `Wildlife/${collectionName}`,
    totalImages: images.length,
    images,
    tags: [],
  };
}

describe('adaptNature curation', () => {
  it('keeps listed frames, hides empty lists, and leaves unlisted collections whole', () => {
    const groups = adaptNature({
      version: '1',
      generated: '2026-11-11T00:00:00.000Z',
      totalCollections: 3,
      collections: [
        item('Listed', ['a.jpg', 'b.jpg']),
        item('Hidden', ['c.jpg']),
        item('Other', ['d.jpg', 'e.jpg']),
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
