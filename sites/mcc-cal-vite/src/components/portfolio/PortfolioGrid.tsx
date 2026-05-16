import { useState, useCallback, useRef, lazy, Suspense, type FC } from 'react';
import type { PortfolioGroup } from './types';
import PortfolioCard from './PortfolioCard';
import PortfolioLoadMore from './PortfolioLoadMore';
import { portfolioStyles } from './index';

// Lazy load lightbox - only loaded when user clicks an image
const PortfolioLightbox = lazy(() => import('./PortfolioLightbox'));

interface PortfolioGridProps {
  groups: PortfolioGroup[];
  initialCount?: number;
  batchSize?: number;
  gridClassName?: string;
  cardImageSizes?: string;
  eagerCount?: number;
}

const PortfolioGrid: FC<PortfolioGridProps> = ({
  groups,
  initialCount = 12,
  batchSize = 6,
  gridClassName,
  cardImageSizes,
  eagerCount = 0,
}) => {
  const [visible, setVisible] = useState(initialCount);
  const [activeGroup, setActiveGroup] = useState<PortfolioGroup | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const shown = groups.slice(0, visible);
  const remaining = Math.max(0, groups.length - visible);

  const handleLoadMore = () => setVisible((v) => v + batchSize);

  const handleCopyLink = useCallback((id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
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
            onOpen={setActiveGroup}
            onCopyLink={handleCopyLink}
            imageSizes={cardImageSizes}
            imageLoading={index < eagerCount ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      <PortfolioLoadMore remaining={remaining} onLoadMore={handleLoadMore} />

      {activeGroup && (
        <Suspense fallback={null}>
          <PortfolioLightbox
            key={activeGroup.id}
            group={activeGroup}
            onClose={() => setActiveGroup(null)}
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
