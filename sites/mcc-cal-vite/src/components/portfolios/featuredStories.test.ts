import { describe, expect, it } from 'vitest';
import type { PortfolioGroup } from '../portfolio/types';
import { orderFeatured, pickLead } from './featuredStories';

function group(id: string, category: string, featuredRank?: number): PortfolioGroup {
  const image = { url: `${id}.jpg`, filename: `${id}.jpg`, alt: id };
  return { id, title: id, category, featuredRank, images: [image], coverImage: image };
}

describe('pickLead', () => {
  it('prefers the lowest featuredRank over date order', () => {
    const groups = [
      group('new', 'Journalism Photography'),
      group('b', 'Concert Photography', 3),
      group('a', 'Concert Photography', 1),
    ];
    expect(pickLead(groups)?.id).toBe('a');
  });

  it('falls back to the newest story when nothing is ranked', () => {
    const groups = [group('new', 'Journalism Photography'), group('old', 'Concert Photography')];
    expect(pickLead(groups)?.id).toBe('new');
  });

  it('returns undefined for no stories', () => {
    expect(pickLead([])).toBeUndefined();
  });
});

describe('orderFeatured', () => {
  it('puts the ranked pick first and keeps the rest in the given order', () => {
    const groups = [
      group('new', 'Journalism Photography'),
      group('show', 'Concert Photography', 1),
      group('party', 'Events Photography'),
    ];
    expect(orderFeatured(groups).map((g) => g.id)).toEqual(['show', 'new', 'party']);
  });

  it('returns an empty list for no stories', () => {
    expect(orderFeatured([])).toEqual([]);
  });
});
