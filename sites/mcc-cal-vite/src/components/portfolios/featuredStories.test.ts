import { describe, expect, it } from 'vitest';
import type { PortfolioGroup } from '../portfolio/types';
import { ALL, getFeaturedStories, pickLead } from './featuredStories';

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

describe('getFeaturedStories', () => {
  const groups = [
    group('new', 'Journalism Photography'),
    group('show', 'Concert Photography', 1),
    group('party', 'Events Photography'),
    group('extra', 'Concert Photography'),
  ];

  it('leads with the ranked story and adds one from each other category', () => {
    expect(getFeaturedStories(groups, ALL).map((g) => g.id)).toEqual(['show', 'party', 'new']);
  });

  it('keeps the ranked lead first in a filtered view', () => {
    const concerts = groups.filter((g) => g.category === 'Concert Photography');
    expect(getFeaturedStories(concerts, 'Concert').map((g) => g.id)).toEqual(['show', 'extra']);
  });
});
