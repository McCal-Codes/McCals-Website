import { imageUrl } from '@/components/portfolio/useManifest';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { eventKeep } from '@/content/eventCuration';
import { describeImage } from '@/utils/altText';

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

// A shoot listed in eventKeep shows only its curated frames (an empty list hides it).
// A shoot missing from the map is shown in full, so new work is never hidden by accident.
function curate(events: EventItem[]): EventItem[] {
  return events
    .map((item) => {
      const keep = eventKeep[item.eventName];
      if (!keep) return item;
      return {
        ...item,
        // Keep-list order wins, so the first entry leads the album and becomes its cover.
        images: keep.flatMap((name) =>
          item.images.filter((img) => (img.path.split('/').pop() ?? '') === name),
        ),
      };
    })
    .filter((item) => item.images.length > 0);
}

export function adaptEvents(manifest: EventsManifest): PortfolioGroup[] {
  return curate(manifest.events).map((item) => {
    const name = item.title ?? item.eventName;
    const images = item.images.map((img, i) => {
      const filename = img.path.split('/').pop() ?? `image-${i}`;
      return {
        url: imageUrl.event(img.path),
        filename,
        caption: img.caption,
        description: img.description,
        alt:
          img.alt ??
          img.caption ??
          img.description ??
          describeImage({
            title: name,
            kind: 'event',
            index: i,
            total: item.images.length,
            date: item.dateDisplay,
          }),
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
