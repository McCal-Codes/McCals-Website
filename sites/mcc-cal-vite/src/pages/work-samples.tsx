import { useEffect } from 'react';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { workSampleSections } from '@/content/workSamples';
import styles from './work-samples.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const essaySections = workSampleSections.filter((section) => section.layout === 'stack');
const photoSections = workSampleSections.filter((section) => section.layout !== 'stack');

// Open the essay a link points to, so #essay and the cover cards land on visible photos.
const openEssayFromHash = () => {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
    target.scrollIntoView();
  }
};

const WorkSamplesPage = () => {
  usePageMeta({
    title: 'Photojournalism Work Samples | Caleb McCartney',
    description:
      'Selected photojournalism by Caleb McCartney, 2024 to 2026: news, features, civic life and sports in western Pennsylvania.',
    canonical: `${SITE_URL}/work-samples`,
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    openEssayFromHash();
    window.addEventListener('hashchange', openEssayFromHash);
    return () => window.removeEventListener('hashchange', openEssayFromHash);
  }, []);

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Work samples</p>
          <h1>Photojournalism, 2024 to 2026.</h1>
          <p>
            I&apos;m a photojournalist in Pittsburgh. I cover politics, public affairs, community news
            and sports. My photographs have run in TribLive, the New York Post and Pittsburgh
            Magazine, among others, and I freelance for TribLive and the Butler Eagle and Cranberry
            Eagle.
          </p>
          <div className={styles.links}>
            <a href="/downloads/caleb-mccartney-resume-photojournalism.pdf">Resume (PDF)</a>
            <a href="/downloads/caleb-mccartney-portfolio.pdf">Portfolio with captions (PDF)</a>
            <a href="#essay">Photo essays</a>
            <a href="mailto:contact@mcc-cal.com">contact@mcc-cal.com</a>
          </div>
        </header>

        <nav className={styles.index} aria-label="Sections">
          {workSampleSections.map((section) => {
            const cover = section.items[section.cover] ?? section.items[0];
            return (
              <a className={styles.card} href={`#${section.id}`} key={section.id}>
                <img src={cover.src} width={cover.width} height={cover.height} alt="" />
                <span>{section.short}</span>
              </a>
            );
          })}
        </nav>

        {photoSections.map((section) => (
          <section className={styles.section} id={section.id} key={section.id}>
            <header className={styles.sectionHeader}>
              <h2>{section.title}</h2>
              <p>{section.blurb}</p>
            </header>
            <div className={styles.grid}>
              {section.items.map((image) => (
                <figure className={styles.figure} key={image.src}>
                  <img
                    src={image.src}
                    width={image.width}
                    height={image.height}
                    alt={image.caption}
                    decoding="async"
                  />
                  <figcaption>
                    {image.caption}
                    <span className={styles.credit}>{image.credit}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}

        {essaySections.map((section) => (
          <details className={styles.essay} id={section.id} key={section.id}>
            <summary className={styles.essaySummary}>
              <span className={styles.essayTitle}>{section.title}</span>
              <span className={styles.essayMeta}>{section.items.length} photos. Tap to read.</span>
            </summary>
            <p className={styles.essayBlurb}>{section.blurb}</p>
            <div className={styles.stack}>
              {section.items.map((image) => (
                <figure className={styles.figure} key={image.src}>
                  <img
                    src={image.src}
                    width={image.width}
                    height={image.height}
                    alt={image.caption}
                    decoding="async"
                  />
                  <figcaption>
                    {image.caption}
                    <span className={styles.credit}>{image.credit}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </details>
        ))}

        <footer className={styles.footer}>
          All photographs are mine. Please contact me before reproducing any image.
        </footer>
      </div>
    </Layout>
  );
};

export default WorkSamplesPage;
