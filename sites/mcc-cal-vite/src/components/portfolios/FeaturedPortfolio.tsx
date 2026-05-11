import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { sortPortfolioGroups } from '../portfolio/sortGroups';
import { generateId } from '@/utils/portfolio-ids';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';

interface FeaturedImage {
  filename?: string;
  caption?: string;
  description?: string;
  path?: string;
  tags?: string[];
}

interface FeaturedMetadata {
  caption?: string;
  description?: string;
  date?: string;
}

interface FeaturedDate {
  iso?: string;
}

interface FeaturedItem {
  title?: string;
  name?: string;
  bandName?: string;
  eventName?: string;
  category: string;
  type?: string;
  folderPath?: string;
  relativeFolderPath?: string;
  dateDisplay?: string;
  dateISO?: string;
  concertDate?: FeaturedDate;
  eventDate?: FeaturedDate;
  date?: FeaturedDate;
  metadata?: FeaturedMetadata;
  coverImage?: string | FeaturedImage;
  published?: boolean;
  tags?: string[];
  images: (string | FeaturedImage)[];
}

interface FeaturedManifest {
  items: FeaturedItem[];
  categories?: string[];
}

function formatDisplayDate(dateISO?: string): string | undefined {
  if (!dateISO) return undefined;

  const parts = dateISO.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  if (parts.length === 2) {
    const [year, month] = parts.map(Number);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }

  return dateISO;
}

function resolveTitle(item: FeaturedItem): string {
  return (
    item.title ??
    item.bandName ??
    item.eventName ??
    item.name ??
    item.relativeFolderPath?.split('/').pop() ??
    item.folderPath?.split('/').pop() ??
    'Untitled'
  );
}

function resolveDateISO(item: FeaturedItem): string | undefined {
  return item.dateISO ?? item.concertDate?.iso ?? item.eventDate?.iso ?? item.date?.iso ?? item.metadata?.date;
}

function resolveDateDisplay(item: FeaturedItem, dateISO?: string): string | undefined {
  if (item.dateDisplay && !/undefined/i.test(item.dateDisplay)) {
    return item.dateDisplay;
  }

  return formatDisplayDate(dateISO);
}

function resolveFilename(image: string | FeaturedImage): string {
  if (typeof image === 'string') return image;
  return image.filename ?? image.path?.split('/').pop() ?? '';
}

function resolveImageUrl(item: FeaturedItem, image: string | FeaturedImage, filename: string): string {
  if (typeof image === 'object' && image.path?.startsWith('src/images/')) {
    return imageUrl.event(image.path);
  }

  const itemType = item.type ?? '';
  if (itemType === 'Journalism' || item.category === 'Journalism Photography') {
    return imageUrl.journalism(item.folderPath ?? '', filename);
  }

  if (itemType === 'Concert' || item.category === 'Concert Photography') {
    return imageUrl.concert(item.relativeFolderPath ?? `Concert/${item.folderPath ?? ''}`, filename);
  }

  return imageUrl.featured(item.relativeFolderPath ?? item.folderPath ?? '', filename);
}

function normaliseImage(
  item: FeaturedItem,
  image: string | FeaturedImage,
  title: string,
  fallback?: FeaturedMetadata,
) {
  const filename = resolveFilename(image);
  const metadata = typeof image === 'object' ? image : undefined;
  const caption = metadata?.caption ?? fallback?.caption;
  const description = metadata?.description ?? fallback?.description;

  return {
    url: resolveImageUrl(item, image, filename),
    filename,
    caption,
    description,
    alt: caption ?? description ?? `${title} — ${filename}`,
  };
}

function normalise(items: FeaturedItem[]): PortfolioGroup[] {
  return items.map((item) => {
    const title = resolveTitle(item);
    const dateISO = resolveDateISO(item);
    const images = item.images.map((image) => normaliseImage(item, image, title));
    const coverSource = item.coverImage ?? item.images[0];
    const coverImage = coverSource
      ? normaliseImage(item, coverSource, title, item.metadata)
      : images[0];

    return {
      id: generateId(title, dateISO),
      title,
      dateDisplay: resolveDateDisplay(item, dateISO),
      dateISO,
      category: item.category,
      tags: item.tags,
      published: item.published ?? false,
      images,
      coverImage,
    };
  });
}

const ALL = 'All';

function shortCategory(cat: string) {
  return cat.replace(' Photography', '');
}

export default function FeaturedPortfolio() {
  const { data, status, error } = useManifest<FeaturedManifest>('featured');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data?.items) return [];
    return sortPortfolioGroups(normalise(data.items));
  }, [data]);

  const filters = useMemo(() => {
    if (!groups.length) return [];
    const cats = Array.from(new Set(groups.map((g) => g.category).filter(Boolean))) as string[];
    return [ALL, ...cats.map(shortCategory)];
  }, [groups]);

  const filtered = useMemo(() => {
    if (activeFilter === ALL) return groups;
    return groups.filter((g) => shortCategory(g.category ?? '') === activeFilter);
  }, [groups, activeFilter]);

  return (
    <div className={portfolioStyles.pfRoot}>
      <h2 className={portfolioStyles.pfHeading}>Featured Work</h2>
      <p className={portfolioStyles.pfSubheading}>
        A curated selection of recent work across concerts, events, and journalism.
      </p>

      {status === 'loading' && (
        <div className={portfolioStyles.pfLoading}>
          <span className={portfolioStyles.pfSpinner} />
          Loading featured work…
        </div>
      )}

      {status === 'error' && (
        <div className={portfolioStyles.pfError}>
          <span>Failed to load portfolio.</span>
          <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>{error}</span>
        </div>
      )}

      {status === 'success' && (
        <>
          <PortfolioFilters
            filters={filters}
            active={activeFilter}
            onChange={setActiveFilter}
          />
          <PortfolioGrid groups={filtered} initialCount={12} batchSize={6} />
        </>
      )}
    </div>
  );
}
