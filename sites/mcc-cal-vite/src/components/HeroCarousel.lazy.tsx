import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './heroCarousel.module.css';
import { getResponsiveImageSrcSet } from '../utils/imageOptimization';
import {
  FAVORITE_HERO_SLIDES,
  HERO_IMAGE_VARIANTS,
  type HeroFocalPoint,
  type HeroSlide,
  type HeroSlideVariant,
} from './heroSlides';

// ── Supabase slide fetch ──────────────────────────────────────────────────────
// Fetches active slides from hero_slides table. Falls back silently to the
// hardcoded FAVORITE_HERO_SLIDES if Supabase is unreachable or returns nothing.

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const R2_BASE       = (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined ?? '').replace(/\/$/, '');

interface DbSlide {
  title: string; meta: string | null; href: string; cta: string;
  links: { url: string; label?: string }[] | null;
  image_url: string; storage_path: string | null; alt_text: string;
  focal_point_mobile_x: number; focal_point_mobile_y: number;
  focal_point_desktop_x: number; focal_point_desktop_y: number;
  sort_order: number;
}
interface DbVariant {
  slide_cta: string; image_url: string; storage_path: string | null; alt_text: string;
  focal_point_mobile_x: number; focal_point_mobile_y: number;
  focal_point_desktop_x: number; focal_point_desktop_y: number;
}

function resolveUrl(imageUrl: string, storagePath: string | null): string {
  if (storagePath && R2_BASE) return `${R2_BASE}/${storagePath}`;
  return imageUrl;
}

function mapDbSlide(row: DbSlide): HeroSlide {
  return {
    title: row.title,
    meta:  row.meta ?? row.title,
    href:  row.href,
    cta:   row.cta,
    links: row.links ?? [],
    image: resolveUrl(row.image_url, row.storage_path),
    alt:   row.alt_text,
    focalPointMobile:  { x: row.focal_point_mobile_x,  y: row.focal_point_mobile_y  },
    focalPointDesktop: { x: row.focal_point_desktop_x, y: row.focal_point_desktop_y },
  };
}

async function fetchHeroSlides(): Promise<{ slides: HeroSlide[]; variants: Record<string, HeroSlideVariant[]> } | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const [slidesRes, variantsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/hero_slides?is_active=eq.true&order=sort_order.asc`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/hero_slide_variants?order=slide_cta.asc,sort_order.asc`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      ),
    ]);
    if (!slidesRes.ok) return null;
    const dbSlides: DbSlide[] = await slidesRes.json();
    const dbVariants: DbVariant[] = variantsRes.ok ? await variantsRes.json() : [];
    if (!Array.isArray(dbSlides) || dbSlides.length === 0) return null;

    const slides = dbSlides.map(mapDbSlide);
    const variants: Record<string, HeroSlideVariant[]> = {};
    for (const v of dbVariants) {
      if (!variants[v.slide_cta]) variants[v.slide_cta] = [];
      variants[v.slide_cta].push({
        image: resolveUrl(v.image_url, v.storage_path),
        alt:   v.alt_text,
        focalPointMobile:  { x: v.focal_point_mobile_x,  y: v.focal_point_mobile_y  },
        focalPointDesktop: { x: v.focal_point_desktop_x, y: v.focal_point_desktop_y },
      });
    }
    return { slides, variants };
  } catch {
    return null;
  }
}

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

const resolveSlideVariant = (slide: HeroSlide, variantPool = HERO_IMAGE_VARIANTS): HeroSlide => {
  const options: [HeroSlideVariant, ...HeroSlideVariant[]] = [
    getBaseVariant(slide),
    ...(variantPool[slide.cta] ?? []),
  ];
  const selected = options[Math.floor(Math.random() * options.length)] ?? options[0];

  return {
    ...slide,
    ...selected,
  };
};

const getInitialSlides = (
  sourceSlides = FAVORITE_HERO_SLIDES,
  variantPool: Record<string, HeroSlideVariant[]> = HERO_IMAGE_VARIANTS,
) => {
  return sourceSlides.map((slide, index) =>
    index === 0 ? slide : resolveSlideVariant(slide, variantPool)
  );
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
  const intervalRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Start immediately with hardcoded slides; replace with Supabase data if it arrives
  const [slides, setSlides] = useState<HeroSlide[]>(() => getInitialSlides());

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      // Abort the fetch after 5s — keep showing static slides
    }, 5000);

    fetchHeroSlides().then(data => {
      if (cancelled || !data || data.slides.length === 0) return;
      clearTimeout(timeout);
      setSlides(getInitialSlides(data.slides, data.variants));
      // Clamp index in case new slide count is smaller
      setCurrentSlideIndex(prev => Math.min(prev, data.slides.length - 1));
    });

    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

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

  const hasPreloadedNext = useRef(false);

  useEffect(() => {
    if (!imageLoaded || hasPreloadedNext.current || slides.length < 2) return;
    hasPreloadedNext.current = true;

    const nextSrc = slides[1]?.image;
    if (!nextSrc) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = nextSrc;
    const srcset = getResponsiveImageSrcSet(nextSrc, [640, 960, 1280, 1920, 3840]);
    if (srcset) {
      link.setAttribute('imagesrcset', srcset);
      link.setAttribute('imagesizes', '100vw');
    }
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, [imageLoaded, slides]);

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
            srcSet={getResponsiveImageSrcSet(currentSlide.image, [640, 960, 1280, 1920, 3840])}
            sizes="100vw"
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
