import type { BetaProgram } from '@/content/types';
import { getRepo } from '@/content/github';
import styles from './BetaCallout.module.css';

interface BetaCalloutProps {
  beta: BetaProgram;
  /** Project title, used in the heading and the button label. */
  title: string;
  /** Project slug, for reading the current version out of github.json. */
  slug: string;
}

/**
 * The beta enrolment area.
 *
 * Two states from one shape. With a TestFlight link it invites people in; without
 * one it says the beta is not open yet. The version shown alongside is pulled from
 * the repository rather than written here, so the banner cannot advertise a build
 * that does not exist.
 */
export default function BetaCallout({ beta, title, slug }: BetaCalloutProps) {
  const repo = getRepo(slug);
  const version = repo?.latestRelease?.tag;
  const open = Boolean(beta.testFlightUrl);

  return (
    <aside aria-labelledby={`beta-${slug}`} className={styles.callout}>
      <div className={styles.head}>
        <p className={`${styles.eyebrow} meta`}>
          {/* Shape and text, never colour alone. Same rule as StatusMarker. */}
          <span aria-hidden="true" className={styles.marker}>
            {open ? '●' : '○'}
          </span>
          {open ? 'Beta open' : 'Beta not open yet'}
        </p>
        {version && <p className={`${styles.version} meta`}>{version}</p>}
      </div>

      <h2 className={styles.heading} id={`beta-${slug}`}>
        {open ? `Test ${title} before it ships` : `${title} opens for testing soon`}
      </h2>

      <p className={styles.blurb}>{beta.blurb}</p>

      {open ? (
        <a
          className={styles.action}
          href={beta.testFlightUrl}
          rel="noreferrer"
          target="_blank"
        >
          Join the TestFlight beta
          <span aria-hidden="true"> ↗</span>
        </a>
      ) : (
        // No button at all rather than a disabled one. A control that cannot be
        // used is an invitation to click something that does nothing.
        <p className={`${styles.pending} meta`}>Invitations are not open yet</p>
      )}

      {beta.note && <p className={styles.note}>{beta.note}</p>}
    </aside>
  );
}
