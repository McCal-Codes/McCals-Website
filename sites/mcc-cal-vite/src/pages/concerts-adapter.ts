import { imageUrl } from '@/components/portfolio';
import { concertKeep } from '@/content/concertCuration';
import type { PortfolioGroup } from '@/components/portfolio/types';

export interface ConcertBand {
  bandName: string;
  relativeFolderPath: string;
  dateDisplay?: string;
  concertDate?: { iso?: string };
  totalImages: number;
  images: string[];
}

export interface ConcertManifest {
  bands: ConcertBand[];
}

// A shoot listed in concertKeep shows only its curated frames (an empty list hides it).
// A shoot missing from the map is shown in full, so new work is never hidden by accident.
function curate(bands: ConcertBand[]): ConcertBand[] {
  return bands
    .map((band) => {
      const keep = concertKeep[band.relativeFolderPath];
      if (!keep) return band;
      return { ...band, images: band.images.filter((filename) => keep.includes(filename)) };
    })
    .filter((band) => band.images.length > 0);
}

export function adaptConcerts(manifest: ConcertManifest): PortfolioGroup[] {
  return curate(manifest.bands).map((band) => {
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
