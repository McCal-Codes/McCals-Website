import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './not-found.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/**
 * Where to send someone who landed on nothing. A 404 is usually a stale link
 * or a typo, so the useful response is the shortest route back to whatever
 * they were probably after — not a single "return home" and a dead end.
 */
const DESTINATIONS = [
  { to: '/featured-work', label: 'Featured work', hint: 'A cross-section of recent shoots' },
  { to: '/journalism', label: 'Photojournalism', hint: 'Political and documentary coverage' },
  { to: '/concerts', label: 'Concerts', hint: 'Live music photography' },
  { to: '/portraits', label: 'Portraits', hint: 'Sessions and headshots' },
  { to: '/podcast', label: 'Podcast', hint: 'Caffeinated Connections episodes' },
  { to: '/blog', label: 'Writing', hint: 'Essays and field notes' },
];

const NotFoundPage = () => {
  const location = useLocation();

  usePageMeta({
    title: 'Page Not Found | McCal Media',
    description:
      'The page you are looking for does not exist. Explore McCal Media for photography, podcast, and creative content.',
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
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.title}>That page isn&apos;t here</h1>
        <p className={styles.description}>
          The link may be out of date, or the address slightly off. Everything below still works.
        </p>

        {/* Shown so a visitor can see the typo, and so anyone reporting a broken
            link has something concrete to quote. */}
        <p className={styles.requestedPath}>
          You asked for <code>{location.pathname}</code>
        </p>

        <nav className={styles.destinations} aria-label="Popular pages">
          {DESTINATIONS.map((destination) => (
            <Link key={destination.to} to={destination.to} className={styles.destination}>
              <span className={styles.destinationLabel}>{destination.label}</span>
              <span className={styles.destinationHint}>{destination.hint}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeLink}>
            Return home
          </Link>
          <Link to="/contact-us" className={styles.secondaryLink}>
            Tell me the link is broken
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default NotFoundPage;
