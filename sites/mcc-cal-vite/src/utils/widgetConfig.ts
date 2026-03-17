/**
 * Widget Configuration Mapping
 * Maps dev pages to their corresponding production widget versions
 *
 * All widget views are automatically tracked in the changelog.
 * View the changelog at /changelog
 */

export interface WidgetConfig {
  widget: string;
  version?: string;
  category?: string;
  description?: string;
}

export const widgetMap: Record<string, WidgetConfig> = {
  // Portfolio pages — version omitted so API auto-serves the latest
  journalism: {
    widget: 'photojournalism-portfolio',
    category: 'portfolios',
    description: 'Journalism portfolio with filtering and lightbox',
  },
  concerts: {
    widget: 'concert-portfolio',
    category: 'portfolios',
    description: 'Concert photography portfolio with Spotify integration',
  },
  events: {
    widget: 'event-portfolio',
    category: 'portfolios',
    description: 'Event photography portfolio',
  },
  'featured-work': {
    widget: 'featured-portfolio',
    category: 'portfolios',
    description: 'Featured work showcase',
  },
  portraits: {
    widget: 'portrait-portfolio',
    category: 'portfolios',
    description: 'Portrait photography portfolio',
  },
  nature: {
    widget: 'nature-portfolio',
    category: 'portfolios',
    description: 'Nature photography portfolio',
  },
  video: {
    widget: 'video-portfolio',
    category: 'portfolios',
    description: 'Video portfolio with inline playback and filtering',
  },
  podcast: {
    widget: 'podcast-feed',
    category: '_content',
    description: 'Podcast episodes feed',
  },

  // Navigation and layout
  navigation: {
    widget: 'site-navigation',
    category: '_navigation',
    description: 'Main site navigation',
  },
  footer: {
    widget: 'site-footer',
    category: '_navigation',
    description: 'Site footer',
  },
  about: {
    widget: 'complete-about-page',
    category: '_content/about',
    description: 'About page content',
  },
  contact: {
    widget: 'contact-form',
    category: '_content',
    description: 'Contact form widget',
  },
  abridged: {
    widget: 'abridged',
    category: 'projects',
    description: 'Abridged app overview widget',
  },
  roadmap: {
    widget: 'roadmap',
    category: 'projects',
    description: 'Project roadmap',
  },
  'design-systems': {
    widget: 'design-system-portfolio',
    category: 'projects',
    description: 'Design systems portfolio',
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
