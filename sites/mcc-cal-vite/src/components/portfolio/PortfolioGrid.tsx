import { useState, useCallback, useEffect, useMemo, useRef, lazy, Suspense, type FC } from 'react';
import type { PortfolioGroup } from './types';
import PortfolioCard from './PortfolioCard';
import PortfolioLoadMore from './PortfolioLoadMore';
import { portfolioStyles } from './index';

// Lazy load lightbox - only loaded when user clicks an image
const PortfolioLightbox = lazy(() => import('./PortfolioLightbox'));

interface ActiveLightbox {
  group: PortfolioGroup;
  initialIndex: number;
}

interface PortfolioGridProps {
  groups: PortfolioGroup[];
  initialCount?: number;
  wideInitialCount?: number;
  batchSize?: number;
  gridClassName?: string;
  cardImageSizes?: string;
  eagerCount?: number;
}

const TABLET_GRID_QUERY = '(min-width: 900px)';
const DESKTOP_GRID_QUERY = '(min-width: 1200px)';

function getResponsiveInitialCount(initialCount: number, wideInitialCount: number) {
  if (typeof window === 'undefined') return initialCount;

  if (window.matchMedia(DESKTOP_GRID_QUERY).matches) {
    return wideInitialCount;
  }

  if (window.matchMedia(TABLET_GRID_QUERY).matches) {
    return Math.min(wideInitialCount, initialCount + 4);
  }

  return initialCount;
}

const PortfolioGrid: FC<PortfolioGridProps> = ({
  groups,
  initialCount = 12,
  wideInitialCount,
  batchSize = 6,
  gridClassName,
  cardImageSizes,
  eagerCount = 0,
}) => {
  const resolvedWideInitialCount = useMemo(
    () => Math.max(initialCount, wideInitialCount ?? initialCount + 6),
    [initialCount, wideInitialCount],
  );
  const [visible, setVisible] = useState(() => getResponsiveInitialCount(initialCount, resolvedWideInitialCount));
  const [activeLightbox, setActiveLightbox] = useState<ActiveLightbox | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openerRef = useRef<HTMLElement | null>(null);

  const shown = groups.slice(0, visible);
  const remaining = Math.max(0, groups.length - visible);

  const handleLoadMore = () => setVisible((v) => v + batchSize);

  useEffect(() => {
    const updateVisibleCount = () => {
      const nextVisible = getResponsiveInitialCount(initialCount, resolvedWideInitialCount);
      setVisible((currentVisible) => Math.min(groups.length, Math.max(currentVisible, nextVisible)));
    };

    updateVisibleCount();

    if (typeof window === 'undefined') return undefined;

    const mediaQueries = [
      window.matchMedia(TABLET_GRID_QUERY),
      window.matchMedia(DESKTOP_GRID_QUERY),
    ];

    mediaQueries.forEach((mediaQuery) => {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', updateVisibleCount);
      } else {
        mediaQuery.addListener(updateVisibleCount);
      }
    });

    return () => {
      mediaQueries.forEach((mediaQuery) => {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', updateVisibleCount);
        } else {
          mediaQuery.removeListener(updateVisibleCount);
        }
      });
    };
  }, [groups.length, initialCount, resolvedWideInitialCount]);

  const handleCopyLink = useCallback((id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const handleOpen = useCallback((group: PortfolioGroup) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveLightbox({ group, initialIndex: 0 });
  }, []);

  const handleClose = useCallback(() => {
    setActiveLightbox(null);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  }, []);

  const handleLightboxGroupChange = useCallback((group: PortfolioGroup, initialIndex: number) => {
    setActiveLightbox({ group, initialIndex });
  }, []);

  if (groups.length === 0) {
    return (
      <div className={`${portfolioStyles.pfGrid}${gridClassName ? ` ${gridClassName}` : ''}`} role="status" aria-live="polite">
        <p>No portfolio items found.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${portfolioStyles.pfGrid}${gridClassName ? ` ${gridClassName}` : ''}`}>
        {shown.map((group, index) => (
          <PortfolioCard
            key={group.id}
            group={group}
            onOpen={handleOpen}
            onCopyLink={handleCopyLink}
            imageSizes={cardImageSizes}
            imageLoading={index < eagerCount ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      <PortfolioLoadMore remaining={remaining} onLoadMore={handleLoadMore} />

      {activeLightbox && (
        <Suspense fallback={null}>
          <PortfolioLightbox
            key={`${activeLightbox.group.id}-${activeLightbox.initialIndex}`}
            group={activeLightbox.group}
            collection={groups}
            initialIndex={activeLightbox.initialIndex}
            onChangeGroup={handleLightboxGroupChange}
            onClose={handleClose}
          />
        </Suspense>
      )}

      <div
        className={`${portfolioStyles.pfToast}${toastVisible ? ` ${portfolioStyles.pfToastShow}` : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        Link copied
      </div>
    </>
  );
};

export default PortfolioGrid;
