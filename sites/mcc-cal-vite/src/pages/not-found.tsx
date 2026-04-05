import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const NotFoundPage = () => {
  usePageMeta({
    title: 'Page Not Found | McCal Media',
    description: 'The page you are looking for does not exist. Explore McCal Media for photography, podcast, and creative content.',
    canonical: `${SITE_URL}/404`,
    og: {
      type: 'website',
      title: 'Page Not Found | McCal Media',
      description: 'The page you are looking for does not exist.',
    },
    twitter: {
      card: 'summary',
      title: 'Page Not Found | McCal Media',
      description: 'The page you are looking for does not exist.',
    },
  });

  return (
    <Layout>
      <section style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1>404 — Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/">Return home</Link>
      </section>
    </Layout>
  );
};

export default NotFoundPage;
