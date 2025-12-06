/**
 * Widget Configuration Mapping
 * Maps dev pages to their corresponding production widget versions
 * 
 * All widget views are automatically tracked in the changelog.
 * View the changelog at /changelog
 */

export interface WidgetConfig {
  widget: string;
  version: string;
  description?: string;
}

export const widgetMap: Record<string, WidgetConfig> = {
  // Portfolio pages
  journalism: {
    widget: 'photojournalism-portfolio',
    version: 'v5.2.0-performance-optimized.html',
    description: 'Journalism portfolio with filtering and lightbox',
  },
  concerts: {
    widget: 'concert-portfolio',
    version: 'v4.7.1-api-optional.html',
    description: 'Concert photography portfolio with Spotify integration',
  },
  events: {
    widget: 'event-portfolio',
    version: 'v2.6.4-event-portfolio.html',
    description: 'Event photography portfolio',
  },
  'featured-work': {
    widget: 'featured-portfolio',
    version: 'v1.5.0-working.html',
    description: 'Featured work showcase',
  },
  portraits: {
    widget: 'portrait-portfolio',
    version: 'v1.1-portrait-portfolio.html',
    description: 'Portrait photography portfolio',
  },
  nature: {
    widget: 'nature-portfolio',
    version: 'v1.0-nature-portfolio.html',
    description: 'Nature photography portfolio',
  },
  podcast: {
    widget: 'podcast-feed',
    version: 'v1.9.5-podcast-feed.html',
    description: 'Podcast episodes feed',
  },
  
  // Navigation and layout
  navigation: {
    widget: 'site-navigation',
    version: 'v1.6.3-site-navigation.html',
    description: 'Main site navigation',
  },
  footer: {
    widget: 'site-footer',
    version: 'v1.2.0-site-footer.html',
    description: 'Site footer',
  },
  about: {
    widget: 'about',
    version: 'v1.4.4-about.html',
    description: 'About page content',
  },
  contact: {
    widget: 'contact-form',
    version: 'v1.0-contact-form.html',
    description: 'Contact form widget',
  },
};

/**
 * Get widget config by page name
 */
export function getWidgetConfig(page: string): WidgetConfig | null {
  return widgetMap[page] || null;
}

/**
 * List all available widget pages
 */
export function listAvailablePages(): string[] {
  return Object.keys(widgetMap);
}
