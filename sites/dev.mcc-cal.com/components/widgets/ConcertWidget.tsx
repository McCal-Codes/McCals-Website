
import React, { useEffect, useState, useCallback } from 'react';
import type { FC } from 'react';
import styles from '../../styles/widgets/concertWidget.module.css';
import { ConcertManifest } from '../../types/concertManifest';
import Lightbox from './Lightbox';
import ImageCard from './ImageCard';

const API_MANIFEST_URL = 'https://api.mcc-cal.com/api/v1/manifests/concert';
const LOCAL_FALLBACK = '/data/concert-manifest.json';
const WIDGET_VERSION = '4.8.0';

const ConcertWidget: FC = () => {
  const [manifest, setManifest] = useState<ConcertManifest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);
  // Use number for timer id in browser

  const fetchManifest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try API first
      const response = await fetch(API_MANIFEST_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Always get fresh data from API
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data: ConcertManifest = await response.json();
      setManifest(data);
    } catch (apiError) {
      console.warn('API fetch failed, trying local fallback:', apiError);
      try {
        // Fallback to local manifest
        const localResponse = await fetch(LOCAL_FALLBACK);
        if (!localResponse.ok) {
          throw new Error('Local fallback failed');
        }
        const data: ConcertManifest = await localResponse.json();
        setManifest(data);
      } catch (localError) {
        console.error('Both API and local fallback failed:', localError);
        setError('Could not load concert manifest from API or local source.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManifest();
    // Auto-refresh every 15 minutes (browser only)
    const timer = typeof window !== 'undefined' ? window.setInterval(fetchManifest, 15 * 60 * 1000) : null;
    return () => { if (timer) window.clearInterval(timer); };
  }, [fetchManifest]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!manifest) return null;

  const widgetTitle = manifest.title || 'Concert Portfolio';

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.title}>
        {widgetTitle}
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
              <div className={styles.changelogVersion}>v4.8 - API Integration (Current)</div>
              <ul className={styles.changelogItems}>
                <li>Direct API fetch from api.mcc-cal.com with graceful local fallback</li>
                <li>Improved error handling and refresh control for live data</li>
                <li>Theme-ready styling aligned to dev.mcc-cal.com</li>
                <li>Retains Spotify support and v4.6 performance optimizations</li>
              </ul>
              <div className={styles.changelogVersion}>v4.7 - Artist Support (Spotify)</div>
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
