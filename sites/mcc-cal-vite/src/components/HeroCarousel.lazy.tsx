import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './heroCarousel.module.css';
import { imageUrl } from './portfolio/useManifest';

interface HeroFocalPoint {
  x: number;
  y: number;
}

interface HeroSlideVariant {
  image: string;
  alt: string;
  focalPointMobile?: HeroFocalPoint;
  focalPointDesktop?: HeroFocalPoint;
}

interface HeroSlide extends HeroSlideVariant {
  title: string;
  meta: string;
  href: string;
  links?: {
    url: string;
    label?: string;
    cta?: string;
  }[];
  cta: string;
}

const DESKTOP_BREAKPOINT = 769;
const SLIDE_DURATION = 8000;
const HEIGHT_MULTIPLIER = 1.12;

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

const FAVORITES: HeroSlide[] = [
  {
    title: 'Politics',
    meta: 'Politics',
    image: imageUrl.journalism(
      'Politics/obama-speaks-pitt',
      '101024_Obama Speaks at Pittsburgh_CAL3364.jpg',
    ),
    href: '/journalism',
    links: [
      { url: '/journalism', label: 'Journalism' },
      { url: '/featured-work', label: 'Featured Work' },
    ],
    cta: 'Politics',
    alt: 'Obama Smiling at the crowd during a Rally In Pittsburgh, PA',
    focalPointMobile: { x: 0.38, y: 0.46 },
    focalPointDesktop: { x: 0.42, y: 0.5 },
  },
  {
    title: 'Journalism',
    meta: 'Journalism',
    image: imageUrl.journalism(
      'Documentary/Boyd Station',
      '6-10-25_Caleb McCartney_320-min.jpg',
    ),
    href: '/journalism',
    links: [
      { url: '/journalism', label: 'Journalism' },
      { url: '/events', label: 'Event Coverage' },
    ],
    cta: 'Journalism',
    alt: 'A farmer works in a garden during a Boyd Station photojournalism assignment.',
    focalPointMobile: { x: 0.54, y: 0.38 },
    focalPointDesktop: { x: 0.46, y: 0.5 },
  },
  {
    title: 'Pittsburgh',
    meta: 'Pittsburgh',
    image: imageUrl.nature('Landscapes/Downtown Pittsburgh', 'IMGP7209.jpg'),
    href: '/nature',
    links: [
      { url: '/nature', label: 'Nature' },
      { url: '/featured-work', label: 'Featured Work' },
    ],
    cta: 'Pittsburgh',
    alt: 'A large, steel truss bridge spans over a body of water at sunset, with trees and buildings visible below and in the background.',
    focalPointMobile: { x: 0.6175632360483595, y: 0.464 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Portraits',
    meta: 'Portraits',
    image: imageUrl.portrait('Studio/Logan Spiker', 'Studio with logan0066.jpg'),
    href: '/portraits',
    links: [
      { url: '/portraits', label: 'Portraits' },
      { url: '/portraits', label: 'Portrait Gallery' },
    ],
    cta: 'Portraits',
    alt: 'Studio portrait of Logan Spiker.',
    focalPointMobile: { x: 0.52, y: 0.42 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Corporate',
    meta: 'Corporate',
    image: imageUrl.event(
      'src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp',
    ),
    href: '/events',
    links: [
      { url: '/events', label: 'Events' },
      { url: '/events', label: 'Corporate Work' },
    ],
    cta: 'Corporate',
    alt: 'Group of people at a professional networking event, talking and laughing, with a woman preparing drinks on a table.',
    focalPointMobile: { x: 0.8141660064306552, y: 0.528 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Event',
    meta: 'Event',
    image: imageUrl.event(
      'src/images/Portfolios/Events/CMU-Business-Graduation/250511_CMU-Business-Graduation-_CAL6655-1280.jpg',
    ),
    href: '/events',
    links: [
      { url: '/events', label: 'Events' },
      { url: '/events', label: 'Event Gallery' },
    ],
    cta: 'Event',
    alt: 'A CMU business graduate smiles while receiving recognition at commencement.',
    focalPointMobile: { x: 0.46, y: 0.42 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Concert',
    meta: 'Concert',
    image: imageUrl.concert(
      'Concert/Dream The Heavy/October 2025',
      '251025 When We Were Dead_CAL8612_webuse.jpg',
    ),
    href: '/concerts',
    links: [
      { url: '/concerts', label: 'Concerts' },
      { url: '/concerts', label: 'Concert Gallery' },
    ],
    cta: 'Concert',
    alt: 'A singer on stage on his knees with green and blue lighting.',
    focalPointMobile: { x: 0.3828257120011642, y: 0.44 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Theatre',
    meta: 'Theatre',
    image: imageUrl.event(
      'src/images/Portfolios/Events/guy-hates-musicals/250319 A Guy Who Hates Musicals - Ghostlight_CAL999.jpg',
    ),
    href: '/events',
    links: [
      { url: '/events', label: 'Events' },
      { url: '/events', label: 'Theatre Gallery' },
    ],
    cta: 'Theatre',
    alt: 'The cast from A Guy Who Hates Musicals together on stage.',
    focalPointMobile: { x: 0.5, y: 0.5 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Nature',
    meta: 'Nature',
    image: imageUrl.nature('Flowers & Plants', 'IMGP8504.jpg'),
    href: '/nature',
    links: [
      { url: '/nature', label: 'Nature' },
      { url: '/nature', label: 'Nature Gallery' },
    ],
    cta: 'Nature',
    alt: 'Close-up of a pink flower with a dark green background.',
    focalPointMobile: { x: 0.5, y: 0.5 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
];

const HERO_IMAGE_VARIANTS: Record<string, HeroSlideVariant[]> = {
  Politics: [
    {
      image: imageUrl.journalism('Politics/kamala-pittsburgh', '241104_kamala-pgh-eve_CAL4102.jpg'),
      alt: 'Kamala Harris speaks at a campaign event in Pittsburgh.',
      focalPointMobile: { x: 0.5, y: 0.54 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.journalism('Politics/kamala-speaks-erie', '141024_Kamala Speaks at Erie_CAL4115.jpg'),
      alt: 'Kamala Harris speaks at a campaign event in Erie, Pennsylvania.',
      focalPointMobile: { x: 0.78, y: 0.52 },
      focalPointDesktop: { x: 0.68, y: 0.5 },
    },
    {
      image: imageUrl.journalism(
        'Politics/trump-returns-butler',
        '051024 Caleb McCartney_Trump Returns to Butler PA_CAL2649.webp',
      ),
      alt: 'Donald Trump returns to Butler, Pennsylvania for a campaign rally.',
      focalPointMobile: { x: 0.48, y: 0.66 },
      focalPointDesktop: { x: 0.5, y: 0.56 },
    },
  ],
  Journalism: [
    {
      image: imageUrl.journalism(
        'Documentary/Boyd Station',
        '6-10-25_Caleb McCartney_320-min.jpg',
      ),
      alt: 'A farmer works in a garden during a Boyd Station photojournalism assignment.',
      focalPointMobile: { x: 0.54, y: 0.38 },
      focalPointDesktop: { x: 0.46, y: 0.5 },
    },
    {
      image: imageUrl.journalism(
        'Events/Drag at Carnegie Coffee',
        '250309 Drag at Carnegie Coffee_CAL9319.jpg',
      ),
      alt: 'A drag performer poses during a Carnegie Coffee event.',
      focalPointMobile: { x: 0.46, y: 0.38 },
      focalPointDesktop: { x: 0.5, y: 0.46 },
    },
    {
      image: imageUrl.journalism(
        'Events/Pro Palestine Protest at Pitt',
        '240430_Pro Palestine Protest at Pitt_CAL1489_webuse.jpg',
      ),
      alt: 'A demonstrator sits wrapped in a Palestinian flag during a Pitt protest.',
      focalPointMobile: { x: 0.58, y: 0.42 },
      focalPointDesktop: { x: 0.58, y: 0.5 },
    },
    {
      image: imageUrl.journalism(
        'Events/Pro Palestine Protest at Pitt',
        '240430_Pro Palestine Protest at Pitt_CAL1501_webuse.jpg',
      ),
      alt: 'Demonstrators gather during a pro-Palestine protest at Pitt.',
      focalPointMobile: { x: 0.68, y: 0.42 },
      focalPointDesktop: { x: 0.58, y: 0.5 },
    },
  ],
  Pittsburgh: [
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '230509_untitled__CAL4122.jpg'),
      alt: 'A downtown Pittsburgh cityscape at dusk.',
      focalPointMobile: { x: 0.5, y: 0.52 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '230505_untitled__CAL4020-Edit.jpg'),
      alt: 'Downtown Pittsburgh architecture and city lights.',
      focalPointMobile: { x: 0.5, y: 0.5 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Portraits: [
    {
      image: imageUrl.portrait('Studio/Logan Spiker', 'Studio with logan0066.jpg'),
      alt: 'Studio portrait of Logan Spiker.',
      focalPointMobile: { x: 0.52, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.portrait('Studio/Liam Sulivan', '250425_Excused Chao’s with Liam _CAL3563-min.jpg'),
      alt: 'Studio portrait of Liam Sulivan.',
      focalPointMobile: { x: 0.52, y: 0.38 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.portrait('Studio/Helen Wise', '240528_Helen Wise_1639_CAL_Compressed.jpg'),
      alt: 'Studio portrait of Helen Wise.',
      focalPointMobile: { x: 0.48, y: 0.36 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Corporate: [
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/The Rooney Rule/250417 The Rooney Rule_CAL2761.jpg',
      ),
      alt: 'Professionals speak during a Rooney Rule event.',
      focalPointMobile: { x: 0.45, y: 0.44 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/Inclusivity Event - PRSSA/251025 PRSSA Workplace Inclusivity_CAL7937_webuse.jpg',
      ),
      alt: 'A speaker presents during the PRSSA workplace inclusivity event.',
      focalPointMobile: { x: 0.64, y: 0.44 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/Inclusivity Event - PRSSA/251025 PRSSA Workplace Inclusivity_CAL7956_webuse.jpg',
      ),
      alt: 'Panelists speak during the PRSSA workplace inclusivity event.',
      focalPointMobile: { x: 0.5, y: 0.46 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Event: [
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/pitt-winter-grad-2024/241218_pitt-grad-w24_CAL7109.jpg',
      ),
      alt: 'A Pitt graduate smiles during winter commencement.',
      focalPointMobile: { x: 0.46, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/pitt-winter-grad-2024/241218_pitt-grad-w24_CAL7027.jpg',
      ),
      alt: 'A Pitt graduate sits among classmates during winter commencement.',
      focalPointMobile: { x: 0.42, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/CMU-Business-Graduation/250511_CMU-Business-Graduation-_CAL6485-1280.jpg',
      ),
      alt: 'A bagpiper leads the CMU business graduation procession.',
      focalPointMobile: { x: 0.46, y: 0.44 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Concert: [
    {
      image: imageUrl.concert('Concert/Star Viper/October 2025', '251025 When We Were Dead_CAL8825_webuse.jpg'),
      alt: 'Star Viper performs on stage under concert lighting.',
      focalPointMobile: { x: 0.5, y: 0.38 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.concert('Concert/Horseburner/December 2025', '251206 Riffmas 3_CAL2526_webuse.jpg'),
      alt: 'Horseburner performs during Riffmas 3.',
      focalPointMobile: { x: 0.46, y: 0.38 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.concert('Concert/Funky Lamp/September 2025', '250927_Bellueve Music Festival_CAL6073_webuse.jpg'),
      alt: 'Funky Lamp performs at Bellevue Music Festival.',
      focalPointMobile: { x: 0.52, y: 0.36 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Theatre: [
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/guy-hates-musicals/250319 A Guy Who Hates Musicals - Ghostlight_CAL930.jpg',
      ),
      alt: 'The cast performs in A Guy Who Hates Musicals.',
      focalPointMobile: { x: 0.5, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/guy-hates-musicals/250319 A Guy Who Hates Musicals - Ghostlight_CAL808.jpg',
      ),
      alt: 'A stage scene from A Guy Who Hates Musicals.',
      focalPointMobile: { x: 0.52, y: 0.46 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        "src/images/Portfolios/Events/Love's A Game/251106 Love’s A Game - Ghostlight_CAL466_webuse.jpg",
      ),
      alt: "Performers on stage during Ghostlight's Love's A Game.",
      focalPointMobile: { x: 0.47, y: 0.43 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        "src/images/Portfolios/Events/Love's A Game/251106 Love’s A Game - Ghostlight_CAL447_webuse.jpg",
      ),
      alt: "A stage moment from Ghostlight's Love's A Game.",
      focalPointMobile: { x: 0.5, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Nature: [
    {
      image: imageUrl.nature('Wildlife/Birds/Blue-bellied roller', '230727_Blue-bellied Roller__CAL4526.jpg'),
      alt: 'A blue-bellied roller perched on a branch.',
      focalPointMobile: { x: 0.54, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.nature('Landscapes/West Virginia', 'seneca-rocks-night.jpg'),
      alt: 'Seneca Rocks under a night sky.',
      focalPointMobile: { x: 0.52, y: 0.46 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.nature('Landscapes/West Virginia', 'barn.jpg'),
      alt: 'A rural West Virginia barn in a mountain landscape.',
      focalPointMobile: { x: 0.48, y: 0.5 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
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
  return FAVORITES.map(resolveSlideVariant);
};

const HeroCarousel: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const slides = useMemo(() => getInitialSlides(), []);

  const currentSlide = slides[currentSlideIndex];

  // Match the original homepage carousel: the hero should start behind the fixed nav.
  useEffect(() => {
    const previousPaddingTop = document.body.style.paddingTop;
    document.body.style.paddingTop = '0';

    return () => {
      document.body.style.paddingTop = previousPaddingTop;
    };
  }, []);

  useEffect(() => {
    const syncHeight = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
      hero.style.setProperty('--mcc-hero-vh', `${Math.round(viewportHeight * HEIGHT_MULTIPLIER)}px`);
    };

    syncHeight();
    window.addEventListener('resize', syncHeight, { passive: true });

    return () => {
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

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
