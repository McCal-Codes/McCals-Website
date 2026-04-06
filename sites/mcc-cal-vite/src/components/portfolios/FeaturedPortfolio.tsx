import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { generateId } from '@/utils/portfolio-ids';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import '../portfolio/portfolio.css';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface FeaturedImage {
  filename?: string;
  caption?: string;
  description?: string;
  path?: string;
}

interface FeaturedItem {
  bandName?: string;
  eventName?: string;
  category: string; // "Concert Photography" | "Events Photography" | "Journalism Photography"
  relativeFolderPath: string;
  dateDisplay?: string;
  concertDate?: { iso: string };
  date?: { iso: string };
  images: (string | FeaturedImage)[]; // filenames or objects with captions
}

interface FeaturedManifest {
  items: FeaturedItem[];
  categories?: string[];
}

// ── Normaliser ────────────────────────────────────────────────────────────────

function buildImageUrl(item: FeaturedItem, filename: string): string {
  const rp = item.relativeFolderPath;
  if (item.category === 'Journalism Photography') {
    // Journalism items have relativeFolderPath like "Politics/cmu-trump-protest"
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

    const images = item.images.map((img) => {
      // Handle both string filenames and image objects
      const isObject = typeof img === 'object';
      const filename = isObject 
        ? (img as FeaturedImage).filename ?? (img as FeaturedImage).path?.split('/').pop() ?? ''
        : (img as string);
      const caption = isObject ? (img as FeaturedImage).caption : undefined;
      const description = isObject ? (img as FeaturedImage).description : undefined;
      
      return {
        url: buildImageUrl(item, filename),
        filename,
        caption,
        description,
        alt: caption ?? `${title} — ${filename}`,
      };
    });

    return {
      id: generateId(title, dateISO),
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
    const items = normalise(data.items);
    // Sort by date (newest first)
    return items.sort((a, b) => {
      const dateA = a.dateISO ? new Date(a.dateISO).getTime() : 0;
      const dateB = b.dateISO ? new Date(b.dateISO).getTime() : 0;
      return dateB - dateA;
    });
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
