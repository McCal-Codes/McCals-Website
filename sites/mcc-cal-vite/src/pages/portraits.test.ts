import { describe, expect, it } from 'vitest';
import { adaptPortraits } from './portraits-adapter';

describe('adaptPortraits', () => {
  it('flattens portrait albums into session cards with category metadata', () => {
    const groups = adaptPortraits({
      version: '1',
      generated: '2026-05-14T00:00:00.000Z',
      totalCollections: 1,
      totalImages: 2,
      collections: [
        {
          collectionName: 'Studio',
          folderPath: 'Studio',
          totalImages: 2,
          images: ['Jordan/250425_jordan_001.jpg', 'Jordan/250425_jordan_002.jpg'],
          tags: ['portrait', 'studio', 'professional'],
          albums: [
            {
              albumName: 'Jordan',
              folderPath: 'Studio/Jordan',
              totalImages: 2,
              images: ['Jordan/250425_jordan_001.jpg', 'Jordan/250425_jordan_002.jpg'],
              tags: ['portrait', 'editorial', 'creative portrait'],
              imageMetadata: {
                '250425_jordan_002.jpg': {
                  caption:
                    'Jordan poses for a studio portrait in Pittsburgh, Pa., April 25, 2025. (Photo by Caleb McCartney)',
                  description: 'A studio portrait of Jordan against a clean backdrop.',
                  alt: 'Jordan poses for a studio portrait.',
                },
              },
            },
          ],
          looseImages: [],
        },
      ],
    });

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      title: 'Jordan',
      category: 'Studio',
      dateDisplay: 'April 2025',
      dateISO: '2025-04',
      tags: ['editorial', 'creative portrait'],
    });
    expect(groups[0]?.coverImage.url).toContain('/Portrait/Studio/Jordan/250425_jordan_001.jpg');
    expect(groups[0]?.images[1]).toMatchObject({
      alt: 'Jordan poses for a studio portrait.',
      caption:
        'Jordan poses for a studio portrait in Pittsburgh, Pa., April 25, 2025. (Photo by Caleb McCartney)',
      description: 'A studio portrait of Jordan against a clean backdrop.',
    });
  });
});
