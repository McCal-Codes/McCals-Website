/**
 * Cookie consent, shared by the accessibility page's controls and the
 * analytics bootstrap.
 *
 * The preferences were previously written to localStorage by the accessibility
 * page and read by nothing at all: GA4 and Vercel Analytics loaded regardless,
 * so "Reject all" changed nothing while being presented as a working control.
 *
 * Default when no choice has been recorded is *granted*. That is a deliberate
 * decision, not an oversight: the consent UI lives only on the accessibility
 * page and there is no site-wide banner, so defaulting to denied would silence
 * analytics for every visitor who never opens that page. Serving EU visitors
 * properly requires a banner and an opt-in default — see the accessibility
 * statement issue.
 */

/** Written by the accessibility page. Shape: { essential: true, analytics: bool, ... } */
const CONSENT_KEY = 'mccal_cookie_consent';
const ANALYTICS_CATEGORY = 'analytics';

export type ConsentPreferences = Record<string, boolean>;

type ConsentListener = (granted: boolean) => void;

const listeners = new Set<ConsentListener>();

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    // Private windows and locked-down browser settings throw on access.
    return null;
  }
}

export function readConsentPreferences(): ConsentPreferences | null {
  const raw = safeStorage()?.getItem(CONSENT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ConsentPreferences) : null;
  } catch {
    return null;
  }
}

/**
 * True unless the visitor has explicitly turned analytics off. Absent or
 * unreadable preferences count as granted — see the note above.
 */
export function hasAnalyticsConsent(): boolean {
  const preferences = readConsentPreferences();
  if (!preferences) return true;
  return preferences[ANALYTICS_CATEGORY] !== false;
}

/**
 * Called by the accessibility page after preferences change, so a decision
 * takes effect immediately rather than on the next page load.
 */
export function notifyConsentChanged(): void {
  const granted = hasAnalyticsConsent();
  for (const listener of listeners) listener(granted);
}

export function onConsentChange(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
