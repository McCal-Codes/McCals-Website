import { useState, useMemo } from 'react';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import type { PortfolioGroup } from '../portfolio/types';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import PortfolioFilters from '../portfolio/PortfolioFilters';
import '../portfolio/portfolio.css';

// ── Manifest shape ────────────────────────────────────────────────────────────

interface PortraitCollection {
  collectionName: string;
  folderPath: string;
  tags?: string[];
  // images is an array of filenames, possibly prefixed with "AlbumName/filename.jpg"
  images: string[];
}

interface PortraitsManifest {
  collections: PortraitCollection[];
}

import { generateId } from '@/utils/portfolio-ids';

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(collections: PortraitCollection[]): PortfolioGroup[] {
  return collections
    .filter((c) => c.images?.length > 0)
    .map((collection) => {
      const images = collection.images.map((filename) => ({
        // filename may include an album subfolder, e.g. "Lucha 2022/IMGP8480.jpg"
        // imageUrl.portrait handles this transparently since it joins folderPath + filename
        url: imageUrl.portrait(collection.folderPath, filename),
        filename: filename.split('/').pop() ?? filename,
        alt: `${collection.collectionName} — ${filename.split('/').pop() ?? filename}`,
      }));

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

export default function PortraitsPortfolio() {
  const { data, status, error } = useManifest<PortraitsManifest>('portrait');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data?.collections) return [];
    return normalise(data.collections);
  }, [data]);

  const filters = useMemo(() => {
    if (!groups.length) return [];
    // Use tags as filter options for portraits (Editorial, Graduation, etc.)
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
      <h2 className="pf-heading">Portraits</h2>
      <p className="pf-subheading">
        Editorial, studio, graduation, and headshot sessions.
      </p>

      {status === 'loading' && (
        <div className="pf-loading">
          <span className="pf-spinner" />
          Loading portraits portfolio…
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
