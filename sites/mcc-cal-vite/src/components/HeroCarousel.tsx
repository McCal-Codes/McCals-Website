import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/styles/heroCarousel.module.css';

interface HeroSlide {
  title: string;
  meta: string;
  image: string;
  href: string;
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

const fpToCss = (fp?: { x: number; y: number }) => {
  const n = normalizeFP(fp);
  if (!n) return '50% 50%';
  return `${(n.x * 100).toFixed(4)}% ${(n.y * 100).toFixed(4)}%`;
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
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/eedc836b-ce05-4452-b29c-8ab2a64f384e/101024_Obama+Speaks+at+Pittsburgh_CAL3364-min.jpg',
    href: '/journalism',
    cta: 'Politics',
    alt: 'Obama Smiling at the crowd during a Rally In Pittsburgh, PA',
    focalPointMobile: { x: 0.32421635258168385, y: 0.488 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Journalism',
    meta: 'Journalism',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/3a804513-dde2-4a01-b38c-d67528d655f4/250715_CMU+Trump+Protest_CAL1573.jpg',
    href: '/journalism',
    cta: 'Journalism',
    alt: 'Journalism assignment image from CMU protest.',
    focalPointMobile: { x: 0.7, y: 0.344 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Pittsburgh',
    meta: 'Pittsburgh',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/62dcd231-e0e8-402b-abf4-cc34e995ea58/IMGP7209.jpg',
    href: '/nature',
    cta: 'Pittsburgh',
    alt: 'A large, steel truss bridge spans over a body of water at sunset, with trees and buildings visible below and in the background.',
    focalPointMobile: { x: 0.6175632360483595, y: 0.464 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Portraits',
    meta: 'Portraits',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/f75a0ba5-795a-4b29-a86e-eb890ef944a3/6-9-25_Caleb+McCartney_134.jpg',
    href: '/portraits',
    cta: 'Portraits',
    alt: 'A woman and a child holding a sparkler at night, with dark trees in the background.',
    focalPointMobile: { x: 0.3513058767534031, y: 0.48 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Corporate',
    meta: 'Corporate',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/abf749ae-bd3d-45a0-9d6a-690a8cf0055d/230411_Cock+Tail+Hour+-+James+Bond+Event_876_Published.jpg',
    href: '/events',
    cta: 'Corporate',
    alt: 'Group of people at a professional networking event, talking and laughing, with a woman preparing drinks on a table.',
    focalPointMobile: { x: 0.8141660064306552, y: 0.528 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Event',
    meta: 'Event',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/a2b77c48-9cf4-4e5f-b15a-1c373e5fc5c1/250823_Honky+Tonk_CAL4149.jpg',
    href: '/events',
    cta: 'Event',
    alt: 'Event image from Honky Tonk gathering.',
    focalPointMobile: { x: 0.750466239268814, y: 0.656 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Concert',
    meta: 'Concert',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/9c635526-663e-42ef-ba9c-7dcc8d477190/251025+When+We+Were+Dead_CAL8612_webuse.jpg',
    href: '/concerts',
    cta: 'Concert',
    alt: 'A singer on stage on his knees with green and blue lighting.',
    focalPointMobile: { x: 0.3828257120011642, y: 0.44 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Theatre',
    meta: 'Theatre',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/77807f5b-9895-4444-804d-1b3363d0f1b3/250319+A+Guy+Who+Hates+Musicals+-+Ghostlight_CAL999.jpg',
    href: '/events',
    cta: 'Theatre',
    alt: 'The cast from A Guy Who Hates Musicals together on stage.',
    focalPointMobile: { x: 0.5, y: 0.5 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Nature',
    meta: 'Nature',
    image:
      'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/f96709e7-3a00-4574-af88-795f26ce432e/IMGP6886.jpg',
    href: '/nature',
    cta: 'Nature',
    alt: 'Close-up of a pink coneflower with a bee on the dark center cone, blurred green background.',
    focalPointMobile: { x: 0.5, y: 0.5 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
];

const HeroCarousel: React.FC = () => {
  // Suppress body padding-top so the hero fills behind the fixed nav
  useEffect(() => {
    const prev = document.body.style.paddingTop;
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = prev;
    };
  }, []);

  const widgetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const deltaXRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const slides = FAVORITES;

  const syncHeight = useCallback(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    widget.style.setProperty('--mcc-hero-vh', `${Math.round(vh * HEIGHT_MULTIPLIER)}px`);
  }, []);

  const applyFocalPoints = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    track.querySelectorAll<HTMLImageElement>('.mcc-hero-slide-img').forEach((img) => {
      const mobile = img.getAttribute('data-focal-mobile') || '50% 50%';
      const desktop = img.getAttribute('data-focal-desktop') || mobile;
      img.style.objectPosition = isDesktop ? desktop : mobile;
    });
  }, []);

  const setTrack = useCallback((x: number, withTransition: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = withTransition ? 'transform 0.5s ease' : 'none';
    track.style.transform = `translate3d(${x}px,0,0)`;
  }, []);

  const goTo = useCallback(
    (nextIndex: number, withTransition = true) => {
      const total = slides.length;
      const safe = ((nextIndex % total) + total) % total;
      indexRef.current = safe;
      const w = viewportWidthRef.current || window.innerWidth;
      setTrack(-safe * w, withTransition);
    },
    [slides.length, setTrack]
  );

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (reducedMotion.current) return;
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      goTo(indexRef.current + 1);
    }, SLIDE_DURATION);
  }, [goTo, stopAutoplay]);

  useEffect(() => {
    syncHeight();
    applyFocalPoints();

    const viewport = viewportRef.current;
    if (!viewport) return;

    viewportWidthRef.current = viewport.getBoundingClientRect().width || window.innerWidth;
    goTo(0, false);
    startAutoplay();

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true;
      viewport.classList.add(styles.isDragging);
      startXRef.current = e.clientX;
      deltaXRef.current = 0;
      viewportWidthRef.current = viewport.getBoundingClientRect().width || window.innerWidth;
      stopAutoplay();
      viewport.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      deltaXRef.current = e.clientX - startXRef.current;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      viewport.classList.remove(styles.isDragging);
      viewport.releasePointerCapture?.(e.pointerId);
      const threshold = Math.max(48, viewportWidthRef.current * 0.1);
      if (Math.abs(deltaXRef.current) > threshold) {
        goTo(deltaXRef.current < 0 ? indexRef.current + 1 : indexRef.current - 1);
      } else {
        goTo(indexRef.current, true);
      }
      startAutoplay();
    };

    const onResize = () => {
      syncHeight();
      viewportWidthRef.current = viewport.getBoundingClientRect().width || window.innerWidth;
      applyFocalPoints();
      goTo(indexRef.current, false);
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', onResize);

    const widget = widgetRef.current;
    widget?.addEventListener('mouseenter', stopAutoplay);
    widget?.addEventListener('mouseleave', startAutoplay);

    return () => {
      stopAutoplay();
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerUp);
      viewport.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);
      widget?.removeEventListener('mouseenter', stopAutoplay);
      widget?.removeEventListener('mouseleave', startAutoplay);
    };
  }, [goTo, startAutoplay, stopAutoplay, syncHeight, applyFocalPoints]);

  const handlePrev = useCallback(() => {
    goTo(indexRef.current - 1);
    startAutoplay();
  }, [goTo, startAutoplay]);

  const handleNext = useCallback(() => {
    goTo(indexRef.current + 1);
    startAutoplay();
  }, [goTo, startAutoplay]);

  return (
    <div ref={widgetRef} className={styles.heroWidget}>
      <div className={styles.heroShell}>
        <section className={styles.hero} aria-label="Featured work carousel">
          <div ref={viewportRef} className={styles.heroViewport}>
            <div ref={trackRef} className={styles.heroTrack}>
              {slides.map((slide, i) => {
                const isDesktop = typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;
                return (
                  <figure key={i} className={styles.heroSlide} aria-label={`Slide ${i + 1}: ${slide.title}`}>
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="mcc-hero-slide-img"
                      data-focal-mobile={fpToCss(slide.focalPointMobile)}
                      data-focal-desktop={fpToCss(slide.focalPointDesktop)}
                      style={{ objectPosition: resolveObjectPosition(slide, isDesktop) }}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
                    />
                    <figcaption className={styles.heroCaption}>
                      <Link
                        to={slide.href}
                        className={styles.heroCta}
                        aria-label={`View ${slide.cta}`}
                      >
                        {slide.cta}
                      </Link>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>

          <button
            className={`${styles.heroArrow} ${styles.heroArrowPrev}`}
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 32 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 1 L1 7 L7 13" />
              <path d="M31 7 L2 7" />
            </svg>
          </button>

          <button
            className={`${styles.heroArrow} ${styles.heroArrowNext}`}
            onClick={handleNext}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 32 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M25 1 L31 7 L25 13" />
              <path d="M1 7 L30 7" />
            </svg>
          </button>

          {/* dots hidden per data-show-dots="false" */}
          <div className={styles.heroDots} aria-label="Slide navigation" />
        </section>
      </div>
    </div>
  );
};

export default HeroCarousel;
