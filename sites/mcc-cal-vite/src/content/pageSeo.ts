import pageSeoData from './pageSeoData.json';

export interface PageSeoEntry {
  route: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  imagePath: string;
  imageAlt: string;
  imageName: string;
  keywords: string[];
}

export interface ResolvedPageSeoEntry extends PageSeoEntry {
  url: string;
  image: string;
}

export const PAGE_SEO = pageSeoData as Record<string, PageSeoEntry>;

export type PageSeoKey = keyof typeof pageSeoData;

export function withSiteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getPageSeo(key: PageSeoKey, siteUrl: string): ResolvedPageSeoEntry {
  const entry = PAGE_SEO[key];

  return {
    ...entry,
    url: withSiteUrl(siteUrl, entry.route),
    image: withSiteUrl(siteUrl, entry.imagePath),
  };
}

export function generateSeoImageSchema(entry: ResolvedPageSeoEntry): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${entry.url}#primaryimage`,
    contentUrl: entry.image,
    url: entry.image,
    name: entry.imageName,
    description: entry.imageAlt,
    caption: entry.imageAlt,
    keywords: entry.keywords.join(', '),
    width: 1200,
    height: 630,
    creator: {
      '@type': 'Person',
      name: 'Caleb McCartney',
      url: 'https://mcc-cal.com/about',
    },
    creditText: 'Photo by Caleb McCartney / McCal Media',
    copyrightNotice: 'Copyright Caleb McCartney / McCal Media',
  };
}
