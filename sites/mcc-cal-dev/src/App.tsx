import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import { useHashScroll } from './lib/useHashScroll';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import NotesPage from './pages/NotesPage';
import ProjectPage from './pages/ProjectPage';

function Shell() {
  useHashScroll();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/projects/:slug', element: <ProjectPage /> },
      { path: '/notes', element: <NotesPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
