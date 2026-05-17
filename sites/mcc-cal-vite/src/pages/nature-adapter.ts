import { imageUrl } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';

interface NatureItem {
  collectionName: string;
  folderPath: string;
  totalImages: number;
  images: NatureImageEntry[];
  tags: string[];
}

export interface NatureManifest {
  version: string;
  generated: string;
  totalCollections: number;
  collections: NatureItem[];
}

interface NatureImageMetadata {
  filename: string;
  path?: string;
  caption?: string;
  description?: string;
  alt?: string;
  tags?: string[];
}

type NatureImageEntry = string | NatureImageMetadata;

function normalizeNatureImage(image: NatureImageEntry): NatureImageMetadata {
  if (typeof image === 'string') {
    return { filename: image };
  }

  return {
    filename: image.filename || image.path || '',
    path: image.path,
    caption: image.caption,
    description: image.description,
    alt: image.alt,
    tags: image.tags,
  };
}

function inferDateFromFilename(filename: string): Date | null {
  const eightDigitMatch = filename.match(/(?:^|[^0-9])(\d{4})(\d{2})(\d{2})(?=[^0-9]|$)/);
  if (eightDigitMatch) {
    const [, year, month, day] = eightDigitMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const sixDigitMatch = filename.match(/(?:^|[^0-9])(\d{2})(\d{2})(\d{2})(?=[^0-9]|$)/);
  if (sixDigitMatch) {
    const [, shortYear, month, day] = sixDigitMatch;
    return new Date(Date.UTC(2000 + Number(shortYear), Number(month) - 1, Number(day)));
  }

  return null;
}

function summarizeCollectionDate(images: NatureImageEntry[]): Pick<PortfolioGroup, 'dateDisplay' | 'dateISO'> {
  const parsedDates = images
    .map((image) => inferDateFromFilename(normalizeNatureImage(image).filename))
    .filter((date): date is Date => date instanceof Date);

  if (parsedDates.length === 0) {
    return {};
  }

  const uniqueMonths = new Set(
    parsedDates.map((date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`),
  );

  if (uniqueMonths.size !== 1) {
    return {};
  }

  const latest = parsedDates.reduce((currentLatest, date) =>
    date.getTime() > currentLatest.getTime() ? date : currentLatest,
  );

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(latest);

  return {
    dateDisplay: monthLabel,
    dateISO: `${latest.getUTCFullYear()}-${String(latest.getUTCMonth() + 1).padStart(2, '0')}`,
  };
}

function formatNatureCategory(item: NatureItem): string {
  if (item.folderPath.startsWith('Wildlife/Birds/')) return 'Birds';
  if (item.folderPath.startsWith('Wildlife/')) return 'Wildlife';
  if (item.folderPath.startsWith('Landscapes/')) return 'Landscapes';

  const primaryTag = item.tags[0];
  if (!primaryTag) return 'Nature';

  return primaryTag
    .split(/[-\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

interface NatureGroupSource {
  title: string;
  folderPath: string;
  images: NatureImageEntry[];
  category: string;
  tags: string[];
}

function splitLandscapeCollection(item: NatureItem): NatureGroupSource[] {
  const category = formatNatureCategory(item);
  const bucketDefinitions: Array<{
    key: string;
    title: string;
    matcher: RegExp;
  }> = [
    {
      key: 'fireworks',
      title: `${item.collectionName} — Fireworks`,
      matcher: /fireworks/i,
    },
    {
      key: 'sunrise',
      title: `${item.collectionName} — Sunrise`,
      matcher: /sunrise/i,
    },
    {
      key: 'point-park',
      title: `${item.collectionName} — Point Park`,
      matcher: /point[_\s-]*park|ppu ad/i,
    },
    {
      key: 'night-market',
      title: `${item.collectionName} — Night Market`,
      matcher: /night[_\s-]*market/i,
    },
  ];

  const buckets = new Map<string, NatureImageEntry[]>(
    bucketDefinitions.map((definition) => [definition.key, []]),
  );
  const selects: NatureImageEntry[] = [];

  for (const image of item.images) {
    const filename = normalizeNatureImage(image).filename;
    const matchedDefinition = bucketDefinitions.find((definition) => definition.matcher.test(filename));

    if (matchedDefinition) {
      buckets.get(matchedDefinition.key)?.push(image);
    } else {
      selects.push(image);
    }
  }

  const groupedCollections = bucketDefinitions
    .map((definition) => {
      const images = buckets.get(definition.key) ?? [];
      if (images.length === 0) return null;

      return {
        title: definition.title,
        folderPath: item.folderPath,
        images,
        category,
        tags: item.tags,
      };
    })
    .filter((group): group is NatureGroupSource => group !== null);

  if (selects.length > 0) {
    groupedCollections.push({
      title: `${item.collectionName} — City Selects`,
      folderPath: item.folderPath,
      images: selects,
      category,
      tags: item.tags,
    });
  }

  return groupedCollections;
}

function expandNatureCollection(item: NatureItem): NatureGroupSource[] {
  if (item.folderPath.startsWith('Landscapes/') && item.images.length > 8) {
    return splitLandscapeCollection(item);
  }

  return [
    {
      title: item.collectionName,
      folderPath: item.folderPath,
      images: item.images,
      category: formatNatureCategory(item),
      tags: item.tags,
    },
  ];
}

export function adaptNature(manifest: NatureManifest): PortfolioGroup[] {
  return manifest.collections
    .filter((item) => item.images.length > 0)
    .flatMap((item) =>
      expandNatureCollection(item).map((groupSource) => {
        const images = groupSource.images.map((entry, index) => {
          const image = normalizeNatureImage(entry);

          return {
            url: imageUrl.nature(groupSource.folderPath, image.filename),
            filename: image.filename,
            caption: image.caption,
            description: image.description,
            alt:
              image.alt ??
              image.caption ??
              image.description ??
              `${groupSource.title}, nature image ${index + 1}`,
          };
        });

        const coverFilename = normalizeNatureImage(groupSource.images[0]).filename;
        const coverImage = {
          ...images[0],
          url: imageUrl.natureThumb(groupSource.folderPath, coverFilename),
        };

        return {
          id: `${groupSource.folderPath.replace(/\//g, '-').toLowerCase()}-${groupSource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: groupSource.title,
          category: groupSource.category,
          tags: groupSource.tags,
          images,
          coverImage,
          ...summarizeCollectionDate(groupSource.images),
        };
      }),
    );
}
