import { Link } from 'react-router-dom';
import type { Project } from '@/content/types';
import { getRepo } from '@/content/github';
import StatusMarker from './StatusMarker';
import PreviewFrame from './PreviewFrame';
import styles from './IndexRow.module.css';

interface IndexRowProps {
  project: Project;
}

/**
 * A full-width project row. The index number does the ordering work that a card
 * grid would otherwise do with boxes.
 *
 * Reading order is product first: what it is, then what it does for you, then the
 * technical facts underneath. The metadata is support, not the headline.
 *
 * A project without a case study renders the same row without the link, rather
 * than linking to a page of filler.
 */
export default function IndexRow({ project }: IndexRowProps) {
  const hasCaseStudy = project.sections.length > 0;
  const headingId = `project-${project.slug}`;
  const repo = getRepo(project.slug);

  // Measured languages first, then frameworks the language stats cannot see.
  const stack = [
    ...(repo?.languages.map((language) => language.name) ?? []),
    ...(project.meta.frameworks ?? []),
  ];

  return (
    <article className={styles.row} aria-labelledby={headingId}>
      <div className={`${styles.body} ${project.preview ? '' : styles.bodyTextOnly}`}>
        <div className={styles.text}>
          <p className={`${styles.index} meta`}>
            {project.index}
            {project.audience && (
              <>
                <span aria-hidden="true" className={styles.indexSep} />
                <span className={styles.audience}>{project.audience}</span>
              </>
            )}
          </p>

          <h3 className={styles.title} id={headingId}>
            {project.title}
          </h3>

          <p className={styles.pitch}>{project.pitch ?? project.purpose}</p>

          {hasCaseStudy ? (
            <Link className={styles.cta} to={`/projects/${project.slug}`}>
              How it works
              <span aria-hidden="true" className={styles.arrow}>
                →
              </span>
            </Link>
          ) : (
            <p className={`${styles.pending} meta`}>Write-up in progress</p>
          )}

          <div className={styles.facts}>
            <StatusMarker status={project.status} />
            {stack.length > 0 && (
              <p className={`${styles.stack} meta`}>{stack.join(' / ')}</p>
            )}
          </div>
        </div>

        <div className={styles.previewCell}>
          <PreviewFrame
            label={`${project.title} preview`}
            ratio="16 / 10"
            shot={project.preview}
          />
        </div>
      </div>
    </article>
  );
}
