import { ROADMAP } from '@/content/roadmap';
import Timeline from '@/components/Timeline';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './PageShell.module.css';

export default function RoadmapPage() {
  useDocumentMeta(
    'Roadmap',
    'What has shipped, what is being worked on now, and what is queued next across McCal development projects.',
  );

  return (
    <>
      <header className={`${styles.header} grid-backdrop`}>
        <div className="shell">
          <p className={`${styles.eyebrow} meta`}>Roadmap</p>
          <h1 className={styles.title}>What is shipped, active, and queued.</h1>
          <p className={styles.lede}>
            A working view of development across projects. Dates on queued work are
            intentionally absent, because they would be guesses.
          </p>
        </div>
      </header>

      <div className="shell">
        {ROADMAP.map((group) => (
          <section
            aria-labelledby={`${group.id}-heading`}
            className={styles.section}
            id={group.id}
            key={group.id}
          >
            <div className={styles.sectionAside}>
              <h2 className={`${styles.sectionHeading} meta`} id={`${group.id}-heading`}>
                {group.label}
              </h2>
              <p className={styles.sectionSummary}>{group.summary}</p>
            </div>

            <div className={styles.sectionBody}>
              <Timeline entries={group.entries} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
