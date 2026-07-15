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
  collection?: PortfolioGroup[];
  initialIndex?: number;
  onChangeGroup?: (group: PortfolioGroup, initialIndex: number) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.5;
const SWIPE_THRESHOLD_PX = 48;
const TWO_FINGER_SWIPE_THRESHOLD_PX = 56;
const PINCH_ZOOM_THRESHOLD_RATIO = 0.04;
const WHEEL_NAVIGATION_THRESHOLD_PX = 42;
const WHEEL_NAVIGATION_COOLDOWN_MS = 380;
const WHEEL_ZOOM_DELTA_FOR_DOUBLE = 120;
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

interface PointerPosition {
  x: number;
  y: number;
}

interface StageSize {
  width: number;
  height: number;
}

interface PinchState {
  hasZoomed: boolean;
  lastMidpoint: PointerPosition;
  movedPointerIds: Set<number>;
  startDistance: number;
  startMidpoint: PointerPosition;
  startZoom: number;
}

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));

const getPinchDistance = (first: PointerPosition, second: PointerPosition) => (
  Math.hypot(second.x - first.x, second.y - first.y)
);

const getPinchMidpoint = (first: PointerPosition, second: PointerPosition) => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const getNormalizedWheelDeltaY = (event: WheelEvent) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * (typeof window === 'undefined' ? 800 : window.innerHeight);
  }

  return event.deltaY;
};

const capturePointer = (element: HTMLElement, pointerId: number) => {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer capture can fail if the browser has already cancelled the gesture.
  }
};

const releasePointer = (element: HTMLElement, pointerId: number) => {
  try {
    if (typeof element.hasPointerCapture === 'function' && !element.hasPointerCapture(pointerId)) {
      return;
    }
    element.releasePointerCapture(pointerId);
  } catch {
    // A cancelled or completed pointer may already be released by the browser.
  }
};

const PortfolioLightbox: FC<PortfolioLightboxProps> = ({
  group,
  initialIndex = 0,
  onChangeGroup,
  onClose,
  collection,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const touchPointersRef = useRef<Map<number, PointerPosition>>(new Map());
  const pinchRef = useRef<PinchState | null>(null);
  const wheelNavigationTimerRef = useRef<number | null>(null);
  const prevZoomRef = useRef(MIN_ZOOM);
  const zoomFocalRef = useRef<{ x: number; y: number } | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [stageSize, setStageSize] = useState<StageSize | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>({
    filename: '',
    loaded: false,
    error: false,
  });
  const isOpen = group !== null;
  const imageCount = group?.images.length ?? 0;
  const activeCollection = useMemo(
    () => collection?.filter((item) => item.images.length > 0) ?? [],
    [collection],
  );
  const activeCollectionIndex = group ? activeCollection.findIndex((item) => item.id === group.id) : -1;
  const canNavigateAdjacentGroups =
    Boolean(onChangeGroup) && activeCollection.length > 1 && activeCollectionIndex >= 0;
  const hasMultiple = imageCount > 1;
  const hasNavigation = hasMultiple || canNavigateAdjacentGroups;

  const activeImage = useMemo(() => {
    if (!group) return null;
    return group.images[activeIndex] ?? group.coverImage;
  }, [activeIndex, group]);
  const imageLoaded = imageStatus.loaded && imageStatus.filename === activeImage?.filename;
  const imageFailed = imageStatus.error && imageStatus.filename === activeImage?.filename;
  const stageAspectRatio = stageSize === null ? null : stageSize.width / stageSize.height;
  const isPortraitImage = imageAspectRatio !== null && imageAspectRatio < 1;
  const shouldFitByHeight =
    imageAspectRatio !== null &&
    (stageAspectRatio === null ? isPortraitImage : imageAspectRatio < stageAspectRatio);

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

  const navigateToAdjacentGroup = useCallback(
    (direction: 'next' | 'previous') => {
      if (!canNavigateAdjacentGroups || !onChangeGroup) return false;

      const nextGroupIndex =
        direction === 'next'
          ? (activeCollectionIndex + 1) % activeCollection.length
          : (activeCollectionIndex - 1 + activeCollection.length) % activeCollection.length;
      const nextGroup = activeCollection[nextGroupIndex];

      if (!nextGroup) return false;

      onChangeGroup(nextGroup, direction === 'previous' ? Math.max(0, nextGroup.images.length - 1) : 0);
      return true;
    },
    [activeCollection, activeCollectionIndex, canNavigateAdjacentGroups, onChangeGroup],
  );

  const showPrevious = useCallback(() => {
    if (activeIndex > 0) {
      selectImage(activeIndex - 1);
      return;
    }

    if (!navigateToAdjacentGroup('previous')) {
      selectImage(activeIndex - 1);
    }
  }, [activeIndex, navigateToAdjacentGroup, selectImage]);

  const showNext = useCallback(() => {
    if (activeIndex < imageCount - 1) {
      selectImage(activeIndex + 1);
      return;
    }

    if (!navigateToAdjacentGroup('next')) {
      selectImage(activeIndex + 1);
    }
  }, [activeIndex, imageCount, navigateToAdjacentGroup, selectImage]);

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

  useEffect(() => {
    if (!group) return;

    const maxIndex = Math.max(0, group.images.length - 1);
    setActiveIndex(Math.min(Math.max(0, initialIndex), maxIndex));
    setZoom(MIN_ZOOM);
    setImageAspectRatio(null);
    setStageSize(null);
    setImageStatus({ filename: '', loaded: false, error: false });
    dragRef.current = null;
    touchPointersRef.current.clear();
    pinchRef.current = null;
    setIsDragging(false);
  }, [group, initialIndex]);

  useEffect(() => () => {
    if (wheelNavigationTimerRef.current !== null) {
      window.clearTimeout(wheelNavigationTimerRef.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const updateStageAspectRatio = () => {
      const rect = scroller.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nextStageSize = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
        setStageSize((currentStageSize) => (
          currentStageSize?.width === nextStageSize.width &&
          currentStageSize.height === nextStageSize.height
            ? currentStageSize
            : nextStageSize
        ));
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

    if (!scroller || zoom === previousZoom) return;

    if (zoom <= MIN_ZOOM) {
      scroller.scrollLeft = 0;
      scroller.scrollTop = 0;
      return;
    }

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

      if (event.pointerType === 'touch') {
        touchPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        capturePointer(event.currentTarget, event.pointerId);

        if (touchPointersRef.current.size >= 2) {
          const [first, second] = Array.from(touchPointersRef.current.values());
          if (first && second) {
            const midpoint = getPinchMidpoint(first, second);
            pinchRef.current = {
              hasZoomed: false,
              lastMidpoint: midpoint,
              movedPointerIds: new Set(),
              startDistance: getPinchDistance(first, second),
              startMidpoint: midpoint,
              startZoom: zoom,
            };
            dragRef.current = null;
            setIsDragging(false);
          }
          return;
        }
      }

      dragRef.current = {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: scroller.scrollLeft,
        scrollTop: scroller.scrollTop,
      };

      if (zoom > MIN_ZOOM) {
        capturePointer(event.currentTarget, event.pointerId);
        setIsDragging(true);
      }
    },
    [zoom],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const scroller = scrollerRef.current;
      if (!scroller) return;

      if (event.pointerType === 'touch' && touchPointersRef.current.has(event.pointerId)) {
        touchPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

        const pinch = pinchRef.current;
        if (pinch && touchPointersRef.current.size >= 2) {
          pinch.movedPointerIds.add(event.pointerId);
          const [first, second] = Array.from(touchPointersRef.current.values());
          if (first && second && pinch.startDistance > 0) {
            const currentDistance = getPinchDistance(first, second);
            const midpoint = getPinchMidpoint(first, second);
            const scale = currentDistance / pinch.startDistance;
            pinch.lastMidpoint = midpoint;

            if (
              (pinch.hasZoomed || pinch.movedPointerIds.size >= 2) &&
              Math.abs(scale - 1) >= PINCH_ZOOM_THRESHOLD_RATIO
            ) {
              pinch.hasZoomed = true;
              zoomFocalRef.current = midpoint;
              setZoom(clampZoom(pinch.startZoom * scale));
            }
          }
          return;
        }
      }

      if (!drag || drag.pointerId !== event.pointerId) return;

      if (zoom > MIN_ZOOM) {
        scroller.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
        scroller.scrollTop = drag.scrollTop - (event.clientY - drag.startY);
      }
    },
    [zoom],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const pinch = pinchRef.current;
      const isCancel = event.type === 'pointercancel';
      const wasPinching = event.pointerType === 'touch' && (
        pinch !== null || touchPointersRef.current.size > 1
      );

      releasePointer(event.currentTarget, event.pointerId);

      if (event.pointerType === 'touch') {
        touchPointersRef.current.delete(event.pointerId);
        if (touchPointersRef.current.size < 2) {
          pinchRef.current = null;
        }
      }

      if (wasPinching) {
        dragRef.current = null;
        setIsDragging(false);

        if (!isCancel && pinch && !pinch.hasZoomed && zoom === MIN_ZOOM && hasNavigation) {
          const deltaX = pinch.lastMidpoint.x - pinch.startMidpoint.x;
          const deltaY = pinch.lastMidpoint.y - pinch.startMidpoint.y;
          const isTwoFingerSwipe =
            Math.abs(deltaX) > TWO_FINGER_SWIPE_THRESHOLD_PX &&
            Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

          if (isTwoFingerSwipe) {
            if (deltaX < 0) {
              showNext();
            } else {
              showPrevious();
            }
          }
        }
        return;
      }

      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const isSwipe =
        zoom === MIN_ZOOM &&
        drag.pointerType !== 'mouse' &&
        hasNavigation &&
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
    [hasNavigation, showNext, showPrevious, zoom],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.cancelable) {
          event.preventDefault();
        }
        event.stopPropagation();

        const normalizedDeltaY = getNormalizedWheelDeltaY(event);
        if (normalizedDeltaY === 0) return;

        const boundedDeltaY = Math.max(
          -WHEEL_ZOOM_DELTA_FOR_DOUBLE,
          Math.min(WHEEL_ZOOM_DELTA_FOR_DOUBLE, normalizedDeltaY),
        );
        const zoomScale = 2 ** (-boundedDeltaY / WHEEL_ZOOM_DELTA_FOR_DOUBLE);
        zoomFocalRef.current = { x: event.clientX, y: event.clientY };
        setZoom((currentZoom) => clampZoom(currentZoom * zoomScale));
        return;
      }

      const absDeltaX = Math.abs(event.deltaX);
      const absDeltaY = Math.abs(event.deltaY);

      if (
        zoom > MIN_ZOOM ||
        !hasNavigation ||
        absDeltaX < WHEEL_NAVIGATION_THRESHOLD_PX ||
        absDeltaX <= absDeltaY
      ) {
        return;
      }

      event.preventDefault();

      if (wheelNavigationTimerRef.current !== null) return;

      if (event.deltaX > 0) {
        showNext();
      } else {
        showPrevious();
      }

      wheelNavigationTimerRef.current = window.setTimeout(() => {
        wheelNavigationTimerRef.current = null;
      }, WHEEL_NAVIGATION_COOLDOWN_MS);
    },
    [hasNavigation, showNext, showPrevious, zoom],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    scroller.addEventListener('wheel', handleWheel, { passive: false });

    return () => scroller.removeEventListener('wheel', handleWheel);
  }, [handleWheel, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const preventPageZoomOutsidePhoto = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      const target = event.target;
      if (target instanceof Node && scrollerRef.current?.contains(target)) return;

      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
    };

    dialog.addEventListener('wheel', preventPageZoomOutsidePhoto, { passive: false });

    return () => dialog.removeEventListener('wheel', preventPageZoomOutsidePhoto);
  }, [isOpen]);

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
  const activeImageFit = imageAspectRatio === null ? 'pending' : shouldFitByHeight ? 'height' : 'width';
  const activeImageOrientation =
    imageAspectRatio === null ? 'pending' : isPortraitImage ? 'portrait' : imageAspectRatio > 1 ? 'landscape' : 'square';
  const activeImageFrameSize =
    imageAspectRatio !== null && stageSize !== null
      ? shouldFitByHeight
        ? {
            width: Math.min(stageSize.width, stageSize.height * imageAspectRatio),
            height: stageSize.height,
          }
        : {
            width: Math.min(stageSize.width, 1100),
            height: Math.min(stageSize.height, Math.min(stageSize.width, 1100) / imageAspectRatio),
          }
      : null;
  const activeImageFrameStyle: CSSProperties | undefined =
    imageAspectRatio === null
      ? undefined
      : {
          aspectRatio: `${imageAspectRatio} / 1`,
          ...(activeImageFrameSize
            ? {
                width: `${activeImageFrameSize.width}px`,
                height: `${activeImageFrameSize.height}px`,
              }
            : {}),
        };
  const activeImageStyle: CSSProperties = shouldFitByHeight
    ? {
        height: activeImageFrameSize ? `${activeImageFrameSize.height * zoom}px` : zoom > MIN_ZOOM ? `${zoom * 100}%` : '100%',
        width: 'auto',
        maxWidth: zoom > MIN_ZOOM ? 'none' : '100%',
        maxHeight: zoom > MIN_ZOOM ? 'none' : '100%',
      }
    : {
        width: activeImageFrameSize ? `${activeImageFrameSize.width * zoom}px` : zoom > MIN_ZOOM ? `${zoom * 100}%` : '100%',
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
              aria-keyshortcuts="-"
              aria-disabled={zoomOutDisabled}
              title="Zoom out (-)"
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
              aria-keyshortcuts="+ ="
              aria-disabled={zoomInDisabled}
              title="Zoom in (+)"
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
              aria-keyshortcuts="0"
              aria-disabled={zoomOutDisabled}
              title="Reset zoom (0)"
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
              aria-keyshortcuts="Escape"
              title="Close (Esc)"
              onClick={onClose}
            >
              <X aria-hidden="true" size={19} />
            </button>
          </div>
        </div>

        <div className={portfolioStyles.pfLightboxStage}>
          {hasNavigation && (
            <button
              type="button"
              className={`${portfolioStyles.pfLightboxNavBtn} ${portfolioStyles.pfLightboxPrevBtn}`}
              aria-label="Previous photo"
              aria-keyshortcuts="ArrowLeft PageUp"
              title="Previous photo (Left arrow)"
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
          >
            <div
              key={`${activeImage.filename}#${retryKey}`}
              className={portfolioStyles.pfLightboxImageFrame}
              data-loaded={imageLoaded ? 'true' : 'false'}
              data-fit={activeImageFit}
              data-orientation={activeImageOrientation}
              style={activeImageFrameStyle}
              title={zoom > MIN_ZOOM ? 'Double-click or pinch to zoom out' : 'Double-click or pinch to zoom in'}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
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

          {hasNavigation && (
            <button
              type="button"
              className={`${portfolioStyles.pfLightboxNavBtn} ${portfolioStyles.pfLightboxNextBtn}`}
              aria-label="Next photo"
              aria-keyshortcuts="ArrowRight PageDown"
              title="Next photo (Right arrow)"
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
