import Footer from '@/components/Layout/Footer';
import Nav from '@/components/Layout/Nav';
import HeroCarousel from '@/components/HeroCarousel';
import { usePageMeta } from '@/hooks/usePageMeta';
import { LIVE_SITE_HOME_FEATURED_ITEMS } from '@/content/liveSiteFallbacks';

const HomePage = () => {
  usePageMeta({
    title: 'Caleb McCartney | Photojournalism, Events, Concerts, and Portraiture',
    description:
      'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney, with writing, podcast conversations, and clear paths into the work.',
    canonical: 'https://mcc-cal.com/',
    og: {
      type: 'website',
      title: 'Caleb McCartney',
      description:
        'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney.',
      image: LIVE_SITE_HOME_FEATURED_ITEMS[0]?.imageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caleb McCartney',
      description:
        'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney.',
      image: LIVE_SITE_HOME_FEATURED_ITEMS[0]?.imageUrl,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'McCal Media',
          url: 'https://mcc-cal.com/',
          description: 'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney.',
          publisher: {
            '@type': 'Organization',
            name: 'McCal Media',
            logo: {
              '@type': 'ImageObject',
              url: 'https://mcc-cal.com/brand/logo-mark.svg',
            },
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://mcc-cal.com/blog?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          name: 'McCal Media',
          url: 'https://mcc-cal.com/',
          logo: 'https://mcc-cal.com/brand/logo-mark.svg',
          sameAs: [
            'https://www.instagram.com/mcc_cal',
            'https://www.linkedin.com/in/calebmccartney',
          ],
        },
      ],
    },
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
