import React from 'react';
import { Link } from 'react-router-dom';
import { LIVE_SITE_HERO_SLIDES } from '@/content/liveSiteFallbacks';
import type { HeroSlide } from '@/content/liveSiteFallbacks';
import styles from '@/styles/heroCarousel.module.css';

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = LIVE_SITE_HERO_SLIDES }) => {
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
