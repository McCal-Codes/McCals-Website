import { Nav, Footer, HeroCarousel } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { LIVE_SITE_HOME_FEATURED_ITEMS } from '@/content/liveSiteFallbacks';
import {
  generatePageGraph,
  generatePersonSchema,
  generatePhotographyProviderSchema,
  generatePhotographyServiceSchema,
  generateWebSiteSchema,
} from '@/utils/jsonLd';

const HomePage = () => {
  usePageMeta({
    title: 'Pittsburgh Photographer | Caleb McCartney | McCal Media',
    description:
      'Pittsburgh photographer Caleb McCartney creates event photography, concert photography, headshots, and commercial brand imagery for artists, teams, and organizations.',
    canonical: 'https://mcc-cal.com/',
    og: {
      type: 'website',
      title: 'Pittsburgh Photographer | Caleb McCartney',
      description:
        'Event photography, concert photography, headshots, and commercial imagery by Pittsburgh photographer Caleb McCartney.',
      image: LIVE_SITE_HOME_FEATURED_ITEMS[0]?.imageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pittsburgh Photographer | Caleb McCartney',
      description:
        'Event photography, concert photography, headshots, and commercial imagery by Pittsburgh photographer Caleb McCartney.',
      image: LIVE_SITE_HOME_FEATURED_ITEMS[0]?.imageUrl,
    },
    jsonLd: generatePageGraph([
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
    ]),
  });

  return (
    <div className="site-layout" style={{ paddingTop: 0 }}>
      <Nav />
      <main className="site-main" style={{ marginTop: 0 }}>
        <HeroCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
