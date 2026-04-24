import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './ComingSoon.module.css';
import { useLocation } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
}

export const ComingSoon = ({ title }: ComingSoonProps) => {
  const location = useLocation();
  const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
  const canonicalPath = location.pathname || '/';

  usePageMeta({
    title: `${title} | McCal Media`,
    description:
      'This page is temporarily unavailable while the site migration is in progress. Please check back soon.',
    canonical: `${SITE_URL}${canonicalPath}`,
    robots: 'noindex, nofollow',
    og: {
      type: 'website',
      title: `${title} | McCal Media`,
      description:
        'This page is temporarily unavailable while the site migration is in progress.',
    },
    twitter: {
      card: 'summary',
      title: `${title} | McCal Media`,
      description:
        'This page is temporarily unavailable while the site migration is in progress.',
    },
  });

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.card}>
          <span className={styles.badge}>Coming Soon</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>
            As I am migrating my site to Vite and TypeScript, some pages may not be fully converted.
            Check back soon for the complete experience.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoon;
