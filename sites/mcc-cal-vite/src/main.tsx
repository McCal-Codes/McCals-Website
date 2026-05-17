import './styles/globals.css';
import './styles/nav.css';
import './styles/footer.css';
import '@/components/portfolio/portfolio-global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { inject } from '@vercel/analytics';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';

const isVercelRuntime = import.meta.env.VITE_VERCEL_ENV !== 'development';

// Initialize Vercel Analytics for route tracking
if (isVercelRuntime) {
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {isVercelRuntime && <SpeedInsights />}
    </QueryClientProvider>
  </React.StrictMode>,
);
