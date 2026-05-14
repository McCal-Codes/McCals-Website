import { imageUrl } from '../components/portfolio/useManifest';

export const LIVE_SITE_BASE = import.meta.env.VITE_LIVE_SITE_BASE || 'https://www.mcc-cal.com';

export interface HomeFeaturedItem {
  id: string;
  title: string;
  eyebrow: string;
  href: string;
  imageUrl?: string;
  meta: string;
}

export interface HeroSlide {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  summary: string;
  ctaText: string;
  ctaLink: string;
}

export const LIVE_SITE_PODCAST = {
  image:
    'https://media.rss.com/cafeconnectpod/20250404_090408_d8a1a6cce833630a24064aedcd52e348.png',
  spotify: 'https://open.spotify.com/show/1GcE0Tt669WrdAOXz73w0S',
  apple: 'https://podcasts.apple.com/us/podcast/caffeinated-connections/id1806715605',
  calendly: 'https://calendly.com/cjmccar-mcc-cal/caffeinated_connections',
};

const LIVE_SITE_FEATURED_BY_TYPE: Record<string, HomeFeaturedItem> = {
  journalism: {
    id: 'journalism-fallback',
    title: 'Photojournalism',
    eyebrow: 'Journalism',
    href: '/journalism',
    imageUrl: imageUrl.journalism('Documentary/Boyd Station', '6-9-25_Caleb McCartney_134-min.jpg'),
    meta: 'Field features / Politics / Regional reporting',
  },
  events: {
    id: 'events-fallback',
    title: 'Events',
    eyebrow: 'Events',
    href: '/events',
    imageUrl: imageUrl.event(
      'src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp',
    ),
    meta: 'Corporate coverage / Experiences / Client work',
  },
  concert: {
    id: 'concerts-fallback',
    title: 'Concerts',
    eyebrow: 'Concert',
    href: '/concerts',
    imageUrl: imageUrl.concert('Concert/Turtle Park/August 2025', '250829_Haven_CAL4401.jpg'),
    meta: 'Live performance / Touring artists / Venue work',
  },
  portraits: {
    id: 'portraits-fallback',
    title: 'Portraits',
    eyebrow: 'Portraits',
    href: '/portraits',
    imageUrl: imageUrl.portrait(
      'Editorial/Lucha 2024',
      "240517_Lucha's Graduation Shoot_1607_CAL_Compressed.jpg",
    ),
    meta: 'Editorial sessions / Graduates / Personal work',
  },
  nature: {
    id: 'nature-fallback',
    title: 'Nature',
    eyebrow: 'Nature',
    href: '/nature',
    imageUrl: imageUrl.nature('Landscapes/West Virginia', 'barn.jpg'),
    meta: 'Landscapes / Quiet studies / Field notes',
  },
};

export const LIVE_SITE_HOME_FEATURED_ITEMS: HomeFeaturedItem[] = [
  LIVE_SITE_FEATURED_BY_TYPE.journalism,
  LIVE_SITE_FEATURED_BY_TYPE.events,
  LIVE_SITE_FEATURED_BY_TYPE.concert,
];

export const LIVE_SITE_HERO_SLIDES: HeroSlide[] = [
  {
    image: imageUrl.journalism('Documentary/Boyd Station', '6-9-25_Caleb McCartney_134-min.jpg'),
    alt: 'A woman and a child holding a sparkler at night, with dark trees in the background.',
    eyebrow: 'Journalism',
    title: 'Field stories with room to breathe.',
    summary:
      'Long-form features, campaign nights, and local reporting built around atmosphere as much as action.',
    ctaText: 'View Photojournalism',
    ctaLink: '/journalism',
  },
  {
    image: imageUrl.journalism('Politics/cmu-trump-protest', '250715_CMU Trump Protest_CAL1573-min.jpg'),
    alt: 'Demonstrators gather during a protest in Pittsburgh.',
    eyebrow: 'Politics',
    title: 'Politics',
    summary:
      'Campaigns, rallies, and public pressure documented without flattening the people inside them.',
    ctaText: 'See Coverage',
    ctaLink: '/journalism',
  },
  {
    image: imageUrl.journalism('Politics/kamala-speaks-erie', '141024_Kamala Speaks at Erie_CAL3804.jpg'),
    alt: 'Supporters listen during a campaign event in Erie, Pennsylvania.',
    eyebrow: 'Pittsburgh',
    title: 'City Stories',
    summary:
      'Regional work rooted in Pittsburgh, Western Pennsylvania, and the communities around them.',
    ctaText: 'Explore Region',
    ctaLink: '/journalism',
  },
  {
    image: imageUrl.event(
      'src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp',
    ),
    alt: 'Guests networking at a cocktail event while a bartender prepares drinks.',
    eyebrow: 'Corporate',
    title: 'Corporate',
    summary:
      'Clean, high-trust coverage for brands, conferences, nonprofits, and client-facing events.',
    ctaText: 'Book Coverage',
    ctaLink: '/events',
  },
  {
    image: imageUrl.event('src/images/Portfolios/Events/Pittsburgh Honky Tonk/250823_Honky Tonk_CAL4149.jpg'),
    alt: 'Guests watching a lively show with colorful lighting and confetti.',
    eyebrow: 'Events',
    title: 'Events',
    summary: 'Live experiences framed with the same discipline as editorial assignments.',
    ctaText: 'Discover Events',
    ctaLink: '/events',
  },
  {
    image: imageUrl.concert('Concert/Turtle Park/August 2025', '250829_Haven_CAL4401.jpg'),
    alt: 'A musician playing bass on stage under purple and blue lights.',
    eyebrow: 'Concert',
    title: 'Concert',
    summary: 'Performance work that stays close to gesture, lighting, and crowd energy.',
    ctaText: 'View Performances',
    ctaLink: '/concerts',
  },
  {
    image: imageUrl.portrait(
      'Editorial/Lucha 2024',
      "240517_Lucha's Graduation Shoot_1607_CAL_Compressed.jpg",
    ),
    alt: 'A portrait subject standing in evening light outdoors.',
    eyebrow: 'Portraits',
    title: 'Portraits',
    summary: 'Editorial portrait sessions with a quieter, more personal pacing.',
    ctaText: 'View Portraits',
    ctaLink: '/portraits',
  },
  {
    image: imageUrl.nature('Landscapes/West Virginia', 'barn.jpg'),
    alt: 'A quiet natural landscape photographed in soft light.',
    eyebrow: 'Nature',
    title: 'Nature',
    summary: 'Landscapes, wildlife, and quiet studies from the field.',
    ctaText: 'View Nature',
    ctaLink: '/nature',
  },
];

function normalizeFeaturedKey(value?: string): string {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) return '';
  if (normalized === 'journalism' || normalized.startsWith('journalism')) return 'journalism';
  if (normalized === 'concert' || normalized.startsWith('concert')) return 'concert';
  if (normalized === 'events' || normalized === 'event' || normalized.startsWith('event')) return 'events';
  if (normalized === 'portraits' || normalized === 'portrait' || normalized.startsWith('portrait')) return 'portraits';
  if (normalized === 'nature' || normalized.startsWith('nature')) return 'nature';

  return normalized;
}

export function getLiveSiteFeaturedFallback(value?: string): HomeFeaturedItem | undefined {
  const key = normalizeFeaturedKey(value);
  return key ? LIVE_SITE_FEATURED_BY_TYPE[key] : undefined;
}

export function mergeHomeFeaturedItems(items: HomeFeaturedItem[], limit = 3): HomeFeaturedItem[] {
  const merged: HomeFeaturedItem[] = items.slice(0, limit).map((item) => {
    const fallback = getLiveSiteFeaturedFallback(item.eyebrow || item.href);

    return {
      ...item,
      href: item.href || fallback?.href || '/featured-work',
      imageUrl: item.imageUrl || fallback?.imageUrl,
      meta: item.meta || fallback?.meta || 'Curated highlight',
    };
  });

  const seenHrefs = new Set(merged.map((item) => item.href));

  for (const fallback of LIVE_SITE_HOME_FEATURED_ITEMS) {
    if (merged.length >= limit) break;
    if (seenHrefs.has(fallback.href)) continue;

    merged.push(fallback);
    seenHrefs.add(fallback.href);
  }

  return merged;
}
