import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const VideoPage = () => {
  usePageMeta({
    title: 'Video Production | Caleb McCartney',
    description: 'Video production and filmmaking by Caleb McCartney. Documentary, promotional, and creative video content.',
    canonical: `${SITE_URL}/video`,
    og: {
      type: 'website',
      title: 'Video Production | Caleb McCartney',
      description: 'Video production and filmmaking by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Video Production | Caleb McCartney',
      description: 'Video production and filmmaking by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Video Production',
      provider: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
      description: 'Professional video production and filmmaking services including documentary, promotional, and creative content.',
      serviceType: 'Video Production',
    },
  });
  const config = getWidgetConfig('video');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default VideoPage;
