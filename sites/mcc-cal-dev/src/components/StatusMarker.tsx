import { STATUS_PRESENTATION, type ProjectStatus } from '@/content/types';
import styles from './StatusMarker.module.css';

interface StatusMarkerProps {
  status: ProjectStatus;
  className?: string;
}

/**
 * Status is carried by shape and text together. The glyph is aria-hidden and the
 * label is always rendered, so the state survives grayscale, color blindness, and
 * a screen reader equally.
 */
export default function StatusMarker({ status, className }: StatusMarkerProps) {
  const { glyph, label } = STATUS_PRESENTATION[status];

  return (
    <span className={[styles.marker, styles[status], className].filter(Boolean).join(' ')}>
      <span aria-hidden="true" className={styles.glyph}>
        {glyph}
      </span>
      {label}
    </span>
  );
}
