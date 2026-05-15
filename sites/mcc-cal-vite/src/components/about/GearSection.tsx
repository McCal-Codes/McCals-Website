import { Aperture, Camera, Headphones, MonitorCog, Zap, type LucideIcon } from 'lucide-react';
import { fieldKit } from './aboutData';
import styles from './about-sections.module.css';

interface GearSectionProps {
  className?: string;
}

const fieldKitIcons: Record<string, LucideIcon> = {
  camera: Camera,
  aperture: Aperture,
  flash: Zap,
  audio: Headphones,
  editing: MonitorCog,
};

export function GearSection({ className = '' }: GearSectionProps) {
  return (
    <section className={`${styles.fieldKit} ${className}`} aria-labelledby="field-kit-heading">
      <div className={styles.fieldKitHeader}>
        <p className={styles.eyebrow}>Field Kit</p>
        <h2 id="field-kit-heading">Prepared without making the tools the story.</h2>
        <p>
          A practical field kit for documentary coverage, live events, portraits, and fast-moving
          assignments where reliability matters.
        </p>
      </div>

      <div className={styles.fieldKitGrid}>
        {fieldKit.map((group) => {
          const Icon = fieldKitIcons[group.icon];

          return (
            <article key={group.category} className={styles.fieldKitCard}>
              <div className={styles.fieldKitCardHeader}>
                <Icon aria-hidden="true" className={styles.fieldKitIcon} strokeWidth={1.8} />
                <h3>{group.category}</h3>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
