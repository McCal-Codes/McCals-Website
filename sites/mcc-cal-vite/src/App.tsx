import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import BlogPage from './pages/blog';
import ConcertsPage from './pages/concerts';
import EventsPage from './pages/events';
import FeaturedWorkPage from './pages/featured-work';
import JournalismPage from './pages/journalism';
import NaturePage from './pages/nature';
import PortraitsPage from './pages/portraits';
import PodcastPage from './pages/podcast';
import VideoPage from './pages/video';
import AbridgedPage from './pages/abridged';
import ProjectsPage from './pages/projects';
import RoadmapPage from './pages/roadmap';
import DesignSystemsPage from './pages/design-systems';
import ChangelogPage from './pages/changelog';
import ShowcasePage from './pages/showcase';
import ApiTestPage from './pages/api-test';
import ContactUsPage from './pages/contact-us';
import RequestAQuotePage from './pages/request-a-quote';
import PoliciesLegalPage from './pages/policies-legal';
import TerranovaPage from './pages/terranova';
import NotFoundPage from './pages/not-found';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
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
    </BrowserRouter>
  );
}
