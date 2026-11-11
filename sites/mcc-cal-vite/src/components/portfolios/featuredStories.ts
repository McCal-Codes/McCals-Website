import type { PortfolioGroup } from '../portfolio/types';

export const ALL = 'All';
export const FILTER_ORDER = ['Concert', 'Events', 'Journalism'];

export function shortCategory(cat: string) {
  return cat.replace(' Photography', '');
}

// The editor's pick leads: the lowest featuredRank wins, and only when nothing is ranked does
// the newest story (the first in date order) take the hero slot.
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

export function getFeaturedStories(
  groups: PortfolioGroup[],
  activeFilter: string,
): PortfolioGroup[] {
  const lead = pickLead(groups);
  if (!lead) {
    return [];
  }

  if (activeFilter !== ALL) {
    return [lead, ...groups.filter((group) => group.id !== lead.id)].slice(0, 3);
  }

  const selected = [lead];
  const selectedIds = new Set([lead.id]);
  const leadCategory = shortCategory(lead.category ?? '');

  for (const category of FILTER_ORDER) {
    if (category === leadCategory) continue;

    const story = groups.find(
      (group) => !selectedIds.has(group.id) && shortCategory(group.category ?? '') === category,
    );

    if (story) {
      selected.push(story);
      selectedIds.add(story.id);
    }

    if (selected.length === 3) {
      return selected;
    }
  }

  for (const group of groups) {
    if (!selectedIds.has(group.id)) {
      selected.push(group);
      selectedIds.add(group.id);
    }

    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}
