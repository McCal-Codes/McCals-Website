import { Link } from 'react-router-dom';
import { ACTIVITY } from '@/content/activity';
import { NOTES } from '@/content/notes';
import { PROJECTS } from '@/content/projects';
import { WEBSITES } from '@/content/websites';
import { SITE } from '@/content/site';
import IndexRow from '@/components/IndexRow';
import WebsiteCard from '@/components/WebsiteCard';
import NoteCard from '@/components/NoteCard';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './HomePage.module.css';

export default function HomePage() {
  useDocumentMeta(SITE.name, SITE.intro);

  return (
    <>
      <section className={`${styles.intro} grid-backdrop`}>
        <div className="shell">
          <p className={`${styles.eyebrow} meta`}>{SITE.person}</p>

          <h1 className={styles.display}>{SITE.headline}</h1>

          <p className={styles.lede}>{SITE.intro}</p>

          <p className={styles.focus}>{SITE.focus}</p>

          <div className={styles.actions}>
            <a className={styles.primary} href="#index">
              See what I have built
            </a>
            <a
              className={styles.secondary}
              href={SITE.github}
              rel="noreferrer"
              target="_blank"
            >
              GitHub<span aria-hidden="true"> ↗</span>
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="index-heading" className={styles.index} id="index">
        <div className="shell">
          <div className={styles.indexHead}>
            <h2 className={styles.sectionHeading} id="index-heading">
              What I am building
            </h2>
            <p className={styles.sectionNote}>
              My own projects, in the order I started them. Each has a write-up when
              there is something worth writing.
            </p>
          </div>

          <div className={styles.rows}>
            {PROJECTS.map((project) => (
              <IndexRow key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="websites-heading" className={styles.websites} id="websites">
        <div className="shell">
          <div className={styles.indexHead}>
            <h2 className={styles.sectionHeading} id="websites-heading">
              Sites I have built for other people
            </h2>
            <p className={styles.sectionNote}>
              Client and commission work. Some have source to read, some do not.
              What matters is that they are live.
            </p>
          </div>

          <div className={styles.siteGrid}>
            {WEBSITES.map((site) => (
              <WebsiteCard key={site.slug} site={site} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="currently-heading" className={styles.currently}>
        <div className="shell">
          <h2 className={`${styles.blockHeading} meta`} id="currently-heading">
            What I am working on right now
          </h2>

          <ul className={styles.activity}>
            {ACTIVITY.map((entry) => (
              <li className={styles.activityItem} key={entry.slug}>
                <Link className={styles.activityProject} to={`/projects/${entry.slug}`}>
                  {entry.project}
                </Link>
                <p className={styles.activityDetail}>{entry.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="notes-heading" className={styles.notes}>
        <div className="shell">
          <div className={styles.notesHead}>
            <h2 className={`${styles.blockHeading} meta`} id="notes-heading">
              Build notes
            </h2>
            <Link className={`${styles.allNotes} meta`} to="/notes">
              All notes<span aria-hidden="true"> →</span>
            </Link>
          </div>

          <div className={styles.noteList}>
            {NOTES.slice(0, 3).map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
