import { SITE } from '@/content/site';
import { GITHUB_SYNCED_AT, formatDate, getRepo } from '@/content/github';
import { PROJECTS } from '@/content/projects';
import styles from './SiteFooter.module.css';

/**
 * Repositories are derived from the project index rather than listed separately,
 * so the footer cannot fall out of step with what the site actually shows. Star and
 * fork counts are pulled, not written.
 */
const REPOSITORIES = PROJECTS.map((project) => getRepo(project.slug)).filter(
  (repo): repo is NonNullable<typeof repo> => repo !== undefined,
);

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} shell`}>
        <section aria-labelledby="footer-open-source" className={styles.block}>
          <h2 className={`${styles.heading} meta`} id="footer-open-source">
            Open source
          </h2>

          <ul className={styles.repos}>
            {REPOSITORIES.map((repo) => (
              <li key={repo.fullName}>
                <a className={styles.repo} href={repo.url} rel="noreferrer" target="_blank">
                  <span className={styles.repoName}>{repo.fullName}</span>
                  <span aria-hidden="true" className={styles.repoArrow}>
                    ↗
                  </span>
                </a>
                <p className={styles.repoDesc}>
                  {repo.description || 'No description set.'}
                </p>
                <p className={`${styles.repoStats} meta`}>
                  {[
                    repo.license,
                    repo.stars > 0 ? `${repo.stars} ★` : null,
                    `Updated ${formatDate(repo.pushedAt)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="footer-elsewhere" className={styles.block}>
          <h2 className={`${styles.heading} meta`} id="footer-elsewhere">
            Elsewhere
          </h2>

          <ul className={styles.links}>
            <li>
              <a className={styles.link} href={SITE.github} rel="noreferrer" target="_blank">
                GitHub<span aria-hidden="true"> ↗</span>
              </a>
            </li>
            <li>
              <a className={styles.link} href={SITE.portfolio} rel="noreferrer" target="_blank">
                Photography portfolio<span aria-hidden="true"> ↗</span>
              </a>
            </li>
          </ul>

          <p className={styles.note}>
            {SITE.person} works in two mediums. This is the software one.
          </p>
        </section>
      </div>

      <div className={`${styles.baseline} shell`}>
        <p className="meta">{SITE.name}</p>
        <p className={`${styles.synced} meta`}>
          Repository data synced {formatDate(GITHUB_SYNCED_AT.slice(0, 10))}
        </p>
      </div>
    </footer>
  );
}
