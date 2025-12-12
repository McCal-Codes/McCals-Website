import '../styles/globals.css';
import '../styles/nav.css';
import '../styles/footer.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Register minimal service worker for offline fallback + basic caching.
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail: PWA installability should not break the site.
    });
  }, []);

  return (
    <>
      <Head>
        <title>dev.mcc-cal.com | McCal Media Development</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
