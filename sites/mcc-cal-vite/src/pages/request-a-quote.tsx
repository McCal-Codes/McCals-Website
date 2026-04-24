import { Layout } from '@/components';
import { QuoteRequestForm } from '@/components/forms';
import { usePageMeta } from '@/hooks/usePageMeta';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const RequestAQuotePage = () => {
  usePageMeta({
    title: 'Request a Quote | Pittsburgh Photographer | McCal Media',
    description:
      'Get a custom photography quote from Pittsburgh photographer Caleb McCartney. Events, concerts, headshots, portraits, and commercial projects. Fast turnaround, competitive rates.',
    canonical: `${SITE_URL}/request-a-quote`,
    og: {
      type: 'website',
      title: 'Request a Quote | Pittsburgh Photographer | McCal Media',
      description: 'Get a custom photography quote from Pittsburgh photographer Caleb McCartney. Events, concerts, headshots, portraits, and commercial projects. Fast turnaround, competitive rates.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Request a Quote | Pittsburgh Photographer | McCal Media',
      description: 'Get a custom photography quote from Pittsburgh photographer Caleb McCartney. Events, concerts, headshots, portraits, and commercial projects. Fast turnaround, competitive rates.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: generatePageGraph([
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for events, concerts, headshots, portraits, and commercial storytelling.',
      ),
      generatePhotographyServiceSchema(
        'Photography Services',
        'Professional photography services including events, concerts, headshots, portraits, and commercial projects in Pittsburgh.',
        `${SITE_URL}/request-a-quote`,
        {
          alternateName: ['Pittsburgh Photography Services', 'McCal Media Photography'],
          category: 'Photography services',
          keywords: ['pittsburgh photographer', 'event photographer pittsburgh', 'concert photographer pittsburgh', 'headshot photographer pittsburgh', 'commercial photographer pittsburgh'],
        },
      ),
    ]),
  });
  return (
    <Layout>
      <QuoteRequestForm />
    </Layout>
  );
};

export default RequestAQuotePage;
