import data from './sites.json';

/**
 * Live facts about the websites, pulled by `scripts/sync-sites.js` and committed.
 *
 * Read at build time, never at runtime: the site's CSP is `connect-src 'self'`,
 * and a client's site being slow should not make this one slow.
 */

export interface LiveSite {
  slug: string;
  url: string | null;
  reachable: boolean;
  status?: number;
  resolvedUrl?: string;
  title?: string | null;
  description?: string | null;
  detectedPlatform?: string | null;
  /** Local path under /public, downloaded from the site's og:image. */
  preview?: string | null;
  previewSource?: string;
  previewError?: string;
  note?: string;
  error?: string;
  checkedAt: string;
}

interface SitesData {
  generatedBy: string;
  generatedAt: string;
  sites: LiveSite[];
}

const live = data as SitesData;

export function getLiveSite(slug: string): LiveSite | undefined {
  return live.sites.find((site) => site.slug === slug);
}
