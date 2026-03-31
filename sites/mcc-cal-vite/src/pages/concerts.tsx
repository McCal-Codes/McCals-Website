import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { useManifest, imageUrl } from '@/components/portfolio/useManifest';
import type { PortfolioGroup } from '@/components/portfolio/types';
import '@/components/portfolio/portfolio.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

interface ConcertItem {
  title: string;
  bandName?: string;
  folderPath?: string;
  dateDisplay?: string;
  dateISO?: string;
  totalImages: number;
  images: { filename: string; path: string }[];
}

interface ConcertManifest {
  items: ConcertItem[];
}

function adaptConcerts(manifest: ConcertManifest): PortfolioGroup[] {
  return manifest.items.map((item) => {
    const images = item.images.map((img) => ({
      url: imageUrl.concert(item.folderPath ?? item.title, img.filename),
      filename: img.filename,
      alt: `${item.title}  concert photo`,
    }));
    return {
      id: item.folderPath
        ? item.folderPath.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: item.title,
      dateDisplay: item.dateDisplay,
      dateISO: item.dateISO,
      category: 'Concert',
      images,
      coverImage: images[0],
    };
  });
}

import { useMemo, useState } from 'react';

const ALL = 'All';

export default function ConcertsPage() {
  const { data, status, error } = useManifest<ConcertManifest>('concerts');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => (data ? adaptConcerts(data) : []), [data]);

  // Filter by year derived from dateISO
  const filters = useMemo(() => {
    const years = [...new Set(groups.map((g) => g.dateISO?.slice(0, 4)).filter(Boolean))].sort(
      (a, b) => Number(b) - Number(a)
    );
    return years.length > 1 ? [ALL, ...years] : [];
  }, [groups]);

  const filtered = useMemo(
    () =>
      activeFilter === ALL ? groups : groups.filter((g) => g.dateISO?.startsWith(activeFilter)),
    [groups, activeFilter]
  );

  usePageMeta({
    title: 'Concert Photography | Caleb McCartney',
    description:
      'Live concert and music photography by Pittsburgh photojournalist Caleb McCartney. Editorial-quality images from touring and local shows.',
    canonical: `${SITE_URL}/concerts`,
    og: {
      type: 'website',
      title: 'Concert Photography | Caleb McCartney',
      description: 'Live concert photography by Pittsburgh photojournalist Caleb McCartney.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Concert Photography | Caleb McCartney',
      description: 'Live concert photography by Pittsburgh photojournalist Caleb McCartney.',
    },
  });

  return (
    <Layout>
      <div className="pf-root">
        <p className="pf-subheading" style={{ textAlign: 'center', marginBottom: 0 }}>
          Concert Photography
        </p>
        <h1 className="pf-heading">Live Music</h1>

        {status === 'loading' && (
          <div className="pf-loading">
            <span className="pf-spinner" aria-hidden="true" />
            Loading…
          </div>
        )}

        {status === 'error' && (
          <div className="pf-error">
            <span>Failed to load concerts.</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{error}</span>
          </div>
        )}

        {status === 'success' && (
          <>
            <PortfolioFilters filters={filters.filter((f): f is string => typeof f === 'string')} active={activeFilter} onChange={setActiveFilter} />
            <PortfolioGrid groups={filtered} />
          </>
        )}
      </div>
    </Layout>
  );
}
