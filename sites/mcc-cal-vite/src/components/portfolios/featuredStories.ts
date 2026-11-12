import type { PortfolioGroup } from '../portfolio/types';

export const ALL = 'All';
export const FILTER_ORDER = ['Concert', 'Events', 'Journalism', 'Portraits', 'Nature'];

export function shortCategory(cat: string) {
  return cat.replace(' Photography', '');
}

// The editor's pick leads: the lowest featuredRank wins, and only when nothing is ranked does
// the newest story (the first in date order) take the first slot.
export function pickLead(groups: PortfolioGroup[]): PortfolioGroup | undefined {
  let lead: PortfolioGroup | undefined;

  for (const group of groups) {
    if (group.featuredRank === undefined) continue;
    if (!lead || group.featuredRank < (lead.featuredRank ?? Number.POSITIVE_INFINITY)) {
      lead = group;
    }
  }

  return lead ?? groups[0];
}

// The ranked pick first, then everything else in the order given (newest first).
export function orderFeatured(groups: PortfolioGroup[]): PortfolioGroup[] {
  const lead = pickLead(groups);
  if (!lead) return [];

  return [lead, ...groups.filter((group) => group.id !== lead.id)];
}
