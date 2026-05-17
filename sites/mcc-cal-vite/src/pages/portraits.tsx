import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, portfolioStyles } from '@/components/portfolio';
import { usePageMeta } from '@/hooks/usePageMeta';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';
import { adaptPortraits, type PortraitManifest } from './portraits-adapter';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';
const PAGE_SEO = getPageSeo('portraits', SITE_URL);

export default function PortraitsPage() {
  const { data, status, error } = useManifest<PortraitManifest>('portraits');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    return sortPortfolioGroups(adaptPortraits(data));
  }, [data]);

  const filters = useMemo(() => {
    const categories = [...new Set(groups.map((g) => g.category).filter(Boolean))];
    return categories.length > 1 ? [ALL, ...categories] : [];
  }, [groups]);

  const filtered = useMemo(
    () => (activeFilter === ALL ? groups : groups.filter((g) => g.category === activeFilter)),
    [groups, activeFilter]
  );

  const portraitStats = useMemo(() => {
    const categories = new Set(groups.map((group) => group.category).filter(Boolean));
    const imageCount = groups.reduce((total, group) => total + group.images.length, 0);
    return {
      sessions: groups.length,
      categories: categories.size,
      images: imageCount,
    };
  }, [groups]);

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
        'Pittsburgh photography business led by Caleb McCartney for event coverage, concerts, headshots, and commercial storytelling.',
      ),
      generatePhotographyServiceSchema(
        'Headshot Photography',
        'On-location headshots and professional portraits for executives, creatives, teams, and editorial assignments in Pittsburgh.',
        `${SITE_URL}/portraits`,
        {
          alternateName: ['Pittsburgh Headshot Photographer', 'Professional Headshots'],
          category: 'Headshot photographer',
          keywords: ['headshot photographer pittsburgh', 'professional headshots pittsburgh', 'business headshots'],
        },
      ),
      generatePhotographyServiceSchema(
        'Portrait Photography',
        'Portrait photography including environmental portraits, editorial sessions, and brand-forward personal imagery.',
        `${SITE_URL}/portraits`,
        {
          alternateName: ['Pittsburgh Portrait Photographer'],
          category: 'Portrait photographer',
          keywords: ['portrait photographer pittsburgh', 'editorial portraits', 'personal branding photography'],
        },
      ),
      generateSeoImageSchema(PAGE_SEO),
    ]),
  });

  return (
    <Layout>
      <div className={portfolioStyles.pfRoot}>
        <p className={`${portfolioStyles.pfSubheading} text-center mb-0`}>
          Pittsburgh Headshot Photographer
        </p>
        <h1 className={portfolioStyles.pfHeading}>Portraits & Headshots</h1>
        <p className={portfolioStyles.pfIntro}>
          On-location headshot and portrait photography for executives, creatives, teams, and
          editorial stories, organized by session so visitors can move from the first impression to
          the full gallery without wading through unrelated shoots.
        </p>

        {status === 'success' && (
          <div className={portfolioStyles.pfPortraitSummary} aria-label="Portrait portfolio overview">
            <div className={portfolioStyles.pfPortraitMetric}>
              <span className={portfolioStyles.pfPortraitMetricValue}>{portraitStats.sessions}</span>
              <span className={portfolioStyles.pfPortraitMetricLabel}>Sessions</span>
            </div>
            <div className={portfolioStyles.pfPortraitMetric}>
              <span className={portfolioStyles.pfPortraitMetricValue}>{portraitStats.images}</span>
              <span className={portfolioStyles.pfPortraitMetricLabel}>Edited images</span>
            </div>
            <div className={portfolioStyles.pfPortraitMetric}>
              <span className={portfolioStyles.pfPortraitMetricValue}>{portraitStats.categories}</span>
              <span className={portfolioStyles.pfPortraitMetricLabel}>Gallery types</span>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className={portfolioStyles.pfLoading}>
            <span className={portfolioStyles.pfSpinner} aria-hidden="true" />
            Loading...
          </div>
        )}

        {status === 'error' && (
          <div className={portfolioStyles.pfError}>
            <span>Failed to load portraits portfolio.</span>
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
              gridClassName={portfolioStyles.pfPortraitGrid}
              cardImageSizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc(50vw - 28px), (max-width: 1400px) calc(33vw - 32px), 25vw"
            />
          </>
        )}
      </div>
    </Layout>
  );
}
