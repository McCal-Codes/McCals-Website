import { Link, Navigate, useParams } from 'react-router-dom';
import { getProject } from '@/content/projects';
import { formatDate, getRepo } from '@/content/github';
import type { CaseStudySection } from '@/content/types';
import AnnotatedShot from '@/components/AnnotatedShot';
import BetaCallout from '@/components/BetaCallout';
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

function SectionBody({ section, slug }: { section: CaseStudySection; slug: string }) {
  const repo = getRepo(slug);
  // A releases section renders the repository's published releases. There is no
  // hand-written fallback on purpose: if nothing shipped, the section says so.
  const releases = section.kind === 'releases' ? (repo?.releases ?? []) : [];

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

      {section.kind === 'releases' &&
        (releases.length > 0 ? (
          <ul className={styles.releases}>
            {releases.map((release) => (
              <li className={styles.release} key={release.tag}>
                <a
                  className={`${styles.releaseVersion} meta`}
                  href={release.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {release.tag}
                  <span aria-hidden="true"> ↗</span>
                </a>
                <span className={`${styles.releaseDate} meta`}>{formatDate(release.date)}</span>
                {release.prerelease && (
                  <span className={`${styles.releaseTag} meta`}>Pre-release</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${styles.empty} meta`}>No published releases yet</p>
        ))}
    </>
  );
}

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProject(slug) : undefined;
  const repo = project ? getRepo(project.slug) : undefined;
  const stack = [
    ...(repo?.languages.map((language) => language.name) ?? []),
    ...(project?.meta.frameworks ?? []),
  ];

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
                <StatusMarker slug={project.slug} status={project.status} />
                {stack.length > 0 && <p className={`${styles.stack} meta`}>{stack.join(' / ')}</p>}
              </div>

              <VersionBadge
                updated={repo ? formatDate(repo.pushedAt) : undefined}
                version={repo?.latestRelease?.tag}
              />
            </div>

            <div className={styles.previewCell}>
              <PreviewFrame label={`${project.title} preview`} shot={project.preview} />
            </div>
          </div>

          <div className={styles.metaBlock}>
            <MetaTable project={project} />
          </div>

          {project.beta && (
            <div className={styles.betaBlock}>
              <BetaCallout beta={project.beta} slug={project.slug} title={project.title} />
            </div>
          )}
        </div>
      </header>

      <SectionNav repoHref={repo?.url} sections={project.sections} title={project.title} />

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
              <SectionBody section={section} slug={project.slug} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
