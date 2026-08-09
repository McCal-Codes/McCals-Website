import styles from './VersionBadge.module.css';

interface VersionBadgeProps {
  version?: string;
  build?: string;
  updated?: string;
}

/** Version markers. Renders nothing when there is nothing real to show. */
export default function VersionBadge({ version, build, updated }: VersionBadgeProps) {
  const parts = [
    version,
    build ? `Build ${build}` : null,
    updated ? `Updated ${updated}` : null,
  ].filter((part): part is string => Boolean(part));

  if (parts.length === 0) return null;

  return (
    <p className={`${styles.badge} meta`}>
      {parts.map((part, i) => (
        <span key={part}>
          {i > 0 && <span aria-hidden="true" className={styles.sep} />}
          {part}
        </span>
      ))}
    </p>
  );
}
