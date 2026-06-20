import './instrument';
import './styles/globals.css';
import './styles/nav.css';
import './styles/footer.css';
import '@/components/portfolio/portfolio-global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { injectWebsiteAnalytics, isSpeedInsightsEnabled } from '@/utils/analytics';

injectWebsiteAnalytics();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Apply persisted theme from localStorage before paint
try {
  const t = localStorage.getItem('mcc-theme');
  if (t === 'light' || t === 'dark') {
    document.body.setAttribute('data-theme', t);
  }
} catch {
  // localStorage can be unavailable in restricted browser contexts.
}

ReactDOM.createRoot(document.getElementById('root')!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {isSpeedInsightsEnabled() && <SpeedInsights />}
    </QueryClientProvider>
  </React.StrictMode>,
);
