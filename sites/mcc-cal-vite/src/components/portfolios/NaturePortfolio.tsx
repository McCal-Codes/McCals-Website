import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { sortPortfolioGroups } from '../portfolio/sortGroups';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import { portfolioStyles } from '../portfolio';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface NatureCollection {
  collectionName: string;
  folderPath: string; // relative to Portfolios/Nature/
  tags?: string[];
  images: NatureImageEntry[];
}

interface NatureManifest {
  collections: NatureCollection[];
}

interface NatureImageMetadata {
  filename: string;
  path?: string;
  caption?: string;
  description?: string;
  alt?: string;
}

type NatureImageEntry = string | NatureImageMetadata;

import { generateId } from '@/utils/portfolio-ids';

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(collections: NatureCollection[]): PortfolioGroup[] {
  return collections
    .filter((c) => c.images?.length > 0)
    .map((collection) => {
      const images = collection.images.map((entry, index) => {
        const image = typeof entry === 'string'
          ? { filename: entry }
          : { ...entry, filename: entry.filename || entry.path || '' };

        return {
          url: imageUrl.nature(collection.folderPath, image.filename),
          filename: image.filename,
          caption: image.caption,
          description: image.description,
          alt:
            image.alt ??
            image.caption ??
            image.description ??
            `${collection.collectionName}, photo ${index + 1}`,
        };
      });

      return {
        id: generateId(collection.collectionName),
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
    return sortPortfolioGroups(normalise(data.collections));
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
    <div className={portfolioStyles.pfRoot}>
      <h2 className={portfolioStyles.pfHeading}>Nature</h2>
      <p className={portfolioStyles.pfSubheading}>
        Wildlife, landscapes, and the natural world.
      </p>

      {status === 'loading' && (
        <div className={portfolioStyles.pfLoading}>
          <span className={portfolioStyles.pfSpinner} />
          Loading nature portfolio…
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
