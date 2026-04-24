import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, imageUrl } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';
import '@/components/portfolio/portfolio.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';

interface PortraitItem {
  collectionName: string;
  folderPath: string;
  totalImages: number;
  images: string[];
  tags: string[];
}

interface PortraitManifest {
  version: string;
  generated: string;
  totalCollections: number;
  totalImages: number;
  collections: PortraitItem[];
}

function adaptPortraits(manifest: PortraitManifest): PortfolioGroup[] {
  return manifest.collections
    .filter((item) => item.images.length > 0)
    .map((item) => {
      const images = item.images.map((filename) => ({
        url: imageUrl.portrait(item.folderPath, filename),
        filename,
        alt: `${item.collectionName} portrait photo`,
      }));

      return {
        id: item.folderPath.replace(/\//g, '-').toLowerCase(),
        title: item.collectionName,
        category: item.tags[0] || 'Portrait',
        images,
        coverImage: images[0],
      };
    });
}

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

  usePageMeta({
    title: 'Pittsburgh Headshot Photographer | Caleb McCartney',
    description:
      'Pittsburgh headshot photographer for professional headshots, portrait sessions, editorial portraits, and brand-forward personal imagery.',
    canonical: `${SITE_URL}/portraits`,
    og: {
      type: 'website',
      title: 'Pittsburgh Headshot Photographer | Caleb McCartney',
      description: 'Professional headshots, portraits, and editorial sessions by Caleb McCartney in Pittsburgh.',
      image: `${SITE_URL}/images/portraits-og.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pittsburgh Headshot Photographer | Caleb McCartney',
      description: 'Professional headshots, portraits, and editorial sessions by Caleb McCartney in Pittsburgh.',
      image: `${SITE_URL}/images/portraits-og.jpg`,
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
    ]),
  });

  return (
    <Layout>
      <div className="pf-root">
        <p className="pf-subheading text-center mb-0">
          Pittsburgh Headshot Photographer
        </p>
        <h1 className="pf-heading">Portraits & Headshots</h1>
        <p className="pf-intro">
          On-location headshot and portrait photography for executives, creatives, teams, and
          editorial stories, with clean professional portraits that still feel like you.
        </p>

        {status === 'loading' && (
          <div className="pf-loading">
            <span className="pf-spinner" aria-hidden="true" />
            Loading...
          </div>
        )}

        {status === 'error' && (
          <div className="pf-error">
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
            <PortfolioGrid groups={filtered} />
          </>
        )}
      </div>
    </Layout>
  );
}
