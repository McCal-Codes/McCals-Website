type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function isGa4Enabled(): boolean {
  return import.meta.env.PROD && import.meta.env.VITE_ENABLE_GA === 'true' && Boolean(MEASUREMENT_ID);
}

let installed = false;

// Loads gtag.js and initializes GA4. send_page_view is disabled because
// RouteAnalytics already fires a page_view event per SPA navigation via
// trackWebsiteEvent - letting gtag.js's own automatic pageview through too
// would double-count the first page.
export function installGa4(): void {
  if (installed || !isGa4Enabled()) return;
  installed = true;

  window.dataLayer = window.dataLayer || [];
  const gtag: GtagFn = (...args) => {
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function gaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isGa4Enabled() || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
