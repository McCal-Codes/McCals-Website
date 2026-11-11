import { useMemo, useState } from 'react';
import { preload } from 'react-dom';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/utils/imageOptimization';
import OptimizedImage from '@/components/OptimizedImage';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { generateId } from '@/utils/portfolio-ids';
import { concertKeep } from '@/content/concertCuration';
import { eventKeep } from '@/content/eventCuration';
import { journalismKeep } from '@/content/journalismCuration';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';
import { ALL, FILTER_ORDER, getFeaturedStories, shortCategory } from './featuredStories';
import { featuredPicks } from '@/content/featuredPicks';
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

const LEAD_IMAGE_WIDTHS = [640, 960, 1280, 1600];
const LEAD_IMAGE_SIZES = '(max-width: 980px) calc(100vw - 40px), 58vw';

interface FeaturedStoryCardProps {
  group: PortfolioGroup;
  variant: 'lead' | 'support';
  loading?: 'eager' | 'lazy';
}

// Featured is for browsing: every image leads to its work page, where the full gallery lives.
function FeaturedStoryCard({ group, variant, loading = 'lazy' }: FeaturedStoryCardProps) {
  const label = categoryLabel(group.category);
  const route = categoryRoute(group.category);
  const description = group.featuredDescription ?? group.coverImage.caption;

  return (
    <article
      className={`${portfolioStyles.pfFeaturedStory} ${variant === 'lead' ? portfolioStyles.pfFeaturedStoryLead : portfolioStyles.pfFeaturedStorySupport}`}
    >
      <Link
        to={route}
        className={portfolioStyles.pfFeaturedStoryImageButton}
        aria-label={`${group.title}, see more ${label.toLowerCase()}`}
      >
        <ProtectedPortfolioImage className={portfolioStyles.pfFeaturedStoryProtectedImage}>
          <OptimizedImage
            src={group.coverImage.url}
            alt={group.coverImage.alt ?? group.title}
            frameClassName={`${portfolioStyles.pfBlurImageFrame} ${portfolioStyles.pfFeaturedStoryImageFrame}`}
            imageClassName={`${portfolioStyles.pfBlurImage} ${portfolioStyles.pfFeaturedStoryImage}`}
            loading={loading}
            decoding="async"
            optimizedWidth={variant === 'lead' ? 1280 : 720}
            srcSetWidths={variant === 'lead' ? LEAD_IMAGE_WIDTHS : [360, 540, 720, 960]}
            sizes={
              variant === 'lead' ? LEAD_IMAGE_SIZES : '(max-width: 980px) calc(100vw - 40px), 28vw'
            }
            width={variant === 'lead' ? 980 : 460}
            height={variant === 'lead' ? 620 : 310}
            draggable={false}
          />
        </ProtectedPortfolioImage>
      </Link>

      <div className={portfolioStyles.pfFeaturedStoryCopy}>
        <p className={portfolioStyles.pfFeaturedStoryMeta}>
          <span>{label}</span>
          {group.dateDisplay && <span>{group.dateDisplay}</span>}
        </p>
        <h3 className={portfolioStyles.pfFeaturedStoryTitle}>{group.title}</h3>
        {description && <p className={portfolioStyles.pfFeaturedStoryDescription}>{description}</p>}
        <div className={portfolioStyles.pfFeaturedStoryActions}>
          <Link className={portfolioStyles.pfFeaturedStoryButton} to={route}>
            See more {label.toLowerCase()}
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedTile({ group, loading }: { group: PortfolioGroup; loading: 'eager' | 'lazy' }) {
  const label = categoryLabel(group.category);

  return (
    <Link
      to={categoryRoute(group.category)}
      className={portfolioStyles.pfFeaturedTile}
      aria-label={`${group.title}, see more ${label.toLowerCase()}`}
    >
      <ProtectedPortfolioImage className={portfolioStyles.pfFeaturedStoryProtectedImage}>
        <OptimizedImage
          src={group.coverImage.url}
          alt={group.coverImage.alt ?? group.title}
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
      <span className={portfolioStyles.pfFeaturedTileCaption}>
        <span className={portfolioStyles.pfFeaturedTileMeta}>
          {label}
          {group.dateDisplay ? ` · ${group.dateDisplay}` : ''}
        </span>
        <span className={portfolioStyles.pfFeaturedTileTitle}>{group.title}</span>
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

  const filtered = useMemo(() => {
    if (activeFilter === ALL) return groups;
    return groups.filter((g) => shortCategory(g.category ?? '') === activeFilter);
  }, [groups, activeFilter]);

  const featuredStories = getFeaturedStories(filtered, activeFilter);
  const featuredStoryIds = new Set(featuredStories.map((group) => group.id));
  const gridGroups = filtered.filter((group) => !featuredStoryIds.has(group.id));

  const categorySummaries = useMemo(() => {
    const categories = ['Concert', 'Events', 'Journalism'];

    return categories.map((category) => {
      const categoryGroups = groups.filter(
        (group) => shortCategory(group.category ?? '') === category,
      );
      const photoCount = categoryGroups.reduce((sum, group) => sum + group.images.length, 0);

      return {
        category,
        groups: categoryGroups.length,
        photos: photoCount,
        href: categoryRoute(`${category} Photography`),
      };
    });
  }, [groups]);

  // Start fetching the hero as soon as the lead is known, with the same srcset the card requests,
  // so the browser does not wait for the card to render before asking for it.
  const leadCover = featuredStories[0]?.coverImage.url;
  if (leadCover) {
    preload(getOptimizedImageUrl(leadCover, { width: 1280 }), {
      as: 'image',
      imageSrcSet: getResponsiveImageSrcSet(leadCover, LEAD_IMAGE_WIDTHS),
      imageSizes: LEAD_IMAGE_SIZES,
      fetchPriority: 'high',
    });
  }

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

        {groups.length > 0 && (
          <div className={portfolioStyles.pfFeaturedStats} aria-label="Featured portfolio summary">
            {categorySummaries.map((summary) => (
              <Link
                key={summary.category}
                className={portfolioStyles.pfFeaturedStat}
                to={summary.href}
              >
                <span className={portfolioStyles.pfFeaturedStatValue}>{summary.groups}</span>
                <span className={portfolioStyles.pfFeaturedStatLabel}>{summary.category}</span>
                <span className={portfolioStyles.pfFeaturedStatMeta}>{summary.photos} photos</span>
              </Link>
            ))}
          </div>
        )}
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
          {featuredStories.length > 0 && (
            <section
              className={portfolioStyles.pfFeaturedEditorial}
              aria-label="Featured portfolio highlights"
            >
              <FeaturedStoryCard group={featuredStories[0]} variant="lead" loading="eager" />
              {featuredStories.length > 1 && (
                <div className={portfolioStyles.pfFeaturedSupportStack}>
                  {featuredStories.slice(1).map((group) => (
                    <FeaturedStoryCard
                      key={group.id}
                      group={group}
                      variant="support"
                      loading="eager"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <PortfolioFilters filters={filters} active={activeFilter} onChange={setActiveFilter} />
          {gridGroups.length > 0 && (
            <div className={`${portfolioStyles.pfGrid} ${portfolioStyles.pfFeaturedGrid}`}>
              {gridGroups.map((group, index) => (
                <FeaturedTile key={group.id} group={group} loading={index < 3 ? 'eager' : 'lazy'} />
              ))}
            </div>
          )}

          {activeFilter !== ALL && gridGroups.length === 0 && (
            <div className={portfolioStyles.pfFeaturedCategoryNote}>
              <p>That is the full curated {filterDisplayLabel(activeFilter)} edit.</p>
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
