import { Layout } from '@/components';
import FeaturedPortfolio from '@/components/portfolios/FeaturedPortfolio';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const FeaturedWorkPage = () => {
  usePageMeta({
    title: 'Featured Photography Portfolio | Caleb McCartney',
    description: 'A curated first look at Caleb McCartney’s photography across concerts, events, and photojournalism. Pittsburgh-based coverage for artists, organizations, publications, and public moments.',
    canonical: `${SITE_URL}/featured-work`,
    og: {
      type: 'website',
      title: 'Featured Photography Portfolio | Caleb McCartney',
      description: 'A curated first look at concert, event, and photojournalism by Pittsburgh photographer Caleb McCartney.',
      image: `${SITE_URL}/images/Portfolios/Journalism/Politics/scarlett-canvas/241103_scarlett-canvas_CAL3197.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Featured Photography Portfolio | Caleb McCartney',
      description: 'A curated first look at concert, event, and photojournalism.',
      image: `${SITE_URL}/images/Portfolios/Journalism/Politics/scarlett-canvas/241103_scarlett-canvas_CAL3197.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Featured Photography Portfolio',
      description: 'Curated photography portfolio featuring concerts, events, and photojournalism by Caleb McCartney.',
      url: `${SITE_URL}/featured-work`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'McCal Media',
        url: SITE_URL,
      },
      about: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        jobTitle: 'Photographer',
      },
    },
  });

  return (
    <Layout>
      <FeaturedPortfolio />
    </Layout>
  );
};

export default FeaturedWorkPage;
