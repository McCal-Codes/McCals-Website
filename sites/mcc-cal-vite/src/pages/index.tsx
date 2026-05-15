import { Nav, Footer } from '@/components';
import { lazy, Suspense } from 'react';

const HeroCarousel = lazy(() => import('@/components/HeroCarousel.lazy'));
import {
  HOMEPAGE_HERO_IMAGE_SEO_ENTRIES,
  HOMEPAGE_HERO_SOCIAL_IMAGE,
} from '@/components/heroSlides';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  generatePageGraph,
  generatePersonSchema,
  generatePhotographyProviderSchema,
  generatePhotographyServiceSchema,
  generateWebSiteSchema,
} from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const HOME_URL = `${SITE_URL}/`;
const HOME_DESCRIPTION =
  'Pittsburgh photographer Caleb McCartney creates event photography, concert photography, headshots, and commercial brand imagery for artists, teams, and organizations.';
const HOME_SOCIAL_IMAGE = HOMEPAGE_HERO_SOCIAL_IMAGE.image;
const HOME_SOCIAL_IMAGE_ALT = HOMEPAGE_HERO_SOCIAL_IMAGE.alt;

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
  representativeOfPage: slide.image === HOME_SOCIAL_IMAGE || undefined,
  acquireLicensePage: `${SITE_URL}/request-a-quote`,
}));

const HOMEPAGE_SCHEMA = {
  '@type': 'WebPage',
  '@id': `${HOME_URL}#webpage`,
  url: HOME_URL,
  name: 'Pittsburgh Photographer | Caleb McCartney | McCal Media',
  description: HOME_DESCRIPTION,
  primaryImageOfPage: {
    '@id': HOMEPAGE_HERO_IMAGE_SCHEMAS.find((image) => image.contentUrl === HOME_SOCIAL_IMAGE)?.['@id'],
  },
  image: HOMEPAGE_HERO_IMAGE_SCHEMAS.map((image) => ({
    '@id': image['@id'],
  })),
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
    title: 'Pittsburgh Photographer | Caleb McCartney | McCal Media',
    description: HOME_DESCRIPTION,
    canonical: HOME_URL,
    og: {
      type: 'website',
      title: 'Pittsburgh Photographer | Caleb McCartney',
      description:
        'Event photography, concert photography, headshots, and commercial imagery by Pittsburgh photographer Caleb McCartney.',
      image: HOME_SOCIAL_IMAGE,
      imageAlt: HOME_SOCIAL_IMAGE_ALT,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pittsburgh Photographer | Caleb McCartney',
      description:
        'Event photography, concert photography, headshots, and commercial imagery by Pittsburgh photographer Caleb McCartney.',
      image: HOME_SOCIAL_IMAGE,
      imageAlt: HOME_SOCIAL_IMAGE_ALT,
    },
    jsonLd: generatePageGraph([
      HOMEPAGE_SCHEMA,
      generateWebSiteSchema(),
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for events, concerts, headshots, and commercial storytelling.',
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
      ...HOMEPAGE_HERO_IMAGE_SCHEMAS,
    ]),
  });

  return (
    <div className="site-layout pt-0">
      <Nav />
      <main className="site-main mt-0">
        <Suspense fallback={<div className="hero-carousel-skeleton" style={{ height: '70vh', background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }} />}>
          <HeroCarousel />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
