import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, imageUrl } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { usePageMeta } from '@/hooks/usePageMeta';
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
    title: 'Portrait Photography | Caleb McCartney',
    description: 'Professional portrait photography by Caleb McCartney. Headshots, environmental portraits, and creative character studies.',
    canonical: `${SITE_URL}/portraits`,
    og: {
      type: 'website',
      title: 'Portrait Photography | Caleb McCartney',
      description: 'Professional portrait photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Portrait Photography | Caleb McCartney',
      description: 'Professional portrait photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Portrait Photography',
      provider: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
      description: 'Professional portrait photography including headshots, environmental portraits, and creative character studies.',
      areaServed: {
        '@type': 'City',
        name: 'Pittsburgh',
        containedInPlace: {
          '@type': 'State',
          name: 'Pennsylvania',
        },
      },
      serviceType: 'Photography',
    },
  });

  return (
    <Layout>
      <div className="pf-root">
        <p className="pf-subheading" style={{ textAlign: 'center', marginBottom: 0 }}>
          Portrait Photography
        </p>
        <h1 className="pf-heading">Portraits & Headshots</h1>

        {status === 'loading' && (
          <div className="pf-loading">
            <span className="pf-spinner" aria-hidden="true" />
            Loading...
          </div>
        )}

        {status === 'error' && (
          <div className="pf-error">
            <span>Failed to load portraits portfolio.</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{error}</span>
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
