import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './not-found.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const NotFoundPage = () => {
  usePageMeta({
    title: 'Page Not Found | McCal Media',
    description: 'The page you are looking for does not exist. Explore McCal Media for photography, podcast, and creative content.',
    canonical: `${SITE_URL}/404`,
    robots: 'noindex, nofollow',
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
      <section className={styles.container}>
        <h1 className={styles.title}>404 — Page Not Found</h1>
        <p className={styles.description}>
          The page you're looking for doesn't exist. Explore McCal Media for photography, podcast, and creative content.
        </p>
        <Link to="/" className={styles.homeLink}>
          Return home
        </Link>
      </section>
    </Layout>
  );
};

export default NotFoundPage;
