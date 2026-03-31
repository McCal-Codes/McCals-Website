import { useEffect, useRef, type FC } from 'react';
import type { PortfolioGroup } from './types';

interface PortfolioCardProps {
  group: PortfolioGroup;
  onOpen: (group: PortfolioGroup) => void;
  onCopyLink: (id: string) => void;
}

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
      {/* Image count badge */}
      <div className="pf-card__count" aria-hidden="true">
        <EyeIcon />
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
      </div>
    </article>
  );
};

export default PortfolioCard;
