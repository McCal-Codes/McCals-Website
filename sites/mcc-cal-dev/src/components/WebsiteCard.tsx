import type { Website } from '@/content/types';
import { hasRole } from '@/content/websites';
import { getLiveSite } from '@/content/sites-live';
import { getRepo } from '@/content/github';
import styles from './WebsiteCard.module.css';

interface WebsiteCardProps {
  site: Website;
}

/**
 * One site built for someone else.
 *
 * Denser than an IndexRow because these are supporting work, not the products the
 * page is built around. The preview is whatever the site publishes as its own
 * og:image, downloaded locally at sync time.
 */
export default function WebsiteCard({ site }: WebsiteCardProps) {
  const live = getLiveSite(site.slug);
  const repo = site.repoSlug ? getRepo(site.repoSlug) : undefined;
  const isLive = Boolean(live?.reachable && site.url);
  const platform = live?.detectedPlatform ?? site.platform;

  return (
    <article className={styles.card}>
      <div className={styles.frame}>
        {live?.preview ? (
          <img
            alt={`${site.name} homepage`}
            className={styles.shot}
            height={630}
            loading="lazy"
            src={live.preview}
            width={1200}
          />
        ) : (
          <p className={`${styles.pending} meta`}>Preview pending</p>
        )}
      </div>

      <p className={`${styles.index} meta`}>
        {site.index}
        <span aria-hidden="true"> / </span>
        {site.year}
      </p>

      <h3 className={styles.name}>
        {isLive ? (
          <a className={styles.nameLink} href={site.url} rel="noreferrer" target="_blank">
            {site.name}
            <span aria-hidden="true"> ↗</span>
          </a>
        ) : (
          site.name
        )}
      </h3>

      <p className={styles.purpose}>{site.purpose}</p>

      {hasRole(site) && <p className={`${styles.role} meta`}>{site.role}</p>}

      <p className={`${styles.platform} meta`}>{platform}</p>

      <p className={`${styles.links} meta`}>
        {/*
          Status is stated rather than implied. A site that has come down is a fact
          about the work, and hiding it would be the kind of quiet edit this site avoids.
        */}
        {isLive ? (
          <span className={styles.statusLive}>● Live</span>
        ) : (
          <span className={styles.statusDown}>○ Not currently reachable</span>
        )}
        {repo && (
          <>
            <span aria-hidden="true"> · </span>
            <a className={styles.repoLink} href={repo.url} rel="noreferrer" target="_blank">
              Source ↗
            </a>
          </>
        )}
      </p>
    </article>
  );
}
