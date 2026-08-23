import { SITE } from '@/content/site';
import Prose from '@/components/Prose';
import { useDocumentMeta } from '@/lib/useDocumentTitle';
import styles from './PageShell.module.css';

export default function AboutPage() {
  useDocumentMeta(
    'About',
    'I learn how to do it, then I apply those lessons learned. Careful persistence, across code, photography, and whatever trade comes next.',
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
            'I build because if it exists, I want to edit it or make it my own. That comes from my creative side. Once I hopped into programming it opened so many new avenues to get what I want, or at least customize it. And who knows, help people too.',
            'Open source is seriously slept on.',
            'I do not want to charge for any of these projects, though I am happy to accept tips.',
            'Anyone who is interested is welcome here. I do not discriminate when it comes to our collective interests.',
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
          {SITE.kofi && (
            <a className={styles.link} href={SITE.kofi} rel="noreferrer" target="_blank">
              Tips on Ko-fi<span aria-hidden="true"> ↗</span>
            </a>
          )}
        </div>
      </div>
    </>
  );
}
