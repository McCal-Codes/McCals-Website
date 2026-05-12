import { useState, useEffect } from 'react';
import styles from '@/pages/one-nation-divided.module.css';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export function TableOfContents() {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from the page
    const headings = document.querySelectorAll('h2[id], h3[id]');
    const items: TOCItem[] = Array.from(headings).map(heading => ({
      id: heading.id,
      title: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
    }));
    setTocItems(items);

    // Guard against SSR and ensure headings exist
    if (typeof window === 'undefined' || headings.length === 0) return;

    // Set up intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach(heading => observer.observe(heading));

    return () => {
      headings.forEach(heading => observer.unobserve(heading));
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <nav className={styles.tableOfContents} aria-label="Table of contents">
      <h3 className={styles.tocTitle}>Contents</h3>
      <ul className={styles.tocList}>
        {tocItems.map(item => (
          <li
            key={item.id}
            className={`${styles.tocItem} ${styles[`tocLevel${item.level}`]} ${
              activeId === item.id ? styles.tocActive : ''
            }`}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.id);
              }}
              className={styles.tocLink}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
