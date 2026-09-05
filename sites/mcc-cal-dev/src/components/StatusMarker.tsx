import { STATUS_PRESENTATION, type ProjectStatus } from '@/content/types';
import { getRepo, monthsSincePush } from '@/content/github';
import styles from './StatusMarker.module.css';

interface StatusMarkerProps {
  status: ProjectStatus;
  /**
   * When given, the repository's last push is checked against the status and a
   * dormant project discloses it rather than letting the label overclaim.
   */
  slug?: string;
  className?: string;
}

/** Past this, "active" is a claim the commit history no longer supports. */
const DORMANT_AFTER_MONTHS = 4;

const ACTIVE_STATUSES: ProjectStatus[] = ['active-alpha', 'active-development'];

/**
 * Status is carried by shape and text together. The glyph is aria-hidden and the
 * label is always rendered, so the state survives grayscale, color blindness, and
 * a screen reader equally.
 */
export default function StatusMarker({ status, slug, className }: StatusMarkerProps) {
  const { glyph, label } = STATUS_PRESENTATION[status];

  // A written status is an intention; the push date is a fact. When they disagree,
  // show both rather than quietly trusting the one that flatters.
  const months = slug ? monthsSincePush(getRepo(slug)) : null;
  const dormant =
    ACTIVE_STATUSES.includes(status) && months !== null && months >= DORMANT_AFTER_MONTHS;

  return (
    <span className={styles.wrap}>
      <span className={[styles.marker, styles[status], className].filter(Boolean).join(' ')}>
        <span aria-hidden="true" className={styles.glyph}>
          {glyph}
        </span>
        {label}
      </span>
      {dormant && (
        <span className={styles.dormant}>No commits in {months} months</span>
      )}
    </span>
  );
}
