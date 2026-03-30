import React from 'react';
import { Link } from 'react-router-dom';
import styles from '@/styles/heroCarousel.module.css';

export interface HeroSlide {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  summary: string;
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
    eyebrow: 'Journalism',
    title: 'Field stories with room to breathe.',
    summary: 'Long-form features, campaign nights, and local reporting built around atmosphere as much as action.',
    ctaText: 'View Photojournalism',
    ctaLink: '/journalism',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/3a804513-dde2-4a01-b38c-d67528d655f4/250715_CMU+Trump+Protest_CAL1573.jpg',
    alt: 'Demonstrators gather during a protest in Pittsburgh.',
    eyebrow: 'Politics',
    title: 'Politics',
    summary: 'Campaigns, rallies, and public pressure documented without flattening the people inside them.',
    ctaText: 'See Coverage',
    ctaLink: '/journalism',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/1757468682503-YXX6ILQYQ1CMH1OT66WD/141024_Kamala+Speaks+at+Erie_CAL3804+1+%281%29.jpg',
    alt: 'Supporters listen during a campaign event in Erie, Pennsylvania.',
    eyebrow: 'Pittsburgh',
    title: 'City Stories',
    summary: 'Regional work rooted in Pittsburgh, Western Pennsylvania, and the communities around them.',
    ctaText: 'Explore Region',
    ctaLink: '/journalism',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/abf749ae-bd3d-45a0-9d6a-690a8cf0055d/230411_Cock+Tail+Hour+-+James+Bond+Event_876_Published.jpg',
    alt: 'Guests networking at a cocktail event while a bartender prepares drinks.',
    eyebrow: 'Corporate',
    title: 'Corporate',
    summary: 'Clean, high-trust coverage for brands, conferences, nonprofits, and client-facing events.',
    ctaText: 'Book Coverage',
    ctaLink: '/events',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/a2b77c48-9cf4-4e5f-b15a-1c373e5fc5c1/250823_Honky+Tonk_CAL4149.jpg',
    alt: 'Guests watching a lively show with colorful lighting and confetti.',
    eyebrow: 'Events',
    title: 'Events',
    summary: 'Live experiences framed with the same discipline as editorial assignments.',
    ctaText: 'Discover Events',
    ctaLink: '/events',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/2aa375a0-a9b1-4965-9ae2-23e9660f7c3e/250829_Haven_CAL4401.jpg',
    alt: 'A musician playing bass on stage under purple and blue lights.',
    eyebrow: 'Concert',
    title: 'Concert',
    summary: 'Performance work that stays close to gesture, lighting, and crowd energy.',
    ctaText: 'View Performances',
    ctaLink: '/concerts',
  },
  {
    image: 'https://images.squarespace-cdn.com/content/v1/68c0d80717db343b721449f3/8b6c6a68-c922-4e0f-9555-d1eafcf4f47b/250518_Senior+Portraits_CAL0318.jpg',
    alt: 'A portrait subject standing in evening light outdoors.',
    eyebrow: 'Portraits',
    title: 'Portraits',
    summary: 'Editorial portrait sessions with a quieter, more personal pacing.',
    ctaText: 'View Portraits',
    ctaLink: '/portraits',
  },
];

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = defaultSlides }) => {
  const [featured, ...secondary] = slides;

  if (!featured) {
    return null;
  }

  return (
    <div className={styles.heroWidget}>
      <div className={styles.heroShell}>
        <section className={styles.hero} aria-label="Homepage featured work">
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={styles.heroFrame}>
            <div className={styles.heroIntro}>
              <p className={styles.heroKicker}>Caleb McCartney</p>
              <h1 className={styles.heroTitle}>
                Photojournalism, events, and portraiture with a newsroom eye.
              </h1>
              <p className={styles.heroText}>
                A homepage layout closer to the live site: transparent navigation, direct paths into
                the work, and a faster first impression than an autoplay carousel.
              </p>
            </div>

            <article className={`${styles.heroCard} ${styles.heroCardFeatured}`}>
              <Link className={styles.heroCardLink} to={featured.ctaLink}>
                <img
                  className={styles.heroCardImage}
                  src={featured.image}
                  alt={featured.alt}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1080px) 58vw, 100vw"
                />
                <div className={`${styles.heroCardBody} ${styles.heroCardBodyFeatured}`}>
                  <span className={styles.heroEyebrow}>{featured.eyebrow}</span>
                  <h2 className={styles.heroCardTitleFeatured}>{featured.title}</h2>
                  <p className={styles.heroSummary}>{featured.summary}</p>
                  <span className={styles.heroCta}>{featured.ctaText}</span>
                </div>
              </Link>
            </article>

            <div className={styles.heroRail}>
              {secondary.map((slide) => (
                <article key={slide.title} className={styles.heroCard}>
                  <Link className={styles.heroCardLink} to={slide.ctaLink}>
                    <img
                      className={styles.heroCardImage}
                      src={slide.image}
                      alt={slide.alt}
                      loading="lazy"
                      sizes="(min-width: 1080px) 22vw, (min-width: 700px) 45vw, 100vw"
                    />
                    <div className={styles.heroCardBody}>
                      <span className={styles.heroEyebrow}>{slide.eyebrow}</span>
                      <h2 className={styles.heroCardTitle}>{slide.title}</h2>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeroCarousel;
