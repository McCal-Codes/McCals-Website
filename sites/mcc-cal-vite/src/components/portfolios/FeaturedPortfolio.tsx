import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { imageRightsProperties } from '@/utils/jsonLd';
import OptimizedImage from '@/components/OptimizedImage';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { generateId } from '@/utils/portfolio-ids';
import { concertKeep } from '@/content/concertCuration';
import { eventKeep } from '@/content/eventCuration';
import { journalismKeep } from '@/content/journalismCuration';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';
import { ALL, FILTER_ORDER, orderFeatured, shortCategory } from './featuredStories';
import { featuredPicks } from '@/content/featuredPicks';
import { featuredNames } from '@/content/featuredNames';
import { adaptPortraits, type PortraitManifest } from '@/pages/portraits-adapter';
import { adaptNature, type NatureManifest } from '@/pages/nature-adapter';
import ProtectedPortfolioImage from '../portfolio/ProtectedPortfolioImage';

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
  featuredRank?: number;
  featuredDescription?: string;
  featuredCover?: string;
  sourcePath?: string;
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
  return (
    item.dateISO ??
    item.concertDate?.iso ??
    item.eventDate?.iso ??
    item.date?.iso ??
    item.metadata?.date
  );
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

function resolveImageUrl(
  item: FeaturedItem,
  image: string | FeaturedImage,
  filename: string,
): string {
  if (typeof image === 'object' && image.path?.startsWith('src/images/')) {
    return imageUrl.event(image.path);
  }

  const itemType = item.type ?? '';
  if (itemType === 'Journalism' || item.category === 'Journalism Photography') {
    return imageUrl.journalism(item.folderPath ?? '', filename);
  }

  if (itemType === 'Concert' || item.category === 'Concert Photography') {
    return imageUrl.concert(
      item.relativeFolderPath ?? `Concert/${item.folderPath ?? ''}`,
      filename,
    );
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
    alt: caption ?? description ?? `${title} - ${filename}`,
  };
}

// Featured reuses the same editor's-eye keep-lists as the Concerts and Photojournalism pages,
// so a story shows the same frames wherever it appears. Items with no list show in full.
function keepListFor(item: FeaturedItem): readonly string[] | undefined {
  if (item.type === 'Journalism') return journalismKeep[item.folderPath ?? ''];
  if (item.type === 'Concert') return concertKeep[item.relativeFolderPath ?? ''];
  if (item.type === 'Events') return eventKeep[item.eventName ?? ''];
  return undefined;
}

// Keep-list order wins, so the first entry leads the story and becomes its cover.
function curatedImages(item: FeaturedItem): (string | FeaturedImage)[] {
  const keep = keepListFor(item);
  if (!keep) return item.images;

  return keep.flatMap((name) => item.images.filter((image) => resolveFilename(image) === name));
}

function normalise(items: FeaturedItem[]): PortfolioGroup[] {
  return items
    .filter((rawItem) => curatedImages(rawItem).length > 0)
    .map((rawItem) => {
      const item = { ...rawItem, images: curatedImages(rawItem) };
      const title = resolveTitle(item);
      const dateISO = resolveDateISO(item);
      const images = item.images.map((image) => normaliseImage(item, image, title));
      const cover = item.coverImage;
      const coverKept =
        cover !== undefined &&
        item.images.some((image) => resolveFilename(image) === resolveFilename(cover));
      const coverSource = coverKept && !keepListFor(rawItem) ? cover : item.images[0];
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
        featuredRank: item.featuredRank,
        featuredDescription: item.featuredDescription,
        featuredCover: item.featuredCover,
        sourcePath: item.sourcePath ?? item.relativeFolderPath ?? item.folderPath,
        published: item.published ?? false,
        images,
        coverImage,
      };
    });
}

function getFeaturedTimestamp(group: PortfolioGroup): number {
  const timestamp = Date.parse(group.dateISO ?? '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function compareFeaturedGroups(a: PortfolioGroup, b: PortfolioGroup) {
  const dateDelta = getFeaturedTimestamp(b) - getFeaturedTimestamp(a);
  if (dateDelta !== 0) {
    return dateDelta;
  }

  const aRank = a.featuredRank ?? Number.POSITIVE_INFINITY;
  const bRank = b.featuredRank ?? Number.POSITIVE_INFINITY;

  if (aRank !== bRank) {
    return aRank - bRank;
  }

  return a.title.localeCompare(b.title);
}

// Portraits albums and Nature collections come from their own manifests. Only the names listed
// in featuredPicks appear, in that order, and each keeps the cover its work page uses.
function pickExtras(groups: PortfolioGroup[], names: readonly string[], category: string) {
  return names.flatMap((name) => {
    const group = groups.find((candidate) => candidate.title === name);
    return group && group.images.length > 0
      ? [{ ...group, category, featuredRank: undefined }]
      : [];
  });
}

function categoryRoute(category?: string) {
  const short = shortCategory(category ?? '');

  if (short === 'Concert') return '/concerts';
  if (short === 'Events') return '/events';
  if (short === 'Journalism') return '/journalism';
  if (short === 'Portraits') return '/portraits';
  if (short === 'Nature') return '/nature';

  return '/featured-work';
}

function categoryLabel(category?: string) {
  const label = shortCategory(category ?? 'Portfolio');
  return label === 'Journalism' ? 'Photojournalism' : label;
}

function filterDisplayLabel(filter: string) {
  return filter === 'Journalism' ? 'photojournalism' : filter.toLowerCase();
}

// Alt text a search engine can use. A written caption wins; otherwise describe the shoot instead
// of the raw filename the adapters fall back to.
function describePhoto(group: PortfolioGroup): string {
  const caption = group.coverImage.caption;
  if (caption) return caption;

  const names = featuredNames[group.title];
  const subject = names ? `${group.title} (${names})` : group.title;
  const label = categoryLabel(group.category).toLowerCase();
  const when = group.dateDisplay ? `, ${group.dateDisplay}` : '';
  return `${subject}, ${label} photography by Caleb McCartney${when}`;
}

function toAbsoluteUrl(url: string) {
  return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

function FeaturedTile({ group, loading }: { group: PortfolioGroup; loading: 'eager' | 'lazy' }) {
  const label = categoryLabel(group.category);
  const names = featuredNames[group.title];

  return (
    <Link to={categoryRoute(group.category)} className={portfolioStyles.pfFeaturedTile}>
      <span className={portfolioStyles.pfFeaturedTileImage}>
        <ProtectedPortfolioImage className={portfolioStyles.pfFeaturedStoryProtectedImage}>
          <OptimizedImage
            src={group.coverImage.url}
            alt={describePhoto(group)}
            frameClassName={`${portfolioStyles.pfBlurImageFrame} ${portfolioStyles.pfFeaturedStoryImageFrame}`}
            imageClassName={`${portfolioStyles.pfBlurImage} ${portfolioStyles.pfFeaturedStoryImage}`}
            loading={loading}
            decoding="async"
            optimizedWidth={720}
            srcSetWidths={[360, 540, 720, 960]}
            sizes="(max-width: 680px) calc(100vw - 32px), (max-width: 980px) 50vw, 31vw"
            width={460}
            height={345}
            draggable={false}
          />
        </ProtectedPortfolioImage>
      </span>
      <span className={portfolioStyles.pfFeaturedTileCaption}>
        <span className={portfolioStyles.pfFeaturedTileTitle}>{group.title}</span>
        {names && <span className={portfolioStyles.pfFeaturedTileNames}>{names}</span>}
        <span className={portfolioStyles.pfFeaturedTileMeta}>
          {label}
          {group.dateDisplay ? ` · ${group.dateDisplay}` : ''}
        </span>
      </span>
    </Link>
  );
}

export default function FeaturedPortfolio() {
  const { data, status, error } = useManifest<FeaturedManifest>('featured');
  const { data: portraitData } = useManifest<PortraitManifest>('portraits');
  const { data: natureData } = useManifest<NatureManifest>('nature');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data?.items) return [];
    const extras = [
      ...pickExtras(
        portraitData ? adaptPortraits(portraitData) : [],
        featuredPicks.Portraits,
        'Portraits Photography',
      ),
      ...pickExtras(
        natureData ? adaptNature(natureData) : [],
        featuredPicks.Nature,
        'Nature Photography',
      ),
    ];
    return [...normalise(data.items).sort(compareFeaturedGroups), ...extras];
  }, [data, portraitData, natureData]);

  const filters = useMemo(() => {
    if (!groups.length) return [];
    const cats = new Set(groups.map((g) => shortCategory(g.category ?? '')).filter(Boolean));
    const ordered = FILTER_ORDER.filter((category) => cats.has(category));
    const remaining = Array.from(cats)
      .filter((category) => !FILTER_ORDER.includes(category))
      .sort();

    return [ALL, ...ordered, ...remaining];
  }, [groups]);

  const visible = useMemo(() => {
    const filtered =
      activeFilter === ALL
        ? groups
        : groups.filter((g) => shortCategory(g.category ?? '') === activeFilter);
    return orderFeatured(filtered);
  }, [groups, activeFilter]);

  // Structured data for the photos on the page, so search engines get the credit, copyright and
  // licensing details with each image.
  const galleryJsonLd = useMemo(() => {
    if (!visible.length) return null;
    const origin = window.location.origin;
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'Featured Photography Portfolio',
      url: `${origin}/featured-work`,
      image: visible.map((group) => ({
        '@type': 'ImageObject',
        contentUrl: toAbsoluteUrl(group.coverImage.url),
        name: group.title,
        description: describePhoto(group),
        ...(group.dateISO ? { dateCreated: group.dateISO } : {}),
        ...imageRightsProperties(),
        url: `${origin}${categoryRoute(group.category)}`,
      })),
    });
  }, [visible]);

  return (
    <div className={`${portfolioStyles.pfRoot} ${portfolioStyles.pfFeaturedRoot}`}>
      <header className={portfolioStyles.pfFeaturedHeader}>
        <div className={portfolioStyles.pfFeaturedHeaderCopy}>
          <p className={portfolioStyles.pfFeaturedDeck}>Latest Curated Edit</p>
          <h1 className={portfolioStyles.pfHeading}>Featured Work</h1>
          <p className={portfolioStyles.pfSubheading}>
            A quick look across concerts, events, photojournalism, portraits, and nature. Pick any
            image to see the full set.
          </p>
        </div>
      </header>

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
          <PortfolioFilters filters={filters} active={activeFilter} onChange={setActiveFilter} />
          {visible.length > 0 && (
            <div className={`${portfolioStyles.pfGrid} ${portfolioStyles.pfFeaturedGrid}`}>
              {visible.map((group, index) => (
                <FeaturedTile key={group.id} group={group} loading={index < 6 ? 'eager' : 'lazy'} />
              ))}
            </div>
          )}

          {galleryJsonLd && <script type="application/ld+json">{galleryJsonLd}</script>}

          {activeFilter !== ALL && visible.length === 0 && (
            <div className={portfolioStyles.pfFeaturedCategoryNote}>
              <p>Nothing featured in {filterDisplayLabel(activeFilter)} yet.</p>
              <Link to={categoryRoute(`${activeFilter} Photography`)}>
                View the full {filterDisplayLabel(activeFilter)} portfolio
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
