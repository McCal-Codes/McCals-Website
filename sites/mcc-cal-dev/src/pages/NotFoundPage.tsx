import { Link } from 'react-router-dom';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './PageShell.module.css';

export default function NotFoundPage() {
  useDocumentMeta('Not found');

  return (
    <header className={`${styles.header} grid-backdrop`}>
      <div className="shell">
        <p className={`${styles.eyebrow} meta`}>404</p>
        <h1 className={styles.title}>That page does not exist.</h1>
        <p className={styles.lede}>
          The project index is the best place to start.
        </p>

        <div className={styles.links}>
          <Link className={styles.link} to="/">
            Project index<span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
