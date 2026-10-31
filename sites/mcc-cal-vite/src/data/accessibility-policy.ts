/**
 * Policy data published on /accessibility, kept out of the page component so
 * it can be imported by the test that checks it against the code, without
 * breaking fast refresh on the page itself.
 */

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieInfo[];
}

export interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

// Prefers reduced motion check
/**
 * What this site actually stores. The previous inventory listed mccal_session,
 * mccal_consent and mccal_theme, none of which exist anywhere in the codebase.
 * This site sets no cookies of its own at all - a grep for `document.cookie`
 * returns nothing - so everything below under "McCal Media" is a localStorage
 * entry, which is why each one lives until the visitor clears site data rather
 * than expiring on a schedule. Only Google Analytics sets real cookies, and only
 * once analytics consent has been granted.
 *
 * Keep this in step with the keys the code writes. If a new key is added, it
 * belongs here.
 */
export const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Required for the website to function properly. Cannot be disabled.',
    required: true,
    cookies: [
      { name: 'mccal_cookie_consent', provider: 'McCal Media', purpose: 'Stores your cookie and analytics choices', duration: 'Local storage, until cleared' },
      { name: 'mccal_consent_date', provider: 'McCal Media', purpose: 'Records when those choices were made', duration: 'Local storage, until cleared' },
    ],
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'Enable enhanced functionality and personalization.',
    required: false,
    cookies: [
      { name: 'mcc-theme', provider: 'McCal Media', purpose: 'Remembers your light or dark theme preference', duration: 'Local storage, until cleared' },
      { name: 'mcc_quote_draft_v2', provider: 'McCal Media', purpose: 'Keeps an unfinished quote request so it survives a reload', duration: 'Local storage, until submitted or cleared' },
      { name: 'podcast-feed-v2.5', provider: 'McCal Media', purpose: 'Caches the podcast episode list so it loads quickly', duration: 'Local storage, until cleared' },
      { name: 'dev-site-changelog', provider: 'McCal Media', purpose: 'Holds the entries shown on the changelog page', duration: 'Local storage, until cleared' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website. Set only if you allow analytics.',
    required: false,
    cookies: [
      { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguish unique users', duration: '2 years' },
      { name: '_ga_<id>', provider: 'Google Analytics', purpose: 'Keep session state for this property', duration: '2 years' },
    ],
  },
];

/**
 * Pinned on purpose. This used to be `new Date()`, so the page told every
 * visitor it had been assessed that same day, forever - a conformance claim that
 * is always current is not a claim at all. Bump this by hand when the site is
 * genuinely reviewed, and note what changed in the changelog.
 */
export const LAST_REVIEWED = '2026-09-06';

/**
 * Formatted with an explicit locale and time zone rather than the visitor's, so
 * the rendered date matches the machine-readable one in the `datetime`
 * attribute. Parsed at midday UTC because a bare date parsed in a negative
 * offset lands on the previous day.
 */
export const LAST_REVIEWED_DISPLAY = new Date(`${LAST_REVIEWED}T12:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  timeZone: 'UTC',
});
