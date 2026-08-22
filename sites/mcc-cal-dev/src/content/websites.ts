import type { Website } from './types';

/**
 * Sites built for other people.
 *
 * Separate from PROJECTS on purpose. A product is judged by its source; a website
 * is judged by being live and looking right. Two of these have no repository at
 * all, which is normal for hosted platforms and not a gap to apologise for.
 *
 * Live title, description, preview image, and reachability come from
 * `sites.json` via `websites` in `sites.ts`. Only the fields below are written by
 * hand, because nothing can crawl them.
 */

/**
 * Sentinel for a role Caleb has not stated yet.
 *
 * Credit is the one claim a portfolio must never guess at, so an unconfirmed role
 * renders as nothing rather than as a plausible-sounding default.
 */
export const ROLE_PENDING = '__ROLE_PENDING__';

export const WEBSITES: Website[] = [
  {
    index: '01',
    slug: 'courtroom-kyle',
    name: 'Courtroom Kyle',
    url: 'https://www.courtroomkyle.com/',
    purpose: 'A Supreme Court and legal news blog.',
    role: ROLE_PENDING,
    platform: 'Wix',
    year: '2026',
  },
  {
    index: '02',
    slug: 'allegheny-hyp-club',
    name: 'The Allegheny HYP Club',
    url: 'https://allegheny-hyp-club.vercel.app',
    purpose: 'A private club in Pittsburgh.',
    role: ROLE_PENDING,
    platform: 'React / TypeScript',
    repoSlug: 'allegheny-hyp-club',
    year: '2026',
  },
  {
    index: '03',
    slug: 'divine-eyth',
    name: 'Divine Eyth',
    url: '',
    purpose: 'A personal site for a musician.',
    role: ROLE_PENDING,
    platform: 'React / TypeScript / Vite',
    repoSlug: 'divine-eyth',
    year: '2026',
  },
];

export function hasRole(site: Website): boolean {
  return site.role !== ROLE_PENDING && site.role.trim().length > 0;
}
