import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Layout } from '@/components';
import '@/pages/policies-legal.css';

export interface LegalNavItem {
  label: string;
  href: string;
}

export interface LegalNavSection {
  title: string;
  open: boolean;
  items: LegalNavItem[];
}

export interface LegalGlanceItem {
  label: string;
  href: string;
  description: string;
}

export interface LegalDocumentAction {
  label: string;
  href: string;
  title: string;
}

interface LegalDocumentProps {
  /** Rendered as the h1 and used to label the document landmark. */
  title: string;
  intro: string;
  /**
   * The date these terms took effect, as `YYYY-MM-DD`.
   *
   * Required rather than derived from `new Date()`, which is what the combined
   * policies page used to do, that rendered today's date on every visit, telling
   * every reader the terms had just changed. An effective date is a factual claim
   * about a document and has to be stated, not computed.
   */
  effectiveDate: string;
  navLabel: string;
  navSections: LegalNavSection[];
  glanceItems: LegalGlanceItem[];
  /** Optional mailto links for requesting a PDF copy. */
  actions?: LegalDocumentAction[];
  children: ReactNode;
}

/** Honours the user's motion preference for in-page anchor scrolling. */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

function formatEffectiveDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PrintIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

/**
 * Shared chrome for the legal documents: table of contents with scrollspy and
 * search, reading-time estimate, reading-progress bar, and a mobile drawer.
 *
 * Extracted from the single 1,075-line policies page when it was split into
 * `/licensing`, `/privacy` and `/terms`. Each page supplies its own sections and
 * navigation; none of this behaviour is duplicated.
 */
export default function LegalDocument({
  title,
  intro,
  effectiveDate,
  navLabel,
  navSections,
  glanceItems,
  actions = [],
  children,
}: LegalDocumentProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [progress, setProgress] = useState(0);

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const text = mainRef.current.innerText ?? mainRef.current.textContent ?? '';
    const words = text.split(/\s+/).filter(Boolean).length;
    setReadingTime(`Est. ${Math.max(1, Math.ceil(words / 200))} min read`);
  }, [children]);

  useEffect(() => {
    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !navOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [navOpen]);

  const handleNavClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', href);
    }
    setNavOpen(false);
  }, []);

  const isActive = useCallback((id: string) => activeSection === id, [activeSection]);

  const visibleSections = useMemo(() => {
    if (!searchTerm) return navSections;
    const needle = searchTerm.toLowerCase();
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.label.toLowerCase().includes(needle)),
      }))
      .filter((section) => section.items.length > 0);
  }, [navSections, searchTerm]);

  const formattedDate = formatEffectiveDate(effectiveDate);

  return (
    <Layout>
      <div className="policy-page-wrapper">
        <div className="policy-container">
          <a className="policy-skip" href="#policy-main">
            Skip to main content
          </a>

          <div className="policy-site" role="document" aria-labelledby="policy-title">
            <div
              className="policy-progress"
              aria-hidden="true"
              style={{ transform: `scaleX(${progress})` }}
            />

            <button
              className={`toc-toggle ${navOpen ? 'is-open' : ''}`}
              aria-controls="policy-toc"
              aria-expanded={navOpen}
              aria-label={navOpen ? `Close ${navLabel} navigation` : `Open ${navLabel} navigation`}
              type="button"
              onClick={() => setNavOpen(!navOpen)}
            >
              {navOpen ? 'Close' : 'Sections'}
            </button>

            <div
              className={`policy-scrim ${navOpen ? 'active' : ''}`}
              aria-hidden="true"
              onClick={() => setNavOpen(false)}
            />

            <aside
              id="policy-toc"
              className={`policy-toc ${navOpen ? 'open' : ''}`}
              role="navigation"
              aria-label={`${navLabel} navigation`}
            >
              <div className="label">Section Discovery</div>
              <div className="nav-search-wrapper">
                <input
                  type="search"
                  id="navSearch"
                  placeholder="Search keywords..."
                  aria-label={`Filter ${navLabel} sections`}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="label">{navLabel}</div>
              {visibleSections.length === 0 ? (
                <p className="policy-toc__empty" role="status">
                  No sections match “{searchTerm}”.
                </p>
              ) : (
                visibleSections.map((section) => (
                  <details key={section.title} open={section.open || searchTerm.length > 0}>
                    <summary>{section.title}</summary>
                    <nav>
                      {section.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className={isActive(item.href.slice(1)) ? 'active' : ''}
                          aria-current={isActive(item.href.slice(1)) ? 'true' : 'false'}
                          onClick={(event) => handleNavClick(event, item.href)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </details>
                ))
              )}
            </aside>

            <main id="policy-main" className="policy-main" ref={mainRef} role="main">
              <header className="policy-hero">
                <div className="policy-hero__content">
                  <h1 id="policy-title">{title}</h1>
                  <p className="policy-hero__intro">{intro}</p>
                  <div className="header-meta" aria-label="Document details">
                    <span className="badge eff">
                      Effective <time dateTime={effectiveDate}>{formattedDate}</time>
                    </span>
                    {readingTime && (
                      <span className="badge reading-time" id="readingTime">
                        {readingTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* The print action is always available; mailto actions are per-document. */}
                <div className="download-bar" role="region" aria-label="Document actions">
                  {actions.map((action) => (
                    <a
                      key={action.href}
                      className="download-btn active-btn"
                      href={action.href}
                      title={action.title}
                      aria-label={action.title}
                    >
                      <MailIcon />
                      <span>{action.label}</span>
                    </a>
                  ))}
                  <button
                    type="button"
                    className="download-btn active-btn"
                    onClick={() => window.print()}
                    title="Print this page to PDF for your records"
                    aria-label={`Print ${title} to PDF`}
                  >
                    <PrintIcon />
                    <span>Print/Save</span>
                  </button>
                </div>
              </header>

              {glanceItems.length > 0 && (
                <nav className="policy-at-a-glance" aria-label={`${navLabel} at a glance`}>
                  {glanceItems.map((item) => (
                    <a key={item.href} href={item.href}>
                      <span>{item.label}</span>
                      <small>{item.description}</small>
                    </a>
                  ))}
                </nav>
              )}

              {children}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
