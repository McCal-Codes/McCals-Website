import { useMemo, useState } from 'react';
import { Layout } from '@/components';
import { ConcertArtistSupport, PortfolioFilters, PortfolioGrid, sortPortfolioGroups, useManifest, imageUrl, portfolioStyles } from '@/components/portfolio';
import EmptyState from '@/components/portfolio/EmptyState';
import PortfolioSkeleton from '@/components/LoadingStates/PortfolioSkeleton';
import type { PortfolioGroup } from '@/components/portfolio/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { generateSeoImageSchema, getPageSeo } from '@/content/pageSeo';
import { generatePageGraph, generatePhotographyProviderSchema, generatePhotographyServiceSchema } from '@/utils/jsonLd';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const ALL = 'All';
const PAGE_SEO = getPageSeo('concerts', SITE_URL);

interface ConcertBand {
  bandName: string;
  relativeFolderPath: string;
  dateDisplay?: string;
  concertDate?: { iso?: string };
  totalImages: number;
  images: string[];
}

interface ConcertManifest {
  bands: ConcertBand[];
}

export function adaptConcerts(manifest: ConcertManifest): PortfolioGroup[] {
  return manifest.bands.map((band) => {
    const images = band.images.map((filename) => ({
      url: imageUrl.concert(band.relativeFolderPath, filename),
      filename,
      alt: `${band.bandName} concert photo`,
    }));

    return {
      id: `${band.relativeFolderPath}-${band.bandName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      title: band.bandName,
      dateDisplay: band.dateDisplay,
      dateISO: band.concertDate?.iso,
      category: 'Concert',
      images,
      coverImage: images[0],
    };
  });
}

export default function ConcertsPage() {
  const { data, status, error } = useManifest<ConcertManifest>('concerts');
  const [activeFilter, setActiveFilter] = useState(ALL);

  const groups = useMemo(() => {
    if (!data) return [];
    return sortPortfolioGroups(adaptConcerts(data));
  }, [data]);

  const filters = useMemo(() => {
    const years = [...new Set(groups.map((group) => group.dateISO?.slice(0, 4)).filter(Boolean))].sort(
      (left, right) => Number(right) - Number(left),
    );

    return years.length > 1 ? [ALL, ...years] : [];
  }, [groups]);

  const filtered = useMemo(
    () =>
      activeFilter === ALL
        ? groups
        : groups.filter((group) => group.dateISO?.startsWith(activeFilter)),
    [groups, activeFilter],
  );

  usePageMeta({
    title: PAGE_SEO.title,
    description: PAGE_SEO.description,
    canonical: PAGE_SEO.url,
    og: {
      type: 'website',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_SEO.ogTitle,
      description: PAGE_SEO.ogDescription,
      image: PAGE_SEO.image,
      imageAlt: PAGE_SEO.imageAlt,
    },
    jsonLd: generatePageGraph([
      generatePhotographyProviderSchema(
        'Pittsburgh photography business led by Caleb McCartney for event coverage, concerts, headshots, and commercial storytelling.',
      ),
      generatePhotographyServiceSchema(
        'Concert Photography',
        'Live music photography for artists, venues, promoters, and editorial teams in Pittsburgh and beyond.',
        `${SITE_URL}/concerts`,
        {
          alternateName: ['Pittsburgh Concert Photographer', 'Live Music Photography'],
          category: 'Concert photographer',
          keywords: ['concert photographer pittsburgh', 'music photographer', 'live music photography'],
        },
      ),
      generateSeoImageSchema(PAGE_SEO),
    ]),
  });

  return (
    <Layout>
      <div className={portfolioStyles.pfRoot}>
        <p className={`${portfolioStyles.pfSubheading} text-center mb-0`}>
          Pittsburgh Concert Photographer
        </p>
        <h1 className={portfolioStyles.pfHeading}>Live Music & Venue Coverage</h1>
        <p className={portfolioStyles.pfIntro}>
          Photojournalistic concert photography for artists, venues, promoters, and editorial teams
          that need fast, usable images from live shows in Pittsburgh and beyond.
        </p>

        {status === 'loading' && (
          <PortfolioSkeleton showFilters={true} count={6} />
        )}

        {status === 'error' && (
          <div className={portfolioStyles.pfError}>
            <span>Failed to load concerts.</span>
            <span className="text-xs opacity-70">{error}</span>
          </div>
        )}

        {status === 'success' && (
          <>
            {filtered.length === 0 ? (
              <EmptyState 
                type="concerts"
                title="No Concerts Found"
                description={activeFilter === ALL 
                  ? "No concerts are currently available. Check back soon for new live music photography from Pittsburgh venues and touring acts."
                  : `No concerts found for ${activeFilter}. Try selecting a different year or view all concerts.`
                }
                action={{
                  text: activeFilter === ALL ? "View Other Work" : "View All Concerts",
                  href: activeFilter === ALL ? "/journalism" : "/concerts"
                }}
              />
            ) : (
              <>
                <ConcertArtistSupport bands={data?.bands ?? []} />
                <PortfolioFilters
                  filters={filters.filter((filter): filter is string => typeof filter === 'string')}
                  active={activeFilter}
                  onChange={setActiveFilter}
                />
                <PortfolioGrid
                  groups={filtered}
                  initialCount={16}
                  batchSize={8}
                  gridClassName={portfolioStyles.pfConcertGrid}
                  cardImageSizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 50vw, (max-width: 1400px) 33vw, 25vw"
                />
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
