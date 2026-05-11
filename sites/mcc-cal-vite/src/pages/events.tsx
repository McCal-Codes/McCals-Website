import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { sortPortfolioGroups } from '@/components/portfolio/sortGroups';
import { useManifest, imageUrl } from '@/components/portfolio/useManifest';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { portfolioStyles } from '@/components/portfolio';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

interface EventItem {
  title?: string;
  eventName: string;
  category?: string;
  dateDisplay?: string;
  dateISO?: string;
  folderPath?: string;
  images: { path: string }[];
}

interface EventsManifest {
  items: EventItem[];
}


function adaptEvents(manifest: EventsManifest): PortfolioGroup[] {
  return manifest.items.map((item) => {
    const name = item.title ?? item.eventName;
    const images = item.images.map((img, i) => {
      const filename = img.path.split('/').pop() ?? `image-${i}`;
      // Extract photo number from filename (e.g., CAL753 from PGH Social Club at Avalon_CAL753_webuse.jpg)
      const photoMatch = filename.match(/CAL(\d+)/);
      const photoNum = photoMatch ? ` #${photoMatch[1]}` : '';
      return {
        url: imageUrl.event(img.path),
        filename,
        alt: `${name}${photoNum}`,
      };
    });
    return {
      id: (item.folderPath ?? name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: name,
      dateDisplay: item.dateDisplay,
      dateISO: item.dateISO,
      category: item.category,
      images,
      coverImage: images[0],
    };
  });
}

const ALL = 'All';

export default function EventsPage() {
  const { data, status, error } = useManifest<EventsManifest>('events');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    return sortPortfolioGroups(adaptEvents(data));
  }, [data]);

  const filters = useMemo(() => {
    const cats = [...new Set(groups.map((g) => g.category).filter(Boolean))] as string[];
    return cats.length > 1 ? [ALL, ...cats.sort()] : [];
  }, [groups]);

  const filtered = useMemo(
    () =>
      activeFilter === ALL
        ? groups
        : groups.filter((g) => g.category === activeFilter),
    [groups, activeFilter]
  );

  usePageMeta({
    title: 'Pittsburgh Event Photographer | Caleb McCartney',
    description:
      'Pittsburgh event photographer for corporate events, conferences, nonprofit gatherings, campus programs, and branded activations.',
    canonical: `${SITE_URL}/events`,
    og: {
      type: 'website',
      title: 'Pittsburgh Event Photographer | Caleb McCartney',
      description: 'Corporate event photography, conference coverage, and brand-friendly live documentation in Pittsburgh.',
      image: `${SITE_URL}/images/events-og.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pittsburgh Event Photographer | Caleb McCartney',
      description: 'Corporate event photography, conference coverage, and brand-friendly live documentation in Pittsburgh.',
      image: `${SITE_URL}/images/events-og.jpg`,
    },
    jsonLd: generatePageGraph([
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for event coverage, concerts, headshots, and commercial storytelling.',
      ),
      generatePhotographyServiceSchema(
        'Event Photography',
        'Pittsburgh event photography for corporate events, conferences, nonprofit gatherings, campus programs, and branded activations.',
        `${SITE_URL}/events`,
        {
          alternateName: ['Pittsburgh Event Photographer', 'Corporate Event Photography'],
          category: 'Event photographer',
          keywords: ['event photographer pittsburgh', 'corporate event photographer', 'conference photographer'],
        },
      ),
    ]),
  });

  return (
    <Layout>
      <div className={portfolioStyles.pfRoot}>
        <p className={`${portfolioStyles.pfSubheading} text-center mb-0`}>
          Pittsburgh Event Photographer
        </p>
        <h1 className={portfolioStyles.pfHeading}>Corporate Events, Conferences & Community Coverage</h1>
        <p className={portfolioStyles.pfIntro}>
          On-location event photography for conferences, nonprofit fundraisers, campus programs,
          launches, and brand activations across Pittsburgh and Western Pennsylvania.
        </p>

        {status === 'loading' && (
          <div className={portfolioStyles.pfLoading}>
            <span className={portfolioStyles.pfSpinner} aria-hidden="true" />
            Loading…
          </div>
        )}

        {status === 'error' && (
          <div className={portfolioStyles.pfError}>
            <span>Failed to load events.</span>
            <span className="text-xs opacity-70">{error}</span>
          </div>
        )}

        {status === 'success' && (
          <>
            <PortfolioFilters filters={filters} active={activeFilter} onChange={setActiveFilter} />
            <PortfolioGrid groups={filtered} />
          </>
        )}
      </div>
    </Layout>
  );
}
