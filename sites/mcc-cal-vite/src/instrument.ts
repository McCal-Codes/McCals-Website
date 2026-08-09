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

const sentryConfig = getSentryBrowserConfig(import.meta.env);

if (sentryConfig) {
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

  // Session Replay pulls in rrweb, the single largest dependency in the app
  // (~72 kB gzip). Listing it in `integrations` above puts it in the entry chunk,
  // where it blocks first paint. Loading it through a dynamic import instead lets
  // Rollup split it into its own async chunk, fetched once the page is idle.
  //
  // Imported from '@sentry/replay' rather than '@sentry/react' on purpose: the
  // latter is already in the static graph, so a dynamic import of it resolves to
  // the same module and Rollup has nothing to split off. '@sentry/replay' is only
  // reachable from here, so it gets its own chunk. It ships as part of the SDK and
  // is pinned to the same version as @sentry/react in package.json.
  //
  // Deliberately not `lazyLoadIntegration()`: that fetches from Sentry's CDN, and
  // the `script-src` CSP in vercel.json only allows 'self', vercel.live, and
  // va.vercel-scripts.com. It would be blocked in production.
  const loadReplay = () => {
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
  };

  if (document.readyState === 'complete') {
    loadReplay();
  } else {
    window.addEventListener('load', loadReplay, { once: true });
  }
}
