import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { useManifest, imageUrl } from '@/components/portfolio/useManifest';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { useMemo, useState } from 'react';
import '@/components/portfolio/portfolio.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

interface EventItem {
  title?: string;
  eventName: string;
  category?: string;
  dateDisplay?: string;
  dateISO?: string;
  folderPath?: string;
  images: { path: string }[];
}

interface EventsManifest {
  items: EventItem[];
}


function adaptEvents(manifest: EventsManifest): PortfolioGroup[] {
  return manifest.items.map((item) => {
    const name = item.title ?? item.eventName;
    const images = item.images.map((img, i) => {
      const filename = img.path.split('/').pop() ?? `image-${i}`;
      // Extract photo number from filename (e.g., CAL753 from PGH Social Club at Avalon_CAL753_webuse.jpg)
      const photoMatch = filename.match(/CAL(\d+)/);
      const photoNum = photoMatch ? ` #${photoMatch[1]}` : '';
      return {
        url: imageUrl.event(img.path),
        filename,
        alt: `${name}${photoNum}`,
      };
    });
    return {
      id: (item.folderPath ?? name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: name,
      dateDisplay: item.dateDisplay,
      dateISO: item.dateISO,
      category: item.category,
      images,
      coverImage: images[0],
    };
  });
}

const ALL = 'All';

export default function EventsPage() {
  const { data, status, error } = useManifest<EventsManifest>('events');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    const events = adaptEvents(data);
    // Sort by date (newest first)
    return events.sort((a, b) => {
      const dateA = a.dateISO ? new Date(a.dateISO).getTime() : 0;
      const dateB = b.dateISO ? new Date(b.dateISO).getTime() : 0;
      return dateB - dateA;
    });
  }, [data]);

  const filters = useMemo(() => {
    const cats = [...new Set(groups.map((g) => g.category).filter(Boolean))] as string[];
    return cats.length > 1 ? [ALL, ...cats.sort()] : [];
  }, [groups]);

  const filtered = useMemo(
    () =>
      activeFilter === ALL
        ? groups
        : groups.filter((g) => g.category === activeFilter),
    [groups, activeFilter]
  );

  usePageMeta({
    title: 'Event Photography | Caleb McCartney',
    description:
      'Corporate, conference, and event photography by Pittsburgh photographer Caleb McCartney. Professional coverage for brands, nonprofits, and organizations.',
    canonical: `${SITE_URL}/events`,
    og: {
      type: 'website',
      title: 'Event Photography | Caleb McCartney',
      description: 'Corporate and event photography by Pittsburgh photographer Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Event Photography | Caleb McCartney',
      description: 'Corporate and event photography by Pittsburgh photographer Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
  });

  return (
    <Layout>
      <div className="pf-root">
        <p className="pf-subheading" style={{ textAlign: 'center', marginBottom: 0 }}>
          Event Photography
        </p>
        <h1 className="pf-heading">Events</h1>

        {status === 'loading' && (
          <div className="pf-loading">
            <span className="pf-spinner" aria-hidden="true" />
            Loading…
          </div>
        )}

        {status === 'error' && (
          <div className="pf-error">
            <span>Failed to load events.</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{error}</span>
          </div>
        )}

        {status === 'success' && (
          <>
            <PortfolioFilters filters={filters} active={activeFilter} onChange={setActiveFilter} />
            <PortfolioGrid groups={filtered} />
          </>
        )}
      </div>
    </Layout>
  );
}
