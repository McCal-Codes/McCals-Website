import { imageUrl } from '@/components/portfolio';
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

export function adaptConcerts(manifest: ConcertManifest): PortfolioGroup[] {
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
