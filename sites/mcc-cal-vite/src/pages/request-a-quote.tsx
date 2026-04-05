import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const RequestAQuotePage = () => {
  usePageMeta({
    title: 'Request a Quote | McCal Media',
    description: 'Request a photography quote for events, concerts, portraits, or commercial projects with Caleb McCartney.',
    canonical: `${SITE_URL}/request-a-quote`,
    og: {
      type: 'website',
      title: 'Request a Quote | McCal Media',
      description: 'Request a photography quote for events, concerts, portraits, or commercial projects.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Request a Quote | McCal Media',
      description: 'Request a photography quote for events, concerts, portraits, or commercial projects.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Photography Services',
      provider: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
      description: 'Professional photography services including events, concerts, portraits, and commercial projects.',
      areaServed: {
        '@type': 'City',
        name: 'Pittsburgh',
        containedInPlace: {
          '@type': 'State',
          name: 'Pennsylvania',
        },
      },
      serviceType: 'Photography',
    },
  });
  const config = getWidgetConfig('request-a-quote');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} version={config.version} category={config.category} />
    </Layout>
  );
};

export default RequestAQuotePage;
