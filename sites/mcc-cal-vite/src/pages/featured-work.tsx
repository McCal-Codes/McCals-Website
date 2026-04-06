import { Layout } from '@/components';
import FeaturedPortfolio from '@/components/portfolios/FeaturedPortfolio';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const FeaturedWorkPage = () => {
  usePageMeta({
    title: 'Featured Photography Portfolio | Caleb McCartney - Concerts, Events & Political Coverage',
    description: 'Curated photography portfolio showcasing concert photography, corporate events, and political campaign coverage. Featuring work with Scarlett Johansson, Trump rallies, Harris campaigns, and live music events. Pittsburgh-based professional photographer.',
    canonical: `${SITE_URL}/featured-work`,
    og: {
      type: 'website',
      title: 'Featured Photography Portfolio | Caleb McCartney',
      description: 'Curated photography portfolio featuring concerts, events, and political campaign coverage by Pittsburgh photographer Caleb McCartney.',
      image: `${SITE_URL}/images/Portfolios/Journalism/Politics/Scarlett%20Johansson%20Canvas%20Launch/241103_Scarlett%20Johansson%20GOTV%20Canvass%20Launch_CAL3197.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Featured Photography Portfolio | Caleb McCartney',
      description: 'Curated photography portfolio featuring concerts, events, and political campaign coverage.',
      image: `${SITE_URL}/images/Portfolios/Journalism/Politics/Scarlett%20Johansson%20Canvas%20Launch/241103_Scarlett%20Johansson%20GOTV%20Canvass%20Launch_CAL3197.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Featured Photography Portfolio',
      description: 'Curated photography portfolio featuring concerts, events, and political campaign coverage by Caleb McCartney.',
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
