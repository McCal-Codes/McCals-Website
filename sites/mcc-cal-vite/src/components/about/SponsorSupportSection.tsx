import styles from './about-sections.module.css';
import sponsorLogo from '@/assets/about/sponsors/scrimshaw-media-logo.png';
import sponsorLogoInverse from '@/assets/about/sponsors/scrimshaw-media-logo-inverse.png';

interface SponsorSupportSectionProps {
  className?: string;
  sponsorName?: string;
  sponsorUrl?: string;
}

const DEFAULT_SPONSOR_NAME = 'Scrimshaw Media';
const DEFAULT_SPONSOR_URL = 'https://www.scrimshawphoto.com/';
const SPONSOR_LOGO = sponsorLogo;
const SPONSOR_LOGO_INVERSE = sponsorLogoInverse;

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
        <span className={styles.sponsorLogoSurface} role="img" aria-label={`${sponsorName} logo.`}>
          <img
            className={`${styles.sponsorLogo} ${styles.sponsorLogoInverse}`}
            src={SPONSOR_LOGO_INVERSE}
            alt=""
            aria-hidden="true"
            width="687"
            height="863"
            sizes="(max-width: 640px) 74px, 106px"
            loading="eager"
            decoding="async"
          />
          <img
            className={`${styles.sponsorLogo} ${styles.sponsorLogoStandard}`}
            src={SPONSOR_LOGO}
            alt=""
            aria-hidden="true"
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
          helping sustain independent creative work.
        </p>
        <p>
          Their partnership supports photography, digital media, and community-centered visual
          storytelling.
        </p>
        <a className={styles.sponsorLink} href={sponsorUrl}>
          Visit {sponsorName}
        </a>
      </div>
    </section>
  );
}
