import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stats } from './aboutData';
import styles from './about-sections.module.css';

const ABOUT_IMAGE = '/about/caleb-mccartney-photo.jpg';

interface BioSectionProps {
  className?: string;
}

export function BioSection({ className = '' }: BioSectionProps) {
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [documentsMenuOpen, setDocumentsMenuOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const contactMenuRef = useRef<HTMLDivElement>(null);
  const documentsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (contactMenuRef.current && !contactMenuRef.current.contains(target)) {
        setContactMenuOpen(false);
      }
      if (documentsMenuRef.current && !documentsMenuRef.current.contains(target)) {
        setDocumentsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContactMenuOpen(false);
        setDocumentsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleContactClick = () => {
    setContactMenuOpen((open) => !open);
    setDocumentsMenuOpen(false);
  };

  const handleDocumentsClick = () => {
    setDocumentsMenuOpen((open) => !open);
    setContactMenuOpen(false);
  };

  return (
    <section className={`${styles.bio} ${className}`} aria-labelledby="about-heading">
      <div className={styles.bioGrid}>
        <figure className={styles.bioPhoto}>
          <div className={`${styles.photoWrapper} ${imageLoaded ? styles.loaded : ''}`}>
            {!imageError ? (
              <img
                src={ABOUT_IMAGE}
                alt="Black-and-white portrait of Caleb McCartney."
                loading="eager"
                fetchPriority="high"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.photoFallback}>
                <span>CM</span>
              </div>
            )}
          </div>
          <figcaption className={styles.srOnly}>Portrait of Caleb McCartney.</figcaption>
        </figure>

        <div className={styles.bioContent}>
          <p className={styles.eyebrow}>About Caleb McCartney</p>
          <h1 id="about-heading">
            Photojournalism instincts, polished delivery, and event coverage that still feels
            human.
          </h1>

          <div className={styles.bioText}>
            <p>
              Caleb McCartney is a Pittsburgh-based <strong>photojournalist</strong> and
              freelance storyteller specializing in news-driven narratives, high-energy concert
              coverage, and authentic brand visuals.
            </p>
            <p>
              His approach is rooted in the decisive moment: stay close to the people in front
              of you, pay attention to the room, and make images that still hold onto their
              atmosphere after the assignment is over. That mindset carries from editorial work
              into live events, commercial commissions, and client storytelling.
            </p>
            <p>
              Alongside client work, Caleb writes field notes and hosts the{' '}
              <Link to="/podcast">Caffeinated Connections</Link> podcast, where creative work,
              labor, and public life all collide.
            </p>
          </div>

          <div className={styles.actions}>
            <div className={styles.menuWrapper} ref={contactMenuRef}>
              <button
                type="button"
                className={styles.actionButton}
                aria-expanded={contactMenuOpen}
                aria-haspopup="true"
                onClick={handleContactClick}
              >
                Get in touch
                <svg
                  className={`${styles.chevron} ${contactMenuOpen ? styles.open : ''}`}
                  viewBox="0 0 12 8"
                  aria-hidden="true"
                >
                  <path d="M1 1.5L6 6.5L11 1.5" />
                </svg>
              </button>
              <div
                className={`${styles.menuPanel} ${contactMenuOpen ? styles.open : ''}`}
                role="menu"
              >
                <Link to="/contact-us" className={styles.menuItem} role="menuitem">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.menuIcon}>
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.5l-8 5-8-5V6h16zm-8 7L4 8v10h16V8l-8 5z" />
                  </svg>
                  Contact page
                </Link>
                <Link
                  to="/grab-coffee"
                  className={styles.menuItem}
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.menuIcon}>
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                  </svg>
                  Grab a coffee
                </Link>
              </div>
            </div>

            <div className={styles.menuWrapper} ref={documentsMenuRef}>
              <button
                type="button"
                className={styles.actionButton}
                aria-expanded={documentsMenuOpen}
                aria-haspopup="true"
                onClick={handleDocumentsClick}
              >
                Documents
                <svg
                  className={`${styles.chevron} ${documentsMenuOpen ? styles.open : ''}`}
                  viewBox="0 0 12 8"
                  aria-hidden="true"
                >
                  <path d="M1 1.5L6 6.5L11 1.5" />
                </svg>
              </button>
              <div
                className={`${styles.menuPanel} ${documentsMenuOpen ? styles.open : ''}`}
                role="menu"
              >
                <a
                  href="/downloads/caleb-mccartney-resume.pdf"
                  download
                  className={styles.menuItem}
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.menuIcon}>
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
                  </svg>
                  Resume
                </a>
                <Link to="/roadmap" className={styles.menuItem} role="menuitem">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.menuIcon}>
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  Roadmap
                </Link>
              </div>
            </div>

            <Link to="/featured-work" className={styles.actionButton}>
              View portfolio
            </Link>
            <Link
              to="/request-a-quote"
              className={`${styles.actionButton} ${styles.actionPrimary}`}
            >
              Request a quote
            </Link>
          </div>

          <div className={styles.stats} aria-label="Career highlights">
            {stats.map((item) => (
              <div key={item.label} className={styles.stat}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
