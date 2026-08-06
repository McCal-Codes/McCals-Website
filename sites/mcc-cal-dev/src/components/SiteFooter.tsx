import { REPOSITORIES, SITE } from '@/content/site';
import styles from './SiteFooter.module.css';

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
              <li key={repo.name}>
                <a className={styles.repo} href={repo.href} rel="noreferrer" target="_blank">
                  <span className={styles.repoName}>{repo.name}</span>
                  <span aria-hidden="true" className={styles.repoArrow}>
                    ↗
                  </span>
                </a>
                <p className={styles.repoDesc}>{repo.description}</p>
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
      </div>
    </footer>
  );
}
