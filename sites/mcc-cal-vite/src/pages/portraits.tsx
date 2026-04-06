import { Layout } from '@/components';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const PortraitsPage = () => {
  usePageMeta({
    title: 'Portrait Photography | Caleb McCartney',
    description: 'Professional portrait photography by Caleb McCartney. Headshots, environmental portraits, and creative character studies.',
    canonical: `${SITE_URL}/portraits`,
    og: {
      type: 'website',
      title: 'Portrait Photography | Caleb McCartney',
      description: 'Professional portrait photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Portrait Photography | Caleb McCartney',
      description: 'Professional portrait photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Portrait Photography',
      provider: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
      description: 'Professional portrait photography including headshots, environmental portraits, and creative character studies.',
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
  const config = getWidgetConfig('portraits');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default PortraitsPage;
