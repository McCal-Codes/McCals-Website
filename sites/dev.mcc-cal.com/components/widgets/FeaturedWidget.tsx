import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../../styles/widgets/concertWidget.module.css';
import Lightbox from './Lightbox';
import ImageCard from './ImageCard';
import type { FeaturedManifest, FeaturedItem } from '../../types/featuredManifest';
import type { ConcertImage } from '../../types/concertManifest';
import { loadManifest } from '../../utils/manifestLoader';

const LOCAL_MANIFEST = '/data/featured-manifest.json';
const REMOTE_MANIFEST = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/featured-manifest.json';

function toGhRawUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith('src/') ? path : `src/images/Portfolios/${path.replace(/^\//, '')}`;
  return `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/${normalized}`;
}

function normalizeItem(item: FeaturedItem): ConcertImage[] {
  const label = item.title || item.bandName || item.eventName || item.name || 'Featured';
  const date = (item.date && ('iso' in item.date ? item.date.iso : undefined)) || item.dateISO || item.dateDisplay || '';
  const type = item.type || 'Mixed';
  const baseFolder = item.folderPath || '';
  const list = (item.images || []).map((img) => (typeof img === 'string' ? img : (img.path || img.filename || ''))).filter(Boolean) as string[];
  return list.map((p) => {
    let rel = p;
    if (!rel.startsWith('src/')) {
      // Determine portfolio root by type if provided
      let portfolioRoot = '';
      if (type === 'Concert') portfolioRoot = 'src/images/Portfolios/Concert';
      else if (type === 'Events') portfolioRoot = 'src/images/Portfolios/Events';
      else if (type === 'Journalism') portfolioRoot = 'src/images/Portfolios/Journalism';
      else portfolioRoot = 'src/images/Portfolios';
      rel = `${portfolioRoot}/${baseFolder.replace(/^\//, '')}/${p.replace(/^\//, '')}`;
    }
    const src = toGhRawUrl(rel);
    return { id: `feat-${label}-${rel}`, src, alt: `${label} — ${date}`, band: label, date } as ConcertImage;
  });
}

function flatten(manifest: FeaturedManifest): ConcertImage[] {
  const out: ConcertImage[] = [];
  for (const item of manifest.items || []) {
    out.push(...normalizeItem(item));
  }
  return out;
}

const FeaturedWidget: React.FC = () => {
  const [manifest, setManifest] = useState<FeaturedManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [index, setIndex] = useState<number | null>(null);

  const fetchManifest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadManifest<FeaturedManifest>(LOCAL_MANIFEST, REMOTE_MANIFEST);
      setManifest(data);
    } catch (e) {
      try {
        const data = await loadManifest<FeaturedManifest>(LOCAL_MANIFEST);
        setManifest(data);
      } catch {
        setError('Could not load featured manifest.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchManifest(); }, [fetchManifest]);
  const gallery = useMemo(() => (manifest ? flatten(manifest) : []), [manifest]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!manifest) return null;

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.title}>Featured Work</h2>
      <div className={styles.galleryGrid}>
        {gallery.map((img, i) => (
          <ImageCard key={img.id} image={img} onClick={() => setIndex(i)} />
        ))}
      </div>
      {index !== null && (
        <Lightbox
          images={gallery}
          index={index}
          onClose={() => setIndex(null)}
          onPrev={() => setIndex((i) => (i !== null ? Math.max(0, i - 1) : i))}
          onNext={() => setIndex((i) => (i !== null ? Math.min(gallery.length - 1, i + 1) : i))}
        />
      )}
    </section>
  );
};

export default FeaturedWidget;
