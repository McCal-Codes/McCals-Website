import type { BuildNote } from '@/content/types';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: BuildNote;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <time className={`${styles.date} meta`} dateTime={note.date}>
          {formatDate(note.date)}
        </time>
        {note.project && <span className={`${styles.project} meta`}>{note.project}</span>}
      </div>

      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.hook}>{note.hook}</p>
    </article>
  );
}
