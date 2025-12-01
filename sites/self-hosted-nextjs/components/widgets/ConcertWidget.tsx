
import React, { useEffect, useState, useCallback } from 'react';
import type { FC } from 'react';
import styles from '../../styles/widgets/concertWidget.module.css';
import { ConcertManifest } from '../../types/concertManifest';
import { loadManifest } from '../../utils/manifestLoader';
import Lightbox from './Lightbox';
import ImageCard from './ImageCard';

const LOCAL_MANIFEST = '/data/concert-manifest.json';
const REMOTE_MANIFEST = 'https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Concert/concert-manifest.json';
const WIDGET_VERSION = '4.7.0';

const ConcertWidget: FC = () => {
  const [manifest, setManifest] = useState<ConcertManifest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);
  // Use number for timer id in browser
  const [autoRefresh, setAutoRefresh] = useState<number | null>(null);

  const fetchManifest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try remote first, fallback to local
      const data = await loadManifest<ConcertManifest>(LOCAL_MANIFEST, REMOTE_MANIFEST);
      setManifest(data);
    } catch (e) {
      try {
        const data = await loadManifest<ConcertManifest>(LOCAL_MANIFEST);
        setManifest(data);
      } catch {
        setError('Could not load concert manifest.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManifest();
    // Auto-refresh every 15 minutes
    const timer = window.setInterval(fetchManifest, 15 * 60 * 1000);
    setAutoRefresh(timer);
    return () => { if (timer) window.clearInterval(timer); };
  }, [fetchManifest]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!manifest) return null;

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.title}>
        {manifest.title}
        <span className={styles.versionIndicator} title="View changelog" onClick={() => setShowChangelog(true)}>
          v{WIDGET_VERSION}
        </span>
      </h2>
      <div className={styles.galleryGrid}>
        {manifest.images.map((img: any, idx: number) => (
          <ImageCard
            key={img.id}
            image={img}
            onClick={() => setLightboxIndex(idx)}
          />
        ))}
      </div>
      {lightboxIndex !== null && manifest.images && (
        <Lightbox
          images={manifest.images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : lightboxIndex)}
          onNext={() => setLightboxIndex(lightboxIndex < manifest.images.length - 1 ? lightboxIndex + 1 : lightboxIndex)}
        />
      )}
      {/* Changelog Modal */}
      {showChangelog && (
        <div className={styles.changelogModal} role="dialog" aria-modal="true">
          <div className={styles.changelogContent}>
            <div className={styles.changelogHeader}>
              <h3 className={styles.changelogTitle}>Concert Widget Changelog</h3>
              <button className={styles.changelogClose} onClick={() => setShowChangelog(false)}>&times;</button>
            </div>
            <div className={styles.changelogBody}>
              <div className={styles.changelogVersion}>v4.7 - Artist Support (Spotify) (Current)</div>
              <ul className={styles.changelogItems}>
                <li>Added a small, non-intrusive floating button to support artists with Spotify links</li>
                <li>Automatic list of bands from your concert manifest with “Open on Spotify” search links</li>
                <li>Optional inline JSON map enables embedded previews for known artist IDs (lazy-loaded)</li>
                <li>Accessible keyboard/touch interactions; respects lightbox layering and site UI</li>
                <li>All v4.6 performance optimizations retained</li>
              </ul>
              <div className={styles.changelogVersion}>v4.6 - Performance Optimized</div>
              <ul className={styles.changelogItems}>
                <li>Critical CSS inlining for faster first paint</li>
                <li>Async manifest loading with smarter caching and auto-refresh</li>
                <li>Lazy-loaded lightbox assets and improved gallery transitions</li>
                <li>Structured data refinement for search visibility</li>
                <li>Retains v4.5 accessibility and lightbox enhancements</li>
              </ul>
              {/* Add more changelog entries as needed */}
            </div>
          </div>
        </div>
      )}
      {/* TODO: Add Spotify support panel here */}
      <button className={styles.refreshBtn} onClick={fetchManifest} style={{marginTop: '1rem'}}>Refresh</button>
    </section>
  );
};

export default ConcertWidget;
