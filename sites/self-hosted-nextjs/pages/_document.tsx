import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="McCal Media Development Site - Full-featured Next.js site mirroring mcc-cal.com production with widget integration and API connectivity" />
        <meta name="author" content="McCal Media" />
        <link rel="icon" href="/favicon.ico" />
        
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
