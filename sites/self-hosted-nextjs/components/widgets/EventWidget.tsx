import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../../styles/widgets/concertWidget.module.css';
import Lightbox from './Lightbox';
import ImageCard from './ImageCard';
import type { EventsManifest, EventItem } from '../../types/eventsManifest';
import type { ConcertImage } from '../../types/concertManifest';
import { loadManifest } from '../../utils/manifestLoader';

const LOCAL_MANIFEST = '/data/events-manifest.json';
const REMOTE_MANIFEST = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Events/events-manifest.json';

function toGhRawUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  // Ensure leading src/ path
  const normalized = path.startsWith('src/') ? path : `src/images/Portfolios/Events/${path.replace(/^\//, '')}`;
  return `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/${normalized}`;
}

function uniqueByBase(files: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of files) {
    const base = f.replace(/\.(webp|jpg|jpeg|png)$/i, '').toLowerCase();
    if (!seen.has(base)) {
      seen.add(base);
      out.push(f);
    }
  }
  return out;
}

function flattenToGallery(manifest: EventsManifest): ConcertImage[] {
  const images: ConcertImage[] = [];
  for (const ev of manifest.events) {
    const label = ev.eventName || ev.title || 'Event';
    const date = ev.date?.iso || ev.dateISO || ev.dateDisplay || '';
    const folderRoot = ev.folderPath || '';
    const fileList = ev.images.map((img) => (typeof img === 'string' ? img : (img.path || img.filename || ''))).filter(Boolean) as string[];
    const deduped = uniqueByBase(fileList);
    for (const file of deduped) {
      // If the file already contains full src path use as is, else prefix with portfolio root + folderPath
      const relative = file.startsWith('src/') ? file : `${folderRoot.replace(/^\//, '')}/${file.replace(/^\//, '')}`;
      const src = toGhRawUrl(relative);
      const id = `event-${label}-${relative}`;
      images.push({ id, src, alt: `${label} — ${date}`, band: label, date });
    }
  }
  return images;
}

const EventWidget: React.FC = () => {
  const [manifest, setManifest] = useState<EventsManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [index, setIndex] = useState<number | null>(null);

  const fetchManifest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadManifest<EventsManifest>(LOCAL_MANIFEST, REMOTE_MANIFEST);
      setManifest(data);
    } catch (e) {
      try {
        const data = await loadManifest<EventsManifest>(LOCAL_MANIFEST);
        setManifest(data);
      } catch {
        setError('Could not load events manifest.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchManifest(); }, [fetchManifest]);

  const gallery = useMemo(() => (manifest ? flattenToGallery(manifest) : []), [manifest]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!manifest) return null;

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.title}>Events</h2>
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

export default EventWidget;
