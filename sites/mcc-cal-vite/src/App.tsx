import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PreviewBanner from './components/PreviewBanner';
import ErrorBoundary from './components/ErrorBoundary';

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
const PoliciesLegalPage = lazy(() => import('./pages/policies-legal'));
const TerranovaPage = lazy(() => import('./pages/terranova'));
const NotFoundPage = lazy(() => import('./pages/not-found'));

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
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/authors/:authorId" element={<AuthorsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/concerts" element={<ConcertsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/featured-work" element={<FeaturedWorkPage />} />
          <Route path="/journalism" element={<JournalismPage />} />
          <Route path="/nature" element={<NaturePage />} />
          <Route path="/portraits" element={<PortraitsPage />} />
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/abridged" element={<AbridgedPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/design-systems" element={<DesignSystemsPage />} />
          {import.meta.env.DEV && (
            <>
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route path="/api-test" element={<ApiTestPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
            </>
          )}
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/request-a-quote" element={<RequestAQuotePage />} />
          <Route path="/policies-legal" element={<PoliciesLegalPage />} />
          <Route path="/terranova" element={<TerranovaPage />} />
          <Route path="/accessibility" element={<Navigate to="/policies-legal#accessibility" replace />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
