import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import PreviewBanner from './components/PreviewBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { STATIC_PAGE_ROUTES } from './config/public-routes.js';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/index'));
const AboutPage = lazy(() => import('./pages/about'));
const AuthorsPage = lazy(() => import('./pages/authors'));
const BlogPage = lazy(() => import('./pages/blog'));
const ConcertsPage = lazy(() => import('./pages/concerts'));
const EventsPage = lazy(() => import('./pages/events'));
const FeaturedWorkPage = lazy(() => import('./pages/featured-work'));
const JournalismPage = lazy(() => import('./pages/journalism'));
const NaturePage = lazy(() => import('./pages/nature'));
const PortraitsPage = lazy(() => import('./pages/portraits'));
const PodcastPage = lazy(() => import('./pages/podcast'));
const VideoPage = lazy(() => import('./pages/video'));
const AbridgedPage = lazy(() => import('./pages/abridged'));
const ProjectsPage = lazy(() => import('./pages/projects'));
const RoadmapPage = lazy(() => import('./pages/roadmap'));
const DesignSystemsPage = lazy(() => import('./pages/design-systems'));
const ChangelogPage = lazy(() => import('./pages/changelog'));
const ShowcasePage = lazy(() => import('./pages/showcase'));
const ApiTestPage = lazy(() => import('./pages/api-test'));
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
  video: VideoPage,
  events: EventsPage,
  concerts: ConcertsPage,
  blog: BlogPage,
  authors: AuthorsPage,
  podcast: PodcastPage,
  bookPodcast: BookPodcastPage,
  grabCoffee: GrabCoffeePage,
  faq: FAQPage,
  designSystems: DesignSystemsPage,
  projects: ProjectsPage,
  terranova: TerranovaPage,
  accessibility: AccessibilityPage,
  policiesLegal: PoliciesLegalPage,
} as const;

// Simple fallback for page loading state
function PageLoader() {
  return (
    <div style={{ 
      minHeight: '50vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <span>Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PreviewBanner />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {STATIC_PAGE_ROUTES.map((route) => {
              const RouteComponent = staticRouteComponents[route.routeKey];
              return <Route key={route.path} path={route.path} element={<RouteComponent />} />;
            })}
            <Route path="/one-nation-divided" element={<Navigate to="/letting-me-go" replace />} />
            <Route path="/authors/:authorId" element={<AuthorsPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/abridged" element={<AbridgedPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            {import.meta.env.DEV && (
              <>
                <Route path="/showcase" element={<ShowcasePage />} />
                <Route path="/api-test" element={<ApiTestPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
              </>
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
