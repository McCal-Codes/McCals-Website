import { describe, expect, it } from 'vitest';
import { describeImage } from './altText';

describe('describeImage', () => {
  it('names the shoot, kind, photographer, date, and position', () => {
    expect(
      describeImage({
        title: 'Star Viper',
        kind: 'concert',
        index: 2,
        total: 24,
        date: 'December 2025',
      }),
    ).toBe('Star Viper, concert photo 3 of 24 by Caleb McCartney, December 2025');
  });

  it('leaves out the position for a single photo and the date when unknown', () => {
    expect(describeImage({ title: 'Flowers & Plants', kind: 'nature', index: 0, total: 1 })).toBe(
      'Flowers & Plants, nature photo by Caleb McCartney',
    );
  });

  it('adds the people listed for the shoot', () => {
    expect(describeImage({ title: 'Heading North', kind: 'concert', index: 0 })).toContain(
      'Heading North (Asha Edson,',
    );
  });
});
