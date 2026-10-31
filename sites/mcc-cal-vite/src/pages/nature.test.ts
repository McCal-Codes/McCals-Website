import { describe, expect, it } from 'vitest';
import { adaptNature } from './nature-adapter';

describe('adaptNature', () => {
  it('uses prebuilt nature thumbs for card covers while keeping full-size lightbox images', () => {
    const groups = adaptNature({
      version: '1',
      generated: '2026-05-14T00:00:00.000Z',
      totalCollections: 1,
      collections: [
        {
          collectionName: 'Downtown Pittsburgh',
          folderPath: 'Landscapes/Downtown Pittsburgh',
          totalImages: 10,
          images: [
            {
              filename: '230704_Pitt_Fireworks__CAL2048.jpg',
              caption: 'Fireworks burst over Pittsburgh on Independence Day.',
              description: 'Fireworks bloom above the city skyline at night.',
              alt: 'Fireworks bloom over Pittsburgh at night.',
            },
            '230704_Pitt_Fireworks__CAL2085.jpg',
            '230704_Pitt_Fireworks__CAL2091.jpg',
            '231004_Point_Park_Sunrise_CAL4701.jpg',
            '231004_Point_Park_Sunrise_CAL4703.jpg',
            '230729_dowtown_night_market__CAL4713.jpg',
            '230828_Point Park PR_1971_CAL_Compressed.jpg',
            '240827_PPU Ad_1849_CAL_Compressed.jpg',
            'CAL_9190.jpg',
            'IMGP9168.jpg',
          ],
          tags: ['landscape'],
        },
      ],
    });

    expect(groups).toHaveLength(5);
    expect(groups[0]).toMatchObject({
      title: 'Downtown Pittsburgh, Fireworks',
      category: 'Landscapes',
      dateDisplay: 'July 2023',
      dateISO: '2023-07',
      tags: ['landscape'],
    });
    expect(groups[0]?.coverImage.url).toContain(
      '/Nature/thumbs/Landscapes/Downtown Pittsburgh/230704_Pitt_Fireworks__CAL2048.webp',
    );
    expect(groups[0]?.images[0]?.url).toContain(
      '/Nature/Landscapes/Downtown Pittsburgh/230704_Pitt_Fireworks__CAL2048.jpg',
    );
    expect(groups[0]?.images[0]).toMatchObject({
      caption: 'Fireworks burst over Pittsburgh on Independence Day.',
      description: 'Fireworks bloom above the city skyline at night.',
      alt: 'Fireworks bloom over Pittsburgh at night.',
    });
    expect(groups[1]).toMatchObject({
      title: 'Downtown Pittsburgh, Sunrise',
      category: 'Landscapes',
      dateDisplay: 'October 2023',
      dateISO: '2023-10',
      tags: ['landscape'],
    });
    expect(groups[2]).toMatchObject({
      title: 'Downtown Pittsburgh, Point Park',
      category: 'Landscapes',
      tags: ['landscape'],
    });
    expect(groups[2]?.dateDisplay).toBeUndefined();
    expect(groups[3]).toMatchObject({
      title: 'Downtown Pittsburgh, Night Market',
      category: 'Landscapes',
      dateDisplay: 'July 2023',
      dateISO: '2023-07',
      tags: ['landscape'],
    });
    expect(groups[4]).toMatchObject({
      title: 'Downtown Pittsburgh, City Selects',
      category: 'Landscapes',
      tags: ['landscape'],
    });
    expect(groups[4]?.dateDisplay).toBeUndefined();
  });

  it('maps webuse nature images to the matching prebuilt thumbnail names', () => {
    const groups = adaptNature({
      version: '1',
      generated: '2026-05-14T00:00:00.000Z',
      totalCollections: 1,
      collections: [
        {
          collectionName: 'Downtown Pittsburgh',
          folderPath: 'Landscapes/Downtown Pittsburgh',
          totalImages: 1,
          images: ['200805_Riverfront_Golden_Hour_DSC02724_1_webuse.webp'],
          tags: ['landscape'],
        },
      ],
    });

    expect(groups[0]?.coverImage.url).toContain(
      '/Nature/thumbs/Landscapes/Downtown Pittsburgh/200805_Riverfront_Golden_Hour_DSC02724_1.webp',
    );
    expect(groups[0]?.images[0]?.url).toContain(
      '/Nature/Landscapes/Downtown Pittsburgh/200805_Riverfront_Golden_Hour_DSC02724_1_webuse.webp',
    );
  });
});
