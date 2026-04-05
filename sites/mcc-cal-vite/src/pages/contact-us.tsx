import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const ContactUsPage = () => {
  usePageMeta({
    title: 'Contact Us | McCal Media',
    description: 'Get in touch with Caleb McCartney for photography inquiries, project collaborations, or media requests.',
    canonical: `${SITE_URL}/contact-us`,
    og: {
      type: 'website',
      title: 'Contact Us | McCal Media',
      description: 'Get in touch with Caleb McCartney for photography inquiries and collaborations.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Contact Us | McCal Media',
      description: 'Get in touch with Caleb McCartney for photography inquiries and collaborations.',
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
  const config = getWidgetConfig('contact-us');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} version={config.version} category={config.category} />
    </Layout>
  );
};

export default ContactUsPage;
