import { imageUrl } from '@/components/portfolio/useManifest';
import type { PortfolioGroup } from '@/components/portfolio/types';

export interface EventItem {
  title?: string;
  eventName: string;
  category?: string;
  tags?: string[];
  dateDisplay?: string;
  dateISO?: string;
  folderPath?: string;
  images: {
    path: string;
    caption?: string;
    description?: string;
    alt?: string;
  }[];
}

export interface EventsManifest {
  events: EventItem[];
}

export function adaptEvents(manifest: EventsManifest): PortfolioGroup[] {
  return manifest.events.map((item) => {
    const name = item.title ?? item.eventName;
    const images = item.images.map((img, i) => {
      const filename = img.path.split('/').pop() ?? `image-${i}`;
      const photoMatch = filename.match(/CAL(\d+)/);
      const photoNum = photoMatch ? ` #${photoMatch[1]}` : '';
      return {
        url: imageUrl.event(img.path),
        filename,
        caption: img.caption,
        description: img.description,
        alt: img.alt ?? img.caption ?? img.description ?? `${name}${photoNum}`,
      };
    });
    return {
      id: (item.folderPath ?? name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: name,
      dateDisplay: item.dateDisplay,
      dateISO: item.dateISO,
      category: item.category,
      tags: item.tags,
      images,
      coverImage: images[0],
    };
  });
}
