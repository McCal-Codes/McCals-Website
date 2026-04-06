import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { ConcertArtistSupport, PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, imageUrl } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import '@/components/portfolio/portfolio.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';

interface ConcertBand {
  bandName: string;
  relativeFolderPath: string;
  dateDisplay?: string;
  concertDate?: { iso?: string };
  totalImages: number;
  images: string[];
}

interface ConcertManifest {
  bands: ConcertBand[];
}

function adaptConcerts(manifest: ConcertManifest): PortfolioGroup[] {
  return manifest.bands.map((band) => {
    const images = band.images.map((filename) => ({
      url: imageUrl.concert(band.relativeFolderPath, filename),
      filename,
      alt: `${band.bandName} concert photo`,
    }));

    return {
      id: `${band.relativeFolderPath}-${band.bandName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      title: band.bandName,
      dateDisplay: band.dateDisplay,
      dateISO: band.concertDate?.iso,
      category: 'Concert',
      images,
      coverImage: images[0],
    };
  });
}

export default function ConcertsPage() {
  const { data, status, error } = useManifest<ConcertManifest>('concerts');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    return sortPortfolioGroups(adaptConcerts(data));
  }, [data]);

  const filters = useMemo(() => {
    const years = [...new Set(groups.map((group) => group.dateISO?.slice(0, 4)).filter(Boolean))].sort(
      (left, right) => Number(right) - Number(left),
    );

    return years.length > 1 ? [ALL, ...years] : [];
  }, [groups]);

  const filtered = useMemo(
    () =>
      activeFilter === ALL
        ? groups
        : groups.filter((group) => group.dateISO?.startsWith(activeFilter)),
    [groups, activeFilter],
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
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Concert Photography | Caleb McCartney',
      description: 'Live concert photography by Pittsburgh photojournalist Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
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
            Loading...
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
            <ConcertArtistSupport bands={data?.bands ?? []} />
            <PortfolioFilters
              filters={filters.filter((filter): filter is string => typeof filter === 'string')}
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
