import { STATUS_PRESENTATION, type Project } from '@/content/types';
import { formatDate, getRepo, languageSummary } from '@/content/github';
import styles from './MetaTable.module.css';

interface MetaTableProps {
  project: Project;
}

interface Row {
  term: string;
  value: string;
  href?: string;
  /** Marks a value that came from the GitHub sync rather than hand-written content. */
  live?: boolean;
}

/**
 * The structured project header. A description list, not a table, because these are
 * label/value pairs rather than a grid of comparable data.
 *
 * Rows split into two kinds. Hand-written ones describe intent (type, role, platform).
 * Live ones are measured (source, license, languages, latest release, last push) and
 * come from github.json, so they cannot go stale against the repository.
 */
export default function MetaTable({ project }: MetaTableProps) {
  const repo = getRepo(project.slug);
  const languages = languageSummary(repo);

  const rows: Row[] = [
    { term: 'Project', value: project.title },
    { term: 'Type', value: project.meta.type },
    { term: 'Status', value: STATUS_PRESENTATION[project.status].label },
    { term: 'Role', value: project.meta.role },
    { term: 'Platform', value: project.meta.platform.join(' / ') },
    { term: 'Started', value: project.meta.started },
  ];

  if (languages) {
    rows.push({ term: 'Languages', value: languages, live: true });
  }

  if (project.meta.frameworks?.length) {
    rows.push({ term: 'Built with', value: project.meta.frameworks.join(' / ') });
  }

  if (repo) {
    rows.push({
      term: 'Source',
      value: repo.private ? 'Private' : 'Public',
      live: true,
    });
    rows.push({ term: 'License', value: repo.license ?? 'None declared', live: true });

    if (repo.latestRelease) {
      rows.push({
        term: 'Latest release',
        value: `${repo.latestRelease.tag} (${formatDate(repo.latestRelease.date)})`,
        href: repo.latestRelease.url,
        live: true,
      });
    }

    rows.push({ term: 'Last push', value: formatDate(repo.pushedAt), live: true });
    rows.push({ term: 'Repository', value: repo.fullName, href: repo.url, live: true });
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
