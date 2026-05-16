import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import './policies-legal.css';

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

// Prefers reduced motion check (outside component for SSR safety)
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const PoliciesLegalPage = () => {
  const currentYear: number = new Date().getFullYear();
  usePageMeta({
    title: 'Policies & Legal | McCal Media',
    description:
      'Official policies, terms of service, privacy policy, and legal information for McCal Media\'s professional photography services.',
    canonical: `${SITE_URL}/policies-legal`,
    og: {
      type: 'website',
      title: 'Policies & Legal | McCal Media',
      description: 'View our photography usage license, privacy policy, and service terms.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Policies & Legal | McCal Media',
      description: 'Terms of service, privacy policy, and legal notices for McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Policies & Legal',
      description:
        'McCal Media\'s terms of service, privacy policy, cookie policy, and usage license for professional photography services.',
      url: `${SITE_URL}/policies-legal`,
      publisher: {
        '@type': 'Organization',
        name: 'McCal Media',
        url: SITE_URL,
      },
      datePublished: '2025-01-27',
      dateModified: '2025-12-31',
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

  const mainRef = useRef<HTMLElement>(null);

  // Reading time calculation
  useEffect(() => {
    if (mainRef.current) {
      const text = mainRef.current.innerText ?? mainRef.current.textContent ?? '';
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

  // Memoize nav sections to avoid recalculation on every render
  const navSections: NavSection[] = useMemo(
    () => [
      {
        title: 'License',
        open: true,
        items: filteredNavItems([{ label: 'Overview', href: '#license' }]),
      },
      {
        title: 'Privacy Policy',
        open: false,
        items: filteredNavItems([{ label: 'Overview', href: '#privacy' }]),
      },
      {
        title: 'Cookie Policy',
        open: false,
        items: filteredNavItems([{ label: 'Overview', href: '#cookies' }]),
      },
      {
        title: 'Terms & Conditions',
        open: true,
        items: filteredNavItems([
          { label: 'Overview', href: '#terms-overview' },
          { label: 'Pre-Project Consultation', href: '#consultation' },
          { label: 'Cost', href: '#cost' },
          { label: 'Fees', href: '#fees' },
          { label: 'Late Fees', href: '#late' },
          { label: 'Expenses', href: '#expenses' },
          { label: 'Account Access', href: '#account' },
          { label: 'Confidentiality', href: '#confidentiality' },
          { label: 'Relationships', href: '#relationships' },
          { label: 'Intellectual Property', href: '#ip' },
          { label: 'School & University Graduation Event Use', href: '#graduation-event-use' },
          { label: 'Client Logos & Third-Party Marks', href: '#client-logos' },
          { label: 'Style Release', href: '#style' },
          { label: 'Limit of Liability', href: '#liability' },
          { label: 'Indemnification', href: '#indemnification' },
          { label: 'Assumption of Risk', href: '#risk' },
          { label: 'Non-Disparagement', href: '#non-disparagement' },
          { label: 'Cancellations & Rescheduling', href: '#cancellations' },
          { label: 'Force Majeure', href: '#force' },
          { label: 'No-Shows', href: '#no-shows' },
          { label: 'Governing Law', href: '#law' },
          { label: 'Notice', href: '#notice' },
          { label: 'Severability', href: '#severability' },
          { label: 'Amendments', href: '#amendments' },
          { label: 'Assignments', href: '#assignments' },
        ]),
      },
      {
        title: 'Contact',
        open: false,
        items: filteredNavItems([{ label: 'Overview', href: '#contact' }]),
      },
    ],
    [filteredNavItems]
  );

  return (
    <Layout>
      <div className="policy-page-wrapper">
        <div className="policy-container">
          <a className="policy-skip" href="#policy-main">
            Skip to main content
          </a>

          <div className="policy-site" role="document" aria-labelledby="policy-title">
        {/* Reading Progress Bar */}
        <div
          className="policy-progress"
          aria-hidden="true"
          style={{ transform: `scaleX(${progress})` }}
        />

        {/* Mobile drawer toggle */}
        <button
          className="toc-toggle"
          aria-controls="policy-toc"
          aria-expanded={navOpen}
          aria-label="Open policies navigation"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
        >
          Menu
        </button>

        {/* Overlay */}
        <div
          className={`policy-scrim ${navOpen ? 'active' : ''}`}
          aria-hidden="true"
          onClick={() => setNavOpen(false)}
        />

        {/* Sidebar / TOC */}
        <aside
          id="policy-toc"
          className={`policy-toc ${navOpen ? 'open' : ''}`}
          role="navigation"
          aria-label="Policies & Legal navigation"
        >
          <div className="label">Section Discovery</div>
          <div className="nav-search-wrapper">
            <input
              type="search"
              id="navSearch"
              placeholder="Search keywords..."
              aria-label="Filter legal sections"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="label">Policies & Legal</div>
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
        <main id="policy-main" className="policy-main" ref={mainRef} role="main">
          <header>
            <h1 id="policy-title">Policies & Legal</h1>
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
            <a
              id="download-terms"
              className="download-btn active-btn"
              href="mailto:business@mcc-cal.com?subject=Request%20for%20Terms%20%26%20Conditions%20PDF"
              title="Contact us for a copy of the full Terms & Conditions (PDF)"
              aria-label="Contact us for Terms and Conditions PDF"
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Terms PDF</span>
            </a>
            <a
              id="download-license"
              className="download-btn active-btn"
              href="mailto:business@mcc-cal.com?subject=Request%20for%20Usage%20License%20PDF"
              title="Contact us for a copy of the Usage License (PDF)"
              aria-label="Contact us for Usage License PDF"
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>License PDF</span>
            </a>
            <button
              className="download-btn active-btn"
              onClick={() => window.print()}
              title="Print this page to PDF for your records"
              aria-label="Print Policies to PDF"
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

          {/* License Section */}
          <section id="license" aria-labelledby="license-heading">
            <h2 id="license-heading">
              <a href="#license" className="anchor" aria-hidden="true">
                §
              </a>
              License (Usage Rights)
            </h2>
            <p>
              Unless otherwise agreed in writing, photography delivered by McCal Media is licensed—not
              sold—for the specific usage described on your invoice or contract. All other rights are
              reserved.
            </p>
            <p>
              Licensed images may be used only for the purposes stated in your agreement. Unauthorized
              redistribution, resale, or sublicensing is prohibited. For expanded usage rights or
              commercial licensing, please contact us.
            </p>
          </section>

          <hr aria-hidden="true" />

          {/* Privacy Policy Section */}
          <section id="privacy" aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">
              <a href="#privacy" className="anchor" aria-hidden="true">
                §
              </a>
              Privacy Policy
            </h2>
            <p>
              We collect the minimum personal information necessary to provide services, manage
              bookings, and share updates you opt into. Your data is never sold or shared with third
              parties without your explicit consent.
            </p>
            <p>
              <strong>What we collect:</strong> Name, email address, phone number, project details,
              payment information (processed securely via third-party providers).
            </p>
            <p>
              <strong>How we use it:</strong> Service delivery, invoicing, project communication,
              optional newsletter (unsubscribe anytime).
            </p>
            <p>
              <strong>Data retention:</strong> We retain client data for the duration of our business
              relationship plus required legal retention periods. You may request data deletion at any
              time.
            </p>
            <p>
              <strong>Your rights:</strong> Access, correct, or delete your personal data by contacting
              us at <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a>.
            </p>
            <p className="policy-cross-link">
              For accessibility accommodations or to exercise your data rights, please visit our{' '}
              <a href="/accessibility">Accessibility & Cookie Policy</a> page.
            </p>
          </section>

          <hr aria-hidden="true" />

          {/* Cookie Policy Section */}
          <section id="cookies" aria-labelledby="cookies-heading">
            <h2 id="cookies-heading">
              <a href="#cookies" className="anchor" aria-hidden="true">
                §
              </a>
              Cookie Policy
            </h2>
            <p>
              We use essential cookies for core site features (session management, secure forms) and may
              use analytics or embedded services that set their own cookies.
            </p>
            <p>
              <strong>Essential cookies:</strong> Required for website functionality, cannot be
              disabled.
            </p>
            <p>
              <strong>Analytics cookies:</strong> Help us understand visitor behavior (Google Analytics,
              anonymized).
            </p>
            <p>
              <strong>Third-party cookies:</strong> Social media embeds or payment processors may set
              cookies governed by their policies.
            </p>
            <p>
              Most browsers allow cookie management in settings. Disabling non-essential cookies may
              affect site functionality.
            </p>
            <p className="policy-cross-link">
              <a href="/accessibility">View full Accessibility & Cookie Policy</a> for detailed
              cookie inventory, preference management, and accessibility information.
            </p>
          </section>

          <hr aria-hidden="true" />

          {/* Terms & Conditions Section */}
          <section id="terms" aria-labelledby="terms-heading">
            <h2 id="terms-heading">
              <a href="#terms" className="anchor" aria-hidden="true">
                §
              </a>
              Terms & Conditions
            </h2>
            <p id="terms-overview">
              <strong>Overview:</strong> These Terms & Conditions govern the relationship between McCal
              Media (the &quot;Contractor&quot;) and its Clients. By booking, commissioning, or using services,
              you agree to these terms and the responsibilities they outline.
            </p>

            <section id="consultation" aria-labelledby="consultation-heading">
              <h3 id="consultation-heading">
                <a href="#consultation" className="anchor" aria-hidden="true">
                  §
                </a>
                Pre-Project Consultation
              </h3>
              <p>
                The Contractor shall provide the Client with one thirty to sixty-minute pre-service
                consultation. The Parties shall agree on an acceptable date and time for conducting the
                pre-service consultation. Still, the manner by which the consultation shall be conducted
                shall be at the Contractor&apos;s discretion. This consultation is usually conducted via
                phone, video chat, or in person. This consultation may be scheduled no later than a week
                or more before the event.
              </p>
            </section>

            <section id="cost" aria-labelledby="cost-heading">
              <h3 id="cost-heading">
                <a href="#cost" className="anchor" aria-hidden="true">
                  §
                </a>
                Cost
              </h3>
              <p>
                The total cost of all Services the Contractor agrees to provide to the Client is on an
                agreed basis in addition to (the &quot;Total Cost&quot;). The total cost includes contractor&apos;s
                services, setup time, travel and out-of-pocket expenses, software licenses,
                administrative fees, assistance, subcontractor costs, and additional costs during an
                ongoing project.
              </p>
            </section>

            <section id="fees" aria-labelledby="fees-heading">
              <h3 id="fees-heading">
                <a href="#fees" className="anchor" aria-hidden="true">
                  §
                </a>
                Fees
              </h3>
              <p>
                The contractor&apos;s compensation is determined on a per-project basis, as outlined in the
                estimate provided to the Client.
              </p>
            </section>

            <section id="late" aria-labelledby="late-heading">
              <h3 id="late-heading">
                <a href="#late" className="anchor" aria-hidden="true">
                  §
                </a>
                Late Fees
              </h3>
              <p>
                If the Contractor does not receive payment from the Client within fourteen calendar days
                of any payment date, the Client will be charged a late fee of 1.5% of the outstanding
                amount per day that the Contractor does not receive it.
              </p>
              <ul>
                <li>
                  <strong>For example:</strong> The Client owes the Contractor $1000 due on April 1 and
                  fails to pay by April 14th. On April 15th, the Client owes the Contractor $1015. On
                  April 16th, the Client owes the Contractor $1030.23. On April 17th, the Client owes
                  the Contractor $1045.68, and so on.
                </li>
              </ul>
            </section>

            <section id="expenses" aria-labelledby="expenses-heading">
              <h3 id="expenses-heading">
                <a href="#expenses" className="anchor" aria-hidden="true">
                  §
                </a>
                Expenses
              </h3>
              <p>
                Any expenses incurred by the Contractor while providing the Client with Services will be
                invoiced to the Client promptly. The Client is responsible for paying for and delivering
                any third-party software licenses or products the Contractor wishes to utilize. At the
                Contractor&apos;s discretion, the Contractor will make reasonable efforts to integrate the
                Client&apos;s suggested software or products.
              </p>
            </section>

            <section id="account" aria-labelledby="account-heading">
              <h3 id="account-heading">
                <a href="#account" className="anchor" aria-hidden="true">
                  §
                </a>
                Account Access
              </h3>
              <p>
                The Client shall provide the Contractor access to the accounts no later than 48 hours
                before the day after the day of service. Via: [Software / Email]
              </p>
            </section>

            <section id="confidentiality" aria-labelledby="confidentiality-heading">
              <h3 id="confidentiality-heading">
                <a href="#confidentiality" className="anchor" aria-hidden="true">
                  §
                </a>
                Confidentiality
              </h3>
              <p>
                Parties will treat and hold all information about this Agreement and the Services
                provided. The Parties&apos; businesses in strict confidence and will not use any of this
                information except in connection with fulfilling the terms of this Agreement, and, if
                this Agreement is terminated for whatever reason, Parties will return all such
                information, including account access information, and any and all copies to the
                original Party. They will remain bound to the Confidentiality provision of this
                Agreement.
              </p>
              <p>
                Confidential information (herein &quot;Confidential Information&quot;) means information that is
                of value to its owner and is treated as proprietary or confidential, including, but not
                limited to, intellectual property, inventions, trade secrets or information, financial
                data or information, speculation, knowledge, general Company data or reports, future
                business plans, strategies, customer lists and information, client acquisition
                strategies, advertising campaigns, information regarding executives and employees, and
                the terms and provisions of this Agreement.
              </p>
              <p>
                Further, at all times, neither Party shall use or disclose any Confidential Information
                relating in any way to the past, present, or future business affairs, conditions,
                clients, customers, efforts, employees, financial data, operations, practices, products,
                processes, properties, sales, or services of or relating in any way to the Company in
                whatever form to any parties outside of this Agreement.
              </p>
              <p>
                This Agreement imposes no obligation upon the Parties concerning any Confidential
                Information that was possessed before initial business interactions commenced between
                the Parties; is or becomes a matter of public knowledge through no fault of receiving
                Party; is rightfully obtained from a third party not owing a duty of confidentiality; is
                disclosed without a duty of confidentiality to a third party by, or with the
                authorization of the disclosing Party; or is independently developed by either Party
                without prior knowledge of privileged or confidential information.
              </p>
            </section>

            <section id="relationships" aria-labelledby="relationships-heading">
              <h3 id="relationships-heading">
                <a href="#relationships" className="anchor" aria-hidden="true">
                  §
                </a>
                Relationships of the Parties
              </h3>
              <p>
                The Contractor and any related sub-contractors are not employees, partners, or members
                of the Client&apos;s company or organization. The Contractor has the sole right to control
                and direct the means, manner, and method by which the services in this Agreement are
                performed. The Contractor can hire assistants, subcontractors, or employees to provide
                the Client with its Services. Parties are individually and separately responsible for
                their business operation and expenses, including securing or paying licensing fees,
                insurance, taxes (including FICA), registrations, or permits. The Client is not
                responsible for paying the Contractor for any benefits, Worker&apos;s Compensation,
                insurance, or unemployment fees.
              </p>
            </section>

            <section id="ip" aria-labelledby="ip-heading">
              <h3 id="ip-heading">
                <a href="#ip" className="anchor" aria-hidden="true">
                  §
                </a>
                Intellectual Property
              </h3>
              <p>
                The Contractor retains its copyright ownership in any and all designs pursuant to
                federal copyright law (Chapter 17, Section 201-02 of the United States Code.) Any and
                all work produced in connection with, or in the process of fulfilling this Agreement,
                are expressly and solely owned by the Contractor. The Contractor grants Client a
                nontransferable, non-exclusive, royalty-free license of photos produced with and for
                Client for the specific purpose agreed to in the licensing agreement. Any unauthorized
                use of the design, such as using the design for purposes other than those specified
                herein, will result in additional fees and/or royalty payments to the Contractor.
              </p>
              <p>
                Parties own their respective trademarks and intellectual property used in the standard
                and separate course of their business and agree not to infringe upon or otherwise use
                each other&apos;s respective intellectual property except when providing Client with its
                Services.
              </p>
            </section>

            <section id="graduation-event-use" aria-labelledby="graduation-event-use-heading">
              <h3 id="graduation-event-use-heading">
                <a href="#graduation-event-use" className="anchor" aria-hidden="true">
                  §
                </a>
                School &amp; University Graduation Event Use
              </h3>
              <p>
                Some school and university graduation event photographs displayed on this site were
                created by Caleb McCartney while working on assignment with GradImages or related
                commencement photography coverage. Those images are displayed with permission and
                are included only to show Caleb&apos;s photographic work, event coverage experience,
                and portfolio history.
              </p>
              <p>
                McCal Media does not claim ownership of third-party graduation photography rights,
                does not sell or license these images, does not provide prints or downloads, and does
                not represent that it is any school&apos;s official graduation photography vendor unless
                separately stated in writing. Copyrights, trademarks, school names, graduate likenesses,
                and related rights remain with their respective owners, clients, vendors, schools, or
                subjects as applicable.
              </p>
              <p>
                If you are a graduate, family member, school representative, vendor, or rights holder
                with a question about a displayed graduation image, contact{' '}
                <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a> so the image can be
                reviewed promptly.
              </p>
            </section>

            <section id="client-logos" aria-labelledby="client-logos-heading">
              <h3 id="client-logos-heading">
                <a href="#client-logos" className="anchor" aria-hidden="true">
                  §
                </a>
                Client Logos &amp; Third-Party Marks
              </h3>
              <p>
                Client, publication, school, university, nonprofit, venue, and brand logos shown on
                this site are used to identify organizations Caleb McCartney or McCal Media has
                worked with, contributed to, photographed for, collaborated with, or been published by.
                All logos, names, trademarks, and service marks remain the property of their respective
                owners.
              </p>
              <p>
                Displaying a logo does not imply sponsorship, endorsement, exclusive partnership, or
                official vendor status unless that relationship is separately stated in writing.
              </p>
            </section>

            <section id="style" aria-labelledby="style-heading">
              <h3 id="style-heading">
                <a href="#style" className="anchor" aria-hidden="true">
                  §
                </a>
                Style Release
              </h3>
              <p>
                The Client has spent satisfactory time reviewing the Contractor&apos;s work and reasonably
                expects that the Contractor&apos;s Services will produce a similar outcome and result for the
                Client. The Contractor will use reasonable efforts to ensure the Client&apos;s services are
                carried out in a style and manner consistent with the Contractor&apos;s current portfolio and
                services. The Contractor will try to incorporate any suggestions the Client makes.
                However, the Client understands and agrees that:
              </p>
              <ul>
                <li>
                  Every client and final delivery is different, with different tastes, budgets, and
                  needs;
                </li>
                <li>
                  Photography is a subjective service, and the Contractor is a provider with a unique
                  vision and an ever-evolving style and technique;
                </li>
                <li>
                  Contractor will use his judgment to create favorable results for Client, which may not
                  include strict adherence to Client&apos;s suggestions;
                </li>
                <li>
                  Dissatisfaction with the Contractor&apos;s independent judgment or individual management
                  style is not a valid reason for terminating this Agreement or requesting any monies
                  returned.
                </li>
              </ul>
            </section>

            <section id="liability" aria-labelledby="liability-heading">
              <h3 id="liability-heading">
                <a href="#liability" className="anchor" aria-hidden="true">
                  §
                </a>
                Limit of Liability
              </h3>
              <p>
                Client agrees that the maximum amount of damages he/she/they are entitled to in any
                claim of or relating to this Agreement or Services provided herein are not to exceed
                Contractor&apos;s total cost as outlined in this Agreement.
              </p>
            </section>

            <section id="indemnification" aria-labelledby="indemnification-heading">
              <h3 id="indemnification-heading">
                <a href="#indemnification" className="anchor" aria-hidden="true">
                  §
                </a>
                Indemnification
              </h3>
              <p>
                Client agrees to indemnify and hold harmless Contractor and its employees, agents, and
                independent contractors for any injury, property damage, liability, claim, or other
                cause of action arising from or related to Services provided herein.
              </p>
            </section>

            <section id="risk" aria-labelledby="risk-heading">
              <h3 id="risk-heading">
                <a href="#risk" className="anchor" aria-hidden="true">
                  §
                </a>
                Assumption of Risk
              </h3>
              <p>
                Client and related parties/participants expressly assume any risk of photography and
                related activities as described herein.
              </p>
            </section>

            <section id="non-disparagement" aria-labelledby="non-disparagement-heading">
              <h3 id="non-disparagement-heading">
                <a href="#non-disparagement" className="anchor" aria-hidden="true">
                  §
                </a>
                Non-Disparagement
              </h3>
              <p>
                The Parties mutually agree not to make public defamatory statements that would
                materially harm the reputation or business activities of any Parties to this Agreement.
              </p>
            </section>

            <section id="cancellations" aria-labelledby="cancellations-heading">
              <h3 id="cancellations-heading">
                <a href="#cancellations" className="anchor" aria-hidden="true">
                  §
                </a>
                Cancellations & Rescheduling
              </h3>
              <p>
                If the Client desires to cancel or reschedule Services, the following policies apply:
              </p>
              <ul>
                <li>
                  <strong>More than 30 days before service:</strong> Full refund minus 10%
                  administrative fee
                </li>
                <li>
                  <strong>15-30 days before service:</strong> 50% refund of deposit
                </li>
                <li>
                  <strong>Less than 15 days before service:</strong> No refund; deposit forfeited
                </li>
                <li>
                  <strong>Rescheduling:</strong> First reschedule free if more than 30 days notice;
                  subsequent reschedules subject to availability and $100 fee
                </li>
              </ul>
              <p>
                The Contractor reserves the right to cancel services due to equipment failure, illness,
                or force majeure with full refund and assistance finding alternative providers.
              </p>
            </section>

            <section id="force" aria-labelledby="force-heading">
              <h3 id="force-heading">
                <a href="#force" className="anchor" aria-hidden="true">
                  §
                </a>
                Force Majeure
              </h3>
              <p>
                Either party may choose to be excused from further performance obligations in the event
                of a disastrous occurrence beyond their control including but not limited to: natural
                disasters, pandemics, government orders, acts of war, terrorism, extreme weather, venue
                closures, or transportation failures. In such cases, deposits may be applied to
                rescheduled dates or refunded at the Contractor&apos;s discretion.
              </p>
            </section>

            <section id="no-shows" aria-labelledby="no-shows-heading">
              <h3 id="no-shows-heading">
                <a href="#no-shows" className="anchor" aria-hidden="true">
                  §
                </a>
                No-Shows
              </h3>
              <p>
                Suppose it becomes impossible for the Contractor to render Services due to the fault of
                the Client or related parties (failure to appear, denial of venue access, inadequate
                preparation, intoxication, or safety concerns). In that case, the Contractor may elect
                to leave the service location without rendering Services, and no refund will be issued.
                The Client remains responsible for full payment as outlined in the contract.
              </p>
            </section>

            <section id="law" aria-labelledby="law-heading">
              <h3 id="law-heading">
                <a href="#law" className="anchor" aria-hidden="true">
                  §
                </a>
                Governing Law
              </h3>
              <p>
                The laws of the United States and the jurisdiction of Pennsylvania govern all matters
                arising under this Agreement. Any disputes shall be resolved through mediation or
                binding arbitration in Allegheny County, Pennsylvania, before resorting to litigation.
                Each party is responsible for their own legal fees unless otherwise awarded by a court
                or arbitrator.
              </p>
            </section>

            <section id="notice" aria-labelledby="notice-heading">
              <h3 id="notice-heading">
                <a href="#notice" className="anchor" aria-hidden="true">
                  §
                </a>
                Notice
              </h3>
              <p>
                Parties shall provide adequate notice (&quot;Notice&quot;) to each other, including any payments,
                invoices, contract amendments, or formal communications, via email to the addresses
                specified in the project agreement. Notice is considered delivered when sent via email
                with read receipt or 3 business days after mailing via certified mail. Emergency
                communications may be made via phone with follow-up written confirmation.
              </p>
            </section>

            <section id="severability" aria-labelledby="severability-heading">
              <h3 id="severability-heading">
                <a href="#severability" className="anchor" aria-hidden="true">
                  §
                </a>
                Severability
              </h3>
              <p>
                If any portion of this Agreement is deemed illegal, invalid, or unenforceable by a court
                of competent jurisdiction, the remaining provisions shall remain in full force and
                effect. The parties agree to replace any invalid provision with a valid provision that
                most closely approximates the original intent.
              </p>
            </section>

            <section id="amendments" aria-labelledby="amendments-heading">
              <h3 id="amendments-heading">
                <a href="#amendments" className="anchor" aria-hidden="true">
                  §
                </a>
                Amendments
              </h3>
              <p>
                The parties may amend this Agreement only by written agreement signed by both parties
                with proper Notice. Verbal agreements or email discussions do not constitute amendments
                unless formalized in writing. Project-specific addendums may be created for individual
                engagements while maintaining these general terms.
              </p>
            </section>

            <section id="assignments" aria-labelledby="assignments-heading">
              <h3 id="assignments-heading">
                <a href="#assignments" className="anchor" aria-hidden="true">
                  §
                </a>
                Assignments
              </h3>
              <p>
                Unless otherwise provided herein, neither party may assign or subcontract any rights or
                obligations under this Agreement without proper Notice and written consent from the
                other party. The Contractor may use assistant photographers or subcontractors as needed
                to fulfill services, maintaining quality standards and confidentiality. Clients may not
                transfer service agreements to third parties without Contractor approval.
              </p>
            </section>
          </section>

          <hr aria-hidden="true" />

          {/* FAQ Link Section */}
          <section className="faq-link-section" aria-labelledby="faq-link-heading">
            <h2 id="faq-link-heading">Questions?</h2>
            <p>
              Have questions about our services?{' '}
              <a href="/faq" className="faq-link">
                Check our FAQ page
              </a>{' '}
              for answers to commonly asked questions about turnaround times, photo backups, licensing, and more.
            </p>
          </section>

          {/* Contact Section */}
          <section id="contact" aria-labelledby="contact-heading">
            <h2 id="contact-heading">
              <a href="#contact" className="anchor" aria-hidden="true">
                §
              </a>
              Contact
            </h2>
            <address>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a>
                <br />
                <strong>Phone:</strong>{' '}
                <a href="tel:+15702991214">570-299-1214</a>
                <br />
                <strong>Company:</strong> McCal Media
                <br />
                Pittsburgh, PA
              </p>
            </address>
            <p className="note">
              © {currentYear} McCal Media — All rights reserved.
            </p>
          </section>
        </main>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Policies & Legal',
                item: `${SITE_URL}/policies-legal`,
              },
            ],
          }),
        }}
      />
      </div>
      </div>
      </div>
    </Layout>
  );
};

export default PoliciesLegalPage;
