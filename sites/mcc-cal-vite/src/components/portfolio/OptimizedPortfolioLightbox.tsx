import { useEffect, useRef, useCallback, type FC } from 'react';
import type { PortfolioGroup } from './types';
import { portfolioStyles } from './index';
import VercelImage from '../ui/VercelImage';

interface OptimizedPortfolioLightboxProps {
  group: PortfolioGroup | null;
  onClose: () => void;
}

const OptimizedPortfolioLightbox: FC<OptimizedPortfolioLightboxProps> = ({ group, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const isOpen = group !== null;

  // Lock scroll and hide nav while open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('pf-lb-open');
      document.body.style.overflow = 'hidden';
      dialogRef.current?.focus();
    } else {
      document.documentElement.classList.remove('pf-lb-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.classList.remove('pf-lb-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard: Escape to close, arrows to scroll
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        galleryRef.current?.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        galleryRef.current?.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-focus hint for first-time users
  useEffect(() => {
    if (isOpen && hintRef.current) {
      const timer = setTimeout(() => {
        hintRef.current?.classList.add(portfolioStyles.pfLightboxHintVisible);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!group) return null;

  const hasMultiple = group.images.length > 1;
  const summaryText =
    group.coverImage?.description ??
    group.images[0]?.description ??
    group.coverImage?.caption ??
    group.images[0]?.caption;

  return (
    <div
      className={`${portfolioStyles.pfLightbox}${isOpen ? ` ${portfolioStyles.pfLightboxOpen}` : ''}`}
      aria-modal="true"
      role="dialog"
      aria-label={group.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        type="button"
        className={portfolioStyles.pfLightboxClose}
        aria-label="Close lightbox"
        onClick={onClose}
      >
        ×
      </button>

      <div ref={dialogRef} className={portfolioStyles.pfLightboxDialog} tabIndex={-1}>
        <div ref={galleryRef} className={portfolioStyles.pfLightboxGallery}>
          {hasMultiple && (
            <div ref={hintRef} className={portfolioStyles.pfLightboxHint} aria-hidden="true">
              Scroll Up / Down
            </div>
          )}

          {group.images.map((img, i) => (
            <figure key={img.filename} className={portfolioStyles.pfLightboxFigure}>
              <VercelImage
                src={img.url}
                alt={img.alt ?? `${group.title} — photo ${i + 1}`}
                className={portfolioStyles.pfLightboxImg}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding={i < 2 ? 'sync' : 'async'}
                width={1200}
                quality={85}
                format="auto"
                priority={i < 2}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
              {img.caption && (
                <figcaption className={portfolioStyles.pfLightboxImgCaption}>
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className={portfolioStyles.pfLightboxCaption}>
          <div className={portfolioStyles.pfCaptionRail}>
            <h3 className={portfolioStyles.pfCaptionRailTitle}>{group.title}</h3>

            {(group.dateDisplay || group.category) && (
              <p className={portfolioStyles.pfCaptionRailMeta}>
                {group.dateDisplay && <span>{group.dateDisplay}</span>}
                {group.dateDisplay && group.category && <span className={portfolioStyles.pfCaptionRailMetaSeparator}>•</span>}
                {group.category && <span>{group.category}</span>}
              </p>
            )}

            {summaryText && (
              <p className={portfolioStyles.pfCaptionRailDescription}>{summaryText}</p>
            )}

            {group.published && group.outletName && (
              <div className={portfolioStyles.pfLightboxOutlet}>
                {group.articleUrl ? (
                  <a href={group.articleUrl} target="_blank" rel="noopener noreferrer">
                    Published in {group.outletName} →
                  </a>
                ) : (
                  <span>Published in {group.outletName}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedPortfolioLightbox;
