import Layout from '@/components/Layout/Layout';
import JournalismPortfolio from '@/components/portfolios/JournalismPortfolio';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

export default function JournalismPage() {
  usePageMeta({
    title: 'Photojournalism | Caleb McCartney',
    description:
      'Photojournalism and editorial photography by Pittsburgh-based photographer Caleb McCartney. Published work in news, sports, and community coverage.',
    canonical: `${SITE_URL}/journalism`,
    og: {
      type: 'website',
      title: 'Photojournalism | Caleb McCartney',
      description: 'Editorial and news photography by Pittsburgh photojournalist Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Photojournalism | Caleb McCartney',
      description: 'Editorial and news photography by Pittsburgh photojournalist Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
  });

  return (
    <Layout>
      <JournalismPortfolio />
    </Layout>
  );
}
