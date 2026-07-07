import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from '@/utils/imageOptimization';
import type { PortfolioGroup } from './types';
import { portfolioStyles } from './index';
import ProtectedPortfolioImage from './ProtectedPortfolioImage';

interface PortfolioLightboxProps {
  group: PortfolioGroup | null;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.5;

const PortfolioLightbox: FC<PortfolioLightboxProps> = ({ group, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [loadedImage, setLoadedImage] = useState({ filename: '', loaded: false });
  const isOpen = group !== null;
  const imageCount = group?.images.length ?? 0;
  const hasMultiple = imageCount > 1;

  const activeImage = useMemo(() => {
    if (!group) return null;
    return group.images[activeIndex] ?? group.coverImage;
  }, [activeIndex, group]);
  const imageLoaded = loadedImage.loaded && loadedImage.filename === activeImage?.filename;

  // Lock scroll and hide nav while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.documentElement.classList.add('pf-lb-open');
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.documentElement.classList.remove('pf-lb-open');
      document.body.style.overflow = previousOverflow;
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

      if (event.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => element.offsetParent !== null);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) {
          event.preventDefault();
          dialogRef.current?.focus();
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === 'Escape') {
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
    activeThumbRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeIndex]);

  useEffect(() => {
    if (!group || !activeImage || imageCount < 2) return;

    const neighborImages = [
      group.images[(activeIndex + 1) % imageCount],
      group.images[(activeIndex - 1 + imageCount) % imageCount],
    ].filter(Boolean);

    neighborImages.forEach((image) => {
      const preload = new Image();
      preload.decoding = 'async';
      preload.src = getOptimizedImageUrl(image.url, { width: 1920 });
    });
  }, [activeImage, activeIndex, group, imageCount]);

  if (!group || !activeImage) return null;

  const fallbackCaption =
    group.coverImage.caption ??
    group.coverImage.description ??
    group.images[0]?.caption ??
    group.images[0]?.description;
  const displayCaption = activeImage.caption ?? activeImage.description ?? fallbackCaption;
  const visibleTags = (group.tags ?? []).filter(
    (tag) => {
      const normalizedTag = tag.toLowerCase();

      return (
        normalizedTag !== group.category?.toLowerCase() &&
        !(group.published && normalizedTag === 'published work')
      );
    },
  );
  const zoomPercent = Math.round(zoom * 100);
  const activeImageSrc = getOptimizedImageUrl(activeImage.url, { width: 1920 });
  const activeImageSrcSet = getResponsiveImageSrcSet(activeImage.url, [640, 1080, 1440, 1920]);

  return (
    <div
      className={`${portfolioStyles.pfLightbox}${isOpen ? ` ${portfolioStyles.pfLightboxOpen}` : ''}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={displayCaption ? descriptionId : undefined}
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
            <div
              key={activeImage.filename}
              className={portfolioStyles.pfLightboxImageFrame}
              data-loaded={imageLoaded ? 'true' : 'false'}
            >
              {!imageLoaded && (
                <div className={portfolioStyles.pfLightboxImageLoading} role="status" aria-live="polite">
                  <span className={portfolioStyles.pfSpinner} aria-hidden="true" />
                  <span>Loading photo</span>
                </div>
              )}
              <ProtectedPortfolioImage
                className={portfolioStyles.pfLightboxProtectedImage}
                onDoubleClick={() => {
                  setZoom((currentZoom) => (currentZoom === MIN_ZOOM ? 2 : MIN_ZOOM));
                }}
              >
                <img
                  ref={imageRef}
                  src={activeImageSrc}
                  srcSet={activeImageSrcSet}
                  sizes="(max-width: 720px) calc(100vw - 28px), 1100px"
                  alt={activeImage.alt ?? `${group.title}, photo ${activeIndex + 1}`}
                  className={portfolioStyles.pfLightboxImg}
                  loading="eager"
                  decoding="async"
                  style={
                    zoom > MIN_ZOOM
                      ? { width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: 'none' }
                      : undefined
                  }
                  onLoad={() => setLoadedImage({ filename: activeImage.filename, loaded: true })}
                  draggable={false}
                />
              </ProtectedPortfolioImage>
            </div>
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
                ref={index === activeIndex ? activeThumbRef : undefined}
                type="button"
                className={portfolioStyles.pfLightboxThumb}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => selectImage(index)}
              >
                <ProtectedPortfolioImage className={portfolioStyles.pfLightboxThumbProtectedImage}>
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
                    draggable={false}
                  />
                </ProtectedPortfolioImage>
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

            {displayCaption && (
              <p id={descriptionId} className={portfolioStyles.pfLightboxDescription}>
                {displayCaption}
              </p>
            )}

            {group.articleUrl && group.outletName && (
              <div
                className={portfolioStyles.pfLightboxOutlet}
                aria-label={`Published, view story on ${group.outletName}`}
              >
                <span className={portfolioStyles.pfLightboxOutletLabel}>Published</span>
                <a
                  href={group.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={portfolioStyles.pfLightboxOutletLink}
                >
                  View story on {group.outletName}
                  <ExternalLink aria-hidden="true" size={13} strokeWidth={2.4} />
                </a>
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
