import { imageUrl } from '@/components/portfolio';
import { concertKeep } from '@/content/concertCuration';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { describeImage } from '@/utils/altText';

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
      // Keep-list order wins, so the first entry leads the album and becomes its cover.
      return { ...band, images: keep.filter((filename) => band.images.includes(filename)) };
    })
    .filter((band) => band.images.length > 0);
}

export function adaptConcerts(manifest: ConcertManifest): PortfolioGroup[] {
  return curate(manifest.bands).map((band) => {
    const images = band.images.map((filename, index) => ({
      url: imageUrl.concert(band.relativeFolderPath, filename),
      filename,
      alt: describeImage({
        title: band.bandName,
        kind: 'concert',
        index,
        total: band.images.length,
        date: band.dateDisplay,
      }),
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
