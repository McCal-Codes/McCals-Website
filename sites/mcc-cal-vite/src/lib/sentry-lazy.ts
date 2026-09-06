/**
 * Keeps the Sentry SDK out of the critical path.
 *
 * The SDK is ~57 kB gzip. Importing it synchronously from `main.tsx` meant every
 * visitor downloaded and parsed it before the first paint on a client-rendered
 * SPA. Nothing here statically imports `@sentry/react`, so the SDK lands in an
 * async chunk that is fetched once the page is idle.
 *
 * Errors thrown before the SDK finishes loading are not lost: they are queued
 * here and replayed into Sentry as soon as it is ready.
 */

import { getSentryBrowserConfig } from './sentry-config';

type QueuedError = {
  error: unknown;
  context?: Record<string, unknown>;
};

/**
 * Whether Sentry is configured at all. `sentry-config` is a few pure functions with
 * no dependency on the SDK, so consulting it here is free, and it lets us skip
 * downloading ~98 kB of SDK entirely when there is no DSN (local preview, forks,
 * any build without Sentry env vars).
 */
const sentryEnabled = getSentryBrowserConfig(import.meta.env) !== null;

/** Bounded so a boot-time error loop cannot grow this without limit. */
const MAX_QUEUED_ERRORS = 20;

let queue: QueuedError[] = [];
let sentry: typeof import('@sentry/react') | null = null;
let loading: Promise<void> | null = null;
let pendingRouteName: string | null = null;

/**
 * Names the current transaction after a route pattern (`/blog/[slug]`) rather than
 * a concrete URL, so Sentry does not see one transaction per blog post.
 *
 * This replaces what `wrapCreateBrowserRouterV6` used to do. That wrapper had to be
 * called at module scope to build the router, which forced the whole SDK into the
 * entry chunk, the exact cost this module exists to avoid. Route names are set
 * here instead, from the same helper Speed Insights already uses.
 *
 * Calls made before the SDK loads are held and applied once it is ready.
 */
export function setRouteName(route: string) {
  if (!sentryEnabled) return;

  if (!sentry) {
    pendingRouteName = route;
    return;
  }

  try {
    sentry.getCurrentScope().setTransactionName(route);
  } catch {
    // Naming is cosmetic; never let it break navigation.
  }
}

/**
 * Records an exception. Before the SDK loads this queues; afterwards it forwards
 * straight through. Safe to call at any point in the page lifecycle.
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!sentryEnabled) return;

  if (sentry) {
    sentry.captureException(error, context ? { contexts: { react: context } } : undefined);
    return;
  }

  if (queue.length < MAX_QUEUED_ERRORS) {
    queue.push({ error, context });
  }
}

function drainQueue() {
  if (!sentry) return;

  const pending = queue;
  queue = [];
  for (const { error, context } of pending) {
    sentry.captureException(error, context ? { contexts: { react: context } } : undefined);
  }
}

/**
 * Loads and initializes the SDK, then replays anything captured while it was in
 * flight. Idempotent, concurrent callers share one load.
 */
export function loadSentry(): Promise<void> {
  if (loading) return loading;

  if (!sentryEnabled) {
    queue = [];
    loading = Promise.resolve();
    return loading;
  }

  loading = (async () => {
    try {
      const [sdk, { initSentry }] = await Promise.all([
        import('@sentry/react'),
        import('../instrument'),
      ]);
      initSentry();
      sentry = sdk;
      drainQueue();
      if (pendingRouteName) {
        setRouteName(pendingRouteName);
        pendingRouteName = null;
      }
    } catch {
      // Telemetry is best-effort. Drop the queue rather than retry: a failed
      // chunk fetch is usually offline or a stale deploy, and neither is fixed
      // by trying again on the same page load.
      queue = [];
    }
  })();

  return loading;
}

/**
 * Installs global handlers immediately so boot-time failures are captured even
 * though the SDK is not loaded yet, then schedules the SDK load for after first
 * paint. Call once, as early as possible.
 */
export function installErrorBufferAndDeferSentry() {
  if (!sentryEnabled) return;

  const onError = (event: ErrorEvent) => {
    captureError(event.error ?? new Error(event.message));
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    captureError(event.reason ?? new Error('Unhandled promise rejection'));
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  const start = () => {
    // Once the SDK installs its own global handlers, ours would double-report.
    loadSentry().finally(() => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    });
  };

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }
}
