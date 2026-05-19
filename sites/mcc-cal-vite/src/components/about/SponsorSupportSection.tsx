import styles from './about-sections.module.css';

interface SponsorSupportSectionProps {
  className?: string;
  sponsorName?: string;
  sponsorUrl?: string;
}

const DEFAULT_SPONSOR_NAME = 'Scrimshaw Media';
const DEFAULT_SPONSOR_URL = 'https://www.scrimshawphoto.com/';
const SPONSOR_LOGO_INVERSE = '/about/sponsors/scrimshaw-media-logo-inverse.png';

export function SponsorSupportSection({
  className = '',
  sponsorName = DEFAULT_SPONSOR_NAME,
  sponsorUrl = DEFAULT_SPONSOR_URL,
}: SponsorSupportSectionProps) {
  return (
    <section
      className={`${styles.sponsorSupport} ${className}`.trim()}
      aria-labelledby="sponsor-support-heading"
    >
      <div className={styles.sponsorLogoWrap}>
        <span className={styles.sponsorLogoSurface}>
          <img
            className={styles.sponsorLogo}
            src={SPONSOR_LOGO_INVERSE}
            alt={`${sponsorName} logo.`}
            width="687"
            height="863"
            sizes="(max-width: 640px) 74px, 106px"
            loading="eager"
            decoding="async"
          />
        </span>
      </div>
      <div className={styles.sponsorCopy}>
        <p className={styles.eyebrow}>Community Support</p>
        <h3 id="sponsor-support-heading">Supported by {sponsorName}</h3>
        <p>
          McCal Media is proudly supported by {sponsorName}, a Pittsburgh-based media company
          supporting independent creative work and local storytelling.
        </p>
        <p>
          Their partnership helps sustain my work in photography, digital media, and
          community-centered visual storytelling.
        </p>
        <a className={styles.sponsorLink} href={sponsorUrl}>
          Visit {sponsorName}
        </a>
      </div>
    </section>
  );
}
