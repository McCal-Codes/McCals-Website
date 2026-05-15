import { useMemo } from 'react';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BioSection, TestimonialsSection, ClientsSection, GearSection } from '@/components/about';
import { staticGoogleReviews, staticLinkedInReviews } from '@/hooks/useGoogleReviews';
import {
  generatePageGraph,
  generatePhotographyServiceSchema,
} from '@/utils/jsonLd';
import styles from './about.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ABOUT_IMAGE = '/about/caleb-mccartney-photo.jpg';

const allReviews = [...staticGoogleReviews, ...staticLinkedInReviews];

export default function AboutPage() {
  const averageRating = useMemo(() => 
    allReviews.reduce((sum, r) => sum + ('rating' in r ? r.rating : 5), 0) / allReviews.length,
    []
  );
  usePageMeta({
    title: 'About Caleb McCartney | Pittsburgh Event, Concert, and Commercial Photographer',
    description:
      'Caleb McCartney is a Pittsburgh photographer and photojournalist specializing in event, concert, headshot, and commercial photography for brands, artists, and organizations.',
    canonical: `${SITE_URL}/about`,
    og: {
      type: 'profile',
      title: 'About Caleb McCartney | Pittsburgh Photographer',
      description:
        'Pittsburgh photographer specializing in event, concert, headshot, and commercial photography.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About Caleb McCartney | Pittsburgh Photographer',
      description:
        'Pittsburgh photographer specializing in event, concert, headshot, and commercial photography.',
      image: `${SITE_URL}${ABOUT_IMAGE}`,
    },
    jsonLd: generatePageGraph([
        {
          '@type': 'Person',
          '@id': `${SITE_URL}/about#caleb-mccartney`,
          name: 'Caleb McCartney',
          image: `${SITE_URL}${ABOUT_IMAGE}`,
          url: `${SITE_URL}/about`,
          description:
            'Pittsburgh photographer and photojournalist specializing in event, concert, headshot, and commercial photography.',
          jobTitle: 'Pittsburgh Photographer and Photojournalist',
          homeLocation: {
            '@type': 'Place',
            name: 'Pittsburgh, Pennsylvania',
          },
          knowsAbout: [
            'Photojournalism',
            'Concert Photography',
            'Event Photography',
            'Corporate Photography',
            'Headshot Photography',
            'Commercial Photography',
            'Brand Storytelling',
          ],
          worksFor: {
            '@type': 'Organization',
            '@id': `${SITE_URL}#organization`,
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
          '@id': `${SITE_URL}#organization`,
          name: 'McCal Media',
          url: SITE_URL,
          description:
            'Pittsburgh photography business for event coverage, concerts, headshots, and commercial storytelling led by Caleb McCartney.',
          logo: `${SITE_URL}/brand/logo-mark.svg`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: parseFloat(averageRating.toFixed(1)),
            bestRating: 5,
            reviewCount: allReviews.length,
          },
          review: allReviews.slice(0, 5).map((review) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: review.author_name,
            },
            reviewBody: review.text,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: 'rating' in review ? review.rating : 5,
              bestRating: 5,
            },
          })),
        },
        generatePhotographyServiceSchema(
          'Event Photography',
          'Pittsburgh event photography for corporate events, conferences, nonprofit gatherings, and branded activations.',
          `${SITE_URL}/events`,
          {
            alternateName: ['Pittsburgh Event Photographer', 'Corporate Event Photography'],
            category: 'Event photographer',
            keywords: ['event photographer pittsburgh', 'corporate event photographer', 'conference photographer'],
          },
        ),
        generatePhotographyServiceSchema(
          'Concert Photography',
          'Live music photography for artists, venues, promoters, and editorial teams in Pittsburgh and beyond.',
          `${SITE_URL}/concerts`,
          {
            alternateName: ['Pittsburgh Concert Photographer', 'Live Music Photography'],
            category: 'Concert photographer',
            keywords: ['concert photographer pittsburgh', 'music photographer', 'live music photography'],
          },
        ),
        generatePhotographyServiceSchema(
          'Headshot Photography',
          'On-location headshots and portraits for executives, creatives, teams, and editorial assignments in Pittsburgh.',
          `${SITE_URL}/portraits`,
          {
            alternateName: ['Pittsburgh Headshot Photographer', 'Professional Headshots'],
            category: 'Headshot photographer',
            keywords: ['headshot photographer pittsburgh', 'professional headshots pittsburgh', 'portrait photographer'],
          },
        ),
        generatePhotographyServiceSchema(
          'Commercial Photography',
          'Commercial photography for brands, organizations, publications, and campaigns that need polished visual storytelling.',
          `${SITE_URL}/request-a-quote`,
          {
            alternateName: ['Pittsburgh Commercial Photographer', 'Brand Photography'],
            category: 'Commercial photographer',
            keywords: ['commercial photographer pittsburgh', 'brand photographer', 'advertising photographer'],
          },
        ),
      ]),
  });

  return (
    <Layout>
      <div className={styles.aboutPage}>
        <div className={styles.aboutShell}>
          <BioSection className={styles.aboutPanel} />
          <div className={styles.aboutContent}>
            <TestimonialsSection className={styles.aboutPanel} />
            <GearSection className={styles.aboutPanel} />
            <ClientsSection className={styles.aboutPanel} duplicates={3} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
