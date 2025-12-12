import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="McCal Media Development Site - Full-featured Next.js site mirroring mcc-cal.com production with widget integration and API connectivity"
        />
        <meta name="author" content="McCal Media" />

        {/* PWA / iOS installability */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b0d10" />
        <meta name="application-name" content="McCal Media" />

        {/* iOS-specific PWA meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="McCal Media" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {/* Fonts - Libre Baskerville for branding consistency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body data-theme="dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
