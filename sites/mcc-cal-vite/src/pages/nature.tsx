import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, imageUrl } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import '@/components/portfolio/portfolio.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';

interface NatureItem {
  collectionName: string;
  folderPath: string;
  totalImages: number;
  images: string[];
  tags: string[];
}

interface NatureManifest {
  version: string;
  generated: string;
  totalCollections: number;
  collections: NatureItem[];
}

function adaptNature(manifest: NatureManifest): PortfolioGroup[] {
  return manifest.collections.map((item) => {
    const images = item.images.map((filename) => ({
      url: imageUrl.nature(item.folderPath, filename),
      filename,
      alt: `${item.collectionName} nature photo`,
    }));

    return {
      id: item.folderPath.replace(/\//g, '-').toLowerCase(),
      title: item.collectionName,
      category: item.tags[0] || 'Nature',
      images,
      coverImage: images[0],
    };
  });
}

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
    title: 'Nature Photography | Caleb McCartney',
    description: 'Nature and landscape photography by Caleb McCartney. Wildlife, scenic vistas, and the beauty of the natural world.',
    canonical: `${SITE_URL}/nature`,
    og: {
      type: 'website',
      title: 'Nature Photography | Caleb McCartney',
      description: 'Nature and landscape photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Nature Photography | Caleb McCartney',
      description: 'Nature and landscape photography by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Nature Photography',
      provider: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
      description: 'Nature and landscape photography capturing wildlife, scenic vistas, and the natural world.',
      serviceType: 'Photography',
    },
  });

  return (
    <Layout>
      <div className="pf-root">
        <p className="pf-subheading" style={{ textAlign: 'center', marginBottom: 0 }}>
          Nature Photography
        </p>
        <h1 className="pf-heading">Wildlife & Landscapes</h1>

        {status === 'loading' && (
          <div className="pf-loading">
            <span className="pf-spinner" aria-hidden="true" />
            Loading...
          </div>
        )}

        {status === 'error' && (
          <div className="pf-error">
            <span>Failed to load nature portfolio.</span>
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
