import styles from './Prose.module.css';

interface ProseProps {
  paragraphs: string[];
}

/** Body copy, constrained to a readable measure. */
export default function Prose({ paragraphs }: ProseProps) {
  return (
    <div className={styles.prose}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}
