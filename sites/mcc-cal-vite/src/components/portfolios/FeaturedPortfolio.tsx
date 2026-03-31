import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import '../portfolio/portfolio.css';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface FeaturedItem {
  bandName?: string;
  eventName?: string;
  category: string; // "Concert Photography" | "Events Photography" | "Journalism Photography"
  relativeFolderPath: string;
  dateDisplay?: string;
  concertDate?: { iso: string };
  date?: { iso: string };
  images: string[]; // filenames only
}

interface FeaturedManifest {
  items: FeaturedItem[];
  categories?: string[];
}

// ── Normaliser ────────────────────────────────────────────────────────────────

function buildImageUrl(item: FeaturedItem, filename: string): string {
  const rp = item.relativeFolderPath;
  if (item.category === 'Journalism Photography') {
    // Journalism items have relativeFolderPath like "Politics/CMU Trump Protest"
    // which is relative to Portfolios/Journalism/
    return imageUrl.journalism(rp, filename);
  }
  // Concert and Events items have a full relative path like "Concert/Band/Month"
  // or "Events/Event Name" — both handled by imageUrl.featured
  return imageUrl.featured(rp, filename);
}

function normalise(items: FeaturedItem[]): PortfolioGroup[] {
  return items.map((item) => {
    const title = item.bandName ?? item.eventName ?? item.relativeFolderPath.split('/').pop() ?? 'Untitled';
    const dateISO = (item.concertDate ?? item.date)?.iso;

    const images = item.images.map((filename) => ({
      url: buildImageUrl(item, filename),
      filename,
      alt: `${title} — ${filename}`,
    }));

    return {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      dateDisplay: item.dateDisplay,
      dateISO,
      category: item.category,
      images,
      coverImage: images[0],
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const ALL = 'All';

// Strip " Photography" suffix for cleaner filter labels
function shortCategory(cat: string) {
  return cat.replace(' Photography', '');
}

export default function FeaturedPortfolio() {
  const { data, status, error } = useManifest<FeaturedManifest>('featured');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data?.items) return [];
    return normalise(data.items);
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
    <div className="pf-root">
      <h2 className="pf-heading">Featured Work</h2>
      <p className="pf-subheading">
        A curated selection of recent work across concerts, events, and journalism.
      </p>

      {status === 'loading' && (
        <div className="pf-loading">
          <span className="pf-spinner" />
          Loading featured work…
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
