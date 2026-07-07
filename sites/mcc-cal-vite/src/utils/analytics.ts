import { track } from '@vercel/analytics/react';

const isProduction = import.meta.env.PROD;

// Both @vercel/analytics and @vercel/speed-insights auto-detect the Vercel runtime
// and are no-ops when running outside Vercel (local builds, CI). Only gate on PROD
// so events are suppressed in dev without disabling the components entirely.
export function isWebsiteAnalyticsEnabled(): boolean {
  return isProduction;
}

export function isSpeedInsightsEnabled(): boolean {
  return isProduction;
}

export function trackWebsiteEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isProduction) {
    return;
  }

  track(eventName, payload);
}
