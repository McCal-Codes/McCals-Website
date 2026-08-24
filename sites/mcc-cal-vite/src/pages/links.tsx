import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { trackWebsiteEvent } from '@/utils/analytics';
import styles from './links.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const LINK_STACK = [
  { label: 'Grab a Coffee', href: '/grab-a-coffee', internal: true },
  { label: 'Book a Podcast', href: '/book-a-podcast', internal: true },
  { label: 'Email Me', href: 'mailto:contact@mcc-cal.com', internal: false },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/mcc_cal',
    path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm6.75-2.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/caleb-mccartney/',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/mccalphotography',
    path: 'M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12.1h2.54V9.96c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.81h2.76l-.44 2.87h-2.32V22c4.78-.78 8.44-4.93 8.44-9.94Z',
  },
];

export default function LinksPage() {
  const location = useLocation();

  usePageMeta({
    title: 'Caleb McCartney | McCal Media',
    description: 'Contact links and social profiles for Caleb McCartney.',
    canonical: `${SITE_URL}/links`,
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    const source = new URLSearchParams(location.search).get('src') ?? 'direct';
    trackWebsiteEvent('links_page_view', { source });
  }, [location.search]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <img
          src="/about/caleb-mccartney-photo.webp"
          alt="Caleb McCartney"
          width={112}
          height={112}
          className={styles.avatar}
        />
        <h1 className={styles.name}>Caleb McCartney</h1>
        <p className={styles.tagline}>Pittsburgh Photographer &amp; Photojournalist</p>

        <a href="/caleb-mccartney.vcf" download className={styles.saveContact}>
          Save My Contact
        </a>

        <nav className={styles.linkStack} aria-label="Contact links">
          {LINK_STACK.map((link) =>
            link.internal ? (
              <Link key={link.href} to={link.href} className={styles.linkButton}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className={styles.linkButton}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className={styles.socialRow} aria-label="Social profiles">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={styles.socialLink}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>

        <Link to="/featured-work" className={styles.portfolioLink}>
          View Full Portfolio →
        </Link>
      </div>
    </main>
  );
}
