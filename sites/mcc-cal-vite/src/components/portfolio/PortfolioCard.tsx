import { useEffect, useRef, type FC } from 'react';
import type { PortfolioGroup } from './types';

interface PortfolioCardProps {
  group: PortfolioGroup;
  onOpen: (group: PortfolioGroup) => void;
  onCopyLink: (id: string) => void;
}

// Photos icon (stack of images)
const PhotosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const PortfolioCard: FC<PortfolioCardProps> = ({ group, onOpen, onCopyLink }) => {
  const cardRef = useRef<HTMLElement>(null);

  // Staggered entrance via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('pf-card--visible');
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
      className={`pf-card${group.published ? ' pf-card--published' : ''}`}
      id={group.id}
      role="button"
      tabIndex={0}
      aria-label={`View ${group.title} photos${group.dateDisplay ? `, ${group.dateDisplay}` : ''}`}
      onClick={() => onOpen(group)}
      onKeyDown={handleKeyDown}
    >
      {/* Photo count badge */}
      <div className="pf-card__count" aria-label={`${group.images.length} photos`}>
        <PhotosIcon />
        <span>{group.images.length}</span>
      </div>

      {/* Published badge (shown instead of anchor when published) */}
      {group.published ? (
        <div className="pf-card__published" aria-label="Published work">
          <span className="pf-card__published-dot" />
          <span className="pf-card__published-label">Published</span>
        </div>
      ) : (
        <button
          type="button"
          className="pf-card__anchor"
          title="Copy link to this item"
          aria-label="Copy link"
          onClick={handleAnchorClick}
        >
          <LinkIcon />
        </button>
      )}

      <img
        src={group.coverImage.url}
        alt={group.coverImage.alt ?? group.title}
        loading="lazy"
        decoding="async"
        width={400}
        height={300}
      />

      <div className="pf-card__overlay" aria-hidden="true">
        <h3 className="pf-card__title">{group.title}</h3>
        {(group.dateDisplay || group.category) && (
          <p className="pf-card__meta">
            {[group.dateDisplay, group.category].filter(Boolean).join(' • ')}
          </p>
        )}
        {group.coverImage.caption && (
          <p className="pf-card__caption">{group.coverImage.caption}</p>
        )}
      </div>
    </article>
  );
};

export default PortfolioCard;
