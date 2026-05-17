import { useEffect, useRef, type FC } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import type { PortfolioGroup } from './types';
import { portfolioStyles } from './index';

/**
 * Props for the PortfolioCard component
 * @interface PortfolioCardProps
 */
interface PortfolioCardProps {
  /** Portfolio group data to display */
  group: PortfolioGroup;
  /** Callback when card is clicked to open lightbox */
  onOpen: (group: PortfolioGroup) => void;
  /** Callback when anchor link is clicked to copy URL */
  onCopyLink: (id: string) => void;
  /** Responsive sizes attribute for the card image */
  imageSizes?: string;
  /** Loading behavior for the card cover image */
  imageLoading?: 'eager' | 'lazy';
}

/** Photos icon (stack of images) - decorative, aria-hidden */
const PhotosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

/** Link/anchor icon for copy link button - decorative, aria-hidden */
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

/**
 * PortfolioCard displays a portfolio group as a clickable card.
 * Features:
 * - Lazy-loaded cover image
 * - Photo count badge
 * - Published status indicator
 * - Link copying functionality
 * - Keyboard accessibility (Enter/Space to open)
 * - Staggered entrance animation via IntersectionObserver
 *
 * @example
 * ```tsx
 * <PortfolioCard
 *   group={portfolioGroup}
 *   onOpen={(group) => setActiveGroup(group)}
 *   onCopyLink={(id) => copyToClipboard(id)}
 * />
 * ```
 */
const PortfolioCard: FC<PortfolioCardProps> = ({
  group,
  onOpen,
  onCopyLink,
  imageSizes,
  imageLoading = 'lazy',
}) => {
  const cardRef = useRef<HTMLElement>(null);

  // Staggered entrance via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(portfolioStyles.pfCardVisible);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(group);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyLink(group.id);
  };

  return (
    <article
      ref={cardRef}
      className={`${portfolioStyles.pfCard}${group.published ? ` ${portfolioStyles.pfCardPublishedState}` : ''}`}
      id={group.id}
      role="button"
      tabIndex={0}
      aria-label={`View ${group.title} photos${group.dateDisplay ? `, ${group.dateDisplay}` : ''}`}
      onClick={() => onOpen(group)}
      onKeyDown={handleKeyDown}
    >
      {/* Photo count badge */}
      <div className={portfolioStyles.pfCardCount} aria-label={`${group.images.length} photos`}>
        <PhotosIcon />
        <span>{group.images.length}</span>
      </div>

      {/* Published badge (shown instead of anchor when published) */}
      {group.published ? (
        <div className={portfolioStyles.pfCardPublished} aria-label="Published work">
          <span className={portfolioStyles.pfCardPublishedDot} />
          <span className={portfolioStyles.pfCardPublishedLabel}>Published</span>
        </div>
      ) : (
        <button
          type="button"
          className={portfolioStyles.pfCardAnchor}
          title="Copy link to this item"
          aria-label="Copy link"
          onClick={handleAnchorClick}
        >
          <LinkIcon />
        </button>
      )}

      <OptimizedImage
        src={group.coverImage.url}
        alt={group.coverImage.alt ?? group.title}
        frameClassName={`${portfolioStyles.pfBlurImageFrame} ${portfolioStyles.pfCardImageFrame}`}
        imageClassName={`${portfolioStyles.pfBlurImage} ${portfolioStyles.pfCardImage}`}
        loading={imageLoading}
        decoding="async"
        optimizedWidth={640}
        srcSetWidths={[320, 480, 640, 960]}
        sizes={imageSizes ?? '(max-width: 600px) calc(100vw - 40px), (max-width: 900px) 50vw, 33vw'}
        width={400}
        height={300}
      />

      <div className={portfolioStyles.pfCardOverlay} aria-hidden="true">
        <div className={portfolioStyles.pfCaptionRail}>
          <h3 className={portfolioStyles.pfCaptionRailTitle}>{group.title}</h3>
          {(group.dateDisplay || group.category) && (
            <p className={portfolioStyles.pfCaptionRailMeta}>
              {group.dateDisplay && <span>{group.dateDisplay}</span>}
              {group.dateDisplay && group.category && <span className={portfolioStyles.pfCaptionRailMetaSeparator}>•</span>}
              {group.category && <span>{group.category}</span>}
            </p>
          )}
          {group.coverImage.caption && (
            <p className={portfolioStyles.pfCaptionRailDescription}>{group.coverImage.caption}</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default PortfolioCard;
