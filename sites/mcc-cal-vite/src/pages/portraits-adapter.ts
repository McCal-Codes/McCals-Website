import { imageUrl } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { generateId } from '@/utils/portfolio-ids';

interface PortraitAlbum {
  albumName: string;
  folderPath: string;
  totalImages: number;
  images: string[];
  tags?: string[];
  imageMetadata?: PortraitImageMetadataMap;
}

interface PortraitItem {
  collectionName: string;
  folderPath: string;
  totalImages: number;
  images: string[];
  tags: string[];
  albums?: PortraitAlbum[];
  looseImages?: string[];
  imageMetadata?: PortraitImageMetadataMap;
}

export interface PortraitManifest {
  version: string;
  generated: string;
  totalCollections: number;
  totalImages: number;
  collections: PortraitItem[];
}

interface PortraitImageMetadata {
  caption?: string;
  description?: string;
  alt?: string;
}

type PortraitImageMetadataMap = Record<string, PortraitImageMetadata>;

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

function summarizeSessionDate(images: string[]): Pick<PortfolioGroup, 'dateDisplay' | 'dateISO'> {
  const parsedDates = images
    .map((filename) => inferDateFromFilename(filename))
    .filter((date): date is Date => date instanceof Date);

  if (parsedDates.length === 0) {
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

  const month = String(latest.getUTCMonth() + 1).padStart(2, '0');

  return {
    dateDisplay: monthLabel,
    dateISO: `${latest.getUTCFullYear()}-${month}`,
  };
}

function mergeTags(...tagSets: Array<string[] | undefined>): string[] {
  const tags = tagSets.flatMap((tagSet) => tagSet ?? []);

  return [
    ...new Map(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => [tag.toLowerCase(), tag] as const),
    ).values(),
  ];
}

function getImageMetadata(
  imageMetadata: PortraitImageMetadataMap | undefined,
  rawFilename: string,
): PortraitImageMetadata | undefined {
  if (!imageMetadata) {
    return undefined;
  }

  const basename = rawFilename.split('/').pop() ?? rawFilename;

  return imageMetadata[rawFilename] ?? imageMetadata[basename];
}

function textOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function createSessionGroup(
  category: string,
  tags: string[],
  sessionTitle: string,
  sessionPath: string,
  sessionImages: string[],
  useBasenamePaths = false,
  imageMetadata?: PortraitImageMetadataMap,
): PortfolioGroup | null {
  if (sessionImages.length === 0) {
    return null;
  }

  const images = sessionImages.map((rawFilename, index) => {
    const filename = useBasenamePaths ? rawFilename.split('/').pop() ?? rawFilename : rawFilename;
    const metadata = getImageMetadata(imageMetadata, rawFilename);
    const caption = textOrUndefined(metadata?.caption);
    const description = textOrUndefined(metadata?.description);
    const alt = textOrUndefined(metadata?.alt);

    return {
      url: imageUrl.portrait(sessionPath, filename),
      filename: rawFilename.split('/').pop() ?? rawFilename,
      alt: alt ?? `${sessionTitle}, ${category.toLowerCase()} portrait image ${index + 1}`,
      ...(caption ? { caption } : {}),
      ...(description ? { description } : {}),
    };
  });

  return {
    id: generateId(sessionTitle, category),
    title: sessionTitle,
    category,
    tags: tags.filter((tag) => tag.toLowerCase() !== 'portrait'),
    images,
    coverImage: images[0],
    ...summarizeSessionDate(sessionImages),
  };
}

export function adaptPortraits(manifest: PortraitManifest): PortfolioGroup[] {
  return manifest.collections.flatMap((item) => {
    const sessionGroups = item.albums?.length
      ? item.albums
          .map((album) =>
            createSessionGroup(
              item.collectionName,
              mergeTags(album.tags?.length ? album.tags : item.tags),
              album.albumName,
              album.folderPath,
              album.images,
              true,
              album.imageMetadata,
            ),
          )
          .filter((group): group is PortfolioGroup => group !== null)
      : [];

    if (sessionGroups.length > 0) {
      return sessionGroups;
    }

    const looseImages = item.looseImages ?? item.images;
    const fallbackGroup = createSessionGroup(
      item.collectionName,
      item.tags,
      item.collectionName,
      item.folderPath,
      looseImages,
      false,
      item.imageMetadata,
    );

    return fallbackGroup ? [fallbackGroup] : [];
  });
}
