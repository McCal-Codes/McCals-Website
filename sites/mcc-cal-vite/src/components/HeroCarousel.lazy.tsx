import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './heroCarousel.module.css';
import {
  FAVORITE_HERO_SLIDES,
  HERO_IMAGE_VARIANTS,
  type HeroFocalPoint,
  type HeroSlide,
  type HeroSlideVariant,
} from './heroSlides';

const DESKTOP_BREAKPOINT = 769;
const SLIDE_DURATION = 8000;

const normalizeFP = (fp?: HeroFocalPoint) => {
  if (!fp) return null;
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  return { x: clamp(fp.x), y: clamp(fp.y) };
};


const resolveObjectPosition = (slide: HeroSlide, isDesktop: boolean) => {
  const mobile = normalizeFP(slide.focalPointMobile);
  const desktop = normalizeFP(slide.focalPointDesktop);
  const fp = isDesktop ? desktop || mobile : mobile || desktop;
  return fp ? `${(fp.x * 100).toFixed(4)}% ${(fp.y * 100).toFixed(4)}%` : '50% 50%';
};

const getBaseVariant = (slide: HeroSlide): HeroSlideVariant => ({
  image: slide.image,
  alt: slide.alt,
  focalPointMobile: slide.focalPointMobile,
  focalPointDesktop: slide.focalPointDesktop,
});

const resolveSlideVariant = (slide: HeroSlide): HeroSlide => {
  const options: [HeroSlideVariant, ...HeroSlideVariant[]] = [
    getBaseVariant(slide),
    ...(HERO_IMAGE_VARIANTS[slide.cta] ?? []),
  ];
  const selected = options[Math.floor(Math.random() * options.length)] ?? options[0];

  return {
    ...slide,
    ...selected,
  };
};

const getInitialSlides = () => {
  return FAVORITE_HERO_SLIDES.map((slide, index) => (
    index === 0 ? slide : resolveSlideVariant(slide)
  ));
};

interface ImageStatus {
  src: string;
  loaded: boolean;
  error: boolean;
}

const HeroCarousel: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [imageStatus, setImageStatus] = useState<ImageStatus>({
    src: '',
    loaded: false,
    error: false,
  });
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const slides = useMemo(() => getInitialSlides(), []);

  const currentSlide = slides[currentSlideIndex];
  const imageLoaded = imageStatus.src === currentSlide?.image && imageStatus.loaded;
  const imageError = imageStatus.src === currentSlide?.image && imageStatus.error;

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
  }, []);

  // Auto-advance with pause on hover
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      intervalRef.current = setInterval(nextSlide, SLIDE_DURATION);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, nextSlide, slides.length]);

  // Responsive detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    checkDesktop();

    resizeObserverRef.current = new ResizeObserver(() => {
      checkDesktop();
    });

    if (typeof document !== 'undefined') {
      resizeObserverRef.current.observe(document.body);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // A cached image can complete before React receives onLoad after a slide change.
  // Keep the visible state keyed to the current URL so stale load/reset events cannot blank the slide.
  useEffect(() => {
    if (!currentSlide) return;

    const image = imageRef.current;
    if (!image?.complete) return;

    setImageStatus({
      src: currentSlide.image,
      loaded: image.naturalWidth > 0,
      error: image.naturalWidth === 0,
    });
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const objectPosition = useMemo(() => {
    return currentSlide ? resolveObjectPosition(currentSlide, isDesktop) : '50% 50%';
  }, [currentSlide, isDesktop]);

  const handleImageLoad = () => {
    setImageStatus({
      src: currentSlide.image,
      loaded: true,
      error: false,
    });
  };

  const handleImageError = () => {
    setImageStatus({
      src: currentSlide.image,
      loaded: false,
      error: true,
    });
  };

  if (!currentSlide) {
    return (
      <div className={styles.heroCarousel}>
        <div className={styles.heroSlide} style={{ backgroundColor: '#1f2937' }}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={heroRef}
      className={styles.heroCarousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.heroSlide}>
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className={styles.imageSkeleton} />
        )}

        {/* Error fallback */}
        {imageError ? (
          <div className={styles.imageError}>
            <div className={styles.errorContent}>
              <h2 className={styles.errorTitle}>Image unavailable</h2>
              <p className={styles.errorText}>{currentSlide.title}</p>
            </div>
          </div>
        ) : (
          <img
            ref={imageRef}
            key={currentSlide.image}
            src={currentSlide.image}
            alt={currentSlide.alt}
            className={`${styles.heroImage} ${imageLoaded ? styles.loaded : ''}`}
            style={{ objectPosition }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager"
            fetchPriority="high"
          />
        )}

        <div className={styles.heroContent}>
          <Link to={currentSlide.href} className={styles.heroButton} aria-label={`View ${currentSlide.cta}`}>
            {currentSlide.cta}
          </Link>
        </div>
      </div>

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div className={styles.heroDots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.heroDot} ${index === currentSlideIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlideIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            className={`${styles.heroArrow} ${styles.prev}`}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className={`${styles.heroArrow} ${styles.next}`}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
