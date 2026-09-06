import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  /** Kicker rendered above the title. */
  eyebrow?: string;
  /** Supporting line rendered below the title. */
  subtitle?: string;
  children: ReactNode;
}

export default function SectionCard({ title, eyebrow, subtitle, children }: SectionCardProps) {
  return (
    <section className="section-card">
      {eyebrow ? <p className="section-card__eyebrow">{eyebrow}</p> : null}
      <h2 className="section-card__title">{title}</h2>
      {subtitle ? <p className="section-card__subtitle">{subtitle}</p> : null}
      <div className="section-card__body">{children}</div>
    </section>
  );
}
