import { useEffect, useRef, type FC } from 'react';
import type { PortfolioGroup } from './types';
import { portfolioStyles } from './index';
import VercelImage from '../ui/VercelImage';

/**
 * Props for the OptimizedPortfolioCard component
 * @interface OptimizedPortfolioCardProps
 */
interface OptimizedPortfolioCardProps {
  /** Portfolio group data to display */
  group: PortfolioGroup;
  /** Callback when card is clicked to open lightbox */
  onOpen: (group: PortfolioGroup) => void;
  /** Callback when anchor link is clicked to copy URL */
  onCopyLink: (id: string) => void;
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
 * Optimized portfolio card component with Vercel Image CDN
 * Displays portfolio group with optimized thumbnail image
 */
const OptimizedPortfolioCard: FC<OptimizedPortfolioCardProps> = ({ group, onOpen, onCopyLink }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-focus card when it becomes the focused element
  useEffect(() => {
    if (cardRef.current && document.activeElement === cardRef.current.parentElement) {
      cardRef.current.focus();
    }
  }, []);

  const handleClick = () => onOpen(group);
  const handleCopyLink = (e: React.MouseEvent) => {
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
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
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
          onClick={handleCopyLink}
          aria-label={`Copy link to ${group.title}`}
          title={`Copy link to ${group.title}`}
        >
          <LinkIcon />
        </button>
      )}

      {/* Thumbnail Image */}
      <div className={portfolioStyles.pfCardImage}>
        <VercelImage
          src={group.coverImage?.url || group.images[0]?.url || ''}
          alt={group.coverImage?.alt || `${group.title} portfolio thumbnail`}
          width={400}
          height={300}
          quality={75}
          format="auto"
          loading="lazy"
          decoding="async"
          fallbackSrc={group.images[0]?.url} // Fallback to first image
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div className={portfolioStyles.pfCardImageOverlay}>
          <PhotosIcon />
          <span className={portfolioStyles.pfCardImageCount}>{group.images.length}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className={portfolioStyles.pfCardContent}>
        {group.dateDisplay && (
          <time 
            className={portfolioStyles.pfCardDate}
            dateTime={group.dateISO}
          >
            {group.dateDisplay}
          </time>
        )}

        {group.tags && group.tags.length > 0 && (
          <div className={portfolioStyles.pfCardTags}>
            {group.tags.map((tag) => (
              <span 
                key={tag} 
                className={portfolioStyles.pfCardTag}
                aria-label={`Tag: ${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default OptimizedPortfolioCard;
