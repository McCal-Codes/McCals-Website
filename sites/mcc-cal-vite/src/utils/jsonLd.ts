/**
 * JSON-LD Schema Generators for SEO
 * 
 * Provides structured data helpers for various page types.
 * All functions return schema.org compatible objects.
 */

import type { PortfolioGroup, PortfolioImage } from '../components/portfolio/types';

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
    url: 'https://mcc-cal.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mcc-cal.com/blog?q={search_term_string}',
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
    jobTitle: 'Photojournalist and Event Photographer',
    description: 'Pittsburgh-based photographer specializing in concerts, corporate events, and brand storytelling',
    url: 'https://mcc-cal.com/about',
    sameAs: [
      'https://instagram.com/mccal_media',
      'https://linkedin.com/in/calebmccartney',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'McCal Media',
      url: 'https://mcc-cal.com',
    },
    knowsAbout: [
      'Photography',
      'Photojournalism',
      'Concert Photography',
      'Event Photography',
      'Brand Photography',
    ],
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
    provider: {
      '@type': 'Person',
      name: 'Caleb McCartney',
      url: 'https://mcc-cal.com/about',
    },
    serviceType: 'Photography',
    areaServed: {
      '@type': 'City',
      name: 'Pittsburgh',
      containedInPlace: {
        '@type': 'State',
        name: 'Pennsylvania',
      },
    },
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
// Type Exports
// ============================================================================

export type { PortfolioGroup, PortfolioImage } from '../components/portfolio/types';
