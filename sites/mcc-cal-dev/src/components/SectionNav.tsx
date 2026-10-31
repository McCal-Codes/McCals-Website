import { useEffect, useRef, useState } from 'react';
import type { CaseStudySection } from '@/content/types';
import styles from './SectionNav.module.css';

interface SectionNavProps {
  sections: CaseStudySection[];
  /** Rendered first, before the section links. Usually the project name. */
  title: string;
  repoHref?: string;
}

/**
 * The project command bar. A real navigational pattern, sticky under the header.
 *
 * Scrollspy uses IntersectionObserver against a band near the top of the viewport,
 * so the active entry tracks the section you are reading rather than the one that
 * happens to be centered.
 */
export default function SectionNav({ sections, title, repoHref }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  /**
   * Which sections are currently in the observation band.
   *
   * An IntersectionObserver callback only reports sections whose state *changed*,
   * so reading the callback's entries alone goes stale as soon as one scroll
   * batches several changes together (a jump to an anchor does exactly that).
   * Accumulating into a set and re-deriving the topmost each time is correct
   * regardless of how the changes arrive.
   */
  const intersecting = useRef(new Set<string>());

  useEffect(() => {
    const ids = sections.map((section) => section.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const seen = intersecting.current;
    seen.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }

        // Topmost section in the band wins. Fall back to the last section above
        // the band so the bar never blanks out between sections.
        const topmost = ids.find((id) => seen.has(id));
        if (topmost) {
          setActiveId(topmost);
          return;
        }

        const passed = elements.filter((el) => el.getBoundingClientRect().top < 120);
        const last = passed[passed.length - 1];
        setActiveId(last ? last.id : ids[0]);
      },
      // A band from just under the sticky bar down to 55% of the viewport.
      { rootMargin: '-120px 0px -45% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      seen.clear();
    };
  }, [sections]);

  return (
    <nav aria-label="Project sections" className={styles.bar}>
      <div className={`${styles.inner} shell`}>
        <p className={`${styles.title} meta`}>{title}</p>

        <ul className={`${styles.links} scroll-x`}>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                aria-current={activeId === section.id ? 'location' : undefined}
                className={`${styles.link} meta`}
                href={`#${section.id}`}
              >
                {section.label}
              </a>
            </li>
          ))}

          {repoHref && (
            <li>
              <a
                className={`${styles.link} ${styles.external} meta`}
                href={repoHref}
                rel="noreferrer"
                target="_blank"
              >
                Repository<span aria-hidden="true"> ↗</span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
