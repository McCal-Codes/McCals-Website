import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../../styles/widgets/concertWidget.module.css';
import Lightbox from './Lightbox';
import ImageCard from './ImageCard';
import type { JournalismManifest, JournalismEvent } from '../../types/journalismManifest';
import type { ConcertImage } from '../../types/concertManifest';
import { loadManifest } from '../../utils/manifestLoader';

const LOCAL_MANIFEST = '/data/journalism-manifest.json';
const REMOTE_MANIFEST = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Journalism/journalism-manifest.json';

function toGhRawUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith('src/') ? path : `src/images/Portfolios/Journalism/${path.replace(/^\//, '')}`;
  return `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/${normalized}`;
}

function flatten(manifest: JournalismManifest): ConcertImage[] {
  const out: ConcertImage[] = [];
  for (const ev of manifest.events) {
    const label = ev.eventName || ev.title || 'Story';
    const date = ev.eventDate?.iso || ev.dateDisplay || '';
    for (const img of ev.images) {
      const raw = img.path || img.filename || '';
      if (!raw) continue;
      const rel = raw.startsWith('src/')
        ? raw
        : `${ev.folderPath.replace(/^\//, '')}/${raw.replace(/^\//, '')}`;
      const src = toGhRawUrl(rel);
      out.push({ id: `jour-${label}-${rel}`, src, alt: `${label} — ${date}`, band: label, date });
    }
  }
  return out;
}

const JournalismWidget: React.FC = () => {
  const [manifest, setManifest] = useState<JournalismManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [index, setIndex] = useState<number | null>(null);

  const fetchManifest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadManifest<JournalismManifest>(LOCAL_MANIFEST, REMOTE_MANIFEST);
      setManifest(data);
    } catch (e) {
      try {
        const data = await loadManifest<JournalismManifest>(LOCAL_MANIFEST);
        setManifest(data);
      } catch {
        setError('Could not load journalism manifest.');
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
      <h2 className={styles.title}>Journalism</h2>
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

export default JournalismWidget;
