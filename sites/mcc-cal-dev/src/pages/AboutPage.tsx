import { SITE } from '@/content/site';
import Prose from '@/components/Prose';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './PageShell.module.css';

export default function AboutPage() {
  useDocumentMeta(
    'About',
    'Caleb McCartney builds open-source applications and development tools, and works as an editorial photographer.',
  );

  return (
    <>
      <header className={`${styles.header} grid-backdrop`}>
        <div className="shell">
          <p className={`${styles.eyebrow} meta`}>About</p>
          <h1 className={styles.title}>{SITE.person}</h1>
        </div>
      </header>

      <div className={`${styles.body} shell`}>
        <Prose
          paragraphs={[
            'I build software for creative and technical work: desktop tooling, mobile applications, and the systems that sit underneath them. Most of it starts because a workflow I depend on is worse than it needs to be.',
            'The projects here are real and in progress. Where something is a prototype, it says prototype. Where a case study has not been written, the index says so rather than linking to a page of filler.',
            'I also work as an editorial photographer. That work lives on a separate site, because it is a different medium and deserves a different system.',
          ]}
        />

        <div className={styles.links}>
          <a className={styles.link} href={SITE.github} rel="noreferrer" target="_blank">
            GitHub<span aria-hidden="true"> ↗</span>
          </a>
          <a className={styles.link} href={SITE.portfolio} rel="noreferrer" target="_blank">
            Photography portfolio<span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </div>
    </>
  );
}
