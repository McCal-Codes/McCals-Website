import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type PointerEvent as ReactPointerEvent,
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
const SWIPE_THRESHOLD_PX = 48;
/* Must stay a subset of vercel.json images.sizes — the optimizer 400s any other width. */
const LIGHTBOX_SRCSET_WIDTHS = [640, 1080, 1440, 1920];
const LIGHTBOX_SIZES = '(max-width: 720px) calc(100vw - 28px), 1100px';

interface ImageStatus {
  filename: string;
  loaded: boolean;
  error: boolean;
}

interface DragState {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
}

const PortfolioLightbox: FC<PortfolioLightboxProps> = ({ group, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const prevZoomRef = useRef(MIN_ZOOM);
  const zoomFocalRef = useRef<{ x: number; y: number } | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [stageAspectRatio, setStageAspectRatio] = useState<number | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>({
    filename: '',
    loaded: false,
    error: false,
  });
  const isOpen = group !== null;
  const imageCount = group?.images.length ?? 0;
  const hasMultiple = imageCount > 1;

  const activeImage = useMemo(() => {
    if (!group) return null;
    return group.images[activeIndex] ?? group.coverImage;
  }, [activeIndex, group]);
  const imageLoaded = imageStatus.loaded && imageStatus.filename === activeImage?.filename;
  const imageFailed = imageStatus.error && imageStatus.filename === activeImage?.filename;
  const shouldFitByHeight =
    imageAspectRatio !== null && stageAspectRatio !== null && imageAspectRatio < stageAspectRatio;

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

  const retryImage = useCallback(() => {
    setImageStatus({ filename: '', loaded: false, error: false });
    setImageAspectRatio(null);
    setRetryKey((key) => key + 1);
  }, []);

  useEffect(() => {
    setImageAspectRatio(null);
  }, [activeImage?.filename]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const updateStageAspectRatio = () => {
      const rect = scroller.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageAspectRatio(rect.width / rect.height);
      }
    };

    updateStageAspectRatio();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateStageAspectRatio);
      return () => window.removeEventListener('resize', updateStageAspectRatio);
    }

    const observer = new ResizeObserver(updateStageAspectRatio);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, [isOpen]);

  // Keep the point the viewer was looking at (or the double-clicked point)
  // stable when the zoom level changes, instead of snapping to the top.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const previousZoom = prevZoomRef.current;
    prevZoomRef.current = zoom;
    const focal = zoomFocalRef.current;
    zoomFocalRef.current = null;

    if (!scroller || zoom === previousZoom || zoom <= MIN_ZOOM) return;

    const rect = scroller.getBoundingClientRect();
    const focalX = focal ? focal.x - rect.left : scroller.clientWidth / 2;
    const focalY = focal ? focal.y - rect.top : scroller.clientHeight / 2;
    const factor = zoom / previousZoom;

    scroller.scrollLeft = (scroller.scrollLeft + focalX) * factor - focalX;
    scroller.scrollTop = (scroller.scrollTop + focalY) * factor - focalY;
  }, [zoom]);

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

  // Warm the browser cache for the neighboring photos using the exact
  // srcset/sizes the visible <img> uses, so the candidate the browser
  // preloads is the one it will actually render on next/previous.
  useEffect(() => {
    if (!group || !activeImage || imageCount < 2) return;

    const neighborImages = [
      group.images[(activeIndex + 1) % imageCount],
      group.images[(activeIndex - 1 + imageCount) % imageCount],
    ].filter(Boolean);

    neighborImages.forEach((image) => {
      const preload = new Image();
      preload.decoding = 'async';
      const srcset = getResponsiveImageSrcSet(image.url, LIGHTBOX_SRCSET_WIDTHS);
      if (srcset) {
        preload.srcset = srcset;
        preload.sizes = LIGHTBOX_SIZES;
      }
      preload.src = getOptimizedImageUrl(image.url, { width: 1920 });
    });
  }, [activeImage, activeIndex, group, imageCount]);

  // Pointer interactions on the stage: mouse drag pans while zoomed;
  // a horizontal touch swipe (while not zoomed) navigates prev/next.
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      dragRef.current = {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: scroller.scrollLeft,
        scrollTop: scroller.scrollTop,
      };

      if (zoom > MIN_ZOOM && event.pointerType === 'mouse') {
        scroller.setPointerCapture(event.pointerId);
        setIsDragging(true);
      }
    },
    [zoom],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const scroller = scrollerRef.current;
      if (!drag || !scroller || drag.pointerId !== event.pointerId) return;

      if (zoom > MIN_ZOOM && drag.pointerType === 'mouse') {
        scroller.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
        scroller.scrollTop = drag.scrollTop - (event.clientY - drag.startY);
      }
    },
    [zoom],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const isSwipe =
        zoom === MIN_ZOOM &&
        drag.pointerType !== 'mouse' &&
        hasMultiple &&
        event.type !== 'pointercancel' &&
        Math.abs(deltaX) > SWIPE_THRESHOLD_PX &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.5;

      if (isSwipe) {
        if (deltaX < 0) {
          showNext();
        } else {
          showPrevious();
        }
      }
    },
    [hasMultiple, showNext, showPrevious, zoom],
  );

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
  const activeImageSrcSet = getResponsiveImageSrcSet(activeImage.url, LIGHTBOX_SRCSET_WIDTHS);
  /* While zoomed, widen `sizes` so the browser upgrades to a sharper candidate. */
  const activeImageSizes = zoom > MIN_ZOOM ? `${Math.round(1100 * zoom)}px` : LIGHTBOX_SIZES;
  const activeImageStyle: CSSProperties = shouldFitByHeight
    ? {
        height: zoom > MIN_ZOOM ? `${zoom * 100}%` : '100%',
        width: 'auto',
        maxWidth: zoom > MIN_ZOOM ? 'none' : '100%',
        maxHeight: zoom > MIN_ZOOM ? 'none' : '100%',
      }
    : {
        width: zoom > MIN_ZOOM ? `${zoom * 100}%` : '100%',
        height: 'auto',
        maxWidth: zoom > MIN_ZOOM ? 'none' : '100%',
        maxHeight: zoom > MIN_ZOOM ? 'none' : '100%',
      };
  const zoomOutDisabled = zoom <= MIN_ZOOM;
  const zoomInDisabled = zoom >= MAX_ZOOM;

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
              aria-disabled={zoomOutDisabled}
              onClick={() => {
                if (!zoomOutDisabled) zoomOut();
              }}
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
              aria-disabled={zoomInDisabled}
              onClick={() => {
                if (!zoomInDisabled) zoomIn();
              }}
            >
              <ZoomIn aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              className={portfolioStyles.pfLightboxIconBtn}
              aria-label="Reset zoom"
              aria-disabled={zoomOutDisabled}
              onClick={() => {
                if (!zoomOutDisabled) resetZoom();
              }}
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

          <div
            ref={scrollerRef}
            className={portfolioStyles.pfLightboxImageScroller}
            data-zoomed={zoom > MIN_ZOOM ? 'true' : 'false'}
            data-dragging={isDragging ? 'true' : 'false'}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div
              key={`${activeImage.filename}#${retryKey}`}
              className={portfolioStyles.pfLightboxImageFrame}
              data-loaded={imageLoaded ? 'true' : 'false'}
            >
              {!imageLoaded && !imageFailed && (
                <div className={portfolioStyles.pfLightboxImageLoading} role="status" aria-live="polite">
                  <span className={portfolioStyles.pfSpinner} aria-hidden="true" />
                  <span>Loading photo</span>
                </div>
              )}
              {imageFailed && (
                <div className={portfolioStyles.pfLightboxImageError} role="alert">
                  <span>This photo could not be loaded.</span>
                  <button
                    type="button"
                    className={portfolioStyles.pfLightboxRetryBtn}
                    onClick={retryImage}
                  >
                    Try again
                  </button>
                </div>
              )}
              {!imageFailed && (
                <ProtectedPortfolioImage
                  className={portfolioStyles.pfLightboxProtectedImage}
                  onDoubleClick={(event) => {
                    zoomFocalRef.current = { x: event.clientX, y: event.clientY };
                    setZoom((currentZoom) => (currentZoom === MIN_ZOOM ? 2 : MIN_ZOOM));
                  }}
                >
                  <img
                    src={activeImageSrc}
                    srcSet={activeImageSrcSet}
                    sizes={activeImageSizes}
                    alt={activeImage.alt ?? `${group.title}, photo ${activeIndex + 1}`}
                    className={portfolioStyles.pfLightboxImg}
                    loading="eager"
                    decoding="async"
                    style={activeImageStyle}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      if (naturalWidth > 0 && naturalHeight > 0) {
                        setImageAspectRatio(naturalWidth / naturalHeight);
                      }
                      setImageStatus({ filename: activeImage.filename, loaded: true, error: false });
                    }}
                    onError={() =>
                      setImageStatus({ filename: activeImage.filename, loaded: false, error: true })
                    }
                    draggable={false}
                  />
                </ProtectedPortfolioImage>
              )}
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
          <div className={portfolioStyles.pfLightboxThumbs} role="group" aria-label="Choose photo">
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
