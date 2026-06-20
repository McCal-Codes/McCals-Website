/**
 * JSON-LD Schema Generators for SEO
 * 
 * Provides structured data helpers for various page types.
 * All functions return schema.org compatible objects.
 */

import type { PortfolioGroup, PortfolioImage } from '../components/portfolio/types';

const SITE_ROOT = 'https://mcc-cal.com';
const GOOGLE_BUSINESS_PROFILE_URL = 'https://www.google.com/search?kgmid=/g/11krrndw6s&q=McCal+Media';
const MC_CAL_LOGO = `${SITE_ROOT}/brand/logo-mark.svg`;
const MC_CAL_EMAIL = 'contact@mcc-cal.com';
const PITTSBURGH_AREA_SERVED = {
  '@type': 'City',
  name: 'Pittsburgh',
  containedInPlace: {
    '@type': 'State',
    name: 'Pennsylvania',
  },
};
const PITTSBURGH_POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Pittsburgh',
  addressRegion: 'PA',
  addressCountry: 'US',
};

const MC_CAL_PERSON = {
  '@type': 'Person',
  '@id': `${SITE_ROOT}/about#caleb-mccartney`,
  name: 'Caleb McCartney',
  url: `${SITE_ROOT}/about`,
};

const MC_CAL_ORGANIZATION = {
  '@type': 'LocalBusiness',
  '@id': `${SITE_ROOT}#organization`,
  name: 'McCal Media',
  url: SITE_ROOT,
  logo: MC_CAL_LOGO,
  email: MC_CAL_EMAIL,
  address: PITTSBURGH_POSTAL_ADDRESS,
  areaServed: PITTSBURGH_AREA_SERVED,
  hasMap: GOOGLE_BUSINESS_PROFILE_URL,
  sameAs: [
    GOOGLE_BUSINESS_PROFILE_URL,
    'https://www.instagram.com/mcc_cal',
    'https://www.linkedin.com/in/calebmccartney',
  ],
};

// ============================================================================
// Core Schemas
// ============================================================================

/**
 * Generate WebSite schema with search capability
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'McCal Media',
    url: SITE_ROOT,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ROOT}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Person schema for Caleb McCartney
 */
export function generatePersonSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Caleb McCartney',
    '@id': `${SITE_ROOT}/about#caleb-mccartney`,
    jobTitle: 'Pittsburgh Photographer and Photojournalist',
    description:
      'Pittsburgh photographer specializing in event, concert, headshot, and commercial imagery',
    url: `${SITE_ROOT}/about`,
    sameAs: [
      'https://instagram.com/mccal_media',
      'https://linkedin.com/in/calebmccartney',
    ],
    worksFor: MC_CAL_ORGANIZATION,
    knowsAbout: [
      'Photography',
      'Photojournalism',
      'Concert Photography',
      'Event Photography',
      'Headshot Photography',
      'Commercial Photography',
      'Brand Photography',
    ],
  };
}

export function generatePhotographyProviderSchema(description?: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_ROOT}#organization`,
    name: 'McCal Media',
    url: SITE_ROOT,
    logo: MC_CAL_LOGO,
    email: MC_CAL_EMAIL,
    description:
      description ||
      'Pittsburgh photography business led by Caleb McCartney for events, concerts, headshots, and commercial storytelling.',
    address: PITTSBURGH_POSTAL_ADDRESS,
    areaServed: PITTSBURGH_AREA_SERVED,
    founder: MC_CAL_PERSON,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: MC_CAL_EMAIL,
      url: `mailto:${MC_CAL_EMAIL}`,
    },
    hasMap: GOOGLE_BUSINESS_PROFILE_URL,
    sameAs: [
      GOOGLE_BUSINESS_PROFILE_URL,
      'https://www.instagram.com/mcc_cal',
      'https://www.linkedin.com/in/calebmccartney',
    ],
  };
}

export function generatePhotographyServiceSchema(
  serviceName: string,
  description: string,
  url: string,
  options?: {
    alternateName?: string[];
    category?: string;
    keywords?: string[];
  }
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    ...(options?.alternateName?.length ? { alternateName: options.alternateName } : {}),
    ...(options?.category ? { category: options.category } : {}),
    ...(options?.keywords?.length ? { keywords: options.keywords.join(', ') } : {}),
    description,
    url,
    serviceType: serviceName,
    areaServed: PITTSBURGH_AREA_SERVED,
    provider: MC_CAL_ORGANIZATION,
  };
}

// ============================================================================
// Portfolio Schemas
// ============================================================================

/**
 * Generate ImageGallery schema for portfolio collection pages
 */
export function generateImageGallerySchema(
  title: string,
  description: string,
  url: string,
  groups: PortfolioGroup[],
  dateModified?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: title,
    description,
    url,
    dateModified,
    author: {
      '@type': 'Person',
      name: 'Caleb McCartney',
      url: 'https://mcc-cal.com/about',
    },
    image: groups.slice(0, 10).flatMap(group => 
      group.images.slice(0, 3).map(img => ({
        '@type': 'ImageObject',
        contentUrl: img.url,
        name: img.alt || img.filename,
        description: img.caption,
        author: {
          '@type': 'Person',
          name: 'Caleb McCartney',
        },
      }))
    ),
  };
}

/**
 * Generate ImageObject schema for individual images
 */
export function generateImageObjectSchema(
  image: PortfolioImage,
  groupTitle: string,
  url: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: image.url,
    name: image.alt || `${groupTitle} photo`,
    description: image.caption || image.description,
    author: {
      '@type': 'Person',
      name: 'Caleb McCartney',
    },
    url,
  };
}

/**
 * Generate CreativeWork schema for portfolio groups
 */
export function generateCreativeWorkSchema(
  group: PortfolioGroup,
  url: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: group.title,
    description: `Photography from ${group.title}${group.dateDisplay ? `, ${group.dateDisplay}` : ''}`,
    url,
    dateCreated: group.dateISO,
    about: group.category,
    author: {
      '@type': 'Person',
      name: 'Caleb McCartney',
      url: 'https://mcc-cal.com/about',
    },
    image: group.images.slice(0, 5).map(img => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      name: img.alt || `${group.title} photo`,
    })),
  };
}

// ============================================================================
// Page Schemas
// ============================================================================

/**
 * Generate CollectionPage schema for portfolio listing pages
 */
export function generateCollectionPageSchema(
  title: string,
  description: string,
  url: string,
  groups: PortfolioGroup[],
  breadcrumb: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: groups.map((group, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: generateCreativeWorkSchema(group, `${url}#${group.id}`),
      })),
    },
    breadcrumb: generateBreadcrumbSchema(breadcrumb),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate ContactPage schema
 */
export function generateContactPageSchema(
  title: string,
  description: string,
  url: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'Person',
      name: 'Caleb McCartney',
      jobTitle: 'Photojournalist and Event Photographer',
      url: 'https://mcc-cal.com/about',
    },
  };
}

/**
 * Generate Service schema for photography services
 */
export function generateServiceSchema(
  serviceName: string,
  description: string,
  url: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description,
    url,
    provider: MC_CAL_ORGANIZATION,
    serviceType: 'Photography',
    areaServed: PITTSBURGH_AREA_SERVED,
  };
}

// ============================================================================
// Composite Schemas
// ============================================================================

/**
 * Generate complete page schema with multiple graph nodes
 */
export function generatePageGraph(
  schemas: object[]
): object {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

/**
 * Generate ProfilePage schema for author/creator pages
 * Wraps Person in ProfilePage context per Google guidelines
 */
export function generateProfilePageSchema(
  person: object,
  url: string,
  dateCreated?: string,
  dateModified?: string,
  recentActivity?: object[]
): object {
  const profilePage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: person,
  };

  if (dateCreated) {
    profilePage.dateCreated = dateCreated;
  }
  if (dateModified) {
    profilePage.dateModified = dateModified;
  }
  if (recentActivity && recentActivity.length > 0) {
    profilePage.hasPart = recentActivity;
  }

  return profilePage;
}

/**
 * Generate Review schema for individual testimonials
 */
export function generateReviewSchema(
  reviewText: string,
  authorName: string,
  rating: number,
  datePublished?: string,
  publisherName?: string,
  itemReviewed?: object
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating,
      bestRating: 5,
    },
    author: {
      '@type': 'Person',
      name: authorName,
    },
    reviewBody: reviewText,
    ...(datePublished && { datePublished }),
    ...(publisherName && {
      publisher: {
        '@type': 'Organization',
        name: publisherName,
      },
    }),
    ...(itemReviewed && { itemReviewed }),
  };
}

/**
 * Generate AggregateRating schema for combined ratings
 */
export function generateAggregateRatingSchema(
  ratingValue: number,
  reviewCount: number,
  itemReviewed?: object
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue,
    bestRating: 5,
    reviewCount,
    ...(itemReviewed && { itemReviewed }),
  };
}
/**
 * Generate portfolio page complete schema
 */
export function generatePortfolioPageSchema(
  pageTitle: string,
  pageDescription: string,
  pageUrl: string,
  category: string,
  groups: PortfolioGroup[]
): object {
  return generatePageGraph([
    generateWebSiteSchema(),
    generatePersonSchema(),
    generateCollectionPageSchema(
      pageTitle,
      pageDescription,
      pageUrl,
      groups,
      [
        { name: 'Home', url: 'https://mcc-cal.com' },
        { name: category, url: pageUrl },
      ]
    ),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://mcc-cal.com' },
      { name: category, url: pageUrl },
    ]),
  ]);
}

// ============================================================================
// Event Schemas
// ============================================================================

/**
 * Generate Event schema for concerts and events
 */
export function generateEventSchema(
  eventName: string,
  eventDate: string,
  eventLocation?: string,
  eventDescription?: string,
  eventImage?: string,
  eventUrl?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventName,
    startDate: eventDate,
    ...(eventLocation && {
      location: {
        '@type': 'Place',
        name: eventLocation,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pittsburgh',
          addressRegion: 'PA',
          addressCountry: 'US',
        },
      },
    }),
    ...(eventDescription && { description: eventDescription }),
    ...(eventImage && { image: eventImage }),
    ...(eventUrl && { url: eventUrl }),
    organizer: MC_CAL_ORGANIZATION,
    performer: {
      '@type': 'Person',
      name: 'Caleb McCartney',
      jobTitle: 'Event Photographer',
    },
    attendee: {
      '@type': 'Person',
      name: 'Event Attendees',
    },
  };
}

/**
 * Generate MusicEvent schema for concerts
 */
export function generateMusicEventSchema(
  bandName: string,
  concertDate: string,
  venue?: string,
  concertImage?: string,
  concertUrl?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: bandName,
    startDate: concertDate,
    ...(venue && {
      location: {
        '@type': 'MusicVenue',
        name: venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pittsburgh',
          addressRegion: 'PA',
          addressCountry: 'US',
        },
      },
    }),
    description: `Live concert photography of ${bandName}`,
    ...(concertImage && { image: concertImage }),
    ...(concertUrl && { url: concertUrl }),
    organizer: MC_CAL_ORGANIZATION,
    performer: {
      '@type': 'MusicGroup',
      name: bandName,
    },
    attendee: {
      '@type': 'Person',
      name: 'Concert Attendees',
    },
  };
}

// ============================================================================
// Type Exports
// ============================================================================

export type { PortfolioGroup, PortfolioImage } from '../components/portfolio/types';
