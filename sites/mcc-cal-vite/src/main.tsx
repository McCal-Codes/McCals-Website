import './styles/globals.css';
import './styles/nav.css';
import './styles/footer.css';
import '@/components/portfolio/portfolio-global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { inject } from '@vercel/analytics';
import App from './App';
import { captureError, installErrorBufferAndDeferSentry } from '@/lib/sentry-lazy';

// Buffers errors immediately and loads the Sentry SDK after first paint, so its
// ~57 kB gzip is not in the critical path. Must run before anything that can throw.
installErrorBufferAndDeferSentry();

const enableVercelAnalytics = import.meta.env.PROD && import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS === 'true';

// Initialize Vercel Analytics for route tracking
if (enableVercelAnalytics) {
  inject();
}

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
  onUncaughtError: (error) => captureError(error),
  onRecoverableError: (error) => captureError(error),
}).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
