import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { workSampleSections } from '@/content/workSamples';
import styles from './work-samples.module.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

// The order is the edit: open on the rope line, alternate loud and quiet frames,
// close on the embrace. Files are the same ones /work-samples serves.
const SEQUENCE = [
  'news-11',
  'news-03',
  'news-07',
  'sports-03',
  'news-10',
  'spot-03',
  'news-08',
  'civic-07',
  'news-02',
  'sports-01',
  'news-09',
  'people-07',
  'civic-02',
  'sports-06',
  'boyd-09',
  'boyd-07',
  'healing-08',
];

const byName = new Map(
  workSampleSections.flatMap((section) =>
    section.items.map((item) => [item.src.split('/').pop()?.replace('.jpg', '') ?? '', item] as const)
  )
);

const selected = SEQUENCE.flatMap((name) => {
  const item = byName.get(name);
  return item ? [item] : [];
});

const SelectedWorkPage = () => {
  usePageMeta({
    title: 'Selected Photojournalism | Caleb McCartney',
    description: 'Seventeen selected photographs by Caleb McCartney, 2024 to 2026.',
    canonical: `${SITE_URL}/selected-work`,
    robots: 'noindex, nofollow',
  });

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Selected work</p>
          <h1>Seventeen photographs, 2024 to 2026.</h1>
          <p>
            I&apos;m a photojournalist in Pittsburgh. I cover politics, public affairs, community news
            and sports. I freelance for TribLive and the Butler Eagle and Cranberry Eagle.
          </p>
          <div className={styles.links}>
            <a href="/downloads/caleb-mccartney-resume-photojournalism.pdf">Resume (PDF)</a>
            <a href="/work-samples#essay">Photo essays</a>
            <a href="https://www.instagram.com/mcc_cal" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://www.linkedin.com/in/caleb-mccartney/" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="mailto:contact@mcc-cal.com">contact@mcc-cal.com</a>
          </div>
        </header>

        <section className={styles.section} aria-label="Selected photographs">
          <div className={styles.stack}>
            {selected.map((image) => (
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

        <footer className={styles.footer}>
          All photographs are mine. Please contact me before reproducing any image.
        </footer>
      </div>
    </Layout>
  );
};

export default SelectedWorkPage;
