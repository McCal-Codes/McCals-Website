import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import './faq.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "What's the typical turnaround time?",
    answer:
      'Preview gallery (sneak peeks): Within 72 hours of service. Final edited gallery: 2-4 weeks depending on project scope and season. Rush delivery available for additional fee.',
  },
  {
    question: 'Do you backup my photos?',
    answer:
      'Yes. We maintain redundant backups on multiple drives and cloud storage for 90 days after final delivery. After that period, clients are responsible for maintaining their own backups. We recommend downloading and backing up your gallery immediately upon delivery.',
  },
  {
    question: 'What about model releases or property releases?',
    answer:
      'Required for certain commercial uses—arranged case-by-case. If you plan to use images for advertising, product packaging, or commercial licensing, we\'ll coordinate proper releases with subjects and property owners. Editorial and personal use typically doesn\'t require releases.',
  },
  {
    question: 'Can I share my photos on social media?',
    answer:
      'Yes! Personal social media sharing is encouraged. Please credit @mcc_cal or McCal Media when posting. Commercial use (ads, promotions, business marketing) requires proper licensing—see your project agreement.',
  },
  {
    question: 'What if it rains on my outdoor shoot?',
    answer:
      "We monitor weather forecasts closely. For outdoor sessions, we'll discuss backup indoor locations or reschedule options if severe weather is expected. Light rain can create beautiful moody photos if you're game! See our Cancellations & Force Majeure sections for policy details.",
  },
  {
    question: 'Do you provide raw/unedited files?',
    answer:
      'Our standard deliverables are professionally edited high-resolution JPEGs. Raw files are not included unless specifically negotiated and paid for, as they represent our unfinished creative work. Edited files showcase our artistic vision and professional standards.',
  },
  {
    question: 'How many photos will I receive?',
    answer:
      'Varies by project type. Concert coverage: 50-150 edited images. Corporate events: 100-300 images. Portrait sessions: 25-75 images. Specific deliverable counts are outlined in your project agreement.',
  },
  {
    question: 'Do you shoot corporate headshots or LinkedIn headshots?',
    answer:
      'Yes. On-location corporate headshots, LinkedIn headshots, and personal branding sessions are available for individuals, executives, and full teams, in addition to editorial portrait work. See the Portraits page for examples of past sessions.',
  },
  {
    question: 'How much does event or conference photography cost in Pittsburgh?',
    answer:
      'Pricing depends on coverage length, number of locations, and turnaround needs, so every corporate event and conference project gets a custom quote rather than a flat rate. Request a quote for pricing based on your specific event.',
  },
  {
    question: 'Do you travel outside Pittsburgh for assignments?',
    answer:
      'Yes. Coverage is based in Pittsburgh and Western Pennsylvania, with travel available for corporate, editorial, and political assignments further out, including past work in Washington, D.C. Travel fees may apply depending on distance.',
  },
];

const FAQPage = () => {
  usePageMeta({
    title: 'FAQ | McCal Media',
    description:
      'Frequently asked questions about McCal Media photography services, turnaround times, backups, licensing, and more.',
    canonical: `${SITE_URL}/faq`,
    og: {
      type: 'website',
      title: 'FAQ | McCal Media',
      description: 'Find answers to common questions about photography services.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'FAQ | McCal Media',
      description: 'Frequently asked questions about photography services.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_DATA.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  });

  return (
    <Layout>
      <div className="faq-page-wrapper">
        <div className="faq-container">
          <header className="faq-header">
            <h1>Frequently Asked Questions</h1>
            <p className="faq-subtitle">
              Find answers to common questions about our photography services.
            </p>
          </header>

          <div className="faq-accordion">
            {FAQ_DATA.map((faq: FAQItem, index: number) => (
              <details key={index} className="faq-item">
                <summary>{faq.question}</summary>
                <div className="faq-content">{faq.answer}</div>
              </details>
            ))}
          </div>

          <div className="faq-footer">
            <p>
              Still have questions?{' '}
              <a href="/policies-legal" className="faq-link">
                Check our Policies & Legal page
              </a>{' '}
              or{' '}
              <a href="mailto:business@mcc-cal.com" className="faq-link">
                contact us
              </a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
