import '../styles/globals.css';
import '../styles/nav.css';
import '../styles/footer.css';
import '../styles/abridged.css';
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
        <title>McCal Media | Photography &amp; Photojournalism</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Default OG tags — overridden per-page */}
        <meta property="og:site_name" content="McCal Media" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mcc-cal.com/brand/logo-mark.svg" />
        {/* TODO: replace og:image with a proper 1200×630 JPG once created */}
        {/* Default Twitter Card tags — overridden per-page */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mcc_cal" />
        <meta name="twitter:image" content="https://mcc-cal.com/brand/logo-mark.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
