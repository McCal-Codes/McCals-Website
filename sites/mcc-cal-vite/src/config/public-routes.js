/**
 * Single source of truth for public static route discoverability.
 * Keep this file in sync with route component keys in `App.tsx`.
 */
export const STATIC_PAGE_ROUTES = [
  { path: '/', routeKey: 'home', seoKey: 'home', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', routeKey: 'about', seoKey: 'about', changefreq: 'monthly', priority: '0.9' },
  {
    path: '/contact-us',
    routeKey: 'contactUs',
    seoKey: 'contactUs',
    changefreq: 'monthly',
    priority: '0.8',
    redirectFrom: ['/contact'],
  },
  {
    path: '/request-a-quote',
    routeKey: 'requestAQuote',
    seoKey: 'requestAQuote',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/featured-work',
    routeKey: 'featuredWork',
    seoKey: 'featuredWork',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/letting-me-go',
    routeKey: 'lettingMeGo',
    seoKey: 'lettingMeGo',
    changefreq: 'monthly',
    priority: '0.75',
    redirectFrom: ['/one-nation-divided'],
  },
  {
    path: '/journalism',
    routeKey: 'journalism',
    seoKey: 'journalism',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/portraits',
    routeKey: 'portraits',
    seoKey: 'portraits',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/nature',
    routeKey: 'nature',
    seoKey: 'nature',
    changefreq: 'monthly',
    priority: '0.7',
  },
  { path: '/events', routeKey: 'events', seoKey: 'events', changefreq: 'weekly', priority: '0.8' },
  {
    path: '/concerts',
    routeKey: 'concerts',
    seoKey: 'concerts',
    changefreq: 'weekly',
    priority: '0.7',
  },
  { path: '/blog', routeKey: 'blog', seoKey: 'blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/authors', routeKey: 'authors', seoKey: 'authors', changefreq: 'monthly', priority: '0.6' },
  {
    path: '/authors/mccal',
    routeKey: 'authors',
    seoKey: 'authorMccal',
    changefreq: 'monthly',
    priority: '0.6',
  },
  { path: '/podcast', routeKey: 'podcast', seoKey: 'podcast', changefreq: 'weekly', priority: '0.7' },
  {
    path: '/book-a-podcast',
    routeKey: 'bookPodcast',
    seoKey: 'bookPodcast',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/grab-a-coffee',
    routeKey: 'grabCoffee',
    seoKey: 'grabCoffee',
    changefreq: 'monthly',
    priority: '0.7',
    redirectFrom: ['/schedule'],
  },
  { path: '/faq', routeKey: 'faq', seoKey: 'faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/projects', routeKey: 'projects', seoKey: 'projects', changefreq: 'monthly', priority: '0.6' },
  {
    path: '/accessibility',
    routeKey: 'accessibility',
    seoKey: 'accessibility',
    changefreq: 'yearly',
    priority: '0.3',
  },
  {
    path: '/licensing',
    routeKey: 'licensing',
    seoKey: 'licensing',
    changefreq: 'yearly',
    priority: '0.6',
  },
  {
    path: '/privacy',
    routeKey: 'privacy',
    seoKey: 'privacy',
    changefreq: 'yearly',
    priority: '0.5',
  },
  {
    path: '/terms',
    routeKey: 'terms',
    seoKey: 'terms',
    changefreq: 'yearly',
    priority: '0.5',
  },
  {
    path: '/policies-legal',
    routeKey: 'policiesLegal',
    seoKey: 'policiesLegal',
    changefreq: 'yearly',
    priority: '0.3',
  },
];

export const SITEMAP_STATIC_PATHS = STATIC_PAGE_ROUTES.map((route) => route.path);
export const LEGACY_ROUTE_REDIRECTS = STATIC_PAGE_ROUTES.flatMap((route) =>
  (route.redirectFrom || []).map((from) => ({ from, to: route.path })),
);

const STATIC_ROUTE_BY_PATH = new Map(STATIC_PAGE_ROUTES.map((route) => [route.path, route]));
const STATIC_ROUTE_BY_SEO_KEY = new Map(
  STATIC_PAGE_ROUTES.map((route) => [route.seoKey || route.routeKey, route]),
);

export function getStaticRouteByPath(path) {
  return STATIC_ROUTE_BY_PATH.get(path) || null;
}

export function getStaticRouteBySeoKey(seoKey) {
  return STATIC_ROUTE_BY_SEO_KEY.get(seoKey) || null;
}

export function getCanonicalPath(pathname) {
  const normalizedPath = pathname === '' ? '/' : pathname.replace(/\/+$/, '') || '/';
  const directRoute = getStaticRouteByPath(normalizedPath);
  if (directRoute) return directRoute.path;

  const redirect = LEGACY_ROUTE_REDIRECTS.find((entry) => entry.from === normalizedPath);
  return redirect ? redirect.to : normalizedPath;
}
