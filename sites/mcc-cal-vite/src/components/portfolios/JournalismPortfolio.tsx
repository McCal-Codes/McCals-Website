import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { sortPortfolioGroups } from '../portfolio/sortGroups';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';
import EmptyState from '../portfolio/EmptyState';
import PortfolioSkeleton from '../LoadingStates/PortfolioSkeleton';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface JournalismImage {
  filename: string;
  path: string;
  description?: string;
  caption?: string;
  tags?: string[];
}

interface JournalismEvent {
  eventName: string;
  category: string;
  folderPath: string;
  dateDisplay?: string;
  eventDate?: { iso: string };
  tags?: string[];
  published?: boolean;
  outlet?: string | null;
  outletUrl?: string | null;
  articleUrl?: string | null;
  images: JournalismImage[];
}

interface JournalismManifest {
  events: JournalismEvent[];
  categories?: string[];
}

import { generateId } from '@/utils/portfolio-ids';

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(events: JournalismEvent[]): PortfolioGroup[] {
  return events.map((event) => {
    const images = event.images.map((img) => ({
      url: imageUrl.journalism(event.folderPath, img.path),
      filename: img.filename,
      caption: img.caption,
      description: img.description,
      alt: img.caption ?? `${event.eventName} — ${img.filename}`,
    }));

    return {
      id: generateId(event.eventName, event.eventDate?.iso),
      title: event.eventName,
      dateDisplay: event.dateDisplay,
      dateISO: event.eventDate?.iso,
      category: event.category,
      tags: event.tags,
      published: event.published ?? false,
      outletName: event.outlet ?? undefined,
      outletUrl: event.outletUrl ?? undefined,
      articleUrl: event.articleUrl ?? undefined,
      images,
      coverImage: images[0],
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const ALL = 'All';

export default function JournalismPortfolio() {
  const { data, status, error } = useManifest<JournalismManifest>('journalism');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data?.events) return [];
    return sortPortfolioGroups(normalise(data.events));
  }, [data]);

  const filters = useMemo(() => {
    if (!groups.length) return [];
    const cats = Array.from(new Set(groups.map((g) => g.category).filter(Boolean))) as string[];
    return [ALL, ...cats];
  }, [groups]);

  const filtered = useMemo(() => {
    if (activeFilter === ALL) return groups;
    return groups.filter((g) => g.category === activeFilter);
  }, [groups, activeFilter]);

  return (
    <div className={portfolioStyles.pfRoot}>
      <h2 className={portfolioStyles.pfHeading}>Photojournalism</h2>
      <p className={portfolioStyles.pfSubheading}>
        Documentary, community, sports, and assignment coverage. Use the filters to browse by category or view published work.
      </p>

      {status === 'loading' && (
        <PortfolioSkeleton showFilters={true} count={8} />
      )}

      {status === 'error' && (
        <div className={portfolioStyles.pfError}>
          <span>Failed to load portfolio.</span>
          <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>{error}</span>
        </div>
      )}

      {status === 'success' && (
        <>
          {filtered.length === 0 ? (
            <EmptyState 
              type="journalism"
              title="No Journalism Found"
              description={activeFilter === ALL 
                ? "No published journalism work is currently available. Check back for political events, sports coverage, and community stories from Pittsburgh and beyond."
                : `No journalism found in ${activeFilter}. Try selecting a different category or view all published work.`
              }
              action={{
                text: activeFilter === ALL ? "View Concert Photography" : "View All Journalism",
                href: activeFilter === ALL ? "/concerts" : "/journalism"
              }}
            />
          ) : (
            <>
              <PortfolioFilters
                filters={filters}
                active={activeFilter}
                onChange={setActiveFilter}
              />
              <PortfolioGrid groups={filtered} initialCount={12} batchSize={6} />
            </>
          )}
        </>
      )}
    </div>
  );
}
