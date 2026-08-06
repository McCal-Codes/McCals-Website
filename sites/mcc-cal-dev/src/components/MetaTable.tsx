import { SOURCE_LABEL, STATUS_PRESENTATION, type Project } from '@/content/types';
import styles from './MetaTable.module.css';

interface MetaTableProps {
  project: Project;
}

interface Row {
  term: string;
  value: string;
  href?: string;
}

/**
 * The structured project header. A description list, not a table, because these are
 * label/value pairs rather than a grid of comparable data.
 */
export default function MetaTable({ project }: MetaTableProps) {
  const rows: Row[] = [
    { term: 'Project', value: project.title },
    { term: 'Type', value: project.meta.type },
    { term: 'Status', value: STATUS_PRESENTATION[project.status].label },
    { term: 'Role', value: project.meta.role },
    { term: 'Platform', value: project.meta.platform.join(' / ') },
    { term: 'Source', value: SOURCE_LABEL[project.meta.source] },
    { term: 'Started', value: project.meta.started },
  ];

  if (project.meta.repo) {
    rows.push({
      term: 'Repository',
      value: project.meta.repo.label,
      href: project.meta.repo.href,
    });
  }

  return (
    <div className={`${styles.wrap} scroll-x`}>
      <dl className={styles.list}>
        {rows.map((row) => (
          <div className={styles.row} key={row.term}>
            <dt className={styles.term}>{row.term}</dt>
            <dd className={styles.value}>
              {row.href ? (
                <a className={styles.link} href={row.href} target="_blank" rel="noreferrer">
                  {row.value}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
