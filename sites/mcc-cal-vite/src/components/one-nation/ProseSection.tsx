import type { ReactNode } from 'react';
import styles from '@/pages/one-nation-divided.module.css';

type ProseSectionProps = {
  label: string;
  title: string;
  headingId: string;
  children: ReactNode;
};

export function ProseSection({ label, title, headingId, children }: ProseSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <p className={styles.sectionLabel}>{label}</p>
      <h2 id={headingId} className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </section>
  );
}
