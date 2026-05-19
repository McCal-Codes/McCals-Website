import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import type { PortfolioGroup } from './types';
import { portfolioStyles } from './index';

interface PortfolioLightboxProps {
  group: PortfolioGroup | null;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.5;

const PortfolioLightbox: FC<PortfolioLightboxProps> = ({ group, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const isOpen = group !== null;
  const imageCount = group?.images.length ?? 0;
  const hasMultiple = imageCount > 1;

  const activeImage = useMemo(() => {
    if (!group) return null;
    return group.images[activeIndex] ?? group.coverImage;
  }, [activeIndex, group]);

  // Lock scroll and hide nav while open.
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

  const selectImage = useCallback(
    (nextIndex: number) => {
      if (!group?.images.length) return;

      const clampedIndex = (nextIndex + group.images.length) % group.images.length;
      setActiveIndex(clampedIndex);
      setZoom(MIN_ZOOM);
    },
    [group],
  );

  const showPrevious = useCallback(() => {
    selectImage(activeIndex - 1);
  }, [activeIndex, selectImage]);

  const showNext = useCallback(() => {
    selectImage(activeIndex + 1);
  }, [activeIndex, selectImage]);

  const zoomIn = useCallback(() => {
    setZoom((currentZoom) => Math.min(MAX_ZOOM, Number((currentZoom + ZOOM_STEP).toFixed(1))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((currentZoom) => Math.max(MIN_ZOOM, Number((currentZoom - ZOOM_STEP).toFixed(1))));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(MIN_ZOOM);
  }, []);

  // Keyboard: Escape, arrows, Home/End, and +/- zoom.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        showNext();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        showPrevious();
      } else if (event.key === 'Home') {
        event.preventDefault();
        selectImage(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        selectImage(imageCount - 1);
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomIn();
      } else if (event.key === '-') {
        event.preventDefault();
        zoomOut();
      } else if (event.key === '0') {
        event.preventDefault();
        resetZoom();
      }
    },
    [imageCount, isOpen, onClose, resetZoom, selectImage, showNext, showPrevious, zoomIn, zoomOut],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!group || !activeImage || imageCount < 2) return;

    const neighborImages = [
      group.images[(activeIndex + 1) % imageCount],
      group.images[(activeIndex - 1 + imageCount) % imageCount],
    ].filter(Boolean);

    neighborImages.forEach((image) => {
      const preload = new Image();
      preload.src = image.url;
    });
  }, [activeImage, activeIndex, group, imageCount]);

  if (!group || !activeImage) return null;

  const activeCaption = activeImage.caption ?? activeImage.description;
  const summaryText =
    activeImage.description ??
    group.coverImage.description ??
    group.images[0]?.description ??
    group.coverImage.caption ??
    group.images[0]?.caption;
  const visibleTags = (group.tags ?? []).filter(
    (tag) => tag.toLowerCase() !== group.category?.toLowerCase(),
  );
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={`${portfolioStyles.pfLightbox}${isOpen ? ` ${portfolioStyles.pfLightboxOpen}` : ''}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={summaryText ? descriptionId : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className={portfolioStyles.pfLightboxDialog} tabIndex={-1}>
        <div className={portfolioStyles.pfLightboxToolbar}>
          <div className={portfolioStyles.pfLightboxCounter} aria-live="polite">
            <span>{activeIndex + 1}</span>
            <span aria-hidden="true">/</span>
            <span>{imageCount}</span>
          </div>

          <div className={portfolioStyles.pfLightboxControls}>
            <button
              type="button"
              className={portfolioStyles.pfLightboxIconBtn}
              aria-label="Zoom out"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut aria-hidden="true" size={18} />
            </button>
            <span className={portfolioStyles.pfLightboxZoomValue} aria-live="polite">
              {zoomPercent}%
            </span>
            <button
              type="button"
              className={portfolioStyles.pfLightboxIconBtn}
              aria-label="Zoom in"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              className={portfolioStyles.pfLightboxIconBtn}
              aria-label="Reset zoom"
              onClick={resetZoom}
              disabled={zoom === MIN_ZOOM}
            >
              <RotateCcw aria-hidden="true" size={17} />
            </button>
            <button
              type="button"
              className={`${portfolioStyles.pfLightboxIconBtn} ${portfolioStyles.pfLightboxClose}`}
              aria-label="Close lightbox"
              onClick={onClose}
            >
              <X aria-hidden="true" size={19} />
            </button>
          </div>
        </div>

        <div className={portfolioStyles.pfLightboxStage}>
          {hasMultiple && (
            <button
              type="button"
              className={`${portfolioStyles.pfLightboxNavBtn} ${portfolioStyles.pfLightboxPrevBtn}`}
              aria-label="Previous photo"
              onClick={showPrevious}
            >
              <ChevronLeft aria-hidden="true" size={28} />
            </button>
          )}

          <div className={portfolioStyles.pfLightboxImageScroller} data-zoomed={zoom > MIN_ZOOM ? 'true' : 'false'}>
            <OptimizedImage
              key={activeImage.filename}
              src={activeImage.url}
              alt={activeImage.alt ?? `${group.title}, photo ${activeIndex + 1}`}
              frameClassName={`${portfolioStyles.pfBlurImageFrame} ${portfolioStyles.pfLightboxImageFrame}`}
              imageClassName={`${portfolioStyles.pfBlurImage} ${portfolioStyles.pfLightboxImg}`}
              loading="eager"
              decoding="async"
              optimizedWidth={1920}
              srcSetWidths={[640, 1080, 1440, 1920]}
              sizes="100vw"
              style={
                zoom > MIN_ZOOM
                  ? { width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: 'none' }
                  : undefined
              }
              onDoubleClick={() => {
                setZoom((currentZoom) => (currentZoom === MIN_ZOOM ? 2 : MIN_ZOOM));
              }}
              draggable={false}
            />
          </div>

          {hasMultiple && (
            <button
              type="button"
              className={`${portfolioStyles.pfLightboxNavBtn} ${portfolioStyles.pfLightboxNextBtn}`}
              aria-label="Next photo"
              onClick={showNext}
            >
              <ChevronRight aria-hidden="true" size={28} />
            </button>
          )}
        </div>

        {hasMultiple && (
          <div className={portfolioStyles.pfLightboxThumbs} aria-label="Choose photo">
            {group.images.map((img, index) => (
              <button
                key={img.filename}
                type="button"
                className={portfolioStyles.pfLightboxThumb}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => selectImage(index)}
              >
                <OptimizedImage
                  src={img.url}
                  alt=""
                  frameClassName={`${portfolioStyles.pfBlurImageFrame} ${portfolioStyles.pfLightboxThumbFrame}`}
                  imageClassName={`${portfolioStyles.pfBlurImage} ${portfolioStyles.pfLightboxThumbImg}`}
                  loading="lazy"
                  decoding="async"
                  optimizedWidth={160}
                  width={96}
                  height={64}
                />
              </button>
            ))}
          </div>
        )}

        <div className={portfolioStyles.pfLightboxCaption}>
          <div className={portfolioStyles.pfCaptionRail}>
            <h3 id={titleId} className={portfolioStyles.pfCaptionRailTitle}>{group.title}</h3>

            {(group.dateDisplay || group.category) && (
              <p className={portfolioStyles.pfCaptionRailMeta}>
                {group.dateDisplay && <span>{group.dateDisplay}</span>}
                {group.dateDisplay && group.category && <span className={portfolioStyles.pfCaptionRailMetaSeparator}>•</span>}
                {group.category && <span>{group.category}</span>}
              </p>
            )}

            {activeCaption && (
              <p className={portfolioStyles.pfLightboxDescription}>{activeCaption}</p>
            )}

            {summaryText && summaryText !== activeCaption && (
              <p id={descriptionId} className={portfolioStyles.pfCaptionRailDescription}>{summaryText}</p>
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

            {visibleTags.length > 0 && (
              <div className={portfolioStyles.pfCardTags}>
                {visibleTags.map((tag) => (
                  <span key={tag} className={portfolioStyles.pfCardTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioLightbox;
