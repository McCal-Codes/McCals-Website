import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import '../portfolio/portfolio.css';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface NatureCollection {
  collectionName: string;
  folderPath: string; // relative to Portfolios/Nature/
  tags?: string[];
  images: string[]; // filenames only
}

interface NatureManifest {
  collections: NatureCollection[];
}

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(collections: NatureCollection[]): PortfolioGroup[] {
  return collections
    .filter((c) => c.images?.length > 0)
    .map((collection) => {
      const images = collection.images.map((filename) => ({
        url: imageUrl.nature(collection.folderPath, filename),
        filename,
        alt: `${collection.collectionName} — ${filename}`,
      }));

      return {
        id: collection.collectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: collection.collectionName,
        tags: collection.tags,
        images,
        coverImage: images[0],
      };
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

const ALL = 'All';

export default function NaturePortfolio() {
  const { data, status, error } = useManifest<NatureManifest>('nature');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data?.collections) return [];
    return normalise(data.collections);
  }, [data]);

  const filters = useMemo(() => {
    if (!groups.length) return [];
    const allTags = groups.flatMap((g) => g.tags ?? []);
    const unique = Array.from(new Set(allTags));
    return unique.length > 1 ? [ALL, ...unique] : [];
  }, [groups]);

  const filtered = useMemo(() => {
    if (activeFilter === ALL) return groups;
    return groups.filter((g) => g.tags?.includes(activeFilter));
  }, [groups, activeFilter]);

  return (
    <div className="pf-root">
      <h2 className="pf-heading">Nature</h2>
      <p className="pf-subheading">
        Wildlife, landscapes, and the natural world.
      </p>

      {status === 'loading' && (
        <div className="pf-loading">
          <span className="pf-spinner" />
          Loading nature portfolio…
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
