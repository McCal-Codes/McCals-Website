/**
 * Single source of truth for public static route discoverability.
 * Keep this file in sync with route component keys in `App.tsx`.
 */
export const STATIC_PAGE_ROUTES = [
  { path: '/', routeKey: 'home', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', routeKey: 'about', changefreq: 'monthly', priority: '0.9' },
  { path: '/contact-us', routeKey: 'contactUs', changefreq: 'monthly', priority: '0.8' },
  { path: '/request-a-quote', routeKey: 'requestAQuote', changefreq: 'monthly', priority: '0.8' },
  { path: '/featured-work', routeKey: 'featuredWork', changefreq: 'weekly', priority: '0.9' },
  { path: '/letting-me-go', routeKey: 'lettingMeGo', changefreq: 'monthly', priority: '0.75' },
  { path: '/journalism', routeKey: 'journalism', changefreq: 'weekly', priority: '0.8' },
  { path: '/portraits', routeKey: 'portraits', changefreq: 'monthly', priority: '0.8' },
  { path: '/nature', routeKey: 'nature', changefreq: 'monthly', priority: '0.7' },
  { path: '/events', routeKey: 'events', changefreq: 'weekly', priority: '0.8' },
  { path: '/concerts', routeKey: 'concerts', changefreq: 'weekly', priority: '0.7' },
  { path: '/blog', routeKey: 'blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/authors', routeKey: 'authors', changefreq: 'monthly', priority: '0.6' },
  { path: '/authors/mccal', routeKey: 'authors', changefreq: 'monthly', priority: '0.6' },
  { path: '/podcast', routeKey: 'podcast', changefreq: 'weekly', priority: '0.7' },
  { path: '/book-a-podcast', routeKey: 'bookPodcast', changefreq: 'monthly', priority: '0.7' },
  { path: '/grab-a-coffee', routeKey: 'grabCoffee', changefreq: 'monthly', priority: '0.7' },
  { path: '/faq', routeKey: 'faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/projects', routeKey: 'projects', changefreq: 'monthly', priority: '0.6' },
  { path: '/terranova', routeKey: 'terranova', changefreq: 'monthly', priority: '0.5' },
  { path: '/accessibility', routeKey: 'accessibility', changefreq: 'yearly', priority: '0.3' },
  { path: '/policies-legal', routeKey: 'policiesLegal', changefreq: 'yearly', priority: '0.3' },
];

export const SITEMAP_STATIC_PATHS = STATIC_PAGE_ROUTES.map((route) => route.path);
