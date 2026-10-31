import { Link } from 'react-router-dom';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import './policies-legal.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/**
 * Index for the legal documents.
 *
 * This route used to hold all of them — 1,075 lines across licensing, privacy,
 * cookies and a 24-section client agreement. Each is now its own page, so a client
 * can be sent the terms without the rest, and each can be found on its own terms.
 *
 * The route is kept rather than redirected: it is linked from the footer, the FAQ,
 * the podcast page and the contact form, and it is in the sitemap. The section ids
 * below are the ones the old page used, so existing `#license`, `#privacy` and
 * `#terms` links still land on something that points onward.
 */

const DOCUMENTS = [
  {
    id: 'license',
    to: '/licensing',
    title: 'Image Licensing',
    description:
      'Usage rights for delivered photography — what a licence covers, how it is scoped, credit requirements, and how to request one.',
  },
  {
    id: 'privacy',
    to: '/privacy',
    title: 'Privacy & Cookies',
    description:
      'How personal information is collected, used and protected, and how cookies are used on this site.',
  },
  {
    id: 'terms',
    to: '/terms',
    title: 'Terms & Conditions',
    description:
      'The client agreement: consultation, cost and fees, intellectual property, cancellations, liability, and governing law.',
  },
] as const;

export default function PoliciesLegalPage() {
  usePageMeta({
    title: 'Policies & Legal | McCal Media',
    description:
      'Image licensing, privacy and cookie policy, and terms of service for McCal Media photography.',
    canonical: `${SITE_URL}/policies-legal`,
    og: {
      type: 'website',
      title: 'Policies & Legal | McCal Media',
      description: 'Image licensing, privacy, and terms of service for McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Policies & Legal | McCal Media',
      description: 'Image licensing, privacy, and terms of service for McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Policies & Legal',
      description:
        "Index of McCal Media's legal documents: image licensing, privacy and cookies, and terms of service.",
      url: `${SITE_URL}/policies-legal`,
      publisher: { '@type': 'Organization', name: 'McCal Media', url: SITE_URL },
      inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: 'McCal Media', url: SITE_URL },
      hasPart: DOCUMENTS.map((doc) => ({
        '@type': 'WebPage',
        name: doc.title,
        description: doc.description,
        url: `${SITE_URL}${doc.to}`,
      })),
    },
  });

  return (
    <Layout>
      <div className="policy-page-wrapper">
        <div className="policy-container">
          <a className="policy-skip" href="#policy-main">
            Skip to main content
          </a>

          <div className="policy-site policy-site--hub" role="document" aria-labelledby="policy-title">
            <main id="policy-main" className="policy-main" role="main">
              <header className="policy-hero">
                <div className="policy-hero__content">
                  <h1 id="policy-title">Policies &amp; Legal</h1>
                  <p className="policy-hero__intro">
                    Three documents cover how McCal Media works: what you may do with delivered
                    photography, how your data is handled, and the terms of an engagement.
                  </p>
                </div>
              </header>

              <nav className="policy-hub" aria-label="Legal documents">
                <ul className="policy-hub__list">
                  {DOCUMENTS.map((doc) => (
                    <li key={doc.to} id={doc.id} className="policy-hub__item">
                      <h2 className="policy-hub__title">
                        <Link to={doc.to}>{doc.title}</Link>
                      </h2>
                      <p className="policy-hub__description">{doc.description}</p>
                    </li>
                  ))}
                </ul>
              </nav>

              <section id="contact" aria-labelledby="contact-heading">
                <h2 id="contact-heading">
                  <a href="#contact" className="anchor" aria-hidden="true">
                    §
                  </a>
                  Questions
                </h2>
                <p>
                  Practical questions are often answered on the{' '}
                  <Link to="/faq">FAQ page</Link>. For anything about these documents, email{' '}
                  <a href="mailto:business@mcc-cal.com">business@mcc-cal.com</a>.
                </p>
              </section>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
