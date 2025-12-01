import React from 'react';
import styles from '../styles/heroCarousel.module.css';

export interface HeroSlide {
  image: string;
  alt: string;
  title: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const defaultSlides: HeroSlide[] = [
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/f75a0ba5-795a-4b29-a86e-eb890ef944a3/6-9-25_Caleb+McCartney_134.jpg',
    alt: 'A woman and a child holding a sparkler at night, with dark trees in the background.',
    title: 'Boyd Station',
    ctaText: 'Explore Project',
    ctaLink: '/featured-work',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/3a804513-dde2-4a01-b38c-d67528d655f4/250715_CMU+Trump+Protest_CAL1573.jpg',
    alt: 'A couple kissing outdoors at night during fireworks display in the background.',
    title: 'Photojournalism',
    ctaText: 'View Gallery',
    ctaLink: '/journalism',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/1757468682503-YXX6ILQYQ1CMH1OT66WD/141024_Kamala+Speaks+at+Erie_CAL3804+1+%281%29.jpg',
    alt: 'Crowd of people at a political event listening while holding signs and a flag.',
    title: 'Politics On Assignment',
    ctaText: 'See Coverage',
    ctaLink: '/journalism',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/abf749ae-bd3d-45a0-9d6a-690a8cf0055d/230411_Cock+Tail+Hour+-+James+Bond+Event_876_Published.jpg',
    alt: 'Guests networking at a cocktail event while a bartender prepares drinks.',
    title: 'Corporate Events',
    ctaText: 'Book Coverage',
    ctaLink: '/events',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/a2b77c48-9cf4-4e5f-b15a-1c373e5fc5c1/250823_Honky+Tonk_CAL4149.jpg',
    alt: 'Guests watching a lively show with colorful lighting and confetti.',
    title: 'Experiences',
    ctaText: 'Discover Events',
    ctaLink: '/events',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/2aa375a0-a9b1-4965-9ae2-23e9660f7c3e/250829_Haven_CAL4401.jpg',
    alt: 'A musician playing bass on stage under purple and blue lights.',
    title: 'Concert Moments',
    ctaText: 'View Performances',
    ctaLink: '/concerts',
  },
];

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = defaultSlides }) => {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // do not auto-advance when reduced motion
    }
    const id = window.setInterval(() => {
      setActive((s) => (s + 1) % slides.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <div className={styles.heroWidget}>
      <div className={styles.heroShell}>
        <section className={styles.hero} aria-label="Featured work carousel">
          <div className={styles.heroStage}>
            {slides.map((slide, index) => (
              <figure
                key={index}
                className={`${styles.heroSlide} ${index === active ? (styles as Record<string, string>).active || '' : ''}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <figcaption className={styles.heroCaption}>
                  <h2>{slide.title}</h2>
                  <a className={styles.heroCta} href={slide.ctaLink}>
                    {slide.ctaText}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeroCarousel;
