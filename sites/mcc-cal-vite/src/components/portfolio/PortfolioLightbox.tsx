import { useEffect, useRef, useCallback, type FC } from 'react';
import type { PortfolioGroup } from './types';

interface PortfolioLightboxProps {
  group: PortfolioGroup | null;
  onClose: () => void;
}

const PortfolioLightbox: FC<PortfolioLightboxProps> = ({ group, onClose }) => {
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

  // Fade hint after first scroll
  useEffect(() => {
    if (!isOpen) return;
    const gallery = galleryRef.current;
    if (!gallery) return;
    const hideHint = () => {
      hintRef.current?.classList.add('pf-lightbox__hint--hidden');
      gallery.removeEventListener('scroll', hideHint);
    };
    gallery.addEventListener('scroll', hideHint, { passive: true });
    return () => gallery.removeEventListener('scroll', hideHint);
  }, [isOpen, group]);

  // Reset scroll when group changes
  useEffect(() => {
    if (!isOpen) return;
    galleryRef.current?.scrollTo({ top: 0 });
    hintRef.current?.classList.remove('pf-lightbox__hint--hidden');
  }, [group, isOpen]);

  if (!group) return null;

  const hasMultiple = group.images.length > 1;

  return (
    <div
      className={`pf-lightbox${isOpen ? ' pf-lightbox--open' : ''}`}
      aria-modal="true"
      role="dialog"
      aria-label={group.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        type="button"
        className="pf-lightbox__close"
        aria-label="Close lightbox"
        onClick={onClose}
      >
        ×
      </button>

      <div ref={dialogRef} className="pf-lightbox__dialog" tabIndex={-1}>
        <div ref={galleryRef} className="pf-lightbox__gallery">
          {hasMultiple && (
            <div ref={hintRef} className="pf-lightbox__hint" aria-hidden="true">
              Scroll Up / Down
            </div>
          )}

          {group.images.map((img, i) => (
            <figure key={img.filename} className="pf-lightbox__figure">
              <img
                src={img.url}
                alt={img.alt ?? `${group.title} — photo ${i + 1}`}
                className="pf-lightbox__img"
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding={i < 2 ? 'sync' : 'async'}
              />
              {img.caption && (
                <figcaption className="pf-lightbox__img-caption">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="pf-lightbox__caption">
          <h3 className="pf-lightbox__title">{group.title}</h3>

          {(group.dateDisplay || group.category) && (
            <p className="pf-lightbox__meta">
              {[group.dateDisplay, group.category].filter(Boolean).join(' • ')}
            </p>
          )}

          {group.images[0]?.caption && (
            <p className="pf-lightbox__description">{group.images[0].caption}</p>
          )}

          {group.published && group.outletName && (
            <div className="pf-lightbox__outlet">
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
  );
};

export default PortfolioLightbox;
