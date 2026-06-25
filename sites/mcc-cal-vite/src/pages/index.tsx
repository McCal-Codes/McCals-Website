import { Nav, Footer } from '@/components';
import HeroCarousel from '@/components/HeroCarousel.lazy';
import {
  HOMEPAGE_HERO_IMAGE_SEO_ENTRIES,
  HOMEPAGE_HERO_SOCIAL_IMAGE,
} from '@/components/heroSlides';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  generatePageGraph,
  generatePersonSchema,
  generatePhotographyProviderSchema,
  generatePhotographyServiceSchema,
  generateWebSiteSchema,
} from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const PAGE_SEO = getPageSeo('home', SITE_URL);
const HOME_URL = `${SITE_URL}/`;
const HOME_DESCRIPTION = PAGE_SEO.description;
const HOME_SOCIAL_IMAGE = PAGE_SEO.image;
const HOME_SOCIAL_IMAGE_ALT = PAGE_SEO.imageAlt;
const HOMEPAGE_SOCIAL_IMAGE_SCHEMA = generateSeoImageSchema(PAGE_SEO);
const HOMEPAGE_REPRESENTATIVE_IMAGE = HOMEPAGE_HERO_SOCIAL_IMAGE.image;

const HOMEPAGE_HERO_IMAGE_SCHEMAS = HOMEPAGE_HERO_IMAGE_SEO_ENTRIES.map((slide, index) => ({
  '@type': 'ImageObject',
  '@id': `${HOME_URL}#hero-image-${index + 1}`,
  contentUrl: slide.image,
  url: slide.image,
  name: `${slide.title} photography by Caleb McCartney`,
  description: slide.alt,
  caption: slide.alt,
  keywords: `${slide.title.toLowerCase()} photography, Pittsburgh photographer, McCal Media`,
  creator: {
    '@type': 'Person',
    name: 'Caleb McCartney',
    url: `${SITE_URL}/about`,
  },
  creditText: 'Photo by Caleb McCartney / McCal Media',
  copyrightNotice: 'Copyright Caleb McCartney / McCal Media',
  representativeOfPage: slide.image === HOMEPAGE_REPRESENTATIVE_IMAGE || undefined,
  acquireLicensePage: `${SITE_URL}/request-a-quote`,
}));

const HOMEPAGE_SCHEMA = {
  '@type': 'WebPage',
  '@id': `${HOME_URL}#webpage`,
  url: HOME_URL,
  name: 'Pittsburgh Photographer | Caleb McCartney | McCal Media',
  description: HOME_DESCRIPTION,
  primaryImageOfPage: {
    '@id': `${HOME_URL}#primaryimage`,
  },
  image: [
    { '@id': `${HOME_URL}#primaryimage` },
    ...HOMEPAGE_HERO_IMAGE_SCHEMAS.map((image) => ({
      '@id': image['@id'],
    })),
  ],
  creator: {
    '@id': `${SITE_URL}/about#caleb-mccartney`,
  },
  publisher: {
    '@id': `${SITE_URL}#organization`,
  },
  about: [
    'Event photography',
    'Concert photography',
    'Headshot photography',
    'Commercial photography',
    'Photojournalism',
  ],
};

const HomePage = () => {
  usePageMeta({
    title: PAGE_SEO.title,
    description: HOME_DESCRIPTION,
    canonical: HOME_URL,
    og: {
      type: 'website',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: HOME_SOCIAL_IMAGE,
      imageAlt: HOME_SOCIAL_IMAGE_ALT,
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: HOME_SOCIAL_IMAGE,
      imageAlt: HOME_SOCIAL_IMAGE_ALT,
    },
    jsonLd: generatePageGraph([
      HOMEPAGE_SCHEMA,
      generateWebSiteSchema(),
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for photojournalism, political coverage, event coverage, concerts, and documentary storytelling.',
      ),
      generatePersonSchema(),
      generatePhotographyServiceSchema(
        'Event Photography',
        'Pittsburgh event photography for corporate events, conferences, nonprofit gatherings, and branded activations.',
        'https://mcc-cal.com/events',
        {
          alternateName: ['Pittsburgh Event Photographer', 'Corporate Event Photography'],
          category: 'Event photographer',
          keywords: ['event photographer pittsburgh', 'corporate event photographer', 'conference photographer'],
        },
      ),
      generatePhotographyServiceSchema(
        'Concert Photography',
        'Live music photography for artists, venues, promoters, and editorial teams in Pittsburgh and beyond.',
        'https://mcc-cal.com/concerts',
        {
          alternateName: ['Pittsburgh Concert Photographer', 'Live Music Photography'],
          category: 'Concert photographer',
          keywords: ['concert photographer pittsburgh', 'music photographer', 'live music photography'],
        },
      ),
      generatePhotographyServiceSchema(
        'Headshot Photography',
        'On-location headshots and portraits for executives, creatives, teams, and editorial assignments in Pittsburgh.',
        'https://mcc-cal.com/portraits',
        {
          alternateName: ['Pittsburgh Headshot Photographer', 'Professional Headshots'],
          category: 'Headshot photographer',
          keywords: ['headshot photographer pittsburgh', 'professional headshots pittsburgh', 'portrait photographer'],
        },
      ),
      generatePhotographyServiceSchema(
        'Commercial Photography',
        'Commercial photography for brands, organizations, publications, and campaigns that need polished visual storytelling.',
        'https://mcc-cal.com/request-a-quote',
        {
          alternateName: ['Pittsburgh Commercial Photographer', 'Brand Photography'],
          category: 'Commercial photographer',
          keywords: ['commercial photographer pittsburgh', 'brand photographer', 'advertising photographer'],
        },
      ),
      HOMEPAGE_SOCIAL_IMAGE_SCHEMA,
      ...HOMEPAGE_HERO_IMAGE_SCHEMAS,
    ]),
  });

  return (
    <div className="site-layout site-layout--home pt-0">
      <Nav />
      <main className="site-main mt-0">
        <HeroCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
