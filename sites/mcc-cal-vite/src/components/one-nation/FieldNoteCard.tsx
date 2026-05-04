import styles from '@/pages/one-nation-divided.module.css';

type FieldNoteCardProps = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  credit?: string;
};

export function FieldNoteCard({ id, kicker, title, body, credit }: FieldNoteCardProps) {
  return (
    <article 
      key={id} 
      className={styles.fieldNoteCard}
      aria-labelledby={`${id}-title`}
    >
      <p className={styles.fieldNoteKicker}>{kicker}</p>
      <h3 id={`${id}-title`} className={styles.fieldNoteCardTitle}>{title}</h3>
      {body.map((p, i) => (
        <p key={`${id}-${i}`} className={styles.fieldNoteBody}>
          {p}
        </p>
      ))}
      {credit && (
        <p className={styles.fieldNoteCredit}>{credit}</p>
      )}
    </article>
  );
}
