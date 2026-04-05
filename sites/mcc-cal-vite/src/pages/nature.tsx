import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const NaturePage = () => {
  usePageMeta({
    title: 'Nature Photography | Caleb McCartney',
    description: 'Nature and landscape photography by Caleb McCartney. Wildlife, scenic vistas, and the beauty of the natural world.',
    canonical: `${SITE_URL}/nature`,
    og: {
      type: 'website',
      title: 'Nature Photography | Caleb McCartney',
      description: 'Nature and landscape photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Nature Photography | Caleb McCartney',
      description: 'Nature and landscape photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Nature Photography',
      provider: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
      description: 'Nature and landscape photography capturing wildlife, scenic vistas, and the natural world.',
      serviceType: 'Photography',
    },
  });
  const config = getWidgetConfig('nature');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default NaturePage;
