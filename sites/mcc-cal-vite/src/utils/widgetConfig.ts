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
  category?: string;
  description?: string;
}

export const widgetMap: Record<string, WidgetConfig> = {
  // Portfolio pages
  journalism: {
    widget: 'photojournalism-portfolio',
    category: 'portfolios',
    version: 'v5.5.3-photojournalism-performance.html',
    description: 'Journalism portfolio with filtering and lightbox',
  },
  concerts: {
    widget: 'concert-portfolio',
    category: 'portfolios',
    version: 'v4.9.3-concert-performance.html',
    description: 'Concert photography portfolio with Spotify integration',
  },
  events: {
    widget: 'event-portfolio',
    category: 'portfolios',
    version: 'v2.9.1-event-performance.html',
    description: 'Event photography portfolio',
  },
  'featured-work': {
    widget: 'featured-portfolio',
    category: 'portfolios',
    version: 'v1.5.1-featured-optimization.html',
    description: 'Featured work showcase',
  },
  portraits: {
    widget: 'portrait-portfolio',
    category: 'portfolios',
    version: 'v2.0.2-portrait-performance.html',
    description: 'Portrait photography portfolio',
  },
  nature: {
    widget: 'nature-portfolio',
    category: 'portfolios',
    version: 'v1.9.0-performance-optimized.html',
    description: 'Nature photography portfolio',
  },
  video: {
    widget: 'video-portfolio',
    category: 'portfolios',
    version: 'v0.2.0-video-portfolio.html',
    description: 'Video portfolio with inline playback and filtering',
  },
  podcast: {
    widget: 'podcast-feed',
    category: '_content',
    version: 'v1.9.5-podcast-feed.html',
    description: 'Podcast episodes feed',
  },

  // Navigation and layout
  navigation: {
    widget: 'site-navigation',
    category: '_navigation',
    version: 'v1.6.3-site-navigation.html',
    description: 'Main site navigation',
  },
  footer: {
    widget: 'site-footer',
    category: '_navigation',
    version: 'v1.2.0-site-footer.html',
    description: 'Site footer',
  },
  about: {
    widget: 'about',
    category: '_content',
    version: 'v1.4.4-about.html',
    description: 'About page content',
  },
  contact: {
    widget: 'contact-form',
    category: '_content',
    version: 'v1.0-contact-form.html',
    description: 'Contact form widget',
  },
  abridged: {
    widget: 'abridged',
    category: '_content',
    version: 'v1.0-abridged.html',
    description: 'Abridged app overview widget',
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
