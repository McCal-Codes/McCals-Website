import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, imageUrl, portfolioStyles } from '@/components/portfolio';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';
const PAGE_SEO = getPageSeo('nature', SITE_URL);

interface NatureItem {
  collectionName: string;
  folderPath: string;
  totalImages: number;
  images: string[];
  tags: string[];
}

interface NatureManifest {
  version: string;
  generated: string;
  totalCollections: number;
  collections: NatureItem[];
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

function summarizeCollectionDate(images: string[]): Pick<PortfolioGroup, 'dateDisplay' | 'dateISO'> {
  const parsedDates = images
    .map((filename) => inferDateFromFilename(filename))
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
  images: string[];
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

  const buckets = new Map<string, string[]>(
    bucketDefinitions.map((definition) => [definition.key, []]),
  );
  const selects: string[] = [];

  for (const image of item.images) {
    const matchedDefinition = bucketDefinitions.find((definition) => definition.matcher.test(image));

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
        const images = groupSource.images.map((filename, index) => ({
          url: imageUrl.nature(groupSource.folderPath, filename),
          filename,
          alt: `${groupSource.title}, nature image ${index + 1}`,
        }));

        const coverFilename = groupSource.images[0];
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

export default function NaturePage() {
  const { data, status, error } = useManifest<NatureManifest>('nature');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    return sortPortfolioGroups(adaptNature(data));
  }, [data]);

  const filters = useMemo(() => {
    const categories = [...new Set(groups.map((g) => g.category).filter(Boolean))];
    return categories.length > 1 ? [ALL, ...categories] : [];
  }, [groups]);

  const filtered = useMemo(
    () => (activeFilter === ALL ? groups : groups.filter((g) => g.category === activeFilter)),
    [groups, activeFilter]
  );

  usePageMeta({
    title: PAGE_SEO.title,
    description: PAGE_SEO.description,
    canonical: PAGE_SEO.url,
    og: {
      type: 'website',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    jsonLd: generatePageGraph([
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for event coverage, concerts, headshots, nature, and commercial storytelling.',
      ),
      generatePhotographyServiceSchema(
        'Nature Photography',
        'Nature and landscape photography by Caleb McCartney, including wildlife, city horizons, Appalachian quiet, and close botanical studies.',
        PAGE_SEO.url,
        {
          alternateName: ['Landscape Photography', 'Wildlife Photography'],
          category: 'Nature photographer',
          keywords: ['nature photography', 'landscape photography', 'wildlife photography'],
        },
      ),
      generateSeoImageSchema(PAGE_SEO),
    ]),
  });

  return (
    <Layout>
      <div className={portfolioStyles.pfRoot}>
        <p className={`${portfolioStyles.pfSubheading} text-center mb-0`}>
          Nature Photography
        </p>
        <h1 className={portfolioStyles.pfHeading}>Wildlife & Landscapes</h1>
        <p className={portfolioStyles.pfIntro}>
          Field notes in photographs, from city horizons and Appalachian quiet to close wildlife
          studies, organized as collections so each place or species has room to breathe.
        </p>

        {status === 'loading' && (
          <div className={portfolioStyles.pfLoading}>
            <span className={portfolioStyles.pfSpinner} aria-hidden="true" />
            Loading...
          </div>
        )}

        {status === 'error' && (
          <div className={portfolioStyles.pfError}>
            <span>Failed to load nature portfolio.</span>
            <span className="text-xs opacity-70">{error}</span>
          </div>
        )}

        {status === 'success' && (
          <>
            <PortfolioFilters
              filters={filters.filter((f): f is string => typeof f === 'string')}
              active={activeFilter}
              onChange={setActiveFilter}
            />
            <PortfolioGrid
              groups={filtered}
              gridClassName={portfolioStyles.pfNatureGrid}
              cardImageSizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1100px) calc(50vw - 30px), 33vw"
            />
          </>
        )}
      </div>
    </Layout>
  );
}
