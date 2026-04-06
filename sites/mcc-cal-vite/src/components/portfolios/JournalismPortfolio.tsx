import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import '../portfolio/portfolio.css';

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
    const events = normalise(data.events);
    // Sort by date (newest first)
    return events.sort((a, b) => {
      const dateA = a.dateISO ? new Date(a.dateISO).getTime() : 0;
      const dateB = b.dateISO ? new Date(b.dateISO).getTime() : 0;
      return dateB - dateA;
    });
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
    <div className="pf-root">
      <h2 className="pf-heading">Photojournalism</h2>
      <p className="pf-subheading">
        Political events, sports, and community coverage. Use the filters to browse by category or view published work.
      </p>

      {status === 'loading' && (
        <div className="pf-loading">
          <span className="pf-spinner" />
          Loading journalism portfolio…
        </div>
      )}

      {status === 'error' && (
        <div className="pf-error">
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
