import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { sortPortfolioGroups } from '../portfolio/sortGroups';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface EventImage {
  path: string; // full repo-relative path: "src/images/Portfolios/Events/..."
  caption?: string;
  description?: string;
  alt?: string;
}

interface EventItem {
  eventName: string;
  category?: string;
  tags?: string[];
  dateDisplay?: string;
  dateISO?: string;
  images: EventImage[];
}

interface EventsManifest {
  events: EventItem[];
}

import { generateId } from '@/utils/portfolio-ids';

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(events: EventItem[]): PortfolioGroup[] {
  return events.map((event) => {
    const images = event.images.map((img) => ({
      url: imageUrl.event(img.path),
      filename: img.path.split('/').pop() ?? img.path,
      caption: img.caption,
      description: img.description,
      alt: img.alt ?? img.caption ?? img.description ?? `${event.eventName} photo`,
    }));

    return {
      id: generateId(event.eventName, event.dateISO),
      title: event.eventName,
      dateDisplay: event.dateDisplay,
      dateISO: event.dateISO,
      category: event.category,
      tags: event.tags,
      images,
      coverImage: images[0],
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const ALL = 'All';

export default function EventsPortfolio() {
  const { data, status, error } = useManifest<EventsManifest>('events');
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
      <h2 className={portfolioStyles.pfHeading}>Event Photography</h2>
      <p className={portfolioStyles.pfSubheading}>
        Corporate events, galas, sports, and community gatherings.
      </p>

      {status === 'loading' && (
        <div className={portfolioStyles.pfLoading}>
          <span className={portfolioStyles.pfSpinner} />
          Loading events portfolio…
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
