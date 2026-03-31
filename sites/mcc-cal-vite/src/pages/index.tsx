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
