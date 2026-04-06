import { Layout } from '@/components';
import JournalismPortfolio from '@/components/portfolios/JournalismPortfolio';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

// Image structured data for key political coverage
const portfolioImages = [
  {
    '@type': 'ImageObject',
    name: 'Scarlett Johansson GOTV Canvas Launch',
    description: 'Actress Scarlett Johansson addresses volunteers at a get-out-the-vote canvass launch for Vice President Kamala Harris in Pittsburgh, Pa., Nov. 3, 2024.',
    contentUrl: `${SITE_URL}/images/Portfolios/Journalism/Politics/scarlett-canvas/241103_Scarlett%20Johansson%20GOTV%20Canvass%20Launch_CAL3197.jpg`,
    creator: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
  },
  {
    '@type': 'ImageObject',
    name: 'Trump Returns to Butler',
    description: 'Former President Donald Trump speaks at a campaign rally at Butler Farm Show Inc. in Butler, Pa., Oct. 5, 2024.',
    contentUrl: `${SITE_URL}/images/Portfolios/Journalism/Politics/trump-returns-butler/051024%20Caleb%20McCartney_Trump%20Returns%20to%20Butler%20PA_CAL2418.jpg`,
    creator: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
  },
  {
    '@type': 'ImageObject',
    name: 'Kamala Harris Campaigns in Erie',
    description: 'Vice President Kamala Harris addresses supporters at a presidential campaign rally in Erie, Pa., Oct. 14, 2024.',
    contentUrl: `${SITE_URL}/images/Portfolios/Journalism/Politics/kamala-erie/141024_Kamala%20Speaks%20at%20Erie_CAL3741.jpg`,
    creator: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
  },
];

export default function JournalismPage() {
  usePageMeta({
    title: 'Photojournalism Portfolio | Caleb McCartney - Pittsburgh Political Photography',
    description:
      'Award-winning photojournalism by Caleb McCartney. Political campaign coverage including Trump, Harris, Obama, celebrity events with Scarlett Johansson, and published work for The Globe. Pittsburgh-based editorial photographer specializing in political rallies and breaking news.',
    canonical: `${SITE_URL}/journalism`,
    og: {
      type: 'website',
      title: 'Photojournalism Portfolio | Caleb McCartney',
      description: 'Political campaign photography and editorial work by Pittsburgh photojournalist Caleb McCartney. Published coverage of Trump, Harris, Obama rallies and celebrity events.',
      image: `${SITE_URL}/images/Portfolios/Journalism/Politics/Scarlett%20Johansson%20Canvas%20Launch/241103_Scarlett%20Johansson%20GOTV%20Canvass%20Launch_CAL3197.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Photojournalism Portfolio | Caleb McCartney',
      description: 'Political campaign photography and editorial work by Pittsburgh photojournalist Caleb McCartney.',
      image: `${SITE_URL}/images/Portfolios/Journalism/Politics/Scarlett%20Johansson%20Canvas%20Launch/241103_Scarlett%20Johansson%20GOTV%20Canvass%20Launch_CAL3197.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Photojournalism Portfolio',
      description: 'Political campaign photography and editorial work by Pittsburgh photojournalist Caleb McCartney.',
      url: `${SITE_URL}/journalism`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'McCal Media',
        url: SITE_URL,
      },
      about: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        jobTitle: 'Photojournalist',
        worksFor: {
          '@type': 'Organization',
          name: 'The Globe',
        },
      },
      image: portfolioImages,
    },
  });

  return (
    <Layout>
      <JournalismPortfolio />
    </Layout>
  );
}
