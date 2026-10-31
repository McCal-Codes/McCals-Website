import type { AnnotatedShot } from '@/content/types';
import styles from './PreviewFrame.module.css';

interface PreviewFrameProps {
  shot?: AnnotatedShot;
  label: string;
  /**
   * Override the frame's aspect ratio, e.g. '16 / 10'.
   *
   * The index uses one ratio for every row so the list scans evenly. A portrait
   * mobile capture would otherwise make its row twice the height of the others.
   * Case-study pages omit this and get the capture's true shape.
   */
  ratio?: string;
}

/**
 * The product preview slot.
 *
 * When no capture exists yet the frame still reserves the aspect ratio and says so
 * plainly, so dropping in the real image later changes nothing about layout. An
 * empty labeled frame is more honest than a stock image.
 */
export default function PreviewFrame({ shot, label, ratio: ratioOverride }: PreviewFrameProps) {
  if (!shot) return null;

  const ratio = ratioOverride ?? `${shot.width} / ${shot.height}`;

  if (!shot.src) {
    return (
      <div className={styles.frame} style={{ aspectRatio: ratio }}>
        <div className={styles.placeholder} aria-hidden="true">
          <span className="meta">{label}</span>
          <span className={`${styles.pending} meta`}>Capture pending</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.frame} style={{ aspectRatio: ratio }}>
      <img
        alt={shot.alt}
        className={styles.image}
        decoding="async"
        height={shot.height}
        loading="lazy"
        src={shot.src}
        width={shot.width}
      />
    </div>
  );
}
