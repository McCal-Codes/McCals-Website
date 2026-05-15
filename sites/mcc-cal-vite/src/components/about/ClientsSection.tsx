import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clients, getClientLink, type Client } from './aboutData';
import styles from './about-sections.module.css';

interface ClientsSectionProps {
  className?: string;
  // Number of times to duplicate the client list for seamless loop
  duplicates?: number;
  // Optional: specific clients to show (defaults to all)
  clientList?: Client[];
  // Optional: shuffle order on each render
  shuffle?: boolean;
  // Optional: scroll duration in seconds (desktop)
  scrollDuration?: number;
}

interface ClientCardProps {
  client: Client;
  isDuplicate?: boolean;
  index: number;
}

function getStableShuffleScore(client: Client): number {
  return [...client.id].reduce((score, character) => (
    (score * 31 + character.charCodeAt(0)) % 100000
  ), 7);
}

function ClientCard({ client, isDuplicate, index }: ClientCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get link - randomizes if multiple publications exist
  const linkUrl = useMemo(() => getClientLink(client), [client]);
  const hasLink = linkUrl && linkUrl !== '#';
  
  // Determine if external link
  const isExternal = hasLink && !linkUrl.startsWith('/');
  
  const cardContent = (
    <>
      <div className={`${styles.clientImageWrapper} ${imageLoaded ? styles.loaded : ''}`}>
        {!imageError ? (
          <img
            src={client.src}
            alt={isDuplicate ? '' : client.alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={styles.clientFallback}>{client.name.charAt(0)}</span>
        )}
      </div>
    </>
  );

  // Wrapper with appropriate link behavior
  const cardClasses = `${styles.clientCard} ${hasLink ? styles.clickable : ''}`;
  
  if (!hasLink) {
    return (
      <li
        key={`${client.id}-${index}`}
        className={cardClasses}
        aria-hidden={isDuplicate || undefined}
        title={client.name}
      >
        {cardContent}
      </li>
    );
  }

  if (isExternal) {
    return (
      <li
        key={`${client.id}-${index}`}
        className={cardClasses}
        aria-hidden={isDuplicate || undefined}
      >
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.clientLink}
          title={`View work with ${client.name} ↗`}
          aria-label={`View published work with ${client.name} (opens in new tab)`}
        >
          {cardContent}
          <span className={styles.externalIndicator} aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path d="M8.5 2.5a.5.5 0 0 0-1 0v5.793L5.354 6.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 8.293V2.5z"/>
              <path d="M3.5 3.5a.5.5 0 0 0-1 0v8a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-1 0v7.5H4V3.5h-.5z"/>
            </svg>
          </span>
        </a>
      </li>
    );
  }

  return (
    <li
      key={`${client.id}-${index}`}
      className={cardClasses}
      aria-hidden={isDuplicate || undefined}
    >
      <Link
        to={linkUrl}
        className={styles.clientLink}
        title={`View work with ${client.name}`}
        aria-label={`View published work with ${client.name}`}
      >
        {cardContent}
      </Link>
    </li>
  );
}

export function ClientsSection({
  className = '',
  duplicates = 3,
  clientList,
  shuffle = false,
  scrollDuration = 30
}: ClientsSectionProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayClients = useMemo(() => {
    const list = clientList || clients;
    if (shuffle) {
      return [...list].sort((a, b) => getStableShuffleScore(a) - getStableShuffleScore(b));
    }
    return list;
  }, [clientList, shuffle]);

  // Create duplicated list for seamless infinite scroll (desktop only)
  const carouselItems = useMemo(() => {
    if (isMobile) return displayClients.map((client, i) => ({ client, index: i, isDuplicate: false }));
    const items: { client: Client; index: number; isDuplicate: boolean }[] = [];
    for (let d = 0; d < duplicates; d++) {
      displayClients.forEach((client, i) => {
        items.push({
          client,
          index: d * displayClients.length + i,
          isDuplicate: d > 0,
        });
      });
    }
    return items;
  }, [displayClients, duplicates, isMobile]);

  // Calculate scroll distance dynamically based on track content
  useEffect(() => {
    if (isMobile || !trackRef.current) return;

    const calculateScrollDistance = () => {
      const track = trackRef.current;
      if (!track) return;

      // Get the width of a single set of clients (one full cycle)
      const firstSetWidth = (track.children[0] as HTMLElement)?.offsetWidth || 0;
      const gap = 18; // Match CSS gap
      const clientCount = displayClients.length;
      
      // Calculate total width of one complete cycle
      const singleCycleWidth = (firstSetWidth + gap) * clientCount;
      
      setScrollDistance(singleCycleWidth);
    };

    calculateScrollDistance();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateScrollDistance);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [displayClients.length, isMobile]);

  // Update CSS custom properties
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.setProperty('--scroll-distance', scrollDistance > 0 ? `-${scrollDistance}px` : '-1696px');
      trackRef.current.style.setProperty('--scroll-duration', `${scrollDuration}s`);
    }
  }, [scrollDistance, scrollDuration]);

  // Show limited items on mobile when collapsed
  const visibleClients = isMobile && !isExpanded 
    ? carouselItems.slice(0, 4) 
    : carouselItems;

  return (
    <section className={`${styles.clients} ${className}`} aria-labelledby="clients-heading">
      <div className={`${styles.sectionHeading} ${styles.centered}`}>
        <p className={styles.eyebrow}>Trusted by leading brands</p>
        <h2 id="clients-heading">Editorial, academic, nonprofit, and brand partners.</h2>
        <p className={styles.clientsSubtitle}>
          Click any logo to view published work. Multiple publications are randomly selected.
        </p>
      </div>

      {/* Mobile: Expandable grid */}
      {isMobile ? (
        <>
          <ul className={`${styles.clientsGrid} ${isExpanded ? styles.expanded : ''}`} aria-label="Client logos">
            {visibleClients.map(({ client, index }) => (
              <ClientCard
                key={`${client.id}-${index}`}
                client={client}
                index={index}
                isDuplicate={false}
              />
            ))}
          </ul>
          {carouselItems.length > 4 && (
            <button 
              className={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show less' : `Show all ${carouselItems.length} clients`}
              <svg 
                className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d={isExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
              </svg>
            </button>
          )}
        </>
      ) : (
        /* Desktop: Carousel */
        <div className={styles.clientCarousel} aria-label="Client logo carousel">
          <ul 
            ref={trackRef}
            className={styles.clientTrack}
          >
            {carouselItems.map(({ client, index, isDuplicate }) => (
              <ClientCard
                key={`${client.id}-${index}`}
                client={client}
                index={index}
                isDuplicate={isDuplicate}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Stats section */}
      <div className={`${styles.stats} ${styles.statsClients}`} aria-label="Business stats">
        <div className={styles.stat}>
          <strong>30+</strong>
          <span>Happy clients</span>
        </div>
        <div className={styles.stat}>
          <strong>65+</strong>
          <span>Projects</span>
        </div>
        <div className={styles.stat}>
          <strong>6+</strong>
          <span>Years experience</span>
        </div>
      </div>

      <div className={styles.clientsFooter}>
        <Link to="/request-a-quote" className={`${styles.actionButton} ${styles.actionPrimary}`}>
          Start a project
        </Link>
        <Link to="/featured-work" className={styles.actionButton}>
          Explore featured work
        </Link>
      </div>
    </section>
  );
}

// Sub-components for category-specific displays
export function EditorialClients(props: Omit<ClientsSectionProps, 'clientList'>) {
  const editorialClients = useMemo(() => clients.filter(c => c.category === 'editorial'), []);
  return <ClientsSection {...props} clientList={editorialClients} />;
}

export function AcademicClients(props: Omit<ClientsSectionProps, 'clientList'>) {
  const academicClients = useMemo(() => clients.filter(c => c.category === 'academic'), []);
  return <ClientsSection {...props} clientList={academicClients} />;
}

export function NonprofitClients(props: Omit<ClientsSectionProps, 'clientList'>) {
  const nonprofitClients = useMemo(() => clients.filter(c => c.category === 'nonprofit'), []);
  return <ClientsSection {...props} clientList={nonprofitClients} />;
}

export function BrandClients(props: Omit<ClientsSectionProps, 'clientList'>) {
  const brandClients = useMemo(() => clients.filter(c => c.category === 'brand'), []);
  return <ClientsSection {...props} clientList={brandClients} />;
}
