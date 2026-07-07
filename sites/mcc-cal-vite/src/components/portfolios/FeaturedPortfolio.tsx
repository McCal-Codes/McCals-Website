import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { generateId } from '@/utils/portfolio-ids';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';
import ProtectedPortfolioImage from '../portfolio/ProtectedPortfolioImage';

const PortfolioLightbox = lazy(() => import('../portfolio/PortfolioLightbox'));

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
    alt: caption ?? description ?? `${title} - ${filename}`,
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

const ALL = 'All';
const FILTER_ORDER = ['Concert', 'Events', 'Journalism'];

function shortCategory(cat: string) {
  return cat.replace(' Photography', '');
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

function getFeaturedTimestamp(group: PortfolioGroup): number {
  const timestamp = Date.parse(group.dateISO ?? '');
  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  return 0;
}

function getFeaturedStories(groups: PortfolioGroup[], activeFilter: string): PortfolioGroup[] {
  if (activeFilter !== ALL) {
    return groups.slice(0, 3);
  }

  const [lead] = groups;
  if (!lead) {
    return [];
  }

  const selected = [lead];
  const selectedIds = new Set([lead.id]);
  const leadCategory = shortCategory(lead.category ?? '');

  for (const category of FILTER_ORDER) {
    if (category === leadCategory) continue;

    const story = groups.find(
      (group) => !selectedIds.has(group.id) && shortCategory(group.category ?? '') === category,
    );

    if (story) {
      selected.push(story);
      selectedIds.add(story.id);
    }

    if (selected.length === 3) {
      return selected;
    }
  }

  for (const group of groups) {
    if (!selectedIds.has(group.id)) {
      selected.push(group);
      selectedIds.add(group.id);
    }

    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}

function categoryRoute(category?: string) {
  const short = shortCategory(category ?? '');

  if (short === 'Concert') return '/concerts';
  if (short === 'Events') return '/events';
  if (short === 'Journalism') return '/journalism';

  return '/featured-work';
}

function categoryLabel(category?: string) {
  const label = shortCategory(category ?? 'Portfolio');
  return label === 'Journalism' ? 'Photojournalism' : label;
}

function filterDisplayLabel(filter: string) {
  return filter === 'Journalism' ? 'photojournalism' : filter.toLowerCase();
}

interface FeaturedStoryCardProps {
  group: PortfolioGroup;
  variant: 'lead' | 'support';
  onOpen: (group: PortfolioGroup) => void;
  loading?: 'eager' | 'lazy';
}

function FeaturedStoryCard({
  group,
  variant,
  onOpen,
  loading = 'lazy',
}: FeaturedStoryCardProps) {
  const label = categoryLabel(group.category);
  const description = group.featuredDescription ?? group.coverImage.caption;

  return (
    <article className={`${portfolioStyles.pfFeaturedStory} ${variant === 'lead' ? portfolioStyles.pfFeaturedStoryLead : portfolioStyles.pfFeaturedStorySupport}`}>
      <button
        type="button"
        className={portfolioStyles.pfFeaturedStoryImageButton}
        aria-label={`Open ${group.title} gallery`}
        onClick={() => onOpen(group)}
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
            srcSetWidths={variant === 'lead' ? [640, 960, 1280, 1600] : [360, 540, 720, 960]}
            sizes={variant === 'lead' ? '(max-width: 980px) calc(100vw - 40px), 58vw' : '(max-width: 980px) calc(100vw - 40px), 28vw'}
            width={variant === 'lead' ? 980 : 460}
            height={variant === 'lead' ? 620 : 310}
            draggable={false}
          />
        </ProtectedPortfolioImage>
      </button>

      <div className={portfolioStyles.pfFeaturedStoryCopy}>
        <p className={portfolioStyles.pfFeaturedStoryMeta}>
          <span>{label}</span>
          {group.dateDisplay && <span>{group.dateDisplay}</span>}
          <span>{group.images.length} photos</span>
        </p>
        <h3 className={portfolioStyles.pfFeaturedStoryTitle}>{group.title}</h3>
        {description && (
          <p className={portfolioStyles.pfFeaturedStoryDescription}>{description}</p>
        )}
        <div className={portfolioStyles.pfFeaturedStoryActions}>
          <button
            type="button"
            className={portfolioStyles.pfFeaturedStoryButton}
            onClick={() => onOpen(group)}
          >
            Open Gallery
          </button>
          <Link className={portfolioStyles.pfFeaturedStoryLink} to={categoryRoute(group.category)}>
            View {label}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedPortfolio() {
  const { data, status, error } = useManifest<FeaturedManifest>('featured');
  const [activeFilter, setActiveFilter] = useState(ALL);
  const [activeGroup, setActiveGroup] = useState<PortfolioGroup | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const groups = useMemo(() => {
    if (!data?.items) return [];
    return normalise(data.items).sort(compareFeaturedGroups);
  }, [data]);

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
      const categoryGroups = groups.filter((group) => shortCategory(group.category ?? '') === category);
      const photoCount = categoryGroups.reduce((sum, group) => sum + group.images.length, 0);

      return {
        category,
        groups: categoryGroups.length,
        photos: photoCount,
        href: categoryRoute(`${category} Photography`),
      };
    });
  }, [groups]);

  const handleOpen = useCallback((group: PortfolioGroup) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveGroup(group);
  }, []);

  const handleClose = useCallback(() => {
    setActiveGroup(null);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  }, []);

  return (
    <div className={`${portfolioStyles.pfRoot} ${portfolioStyles.pfFeaturedRoot}`}>
      <header className={portfolioStyles.pfFeaturedHeader}>
        <div className={portfolioStyles.pfFeaturedHeaderCopy}>
          <p className={portfolioStyles.pfFeaturedDeck}>Latest Curated Edit</p>
          <h1 className={portfolioStyles.pfHeading}>Featured Work</h1>
          <p className={portfolioStyles.pfSubheading}>
            Recent concert, event, and photojournalism work, edited for range, pace, and the moments that hold up.
          </p>
        </div>

        {groups.length > 0 && (
          <div className={portfolioStyles.pfFeaturedStats} aria-label="Featured portfolio summary">
            {categorySummaries.map((summary) => (
              <Link key={summary.category} className={portfolioStyles.pfFeaturedStat} to={summary.href}>
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
            <section className={portfolioStyles.pfFeaturedEditorial} aria-label="Featured portfolio highlights">
              <FeaturedStoryCard
                group={featuredStories[0]}
                variant="lead"
                loading="eager"
                onOpen={handleOpen}
              />
              {featuredStories.length > 1 && (
                <div className={portfolioStyles.pfFeaturedSupportStack}>
                  {featuredStories.slice(1).map((group) => (
                    <FeaturedStoryCard
                      key={group.id}
                      group={group}
                      variant="support"
                      loading="eager"
                      onOpen={handleOpen}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <PortfolioFilters
            filters={filters}
            active={activeFilter}
            onChange={setActiveFilter}
          />
          {gridGroups.length > 0 && (
            <PortfolioGrid
              groups={gridGroups}
              initialCount={9}
              batchSize={6}
              gridClassName={portfolioStyles.pfFeaturedGrid}
              cardImageSizes="(max-width: 600px) calc(100vw - 40px), (max-width: 980px) 50vw, 31vw"
              eagerCount={3}
            />
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

      {activeGroup && (
        <Suspense fallback={null}>
          <PortfolioLightbox
            key={activeGroup.id}
            group={activeGroup}
            onClose={handleClose}
          />
        </Suspense>
      )}
    </div>
  );
}
