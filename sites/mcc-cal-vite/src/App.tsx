import { Suspense, lazy } from 'react';
import * as Sentry from '@sentry/react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import PreviewBanner from './components/PreviewBanner';
import ErrorBoundary from './components/ErrorBoundary';
import RouteAwareSpeedInsights from './components/RouteAwareSpeedInsights';
import { STATIC_PAGE_ROUTES } from './config/public-routes.js';
import HomePage from './pages/index';
import PodcastPage from './pages/podcast';

// Lazy load pages for code splitting
const AboutPage = lazy(() => import('./pages/about'));
const AuthorsPage = lazy(() => import('./pages/authors'));
const BlogPage = lazy(() => import('./pages/blog'));
const ConcertsPage = lazy(() => import('./pages/concerts'));
const EventsPage = lazy(() => import('./pages/events'));
const FeaturedWorkPage = lazy(() => import('./pages/featured-work'));
const JournalismPage = lazy(() => import('./pages/journalism'));
const NaturePage = lazy(() => import('./pages/nature'));
const PortraitsPage = lazy(() => import('./pages/portraits'));
const ProjectsPage = lazy(() => import('./pages/projects'));
const RoadmapPage = lazy(() => import('./pages/roadmap'));
const ChangelogPage = lazy(() => import('./pages/changelog'));
const ShowcasePage = lazy(() => import('./pages/showcase'));
const ApiTestPage = lazy(() => import('./pages/api-test'));
const SentryExamplePage = lazy(() => import('./pages/sentry-example-page'));
const ContactUsPage = lazy(() => import('./pages/contact-us'));
const RequestAQuotePage = lazy(() => import('./pages/request-a-quote'));
const GrabCoffeePage = lazy(() => import('./pages/grab-a-coffee'));
const BookPodcastPage = lazy(() => import('./pages/book-a-podcast'));
const PoliciesLegalPage = lazy(() => import('./pages/policies-legal'));
const FAQPage = lazy(() => import('./pages/faq'));
const AccessibilityPage = lazy(() => import('./pages/accessibility'));
const TerranovaPage = lazy(() => import('./pages/terranova'));
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
  roadmap: RoadmapPage,
  terranova: TerranovaPage,
  accessibility: AccessibilityPage,
  policiesLegal: PoliciesLegalPage,
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
      <RouteAwareSpeedInsights />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);
const enableSentryExamplePage =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_SENTRY_TEST_PAGE === 'true';

const router = sentryCreateBrowserRouter([
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
      { path: '/contact', element: <Navigate to="/contact-us" replace /> },
      { path: '/schedule', element: <Navigate to="/grab-a-coffee" replace /> },
      { path: '/one-nation-divided', element: <Navigate to="/letting-me-go" replace /> },
      { path: '/authors/:authorId', element: <AuthorsPage /> },
      { path: '/blog/:slug', element: <BlogPage /> },
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
