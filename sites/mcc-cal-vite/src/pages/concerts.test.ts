import { describe, expect, it } from 'vitest';
import { adaptConcerts } from './concerts-adapter';

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
    expect(groups[0]?.coverImage.url).toContain('/Concert/Star Viper/October 2025/star-viper-1.jpg');
    expect(groups[1]).toMatchObject({
      title: 'Star Viper',
      dateDisplay: 'December 2025',
      dateISO: '2025-12-08',
      category: 'Concert',
    });
    expect(groups[1]?.images).toHaveLength(2);
    expect(groups[0]?.id).not.toBe(groups[1]?.id);
  });
});
