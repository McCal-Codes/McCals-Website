import * as Sentry from '@sentry/react';
import Layout from '../components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './not-found.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

export default function SentryExamplePage() {
  usePageMeta({
    title: 'Sentry Example Page | McCal Media',
    description: 'Internal Sentry verification page for McCal Media.',
    canonical: `${SITE_URL}/sentry-example-page`,
    robots: 'noindex, nofollow',
  });

  const triggerTestError = () => {
    Sentry.logger.info('User triggered test error', {
      action: 'test_error_button_click',
      route: '/sentry-example-page',
    });
    throw new Error('This is your first Sentry error from /sentry-example-page');
  };

  return (
    <Layout>
      <section className={styles.container}>
        <h1 className={styles.title}>Sentry Example Page</h1>
        <p className={styles.description}>
          Use this page to send one test exception after Sentry environment variables are configured.
        </p>
        <button className={styles.homeLink} type="button" onClick={triggerTestError}>
          Trigger test error
        </button>
      </section>
    </Layout>
  );
}
