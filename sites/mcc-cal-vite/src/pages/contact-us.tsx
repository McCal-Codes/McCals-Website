import { Layout } from '@/components';
import { ContactForm } from '@/components/forms';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const ContactUsPage = () => {
  usePageMeta({
    title: 'Contact Us | McCal Media',
    description: 'Contact Pittsburgh photographer Caleb McCartney for event coverage, concert photography, headshots, and commercial projects. Get a response within 24 hours.',
    canonical: `${SITE_URL}/contact-us`,
    og: {
      type: 'website',
      title: 'Contact Us | McCal Media',
      description: 'Contact Pittsburgh photographer Caleb McCartney for event coverage, concert photography, headshots, and commercial projects. Get a response within 24 hours.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Contact Us | McCal Media',
      description: 'Contact Pittsburgh photographer Caleb McCartney for event coverage, concert photography, headshots, and commercial projects. Get a response within 24 hours.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact McCal Media',
      description: 'Contact page for McCal Media photography services.',
      mainEntity: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
        jobTitle: 'Photojournalist and Event Photographer',
        worksFor: {
          '@type': 'Organization',
          name: 'McCal Media',
          url: SITE_URL,
        },
      },
    },
  });

  return (
    <Layout>
      <ContactForm />
    </Layout>
  );
};

export default ContactUsPage;
