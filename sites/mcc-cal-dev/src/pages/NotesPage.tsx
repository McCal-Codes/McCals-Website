import { NOTES } from '@/content/notes';
import NoteCard from '@/components/NoteCard';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './PageShell.module.css';

export default function NotesPage() {
  useDocumentMeta(
    'Build notes',
    'Notes on decisions made while building TerraNova, Abridgd, and other development projects.',
  );

  return (
    <>
      <header className={`${styles.header} grid-backdrop`}>
        <div className="shell">
          <p className={`${styles.eyebrow} meta`}>Build notes</p>
          <h1 className={styles.title}>Decisions, and why they went that way.</h1>
          <p className={styles.lede}>
            A note earns its place by explaining a decision, not by announcing that work
            happened.
          </p>
        </div>
      </header>

      <div className={`${styles.body} shell`}>
        {NOTES.length > 0 ? (
          NOTES.map((note) => <NoteCard key={note.slug} note={note} />)
        ) : (
          <p className="meta">No notes published yet</p>
        )}
      </div>
    </>
  );
}
