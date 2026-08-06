import { Layout } from '@/components';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ArrowRight } from 'lucide-react';
import styles from './projects.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const PROJECTS = [
  {
    to: '/letting-me-go',
    label: 'Exhibition',
    title: 'Letting Me Go',
    desc: 'BFA thesis work on campaign-trail photography, political anxiety, shadow, and polarization.',
  },
];

// Software work moved to its own publication at dev.mcc-cal.com. These are external.
const DEV_PROJECTS = [
  {
    href: 'https://dev.mcc-cal.com/projects/terranova',
    label: 'Tooling',
    title: 'TerraNova',
    desc: 'A terrain generation studio for Hytale, focused on procedural systems and creator tooling.',
  },
  {
    href: 'https://dev.mcc-cal.com/roadmap',
    label: 'Notes',
    title: 'Roadmap',
    desc: 'A public view of what is being built, refined, and considered next across development projects.',
  },
];

const ProjectsPage = () => {
  usePageMeta({
    title: 'Projects | Caleb McCartney',
    description:
      'Artwork, tools, apps, and design work by Caleb McCartney, including Letting Me Go, TerraNova, and the site roadmap.',
    canonical: `${SITE_URL}/projects`,
    og: {
      type: 'website',
      title: 'Projects | Caleb McCartney',
      description: 'Artwork, tools, apps, and design work by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Projects | Caleb McCartney',
      description: 'Artwork, tools, apps, and design work by Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Projects',
      description: 'Artwork, tools, apps, and design work by Caleb McCartney.',
      url: `${SITE_URL}/projects`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'McCal Media',
        url: SITE_URL,
      },
    },
  });

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Projects</p>
          <h1>Artwork, tools, and experiments.</h1>
          <p>
            A small index of public work outside the main photography galleries, including thesis
            projects, creator tooling, and notes on what is being built next.
          </p>
        </header>

        <section className={styles.projectList} aria-label="Project index">
          {PROJECTS.map((project) => (
            <Link className={styles.projectLink} key={project.to} to={project.to}>
              <span className={styles.projectLabel}>{project.label}</span>
              <span className={styles.projectText}>
                <span className={styles.projectTitle}>{project.title}</span>
                <span className={styles.projectDescription}>{project.desc}</span>
              </span>
              <span className={styles.projectArrow} aria-hidden="true">
                <ArrowRight size={18} strokeWidth={1.8} />
              </span>
            </Link>
          ))}
        </section>

        <section className={styles.projectList} aria-label="Development projects">
          {DEV_PROJECTS.map((project) => (
            <a
              className={styles.projectLink}
              key={project.href}
              href={project.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.projectLabel}>{project.label}</span>
              <span className={styles.projectText}>
                <span className={styles.projectTitle}>{project.title}</span>
                <span className={styles.projectDescription}>{project.desc}</span>
              </span>
              <span className={styles.projectArrow} aria-hidden="true">
                <ArrowRight size={18} strokeWidth={1.8} />
              </span>
            </a>
          ))}
        </section>

        <aside className={styles.note}>
          <p>
            Software projects, build notes, and development history live on the technical site at{' '}
            <a href="https://dev.mcc-cal.com" target="_blank" rel="noreferrer">
              dev.mcc-cal.com
            </a>
            .
          </p>
          <p>
            Looking for photography work instead? Start with the curated portfolio or request a
            quote for a specific assignment.
          </p>
          <div className={styles.noteLinks}>
            <Link to="/featured-work">Featured work</Link>
            <Link to="/request-a-quote">Request a quote</Link>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
