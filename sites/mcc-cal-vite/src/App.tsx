import { Suspense, lazy } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import PreviewBanner from './components/PreviewBanner';
import RouteAnalytics from './components/RouteAnalytics';
import ErrorBoundary from './components/ErrorBoundary';
import RouteAwareSpeedInsights from './components/RouteAwareSpeedInsights';
import { LEGACY_ROUTE_REDIRECTS, STATIC_PAGE_ROUTES } from './config/public-routes.js';
// HomePage stays eager: it is the LCP route, so a second round trip for its chunk
// would delay the hero. Every other route is split.
import HomePage from './pages/index';

// Lazy load pages for code splitting
const AboutPage = lazy(() => import('./pages/about'));
const PodcastPage = lazy(() => import('./pages/podcast'));
const AuthorsPage = lazy(() => import('./pages/authors'));
const BlogPage = lazy(() => import('./pages/blog'));
const ConcertsPage = lazy(() => import('./pages/concerts'));
const EventsPage = lazy(() => import('./pages/events'));
const FeaturedWorkPage = lazy(() => import('./pages/featured-work'));
const JournalismPage = lazy(() => import('./pages/journalism'));
const NaturePage = lazy(() => import('./pages/nature'));
const PortraitsPage = lazy(() => import('./pages/portraits'));
const ProjectsPage = lazy(() => import('./pages/projects'));
const ChangelogPage = lazy(() => import('./pages/changelog'));
const ShowcasePage = lazy(() => import('./pages/showcase'));
const ApiTestPage = lazy(() => import('./pages/api-test'));
const SentryExamplePage = lazy(() => import('./pages/sentry-example-page'));
const ContactUsPage = lazy(() => import('./pages/contact-us'));
const RequestAQuotePage = lazy(() => import('./pages/request-a-quote'));
const GrabCoffeePage = lazy(() => import('./pages/grab-a-coffee'));
const BookPodcastPage = lazy(() => import('./pages/book-a-podcast'));
const PoliciesLegalPage = lazy(() => import('./pages/policies-legal'));
const LicensingPage = lazy(() => import('./pages/licensing'));
const PrivacyPage = lazy(() => import('./pages/privacy'));
const TermsPage = lazy(() => import('./pages/terms'));
const FAQPage = lazy(() => import('./pages/faq'));
const LinksPage = lazy(() => import('./pages/links'));
const ManageBookingPage = lazy(() => import('./pages/manage-booking'));
const AccessibilityPage = lazy(() => import('./pages/accessibility'));
const OneNationDividedPage = lazy(() => import('./pages/one-nation-divided'));
const NotFoundPage = lazy(() => import('./pages/not-found'));

const staticRouteComponents = {
  home: HomePage,
  about: AboutPage,
  contactUs: ContactUsPage,
  requestAQuote: RequestAQuotePage,
  featuredWork: FeaturedWorkPage,
  lettingMeGo: OneNationDividedPage,
  journalism: JournalismPage,
  portraits: PortraitsPage,
  nature: NaturePage,
  events: EventsPage,
  concerts: ConcertsPage,
  blog: BlogPage,
  authors: AuthorsPage,
  podcast: PodcastPage,
  bookPodcast: BookPodcastPage,
  grabCoffee: GrabCoffeePage,
  faq: FAQPage,
  projects: ProjectsPage,
  accessibility: AccessibilityPage,
  policiesLegal: PoliciesLegalPage,
  licensing: LicensingPage,
  privacy: PrivacyPage,
  terms: TermsPage,
} as const;

// Simple fallback for page loading state
function PageLoader() {
  return (
    <div
      aria-live="polite"
      style={{
        minHeight: '100svh',
        paddingTop: 'var(--mcc-nav-height)',
        background: 'var(--mcc-bg-elevated)',
        color: 'var(--mcc-fg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="mcc-nav-shell"
        aria-hidden="true"
        style={{
          minHeight: 'var(--mcc-nav-height)',
          pointerEvents: 'none',
        }}
      />
      <div
        role="status"
        style={{
          minHeight: 'calc(100svh - var(--mcc-nav-height))',
          display: 'flex',
          flex: '1 0 auto',
          padding: '0 clamp(20px, 4vw, 28px)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span>Loading...</span>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <>
      <PreviewBanner />
      <RouteAnalytics />
      <RouteAwareSpeedInsights />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

// Plain createBrowserRouter, not Sentry's wrapCreateBrowserRouterV6. The wrapper
// has to run at module scope to build the router, which pulls the whole SDK into
// the entry chunk and blocks first paint. Route-pattern transaction names — the
// main thing the wrapper bought us — are set from RouteAnalytics instead.
const enableSentryExamplePage =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_SENTRY_TEST_PAGE === 'true';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      ...STATIC_PAGE_ROUTES.map((route) => {
        const RouteComponent = staticRouteComponents[route.routeKey];
        return {
          path: route.path,
          element: <RouteComponent />,
        };
      }),
      ...LEGACY_ROUTE_REDIRECTS.map((route) => ({
        path: route.from,
        element: <Navigate to={route.to} replace />,
      })),
      { path: '/authors/:authorId', element: <AuthorsPage /> },
      { path: '/blog/:slug', element: <BlogPage /> },
      // Hidden tap-card page: intentionally not in STATIC_PAGE_ROUTES/nav/sitemap,
      // reachable only by whoever has the direct URL (the NFC card).
      { path: '/links', element: <LinksPage /> },
      // Reached only from the token link in a confirmation email: kept out of
      // STATIC_PAGE_ROUTES (so out of nav and the sitemap) but pre-rendered via
      // HIDDEN_ROUTES in generate-route-meta.js, since a path with no matching
      // file 404s before the SPA rewrite is consulted.
      { path: '/manage-booking', element: <ManageBookingPage /> },
      ...(import.meta.env.DEV
        ? [
            { path: '/showcase', element: <ShowcasePage /> },
            { path: '/api-test', element: <ApiTestPage /> },
            { path: '/changelog', element: <ChangelogPage /> },
          ]
        : []),
      ...(enableSentryExamplePage
        ? [{ path: '/sentry-example-page', element: <SentryExamplePage /> }]
        : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={<PageLoader />}
      future={{ v7_startTransition: true }}
    />
  );
}
