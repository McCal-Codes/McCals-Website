import { describe, expect, it } from 'vitest';
import { getSentryBrowserConfig } from './sentry-config';

describe('getSentryBrowserConfig', () => {
  it('does not enable Sentry without a DSN', () => {
    expect(
      getSentryBrowserConfig({
        PROD: true,
        MODE: 'production',
        VITE_VERCEL_ENV: 'production',
      }),
    ).toBeNull();
  });

  it('does not enable Sentry for local development by default', () => {
    expect(
      getSentryBrowserConfig({
        PROD: false,
        MODE: 'development',
        VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
      }),
    ).toBeNull();
  });

  it('builds a privacy-first production config when a DSN is available', () => {
    expect(
      getSentryBrowserConfig({
        PROD: true,
        MODE: 'production',
        VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
        VITE_VERCEL_ENV: 'preview',
        VITE_VERCEL_GIT_COMMIT_SHA: 'abc123',
      }),
    ).toMatchObject({
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'preview',
      release: 'mcc-cal-vite@abc123',
      sendDefaultPii: false,
      enableLogs: true,
      tracesSampleRate: 0.2,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1,
    });
  });

  it('allows local verification to opt into full tracing and PII explicitly', () => {
    expect(
      getSentryBrowserConfig({
        PROD: false,
        MODE: 'development',
        VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
        VITE_SENTRY_ENABLE_LOCAL: 'true',
        VITE_SENTRY_SEND_DEFAULT_PII: 'true',
        VITE_SENTRY_TRACES_SAMPLE_RATE: '1.0',
      }),
    ).toMatchObject({
      sendDefaultPii: true,
      tracesSampleRate: 1,
    });
  });
});
