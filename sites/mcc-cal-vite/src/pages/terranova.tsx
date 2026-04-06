import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const TerranovaPage = () => {
  usePageMeta({
    title: 'TerraNova Editor | McCal Media',
    description: 'TerraNova Editor - An upcoming content editing tool from McCal Media.',
    canonical: `${SITE_URL}/terranova`,
    og: {
      type: 'website',
      title: 'TerraNova Editor | McCal Media',
      description: 'TerraNova Editor - An upcoming content editing tool from McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'TerraNova Editor | McCal Media',
      description: 'TerraNova Editor - An upcoming content editing tool from McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TerraNova Editor',
      description: 'An upcoming content editing tool from McCal Media.',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      author: {
        '@type': 'Organization',
        name: 'McCal Media',
        url: SITE_URL,
      },
    },
  });

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px' }}>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, marginBottom: '0.5em' }}>
          TerraNova Editor
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
          Coming soon.
        </p>
      </div>
    </Layout>
  );
};
export default TerranovaPage;
