import { Link } from 'react-router-dom';
import LegalDocument from '@/components/legal/LegalDocument';
import type { LegalGlanceItem, LegalNavSection } from '@/components/legal/LegalDocument';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/**
 * Privacy and cookie disclosure.
 *
 * Cookies live here rather than on their own route: they are part of the same
 * disclosure about what is collected, and a standalone cookie page would be thin
 * enough to be worth nothing to a reader or to search.
 */

const NAV_SECTIONS: LegalNavSection[] = [
  {
    title: 'Privacy',
    open: true,
    items: [{ label: 'Privacy Policy', href: '#privacy' }],
  },
  {
    title: 'Cookies',
    open: true,
    items: [{ label: 'Cookie Policy', href: '#cookies' }],
  },
];

const GLANCE_ITEMS: LegalGlanceItem[] = [
  { label: 'Privacy', href: '#privacy', description: 'Data handling' },
  { label: 'Cookies', href: '#cookies', description: 'Cookie basics' },
];

export default function PrivacyPage() {
  usePageMeta({
    title: 'Privacy & Cookies | McCal Media',
    description:
      'How McCal Media collects, uses, and protects personal information, and how cookies are used on this site.',
    canonical: `${SITE_URL}/privacy`,
    og: {
      type: 'website',
      title: 'Privacy & Cookies | McCal Media',
      description: 'How McCal Media handles personal data and cookies.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Privacy & Cookies | McCal Media',
      description: 'How McCal Media handles personal data and cookies.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy & Cookies',
      description: "McCal Media's privacy policy and cookie policy.",
      url: `${SITE_URL}/privacy`,
      publisher: { '@type': 'Organization', name: 'McCal Media', url: SITE_URL },
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'McCal Media', url: SITE_URL },
    },
  });

  return (
    <LegalDocument
      title="Privacy & Cookies"
      intro="How personal information is collected, used, and protected, and how cookies are used on this site."
      effectiveDate="2026-08-11"
      navLabel="Privacy & Cookies"
      navSections={NAV_SECTIONS}
      glanceItems={GLANCE_ITEMS}
    >
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
        <aside className="policy-cross-link" aria-label="Accessibility and data rights">
          <span className="policy-cross-link__eyebrow">Related policy</span>
          <p>
            For accessibility accommodations or to exercise your data rights, visit the dedicated
            accessibility and cookie policy page.
          </p>
          <a href="/accessibility">Accessibility & Cookie Policy</a>
        </aside>
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
        <aside className="policy-cross-link" aria-label="Cookie preferences and accessibility">
          <span className="policy-cross-link__eyebrow">Preferences and access</span>
          <p>
            Detailed cookie inventory, preference management, and accessibility information live
            on the dedicated accessibility page.
          </p>
          <a href="/accessibility">View Accessibility & Cookie Policy</a>
        </aside>
      </section>

      <hr aria-hidden="true" />

      {/* Terms & Conditions Section */}

      <hr aria-hidden="true" />

      <section id="privacy-more" aria-labelledby="privacy-more-heading">
        <h2 id="privacy-more-heading">
          <a href="#privacy-more" className="anchor" aria-hidden="true">
            §
          </a>
          Related policies
        </h2>
        <p>
          For usage rights covering photography, see <Link to="/licensing">Image Licensing</Link>.
          For service terms, see <Link to="/terms">Terms &amp; Conditions</Link>.
        </p>
      </section>
    </LegalDocument>
  );
}
