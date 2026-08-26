import { Layout } from '@/components';
import JournalismPortfolio from '@/components/portfolios/JournalismPortfolio';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const PAGE_SEO = getPageSeo('journalism', SITE_URL);

// Image structured data for key political coverage
const portfolioImages = [
  generateSeoImageSchema(PAGE_SEO),
  {
    '@type': 'ImageObject',
    name: 'Bill Clinton Campaigns in Greensburg',
    description: 'Former President Bill Clinton greets supporters during a campaign event in Greensburg, Pa.',
    contentUrl: `${SITE_URL}/images/Portfolios/Journalism/Politics/clinton-pitt-greensburgh/241029_clinton-pitt_CAL3063.jpg`,
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
    name: 'JD Vance Campaigns in Johnstown',
    description: 'Supporters raise their hands as JD Vance speaks at a campaign event in Johnstown, Pa.',
    contentUrl: `${SITE_URL}/images/Portfolios/Journalism/Politics/jdvance-johnstown/241012_JD%20Vance%20in%20Johnstown_CAL3636.webp`,
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
    description: 'Vice President Kamala Harris addresses supporters at a presidential campaign rally in Erie, Pa.',
    contentUrl: `${SITE_URL}/images/Portfolios/Journalism/Politics/kamala-speaks-erie/141024_Kamala%20Speaks%20at%20Erie_CAL4115.jpg`,
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
    title: PAGE_SEO.title,
    description: PAGE_SEO.description,
    canonical: PAGE_SEO.url,
    og: {
      type: 'website',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Photojournalism Portfolio',
      description: PAGE_SEO.description,
      url: PAGE_SEO.url,
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
          name: 'McCal Media',
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
