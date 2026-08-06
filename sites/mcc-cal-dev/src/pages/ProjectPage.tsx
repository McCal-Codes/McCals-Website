import { Link, Navigate, useParams } from 'react-router-dom';
import { getProject } from '@/content/projects';
import type { CaseStudySection } from '@/content/types';
import AnnotatedShot from '@/components/AnnotatedShot';
import Diagram from '@/components/Diagram';
import MetaTable from '@/components/MetaTable';
import PreviewFrame from '@/components/PreviewFrame';
import Prose from '@/components/Prose';
import SectionNav from '@/components/SectionNav';
import StatusMarker from '@/components/StatusMarker';
import Timeline from '@/components/Timeline';
import VersionBadge from '@/components/VersionBadge';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './ProjectPage.module.css';

function SectionBody({ section }: { section: CaseStudySection }) {
  return (
    <>
      {section.body && <Prose paragraphs={section.body} />}

      {section.kind === 'list' && section.items && (
        <ul className={styles.list}>
          {section.items.map((item) => (
            <li className={styles.listItem} key={item.slice(0, 48)}>
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.kind === 'diagram' && section.diagram && <Diagram spec={section.diagram} />}

      {section.kind === 'shots' &&
        section.shots?.map((shot) => <AnnotatedShot key={shot.alt} shot={shot} />)}

      {section.kind === 'timeline' && section.timeline && (
        <Timeline entries={section.timeline} />
      )}

      {section.kind === 'releases' && section.releases && (
        <ul className={styles.releases}>
          {section.releases.map((release) => (
            <li className={styles.release} key={release.version}>
              <span className={`${styles.releaseVersion} meta`}>{release.version}</span>
              <span className={`${styles.releaseDate} meta`}>{release.date}</span>
              <p className={styles.releaseSummary}>{release.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProject(slug) : undefined;

  useDocumentMeta(project ? project.title : 'Not found', project?.purpose);

  // A project without a case study has no page. The index row does not link here,
  // so reaching this state means a hand-typed URL.
  if (!project || project.sections.length === 0) {
    return <Navigate replace to="/" />;
  }

  return (
    <article>
      <header className={`${styles.header} grid-backdrop`}>
        <div className="shell">
          <p className={`${styles.crumb} meta`}>
            <Link className={styles.crumbLink} to="/#index">
              Index
            </Link>
            <span aria-hidden="true"> / </span>
            {project.index}
          </p>

          <div className={styles.headGrid}>
            <div>
              <h1 className={styles.title}>{project.title}</h1>
              <p className={styles.purpose}>{project.purpose}</p>

              <div className={styles.facts}>
                <StatusMarker status={project.status} />
                <p className={`${styles.stack} meta`}>{project.stack.join(' / ')}</p>
              </div>

              <VersionBadge
                build={project.build}
                updated={project.updated}
                version={project.version}
              />
            </div>

            <div className={styles.previewCell}>
              <PreviewFrame label={`${project.title} preview`} shot={project.preview} />
            </div>
          </div>

          <div className={styles.metaBlock}>
            <MetaTable project={project} />
          </div>
        </div>
      </header>

      <SectionNav
        repoHref={project.meta.repo?.href}
        sections={project.sections}
        title={project.title}
      />

      <div className="shell">
        {project.sections.map((section, i) => (
          <section
            aria-labelledby={`${section.id}-heading`}
            className={styles.section}
            id={section.id}
            key={section.id}
          >
            <div className={styles.sectionHead}>
              <p className={`${styles.sectionIndex} meta`}>
                {String(i + 1).padStart(2, '0')}
              </p>
              <h2 className={styles.sectionHeading} id={`${section.id}-heading`}>
                {section.heading ?? section.label}
              </h2>
            </div>

            <div className={styles.sectionBody}>
              <SectionBody section={section} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
