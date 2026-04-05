import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BioSection, TestimonialsSection, ClientsSection } from '@/components/about';
import '@/styles/about.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ABOUT_IMAGE = '/about/caleb-mccartney-photo.jpg';

export default function AboutPage() {
  usePageMeta({
    title: 'Caleb McCartney | Pittsburgh Photojournalist and Event Photographer',
    description:
      'Caleb McCartney is a Pittsburgh-based photojournalist and photographer specializing in concert, corporate, event, and brand storytelling.',
    canonical: `${SITE_URL}/about`,
    og: {
      type: 'profile',
      title: 'Caleb McCartney | Pittsburgh Photojournalist and Event Photographer',
      description:
        'Pittsburgh-based photojournalist and photographer specializing in concerts, events, and brand storytelling.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caleb McCartney | Pittsburgh Photojournalist and Event Photographer',
      description:
        'Pittsburgh-based photojournalist and photographer specializing in concerts, events, and brand storytelling.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: 'Caleb McCartney',
          image: `${SITE_URL}${ABOUT_IMAGE}`,
          url: `${SITE_URL}/about`,
          description:
            'Pittsburgh-based photojournalist and photographer specializing in concert, corporate, event, and brand storytelling.',
          jobTitle: 'Photojournalist and Event Photographer',
          homeLocation: {
            '@type': 'Place',
            name: 'Pittsburgh, Pennsylvania',
          },
          knowsAbout: [
            'Photojournalism',
            'Concert Photography',
            'Event Photography',
            'Corporate Photography',
            'Brand Storytelling',
          ],
          worksFor: {
            '@type': 'Organization',
            name: 'McCal Media',
            url: SITE_URL,
          },
          sameAs: [
            'https://www.instagram.com/mcc_cal',
            'https://www.linkedin.com/in/calebmccartney',
          ],
        },
        {
          '@type': 'Organization',
          name: 'McCal Media',
          url: SITE_URL,
          description:
            'Photojournalism, event coverage, and visual storytelling led by Caleb McCartney.',
          logo: `${SITE_URL}/brand/logo-mark.svg`,
        },
      ],
    },
  });

  return (
    <Layout>
      <div className="about-page">
        <div className="about-shell">
          <BioSection className="about-panel" />
          <div className="about-content">
            <TestimonialsSection className="about-panel" />
            <ClientsSection className="about-panel" duplicates={3} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
