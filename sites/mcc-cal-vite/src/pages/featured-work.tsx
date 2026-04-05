import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const FeaturedWorkPage = () => {
  usePageMeta({
    title: 'Featured Work | Caleb McCartney',
    description: 'A curated selection of photography projects by Caleb McCartney, featuring concerts, events, portraits, and editorial work.',
    canonical: `${SITE_URL}/featured-work`,
    og: {
      type: 'website',
      title: 'Featured Work | Caleb McCartney',
      description: 'A curated selection of photography projects by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Featured Work | Caleb McCartney',
      description: 'A curated selection of photography projects by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Featured Work',
      description: 'A curated selection of photography projects by Caleb McCartney.',
      url: `${SITE_URL}/featured-work`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'McCal Media',
        url: SITE_URL,
      },
    },
  });
  const config = getWidgetConfig('featured-work');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default FeaturedWorkPage;
