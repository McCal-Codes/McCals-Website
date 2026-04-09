import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import './accessibility.css';

// Icon components (inline SVG to avoid external dependency)
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EyeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const InfoIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const LockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ShieldIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

const AlertCircleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

// Types
interface NavItem {
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  open: boolean;
  items: NavItem[];
}

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieInfo[];
}

interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

// Prefers reduced motion check
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Cookie data
const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Required for the website to function properly. Cannot be disabled.',
    required: true,
    cookies: [
      { name: 'mccal_session', provider: 'McCal Media', purpose: 'Session management and security', duration: 'Session' },
      { name: 'mccal_consent', provider: 'McCal Media', purpose: 'Stores cookie consent preferences', duration: '1 year' },
    ],
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'Enable enhanced functionality and personalization.',
    required: false,
    cookies: [
      { name: 'mccal_theme', provider: 'McCal Media', purpose: 'Remember theme preference (light/dark)', duration: '1 year' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    required: false,
    cookies: [
      { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguish unique users', duration: '2 years' },
      { name: '_gid', provider: 'Google Analytics', purpose: 'Distinguish unique users', duration: '24 hours' },
      { name: '_gat', provider: 'Google Analytics', purpose: 'Throttle request rate', duration: '1 minute' },
    ],
  },
];

const AccessibilityPage = () => {
  usePageMeta({
    title: 'Accessibility & Cookie Policy | McCal Media',
    description:
      'Accessibility statement and cookie policy for McCal Media. Learn about our commitment to digital accessibility and manage your cookie preferences.',
    canonical: `${SITE_URL}/accessibility`,
    og: {
      type: 'website',
      title: 'Accessibility & Cookie Policy | McCal Media',
      description: 'Our commitment to WCAG 2.2 Level AA compliance and cookie transparency.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Accessibility & Cookie Policy | McCal Media',
      description: 'Digital accessibility commitment and cookie management.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Accessibility & Cookie Policy',
      description:
        'McCal Media\'s accessibility statement and cookie policy, including WCAG 2.2 Level AA compliance information and cookie preference management.',
      url: `${SITE_URL}/accessibility`,
      publisher: {
        '@type': 'Organization',
        name: 'McCal Media',
        url: SITE_URL,
      },
      datePublished: '2025-01-27',
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: 'en-US',
      isPartOf: {
        '@type': 'WebSite',
        name: 'McCal Media',
        url: SITE_URL,
      },
    },
  });

  const [navOpen, setNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [readingTime, setReadingTime] = useState('Calculating...');
  const [effectiveDate] = useState(
    new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  );
  const [activeSection, setActiveSection] = useState('');
  const [progress, setProgress] = useState(0);

  // Cookie consent state
  const [cookiePreferences, setCookiePreferences] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('mccal_cookie_consent');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const mainRef = useRef<HTMLElement>(null);

  // Reading time calculation
  useEffect(() => {
    if (mainRef.current) {
      const text = mainRef.current.innerText;
      const wordsPerMinute = 200;
      const minutes = Math.ceil(text.split(/\s+/).length / wordsPerMinute);
      setReadingTime(`Est. ${minutes} min read`);
    }
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = height > 0 ? winScroll / height : 0;
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (navOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [navOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      target.scrollIntoView({ behavior, block: 'start' });
      history.pushState(null, '', href);
    }
    setNavOpen(false);
  }, []);

  const filteredNavItems = useCallback(
    (items: NavItem[]) => {
      if (!searchTerm) return items;
      return items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
    },
    [searchTerm]
  );

  const isActive = useCallback((id: string) => activeSection === id, [activeSection]);

  // Cookie preference handlers
  const handleToggleCategory = (categoryId: string) => {
    if (cookieCategories.find((c) => c.id === categoryId)?.required) return;
    setCookiePreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleAcceptAll = () => {
    const allEnabled: Record<string, boolean> = {};
    cookieCategories.forEach((cat) => {
      allEnabled[cat.id] = true;
    });
    setCookiePreferences(allEnabled);
    savePreferences(allEnabled);
  };

  const handleRejectAll = () => {
    const onlyRequired: Record<string, boolean> = {};
    cookieCategories.forEach((cat) => {
      onlyRequired[cat.id] = cat.required;
    });
    setCookiePreferences(onlyRequired);
    savePreferences(onlyRequired);
  };

  const handleSavePreferences = () => {
    savePreferences(cookiePreferences);
  };

  const savePreferences = (prefs: Record<string, boolean>) => {
    localStorage.setItem('mccal_cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('mccal_consent_date', new Date().toISOString());
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const isCategoryEnabled = (categoryId: string) => {
    const category = cookieCategories.find((c) => c.id === categoryId);
    if (category?.required) return true;
    return cookiePreferences[categoryId] ?? false;
  };

  // Memoize nav sections
  const navSections: NavSection[] = useMemo(
    () => [
      {
        title: 'Accessibility',
        open: true,
        items: filteredNavItems([
          { label: 'Overview', href: '#accessibility-overview' },
          { label: 'Conformance Status', href: '#conformance' },
          { label: 'Known Limitations', href: '#limitations' },
          { label: 'Feedback', href: '#feedback' },
        ]),
      },
      {
        title: 'Cookie Policy',
        open: false,
        items: filteredNavItems([
          { label: 'What Are Cookies', href: '#cookies-overview' },
          { label: 'Cookie Inventory', href: '#cookie-inventory' },
          { label: 'Managing Cookies', href: '#managing-cookies' },
          { label: 'Third-Party Services', href: '#third-party' },
        ]),
      },
      {
        title: 'Preferences',
        open: true,
        items: filteredNavItems([
          { label: 'Cookie Settings', href: '#cookie-settings' },
        ]),
      },
      {
        title: 'Technical',
        open: false,
        items: filteredNavItems([
          { label: 'Standards', href: '#standards' },
          { label: 'Assessment', href: '#assessment' },
        ]),
      },
    ],
    [filteredNavItems]
  );

  return (
    <Layout>
      <div className="accessibility-page-wrapper">
        <div className="accessibility-container">
          <a className="accessibility-skip" href="#accessibility-main">
            Skip to main content
          </a>

          <div className="accessibility-site" role="document" aria-labelledby="page-title">
            {/* Reading Progress Bar */}
            <div
              className="accessibility-progress"
              aria-hidden="true"
              style={{ transform: `scaleX(${progress})` }}
            />

            {/* Mobile drawer toggle */}
            <button
              className="toc-toggle"
              aria-controls="accessibility-toc"
              aria-expanded={navOpen}
              aria-label="Open accessibility navigation"
              type="button"
              onClick={() => setNavOpen(!navOpen)}
            >
              Menu
            </button>

            {/* Overlay */}
            <div
              className={`accessibility-scrim ${navOpen ? 'active' : ''}`}
              aria-hidden="true"
              onClick={() => setNavOpen(false)}
            />

            {/* Sidebar / TOC */}
            <aside
              id="accessibility-toc"
              className={`accessibility-toc ${navOpen ? 'open' : ''}`}
              role="navigation"
              aria-label="Accessibility navigation"
            >
              <div className="label">Section Discovery</div>
              <div className="nav-search-wrapper">
                <input
                  type="search"
                  id="navSearch"
                  placeholder="Search keywords..."
                  aria-label="Filter accessibility sections"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="label">Accessibility & Cookies</div>
              {navSections.map((section) => (
                <details key={section.title} open={section.open || searchTerm.length > 0}>
                  <summary>{section.title}</summary>
                  <nav>
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={isActive(item.href.slice(1)) ? 'active' : ''}
                        aria-current={isActive(item.href.slice(1)) ? 'true' : 'false'}
                        onClick={(e) => handleNavClick(e, item.href)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </details>
              ))}
            </aside>

            {/* Main Content */}
            <main id="accessibility-main" className="accessibility-main" ref={mainRef} role="main">
              <header>
                <h1 id="page-title">Accessibility & Cookie Policy</h1>
                <div className="header-meta">
                  <span className="badge eff" aria-label="Effective date">
                    Effective <time dateTime={new Date().toISOString().split('T')[0]}>{effectiveDate}</time>
                  </span>
                  <span className="badge reading-time" id="readingTime">
                    {readingTime}
                  </span>
                </div>
              </header>

              {/* Download Bar */}
              <div className="download-bar" role="region" aria-label="Downloads">
                <button
                  className="download-btn active-btn"
                  onClick={() => window.print()}
                  title="Print this page to PDF for your records"
                  aria-label="Print Accessibility Policy to PDF"
                >
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
                  <span>Print/Save</span>
                </button>
              </div>

              {/* Accessibility Statement Section */}
              <section id="accessibility-overview" aria-labelledby="accessibility-overview-heading">
                <h2 id="accessibility-overview-heading">
                  <a href="#accessibility-overview" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Accessibility Statement
                </h2>
                <p>
                  <strong>McCal Media</strong> is committed to ensuring digital accessibility for people with 
                  disabilities. We are continually improving the user experience for everyone and applying 
                  the relevant accessibility standards to achieve this.
                </p>
                <p>
                  We believe the web should be accessible to all, regardless of technology or ability. 
                  This accessibility statement outlines our commitment and the steps we are taking to make 
                  our website usable by the widest possible audience.
                </p>

                <div className="commitment-card">
                  <ShieldIcon size={32} />
                  <div>
                    <h3>Our Commitment</h3>
                    <p>
                      We aim to conform to <strong>WCAG 2.2 Level AA</strong> standards, 
                      the international standard for web accessibility developed by the W3C.
                    </p>
                  </div>
                </div>
              </section>

              <hr aria-hidden="true" />

              {/* Conformance Status Section */}
              <section id="conformance" aria-labelledby="conformance-heading">
                <h2 id="conformance-heading">
                  <a href="#conformance" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Conformance Status
                </h2>
                <p>
                  The Web Content Accessibility Guidelines (WCAG) define requirements for designers 
                  and developers to improve accessibility for people with disabilities. It defines 
                  three levels of conformance: Level A, Level AA, and Level AAA.
                </p>
                <div className="conformance-status">
                  <div className="status-badge status-partial">
                    <EyeIcon size={20} />
                    <span>Partially Conformant</span>
                  </div>
                  <p className="status-note">
                    This website is currently <strong>partially conformant with WCAG 2.2 Level AA</strong>. 
                    Partially conformant means that some parts of the content do not fully conform to 
                    the accessibility standard. We are actively working to address these issues.
                  </p>
                </div>
              </section>

              <hr aria-hidden="true" />

              {/* Known Limitations Section */}
              <section id="limitations" aria-labelledby="limitations-heading">
                <h2 id="limitations-heading">
                  <a href="#limitations" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Known Limitations
                </h2>
                <p>
                  Despite our best efforts to ensure accessibility, there are some known limitations:
                </p>
                <ul className="limitations-list">
                  <li>
                    <strong>Third-party content:</strong> Some embedded content from external platforms 
                    (such as social media widgets or video players) may not be fully accessible. We 
                    encourage these providers to improve accessibility.
                  </li>
                  <li>
                    <strong>Legacy portfolio items:</strong> Some older portfolio entries may have 
                    limited alternative text. We are actively updating these descriptions.
                  </li>
                  <li>
                    <strong>PDF documents:</strong> Some downloadable PDFs may not be fully accessible. 
                    Please contact us if you need these in an alternative format.
                  </li>
                </ul>
                <p>
                  We are continuously monitoring and improving our accessibility. Please contact us 
                  if you encounter any barriers.
                </p>
              </section>

              <hr aria-hidden="true" />

              {/* Feedback Section */}
              <section id="feedback" aria-labelledby="feedback-heading">
                <h2 id="feedback-heading">
                  <a href="#feedback" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Feedback & Contact
                </h2>
                <p>
                  We welcome your feedback on the accessibility of our website. Please let us know 
                  if you encounter accessibility barriers or have suggestions for improvement.
                </p>

                <div className="feedback-options">
                  <a href="mailto:business@mcc-cal.com?subject=Accessibility%20Feedback" className="feedback-card">
                    <MailIcon size={20} />
                    <div>
                      <h3>Email Us</h3>
                      <p>business@mcc-cal.com</p>
                    </div>
                  </a>
                </div>

                <p className="response-time">
                  <InfoIcon size={16} />
                  We aim to respond to accessibility feedback within 2 business days.
                </p>
              </section>

              <hr aria-hidden="true" />

              {/* Cookie Policy Overview */}
              <section id="cookies-overview" aria-labelledby="cookies-overview-heading">
                <h2 id="cookies-overview-heading">
                  <a href="#cookies-overview" className="anchor" aria-hidden="true">
                    §
                  </a>
                  What Are Cookies?
                </h2>
                <p>
                  Cookies are small text files that are placed on your computer or mobile device when 
                  you visit a website. They are widely used to make websites work more efficiently and 
                  provide information to the website owners.
                </p>
                <p>
                  Cookies can be "persistent" (stored until they expire or you delete them) or 
                  "session" cookies (deleted when you close your browser). They can be set by the 
                  website you are visiting (first-party cookies) or by third parties (third-party cookies).
                </p>

                <div className="cookie-types-grid">
                  <div className="cookie-type-card">
                    <LockIcon size={20} />
                    <h3>Essential Cookies</h3>
                    <p>Required for the website to function. Cannot be disabled.</p>
                  </div>
                  <div className="cookie-type-card">
                    <CheckIcon size={20} />
                    <h3>Functional Cookies</h3>
                    <p>Enable enhanced features like remembering your preferences.</p>
                  </div>
                  <div className="cookie-type-card">
                    <EyeIcon size={20} />
                    <h3>Analytics Cookies</h3>
                    <p>Help us understand how visitors use our website.</p>
                  </div>
                </div>
              </section>

              <hr aria-hidden="true" />

              {/* Cookie Inventory Section */}
              <section id="cookie-inventory" aria-labelledby="cookie-inventory-heading">
                <h2 id="cookie-inventory-heading">
                  <a href="#cookie-inventory" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Cookie Inventory
                </h2>
                <p>
                  Below is a complete list of all cookies used on our website, organized by category:
                </p>

                <div className="cookie-tables">
                  {cookieCategories.map((category) => (
                    <div key={category.id} className="cookie-category">
                      <h3>
                        {category.name} Cookies
                        {category.required && (
                          <span className="required-badge">
                            <LockIcon size={14} /> Required
                          </span>
                        )}
                      </h3>
                      <p className="category-description">{category.description}</p>
                      <div className="cookie-table-wrapper">
                        <table className="cookie-table">
                          <thead>
                            <tr>
                              <th scope="col">Name</th>
                              <th scope="col">Provider</th>
                              <th scope="col">Purpose</th>
                              <th scope="col">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.cookies.map((cookie) => (
                              <tr key={cookie.name}>
                                <td><code>{cookie.name}</code></td>
                                <td>{cookie.provider}</td>
                                <td>{cookie.purpose}</td>
                                <td>{cookie.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <hr aria-hidden="true" />

              {/* Managing Cookies Section */}
              <section id="managing-cookies" aria-labelledby="managing-cookies-heading">
                <h2 id="managing-cookies-heading">
                  <a href="#managing-cookies" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Managing Cookies
                </h2>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can 
                  usually find these settings in the "Options" or "Preferences" menu of your browser. 
                  The following links provide information on managing cookies in popular browsers:
                </p>
                <ul className="browser-links">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-4617-fde51e7e017a" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                </ul>
                <p>
                  Please note that disabling certain cookies may affect the functionality of this website.
                </p>
              </section>

              <hr aria-hidden="true" />

              {/* Third-Party Services Section */}
              <section id="third-party" aria-labelledby="third-party-heading">
                <h2 id="third-party-heading">
                  <a href="#third-party" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Third-Party Services
                </h2>
                <p>
                  We use select third-party services that may set their own cookies. These services 
                  have their own cookie and privacy policies:
                </p>
                <ul>
                  <li>
                    <strong>Google Analytics:</strong> We use Google Analytics to understand website 
                    traffic and usage patterns. This service may set cookies to track anonymous user data. 
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Google Privacy Policy</a>
                  </li>
                  <li>
                    <strong>Embedded Content:</strong> Our site may include embedded content from 
                    third-party platforms (such as social media). These platforms may set cookies 
                    according to their own policies.
                  </li>
                </ul>
              </section>

              <hr aria-hidden="true" />

              {/* Cookie Preference Center */}
              <section id="cookie-settings" aria-labelledby="cookie-settings-heading">
                <h2 id="cookie-settings-heading">
                  <a href="#cookie-settings" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Cookie Preference Center
                </h2>
                <p>
                  Manage your cookie preferences below. Essential cookies are always enabled as they 
                  are necessary for the website to function properly.
                </p>

                <div className="preference-center">
                  <div className="preference-toggles">
                    {cookieCategories.map((category) => (
                      <div key={category.id} className="preference-item">
                        <div className="preference-header">
                          <div className="preference-info">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                          </div>
                          <label className={`toggle-switch ${category.required ? 'locked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isCategoryEnabled(category.id)}
                              onChange={() => handleToggleCategory(category.id)}
                              disabled={category.required}
                              aria-label={`${category.name} cookies ${category.required ? '(required)' : ''}`}
                            />
                            <span className="toggle-slider">
                              {category.required && <LockIcon size={12} />}
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="preference-actions">
                    <button className="btn-secondary" onClick={handleRejectAll}>
                      Reject All
                    </button>
                    <button className="btn-secondary" onClick={handleAcceptAll}>
                      Accept All
                    </button>
                    <button className="btn-primary" onClick={handleSavePreferences}>
                      Save Preferences
                    </button>
                  </div>

                  {showSaveConfirmation && (
                    <div className="save-confirmation" role="status" aria-live="polite">
                      <CheckIcon size={16} />
                      <span>Your preferences have been saved.</span>
                    </div>
                  )}
                </div>

                <div className="consent-info">
                  <AlertCircleIcon size={16} />
                  <p>
                    Your consent preferences are stored for 1 year or until you clear your browser data. 
                    You can change your preferences at any time by returning to this page.
                  </p>
                </div>
              </section>

              <hr aria-hidden="true" />

              {/* Technical Standards Section */}
              <section id="standards" aria-labelledby="standards-heading">
                <h2 id="standards-heading">
                  <a href="#standards" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Technical Standards
                </h2>
                <p>Our accessibility efforts align with the following standards:</p>
                <ul className="standards-list">
                  <li>
                    <strong>WCAG 2.2 Level AA:</strong> Web Content Accessibility Guidelines version 2.2, 
                    Level AA conformance
                  </li>
                  <li>
                    <strong>Section 508:</strong> U.S. federal accessibility standard for electronic and 
                    information technology
                  </li>
                  <li>
                    <strong>EN 301 549:</strong> European standard for accessibility requirements in 
                    public procurement of ICT products and services
                  </li>
                </ul>
              </section>

              <hr aria-hidden="true" />

              {/* Assessment Section */}
              <section id="assessment" aria-labelledby="assessment-heading">
                <h2 id="assessment-heading">
                  <a href="#assessment" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Assessment & Testing
                </h2>
                <p>
                  We assess the accessibility of our website through the following methods:
                </p>
                <ul>
                  <li>Automated testing using Axe DevTools and Lighthouse</li>
                  <li>Manual keyboard navigation testing</li>
                  <li>Screen reader testing with NVDA and VoiceOver</li>
                  <li>Regular accessibility audits and code reviews</li>
                </ul>
                <p className="assessment-date">
                  <strong>Last assessed:</strong> {effectiveDate}
                </p>
              </section>

              {/* Page Footer */}
              <footer className="page-footer">
                <p className="note">
                  This accessibility statement and cookie policy were last updated on {effectiveDate}. 
                  Changes to this policy will be posted on this page.
                </p>
              </footer>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilityPage;
