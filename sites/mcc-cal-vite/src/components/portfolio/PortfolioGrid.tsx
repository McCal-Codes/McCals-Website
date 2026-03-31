import { useState, useCallback, useRef, type FC } from 'react';
import type { PortfolioGroup } from './types';
import PortfolioCard from './PortfolioCard';
import PortfolioLightbox from './PortfolioLightbox';
import PortfolioLoadMore from './PortfolioLoadMore';

interface PortfolioGridProps {
  groups: PortfolioGroup[];
  initialCount?: number;
  batchSize?: number;
}

const PortfolioGrid: FC<PortfolioGridProps> = ({
  groups,
  initialCount = 12,
  batchSize = 6,
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

  return (
    <>
      <div className="pf-grid">
        {shown.map((group) => (
          <PortfolioCard
            key={group.id}
            group={group}
            onOpen={setActiveGroup}
            onCopyLink={handleCopyLink}
          />
        ))}
      </div>

      <PortfolioLoadMore remaining={remaining} onLoadMore={handleLoadMore} />

      <PortfolioLightbox
        group={activeGroup}
        onClose={() => setActiveGroup(null)}
      />

      <div
        className={`pf-toast${toastVisible ? ' pf-toast--show' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        Link copied
      </div>
    </>
  );
};

export default PortfolioGrid;
