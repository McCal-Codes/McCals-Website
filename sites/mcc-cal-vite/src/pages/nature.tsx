import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, portfolioStyles } from '@/components/portfolio';
import { usePageMeta } from '@/hooks/usePageMeta';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';
import { adaptNature, type NatureManifest } from './nature-adapter';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';
const PAGE_SEO = getPageSeo('nature', SITE_URL);

export default function NaturePage() {
  const { data, status, error } = useManifest<NatureManifest>('nature');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    return sortPortfolioGroups(adaptNature(data));
  }, [data]);

  const filters = useMemo(() => {
    const categories = [...new Set(groups.map((g) => g.category).filter(Boolean))];
    return categories.length > 1 ? [ALL, ...categories] : [];
  }, [groups]);

  const filtered = useMemo(
    () => (activeFilter === ALL ? groups : groups.filter((g) => g.category === activeFilter)),
    [groups, activeFilter]
  );

  usePageMeta({
    title: PAGE_SEO.title,
    description: PAGE_SEO.description,
    canonical: PAGE_SEO.url,
    og: {
      type: 'website',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    jsonLd: generatePageGraph([
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for event coverage, concerts, headshots, nature, and commercial storytelling.',
      ),
      generatePhotographyServiceSchema(
        'Nature Photography',
        'Nature and landscape photography by Caleb McCartney, including wildlife, city horizons, Appalachian quiet, and close botanical studies.',
        PAGE_SEO.url,
        {
          alternateName: ['Landscape Photography', 'Wildlife Photography'],
          category: 'Nature photographer',
          keywords: ['nature photography', 'landscape photography', 'wildlife photography'],
        },
      ),
      generateSeoImageSchema(PAGE_SEO),
    ]),
  });

  return (
    <Layout>
      <div className={portfolioStyles.pfRoot}>
        <p className={`${portfolioStyles.pfSubheading} text-center mb-0`}>
          Nature Photography
        </p>
        <h1 className={portfolioStyles.pfHeading}>Wildlife & Landscapes</h1>
        <p className={portfolioStyles.pfIntro}>
          Field notes in photographs, from city horizons and Appalachian quiet to close wildlife
          studies, organized as collections so each place or species has room to breathe.
        </p>

        {status === 'loading' && (
          <div className={portfolioStyles.pfLoading}>
            <span className={portfolioStyles.pfSpinner} aria-hidden="true" />
            Loading...
          </div>
        )}

        {status === 'error' && (
          <div className={portfolioStyles.pfError}>
            <span>Failed to load nature portfolio.</span>
            <span className="text-xs opacity-70">{error}</span>
          </div>
        )}

        {status === 'success' && (
          <>
            <PortfolioFilters
              filters={filters.filter((f): f is string => typeof f === 'string')}
              active={activeFilter}
              onChange={setActiveFilter}
            />
            <PortfolioGrid
              groups={filtered}
              gridClassName={portfolioStyles.pfNatureGrid}
              cardImageSizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1100px) calc(50vw - 30px), 33vw"
            />
          </>
        )}
      </div>
    </Layout>
  );
}
