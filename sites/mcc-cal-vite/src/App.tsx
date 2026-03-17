import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import BlogPage from './pages/blog';
import ChangelogPage from './pages/changelog';
import ConcertsPage from './pages/concerts';
import EventsPage from './pages/events';
import FeaturedWorkPage from './pages/featured-work';
import JournalismPage from './pages/journalism';
import NaturePage from './pages/nature';
import PortraitsPage from './pages/portraits';
import PodcastPage from './pages/podcast';
import VideoPage from './pages/video';
import AbridgedPage from './pages/abridged';
import ShowcasePage from './pages/showcase';
import ApiTestPage from './pages/api-test';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/concerts" element={<ConcertsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/featured-work" element={<FeaturedWorkPage />} />
        <Route path="/journalism" element={<JournalismPage />} />
        <Route path="/nature" element={<NaturePage />} />
        <Route path="/portraits" element={<PortraitsPage />} />
        <Route path="/podcast" element={<PodcastPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/abridged" element={<AbridgedPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/api-test" element={<ApiTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}
