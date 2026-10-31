import { track } from '@vercel/analytics/react';
import { gaEvent, isGa4Enabled } from './ga4';
import { hasAnalyticsConsent } from '@/lib/consent';

const isProduction = import.meta.env.PROD;

// Both @vercel/analytics and @vercel/speed-insights auto-detect the Vercel runtime
// and are no-ops when running outside Vercel (local builds, CI). Only gate on PROD
// so events are suppressed in dev without disabling the components entirely.
//
// Consent is checked per call rather than captured once, so a visitor who turns
// analytics off stops being measured immediately.
export function isWebsiteAnalyticsEnabled(): boolean {
  return isProduction && hasAnalyticsConsent();
}

export function isSpeedInsightsEnabled(): boolean {
  return isProduction;
}

export function trackWebsiteEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isProduction || !hasAnalyticsConsent()) {
    return;
  }

  track(eventName, payload);

  if (isGa4Enabled()) {
    gaEvent(eventName, payload);
  }
}
