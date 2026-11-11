import { describe, expect, it, vi } from 'vitest';
import { adaptConcerts } from './concerts-adapter';

vi.mock('@/content/concertCuration', () => ({
  concertKeep: {
    'Concert/Listed Band/May 2025': ['b.jpg'],
    'Concert/Hidden Band/May 2025': [],
  },
}));

describe('adaptConcerts', () => {
  it('keeps each show as its own card while preserving concert metadata', () => {
    const groups = adaptConcerts({
      bands: [
        {
          bandName: 'Star Viper',
          relativeFolderPath: 'Concert/Star Viper/October 2025',
          dateDisplay: 'October 2025',
          concertDate: { iso: '2025-10-12' },
          totalImages: 3,
          images: ['star-viper-1.jpg', 'star-viper-2.jpg', 'star-viper-3.jpg'],
        },
        {
          bandName: 'Star Viper',
          relativeFolderPath: 'Concert/Star Viper/December 2025',
          dateDisplay: 'December 2025',
          concertDate: { iso: '2025-12-08' },
          totalImages: 2,
          images: ['star-viper-dec-1.jpg', 'star-viper-dec-2.jpg'],
        },
      ],
    });

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      title: 'Star Viper',
      dateDisplay: 'October 2025',
      dateISO: '2025-10-12',
      category: 'Concert',
    });
    expect(groups[0]?.coverImage.url).toContain(
      '/Concert/Star Viper/October 2025/star-viper-1.jpg',
    );
    expect(groups[1]).toMatchObject({
      title: 'Star Viper',
      dateDisplay: 'December 2025',
      dateISO: '2025-12-08',
      category: 'Concert',
    });
    expect(groups[1]?.images).toHaveLength(2);
    expect(groups[0]?.id).not.toBe(groups[1]?.id);
  });

  it('shows only the curated frames of a listed shoot and hides empty shoots', () => {
    const band = (name: string, images: string[]) => ({
      bandName: name,
      relativeFolderPath: `Concert/${name}/May 2025`,
      totalImages: images.length,
      images,
    });
    const groups = adaptConcerts({
      bands: [
        band('Listed Band', ['a.jpg', 'b.jpg', 'c.jpg']),
        band('Hidden Band', ['x.jpg']),
        band('New Band', ['n1.jpg', 'n2.jpg']),
      ],
    });

    expect(groups.map((group) => group.title)).toEqual(['Listed Band', 'New Band']);
    expect(groups[0]?.images.map((image) => image.filename)).toEqual(['b.jpg']);
    expect(groups[1]?.images).toHaveLength(2);
  });
});
