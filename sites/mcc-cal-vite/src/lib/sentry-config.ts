export interface SentryBrowserEnv {
  PROD: boolean;
  MODE: string;
  VITE_SENTRY_DSN?: string;
  VITE_SENTRY_DEBUG?: string;
  VITE_SENTRY_ENABLE_LOCAL?: string;
  VITE_SENTRY_ENABLE_LOGS?: string;
  VITE_SENTRY_SEND_DEFAULT_PII?: string;
  VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE?: string;
  VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE?: string;
  VITE_VERCEL_ENV?: string;
  VITE_VERCEL_GIT_COMMIT_SHA?: string;
}

export interface SentryBrowserConfig {
  dsn: string;
  environment: string;
  release?: string;
  sendDefaultPii: boolean;
  enableLogs: boolean;
  tracesSampleRate: number;
  tracePropagationTargets: Array<string | RegExp>;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  debug: boolean;
}

const RELEASE_PREFIX = 'mcc-cal-vite';

function readSampleRate(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(1, Math.max(0, parsed));
}

export function getSentryBrowserConfig(env: SentryBrowserEnv): SentryBrowserConfig | null {
  const dsn = env.VITE_SENTRY_DSN?.trim();
  const enableLocal = env.VITE_SENTRY_ENABLE_LOCAL === 'true';

  if (!dsn || (!env.PROD && !enableLocal)) {
    return null;
  }

  const environment = env.VITE_VERCEL_ENV || env.MODE || 'production';
  const release = env.VITE_VERCEL_GIT_COMMIT_SHA
    ? `${RELEASE_PREFIX}@${env.VITE_VERCEL_GIT_COMMIT_SHA}`
    : undefined;

  return {
    dsn,
    environment,
    release,
    sendDefaultPii: env.VITE_SENTRY_SEND_DEFAULT_PII === 'true',
    enableLogs: env.VITE_SENTRY_ENABLE_LOGS !== 'false',
    tracesSampleRate: readSampleRate(env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0.2),
    tracePropagationTargets: [
      'localhost',
      /^https?:\/\/127\.0\.0\.1(?::\d+)?\/api/,
      /^\//,
      /^https:\/\/(www\.)?mcc-cal\.com\/api/,
    ],
    replaysSessionSampleRate: readSampleRate(env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE, 0),
    replaysOnErrorSampleRate: readSampleRate(env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE, 1),
    debug: env.VITE_SENTRY_DEBUG === 'true',
  };
}
