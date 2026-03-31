import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { useManifest, getImageUrl } from '@/components/portfolio/useManifest';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { useMemo, useState } from 'react';
import '@/components/portfolio/portfolio.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

interface JournalismImage {
  filename: string;
  path: string;
  description?: string;
  caption?: string;
}

interface JournalismItem {
  eventName: string;
  category?: string;
  tags?: string[];
  folderPath?: string;
  dateDisplay?: string;
  eventDate?: { iso?: string };
  published?: boolean;
  outlet?: string;
  outletUrl?: string;
  articleUrl?: string;
  metadata?: {
    description?: string;
    caption?: string;
    outlet?: string;
    outletUrl?: string;
    articleUrl?: string;
  };
  images: JournalismImage[];
}

interface JournalismManifest {
  events: JournalismItem[];
  categories?: string[];
}

function adaptJournalism(manifest: JournalismManifest): PortfolioGroup[] {
  return manifest.events.map((item) => {
    const images = item.images.map((img) => ({
      url: getImageUrl(`Journalism/${item.folderPath ?? item.eventName}/${img.path}`),
      filename: img.filename,
      alt: img.description ?? `${item.eventName} — photo`,
      caption: img.caption,
      description: img.description,
    }));
    return {
      id: (item.folderPath ?? item.eventName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: item.eventName,
      dateDisplay: item.dateDisplay,
      dateISO: item.eventDate?.iso,
      category: item.category,
      tags: item.tags,
      published: item.published,
      outletName: item.outlet ?? item.metadata?.outlet,
      outletUrl: item.outletUrl ?? item.metadata?.outletUrl,
      articleUrl: item.articleUrl ?? item.metadata?.articleUrl,
      images,
      coverImage: images[0],
    };
  });
}

const ALL = 'All';

export default function JournalismPage() {
  const { data, status, error } = useManifest<JournalismManifest>('journalism');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => (data ? adaptJournalism(data) : []), [data]);

  const filters = useMemo(() => {
    const source = data?.categories ?? [...new Set(groups.map((g) => g.category).filter(Boolean))];
    return (source as string[]).length > 1 ? [ALL, ...(source as string[]).sort()] : [];
  }, [data, groups]);

  const filtered = useMemo(
    () =>
      activeFilter === ALL
        ? groups
        : groups.filter((g) => g.category === activeFilter),
    [groups, activeFilter]
  );

  usePageMeta({
    title: 'Photojournalism | Caleb McCartney',
    description:
      'Photojournalism and editorial photography by Pittsburgh-based photographer Caleb McCartney. Published work in news, sports, and community coverage.',
    canonical: `${SITE_URL}/journalism`,
    og: {
      type: 'website',
      title: 'Photojournalism | Caleb McCartney',
      description: 'Editorial and news photography by Pittsburgh photojournalist Caleb McCartney.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Photojournalism | Caleb McCartney',
      description: 'Editorial and news photography by Pittsburgh photojournalist Caleb McCartney.',
    },
  });

  return (
    <Layout>
      <div className="pf-root">
        <p className="pf-subheading" style={{ textAlign: 'center', marginBottom: 0 }}>
          Photojournalism
        </p>
        <h1 className="pf-heading">Editorial Work</h1>

        {status === 'loading' && (
          <div className="pf-loading">
            <span className="pf-spinner" aria-hidden="true" />
            Loading…
          </div>
        )}

        {status === 'error' && (
          <div className="pf-error">
            <span>Failed to load journalism work.</span>
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
