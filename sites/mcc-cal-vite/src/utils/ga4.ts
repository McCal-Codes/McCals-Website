type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

import { hasAnalyticsConsent } from '@/lib/consent';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/** Configured to run at all: env only, independent of the visitor's choice. */
export function isGa4Configured(): boolean {
  return import.meta.env.PROD && import.meta.env.VITE_ENABLE_GA === 'true' && Boolean(MEASUREMENT_ID);
}

/**
 * Configured *and* permitted. Consent is checked on every call rather than
 * cached, so revoking it stops events immediately without a reload.
 */
export function isGa4Enabled(): boolean {
  return isGa4Configured() && hasAnalyticsConsent();
}

let installed = false;

// Loads gtag.js and initializes GA4. send_page_view is disabled because
// RouteAnalytics already fires a page_view event per SPA navigation via
// trackWebsiteEvent - letting gtag.js's own automatic pageview through too
// would double-count the first page.
export function installGa4(): void {
  if (installed || !isGa4Enabled()) return;
  installed = true;

  window.dataLayer = window.dataLayer || [];
  const gtag: GtagFn = (...args) => {
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;

  // Consent Mode v2. Google requires the default state to be declared before
  // any tag loads or updates consent — setting it later has no effect. This
  // site runs no advertising, so every ad_* signal stays denied permanently.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: hasAnalyticsConsent() ? 'granted' : 'denied',
  });

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function gaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isGa4Enabled() || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

/**
 * Applies a consent decision made after load. Installs GA4 if it was blocked
 * and has now been permitted, and otherwise tells an already-loaded tag to
 * stop or resume storing analytics data.
 */
export function applyConsentToGa4(): void {
  if (!isGa4Configured()) return;

  if (!installed) {
    installGa4();
    return;
  }

  window.gtag?.('consent', 'update', {
    analytics_storage: hasAnalyticsConsent() ? 'granted' : 'denied',
  });
}
