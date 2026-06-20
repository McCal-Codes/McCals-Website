import { inject } from '@vercel/analytics';
import { track } from '@vercel/analytics/react';

const isProduction = import.meta.env.PROD;
const isVercelRuntime = ['preview', 'production'].includes(import.meta.env.VITE_VERCEL_ENV ?? '');

export function isWebsiteAnalyticsEnabled(): boolean {
  return isProduction && import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS === 'true';
}

export function isSpeedInsightsEnabled(): boolean {
  return (
    isProduction &&
    isVercelRuntime &&
    import.meta.env.VITE_ENABLE_VERCEL_SPEED_INSIGHTS !== 'false'
  );
}

export function injectWebsiteAnalytics(): void {
  if (isWebsiteAnalyticsEnabled()) {
    inject();
  }
}

export function trackWebsiteEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isWebsiteAnalyticsEnabled()) {
    return;
  }

  track(eventName, payload);
}
