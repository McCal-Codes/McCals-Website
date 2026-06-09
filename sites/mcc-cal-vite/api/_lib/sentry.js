import * as Sentry from '@sentry/node';

let initialized = false;

function readSampleRate(value, fallback) {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(1, Math.max(0, parsed));
}

export function initSentry() {
  const dsn = process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;

  if (!dsn || initialized) {
    return Boolean(dsn);
  }

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
    release: process.env.VERCEL_GIT_COMMIT_SHA
      ? `mcc-cal-vite@${process.env.VERCEL_GIT_COMMIT_SHA}`
      : undefined,
    tracesSampleRate: readSampleRate(process.env.SENTRY_SERVER_TRACES_SAMPLE_RATE, 0.1),
  });

  initialized = true;
  return true;
}

export function captureApiException(error, context = {}) {
  if (!initSentry()) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context.route) {
      scope.setTag('api.route', context.route);
    }
    if (context.operation) {
      scope.setTag('api.operation', context.operation);
    }
    scope.setContext('api', context);
    Sentry.captureException(error);
  });
}
