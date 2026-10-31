import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasAnalyticsConsent,
  notifyConsentChanged,
  onConsentChange,
  readConsentPreferences,
} from '@/lib/consent';

const CONSENT_KEY = 'mccal_cookie_consent';

/**
 * The accessibility page wrote these preferences and nothing read them, so
 * "Reject all" was decorative while GA4 and Vercel Analytics loaded regardless.
 * These assertions are the contract that keeps the control real.
 */
describe('analytics consent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('treats an explicit rejection as denial', () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, functional: true, analytics: false }),
    );
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('treats an explicit acceptance as consent', () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, functional: true, analytics: true }),
    );
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('defaults to granted when no choice has been recorded', () => {
    // Deliberate: the consent UI lives only on the accessibility page and there
    // is no site-wide banner, so denying by default would silence analytics for
    // every visitor who never opens that page.
    expect(readConsentPreferences()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('does not treat unrelated categories as an analytics decision', () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, functional: false }),
    );
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('survives corrupt stored preferences rather than throwing', () => {
    window.localStorage.setItem(CONSENT_KEY, 'not json at all');
    expect(readConsentPreferences()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('notifies subscribers so a decision applies without a reload', () => {
    const listener = vi.fn();
    const unsubscribe = onConsentChange(listener);

    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: false }));
    notifyConsentChanged();
    expect(listener).toHaveBeenCalledWith(false);

    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true }));
    notifyConsentChanged();
    expect(listener).toHaveBeenCalledWith(true);

    unsubscribe();
    notifyConsentChanged();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
