import type { BetaProgram } from '@/content/types';
import styles from './BetaCallout.module.css';

interface BetaCalloutProps {
  beta: BetaProgram;
  /** Project title, used in the heading and the button label. */
  title: string;
  /** Project slug. Used for the heading's element id. */
  slug: string;
}

/**
 * The beta enrolment area.
 *
 * Three states from one shape. With a TestFlight link and room left it invites
 * people in; once the count reaches the cap it says so and offers the waitlist if
 * there is one; with no link at all it reads as coming soon. There is deliberately
 * no state where a control exists but does nothing.
 */
export default function BetaCallout({ beta, title, slug }: BetaCalloutProps) {
  const full = Boolean(beta.testers && beta.testers.taken >= beta.testers.cap);
  // A full beta is not an open one, however valid the link still is.
  const open = Boolean(beta.testFlightUrl) && !full;

  return (
    <aside aria-labelledby={`beta-${slug}`} className={styles.callout}>
      <p className={`${styles.eyebrow} meta`}>
        {/* Shape and text, never colour alone. Same rule as StatusMarker. */}
        <span aria-hidden="true" className={styles.marker}>
          {open ? '●' : '○'}
        </span>
        {open ? 'Open for testers' : full ? 'Beta is full' : 'Not taking testers yet'}
      </p>

      <h2 className={styles.heading} id={`beta-${slug}`}>
        {open
          ? `Test ${title} before it ships`
          : full
            ? `The ${title} beta is full`
            : `${title} opens for testing soon`}
      </h2>

      <p className={styles.blurb}>{beta.blurb}</p>

      {beta.testers && (
        <div className={styles.capacity}>
          <p className={`${styles.count} meta`}>
            {beta.testers.taken.toLocaleString()} of{' '}
            {beta.testers.cap.toLocaleString()} places taken
          </p>
          {/*
            Decoration only. The sentence above already carries the number, so a
            screen reader gets the information without the bar being announced.
          */}
          <div aria-hidden="true" className={styles.meter}>
            <span
              className={styles.fill}
              style={{
                // Floor at a hairline so a near-empty beta still reads as a bar
                // rather than as an empty track.
                width: `${Math.max(0.75, Math.min(100, (beta.testers.taken / beta.testers.cap) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

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
      ) : full && beta.waitlist ? (
        <a className={styles.action} href={beta.waitlist.href}>
          {beta.waitlist.label}
        </a>
      ) : (
        // No button at all rather than a disabled one. A control that cannot be
        // used is an invitation to click something that does nothing.
        <p className={`${styles.pending} meta`}>
          {full ? 'Every place is taken' : 'Invitations open when the next build ships'}
        </p>
      )}

      {beta.note && <p className={styles.note}>{beta.note}</p>}
    </aside>
  );
}
