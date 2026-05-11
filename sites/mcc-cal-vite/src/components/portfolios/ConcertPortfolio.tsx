import { useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { sortPortfolioGroups } from '../portfolio/sortGroups';
import { generateId } from '@/utils/portfolio-ids';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import { portfolioStyles } from '../portfolio';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface ConcertBand {
  bandName: string;
  relativeFolderPath: string;
  dateDisplay?: string;
  concertDate?: { iso: string };
  images: string[];
}

interface ConcertManifest {
  bands: ConcertBand[];
}

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(bands: ConcertBand[]): PortfolioGroup[] {
  return bands.map((band) => {
    const images = band.images.map((filename) => ({
      url: imageUrl.concert(band.relativeFolderPath, filename),
      filename,
      alt: `${band.bandName} — ${filename}`,
    }));

    return {
      id: generateId(band.bandName, band.concertDate?.iso),
      title: band.bandName,
      dateDisplay: band.dateDisplay,
      dateISO: band.concertDate?.iso,
      images,
      coverImage: images[0],
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConcertPortfolio() {
  const { data, status, error } = useManifest<ConcertManifest>('concert');

  const groups = useMemo(() => {
    if (!data?.bands) return [];
    return sortPortfolioGroups(normalise(data.bands));
  }, [data]);

  return (
    <div className={portfolioStyles.pfRoot}>
      <h2 className={portfolioStyles.pfHeading}>Concert Photography</h2>
      <p className={portfolioStyles.pfSubheading}>
        Live music from Pittsburgh and beyond.
      </p>

      {status === 'loading' && (
        <div className={portfolioStyles.pfLoading}>
          <span className={portfolioStyles.pfSpinner} />
          Loading concert portfolio…
        </div>
      )}

      {status === 'error' && (
        <div className={portfolioStyles.pfError}>
          <span>Failed to load portfolio.</span>
          <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>{error}</span>
        </div>
      )}

      {status === 'success' && (
        <PortfolioGrid groups={groups} initialCount={12} batchSize={6} />
      )}
    </div>
  );
}
