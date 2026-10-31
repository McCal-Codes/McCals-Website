import type { AnnotatedShot as Shot } from '@/content/types';
import PreviewFrame from './PreviewFrame';
import styles from './AnnotatedShot.module.css';

interface AnnotatedShotProps {
  shot: Shot;
}

/**
 * An interface screenshot with numbered callouts.
 *
 * The markers over the image are decoration. The numbered list below is the content:
 * it works on touch, in a screen reader, and when the capture has not landed yet.
 */
export default function AnnotatedShot({ shot }: AnnotatedShotProps) {
  return (
    <figure className={styles.figure}>
      <div className={styles.stage}>
        <PreviewFrame shot={shot} label={shot.alt} />

        {shot.src &&
          shot.callouts.map((callout) => (
            <span
              aria-hidden="true"
              className={styles.marker}
              key={callout.index}
              style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
            >
              {callout.index}
            </span>
          ))}
      </div>

      <figcaption className={styles.caption}>
        {shot.caption && <p className={styles.captionText}>{shot.caption}</p>}

        <ol className={styles.callouts}>
          {shot.callouts.map((callout) => (
            <li className={styles.callout} key={callout.index}>
              <span className={`${styles.calloutIndex} meta`}>{callout.index}</span>
              <span className={styles.calloutLabel}>{callout.label}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
