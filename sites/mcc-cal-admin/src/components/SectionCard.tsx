import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export default function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="section-card">
      {eyebrow ? <p className="section-card__eyebrow">{eyebrow}</p> : null}
      <h2 className="section-card__title">{title}</h2>
      <div className="section-card__body">{children}</div>
    </section>
  );
}
