import { Layout } from '@/components';
import FeaturedPortfolio from '@/components/portfolios/FeaturedPortfolio';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/**
 * Metadata comes from pageSeoData.json through getPageSeo, the way every sibling
 * gallery page does it.
 *
 * This page used to hardcode its own title, description and social image, which
 * left two sources disagreeing about the same page. The hardcoded one was also
 * broken: it pointed og:image and twitter:image at
 * /images/Portfolios/Journalism/Politics/scarlett-canvas/..., and neither that
 * album nor any /images/Portfolios path exists on the site. Portfolio
 * photographs are served from jsDelivr, and the app's public directory has no
 * Portfolios tree, so every share of this page requested a 404.
 *
 * The per-photograph ImageObject entries are emitted into the prerendered HTML by
 * scripts/generate-route-meta.js, which reads the curation file at build time.
 * That puts them in the page as served rather than injecting them after
 * hydration, and it is what makes the photographs eligible for Google's
 * Licensable badge. This block stays with what describes the page itself.
 */
const PAGE_SEO = getPageSeo('featuredWork', SITE_URL);

const FeaturedWorkPage = () => {
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
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: PAGE_SEO.ogTitle,
          description: PAGE_SEO.description,
          url: PAGE_SEO.url,
          primaryImageOfPage: { '@id': `${PAGE_SEO.url}#primaryimage` },
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
        generateSeoImageSchema(PAGE_SEO),
      ],
    },
  });

  return (
    <Layout>
      <FeaturedPortfolio />
    </Layout>
  );
};

export default FeaturedWorkPage;
