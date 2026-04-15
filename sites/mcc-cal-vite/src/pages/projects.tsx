import { Layout } from '@/components';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const ProjectsPage = () => {
  usePageMeta({
    title: 'Projects | Caleb McCartney',
    description: 'Artwork, apps, tools, and design work by Caleb McCartney. Letting Me Go thesis, design systems, Abridged app, and roadmap.',
    canonical: `${SITE_URL}/projects`,
    og: {
      type: 'website',
      title: 'Projects | Caleb McCartney',
      description: 'Artwork, apps, tools, and design work by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Projects | Caleb McCartney',
      description: 'Artwork, apps, tools, and design work by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Projects',
      description: 'Artwork, apps, tools, and design work by Caleb McCartney.',
      url: `${SITE_URL}/projects`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'McCal Media',
        url: SITE_URL,
      },
    },
  });

  return (
  <Layout>
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px' }}>
      <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, marginBottom: '0.5em' }}>
        Projects
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Artwork, apps, tools, and design work.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {[
          { to: '/letting-me-go', title: 'Letting Me Go', desc: 'BFA thesis, AIR show, and campaign-trail photography: noise, shadow, the road' },
          { to: '/design-systems', title: 'Design Systems', desc: 'Component libraries and visual language' },
          { to: '/abridged', title: 'Abridged App', desc: 'A smarter way to read long-form content' },
          { to: '/roadmap', title: 'Roadmap', desc: 'What\'s being built and what\'s next' },
        ].map(({ to, title, desc }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none', display: 'block', padding: '24px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 16, background: 'rgba(255,255,255,0.04)', transition: 'border-color 0.3s, background 0.3s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  </Layout>
  );
};

export default ProjectsPage;
