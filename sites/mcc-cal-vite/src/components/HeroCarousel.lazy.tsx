import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './heroCarousel.module.css';

interface HeroSlide {
  title: string;
  meta: string;
  image: string;
  href: string;
  // Optional: multiple links for randomization
  links?: {
    url: string;
    label?: string;
    cta?: string;
  }[];
  cta: string;
  alt: string;
  focalPointMobile?: { x: number; y: number };
  focalPointDesktop?: { x: number; y: number };
}

const DESKTOP_BREAKPOINT = 769;
const SLIDE_DURATION = 8000;
const HEIGHT_MULTIPLIER = 1.12;

const normalizeFP = (fp?: { x: number; y: number }) => {
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

const FAVORITES: HeroSlide[] = [
  {
    title: 'Politics',
    meta: 'Politics',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/eedc836b-ce05-4452-b29c-8ab2a64f384e/101024_Obama+Speaks+at+Pittsburgh_CAL3364-min.jpg?format=webp&width=1920',
    href: '/journalism',
    links: [
      {
        url: '/journalism',
        label: 'View Political Photography',
      },
    ],
    cta: 'View Political Coverage',
    alt: 'President Barack Obama speaking at a campaign rally in Pittsburgh, Pennsylvania',
    focalPointMobile: { x: 0.5, y: 0.3 },
    focalPointDesktop: { x: 0.5, y: 0.4 },
  },
  {
    title: 'Live Music',
    meta: 'Concert Photography',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/9e4b4b2a-5a0e-4b1e-9d4a-2b3a1c5c3b0e/240927_Kendrick+Lamar+at+PNC+Park_CAL8253-min.jpg?format=webp&width=1920',
    href: '/concerts',
    links: [
      {
        url: '/concerts',
        label: 'View Concert Photography',
      },
    ],
    cta: 'View Concert Photography',
    alt: 'Kendrick Lamar performing on stage at PNC Park in Pittsburgh',
    focalPointMobile: { x: 0.6, y: 0.4 },
    focalPointDesktop: { x: 0.5, y: 0.3 },
  },
  {
    title: 'Community',
    meta: 'Event Photography',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/f1e8f8a0-3b1e-4b1e-9d4a-2b3a1c5c3b0e/240927_Kendrick+Lamar+at+PNC+Park_CAL8253-min.jpg?format=webp&width=1920',
    href: '/events',
    links: [
      {
        url: '/events',
        label: 'View Event Photography',
      },
    ],
    cta: 'View Event Coverage',
    alt: 'Community event photography showcasing Pittsburgh events',
    focalPointMobile: { x: 0.5, y: 0.5 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
];

const HeroCarousel: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const slides = useMemo(() => {
    const shuffled = [...FAVORITES];
    return shuffled.sort(() => Math.random() - 0.5);
  }, []);

  const currentSlide = slides[currentSlideIndex];

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

  // Reset image states when slide changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentSlideIndex]);

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
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
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
      className={styles.heroCarousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ height: `${window.innerHeight * HEIGHT_MULTIPLIER}px` }}
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
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{currentSlide.title}</h1>
            <p className={styles.heroMeta}>{currentSlide.meta}</p>
          </div>

          {currentSlide.links && currentSlide.links.length > 0 ? (
            <div className={styles.heroLinks}>
              {currentSlide.links.map((link, index) => (
                <Link
                  key={index}
                  to={link.url}
                  className={styles.heroButton}
                  aria-label={link.label}
                >
                  {link.cta || currentSlide.cta}
                </Link>
              ))}
            </div>
          ) : (
            <Link to={currentSlide.href} className={styles.heroButton}>
              {currentSlide.cta}
            </Link>
          )}
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
