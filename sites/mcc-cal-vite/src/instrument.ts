import * as React from 'react';
import {
  addIntegration,
  init,
  reactRouterV6BrowserTracingIntegration,
} from '@sentry/react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { getSentryBrowserConfig } from './lib/sentry-config';

/**
 * Initializes Sentry. Exported rather than run on import so that nothing in the
 * critical path statically depends on this module, `lib/sentry-lazy.ts` pulls it
 * in dynamically after first paint, which keeps the SDK out of the entry chunk.
 *
 * Idempotent: repeated calls after the first are ignored.
 */
let initialized = false;

export function initSentry() {
  if (initialized) return;
  initialized = true;

  const sentryConfig = getSentryBrowserConfig(import.meta.env);
  if (!sentryConfig) return;

  init({
    ...sentryConfig,
    integrations: [
      reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
  });

  // Session Replay pulls in rrweb, the single largest dependency in the app.
  // Listing it in `integrations` above would put it in this chunk; a dynamic
  // import lets Rollup split it out and fetch it separately.
  //
  // Imported from '@sentry/replay' rather than '@sentry/react' on purpose: the
  // latter is already in this module's static graph, so a dynamic import of it
  // resolves to the same module and Rollup has nothing to split off.
  // '@sentry/replay' is only reachable from here, so it gets its own chunk. It
  // ships as part of the SDK and is pinned to the same version in package.json.
  //
  // Deliberately not `lazyLoadIntegration()`: that fetches from Sentry's CDN, and
  // the `script-src` CSP in vercel.json only allows 'self', vercel.live, and
  // va.vercel-scripts.com. It would be blocked in production.
  import('@sentry/replay')
    .then(({ replayIntegration }) => {
      addIntegration(
        replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
        }),
      );
    })
    .catch(() => {
      // Replay is best-effort telemetry; error and trace capture work without it.
    });
}
