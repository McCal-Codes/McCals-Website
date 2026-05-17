/**
 * React Query hooks for podcast data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { FALLBACK } from './constants';
import { fetchFeed, getCached, setCache } from './utils';

// Query keys
export const podcastKeys = {
  all: ['podcast'] as const,
  feed: () => [...podcastKeys.all, 'feed'] as const,
};

// React Query hook for podcast feed
export function usePodcastFeed() {
  return useQuery({
    queryKey: podcastKeys.feed(),
    queryFn: async () => {
      const episodes = await fetchFeed();
      setCache(episodes);
      return episodes;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    placeholderData: () => {
      // Render cached or fallback episodes while the live feed request hydrates.
      return getCached() || FALLBACK;
    },
  });
}
