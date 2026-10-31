import type { TimelineEntry } from '@/content/types';
import styles from './Timeline.module.css';

interface TimelineProps {
  entries: TimelineEntry[];
}

/**
 * Development history. Releases that changed how a tool is used, in order.
 * This is a project's history, not a résumé.
 */
export default function Timeline({ entries }: TimelineProps) {
  return (
    <ol className={styles.list}>
      {entries.map((entry) => (
        <li
          className={`${styles.item} ${entry.current ? styles.current : ''}`}
          key={`${entry.marker}-${entry.title}`}
        >
          <div className={styles.head}>
            <span className={`${styles.marker} meta`}>{entry.marker}</span>
            <span className={`${styles.date} meta`}>{entry.date}</span>
            {entry.current && (
              <span className={`${styles.badge} meta`}>
                <span aria-hidden="true">● </span>In progress
              </span>
            )}
          </div>
          <p className={styles.title}>{entry.title}</p>
          {entry.detail && <p className={styles.detail}>{entry.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
