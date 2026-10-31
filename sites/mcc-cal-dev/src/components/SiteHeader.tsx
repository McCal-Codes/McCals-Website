import { Link, useLocation } from 'react-router-dom';
import { EXTERNAL_NAV, NAV, SITE } from '@/content/site';
import styles from './SiteHeader.module.css';

/**
 * Compact persistent identity. A top bar rather than a fixed sidebar: this site is
 * built for reading long case studies, and a sidebar would take horizontal space
 * that diagrams and interface captures need.
 */
export default function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} shell`}>
        <Link className={styles.identity} to="/">
          <span className={styles.mark}>{SITE.shortName}</span>
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          <ul className={styles.list}>
            {NAV.map((item) => {
              const target = item.to.split('#')[0] || '/';
              const isActive = target === '/' ? pathname === '/' : pathname.startsWith(target);

              return (
                <li key={item.label}>
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={`${styles.link} meta`}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {EXTERNAL_NAV.map((item) => (
              <li key={item.label}>
                <a
                  className={`${styles.link} meta`}
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                  <span aria-hidden="true"> ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
