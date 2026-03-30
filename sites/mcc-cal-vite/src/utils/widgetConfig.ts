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
  // Portfolio pages
  journalism: {
    widget: 'photojournalism-portfolio',
    version: 'v5.5.3-photojournalism-performance.html',
    category: 'portfolios',
    description: 'Journalism portfolio with filtering and lightbox',
  },
  concerts: {
    widget: 'concert-portfolio',
    version: 'v4.9.3-concert-performance.html',
    category: 'portfolios',
    description: 'Concert photography portfolio with Spotify integration',
  },
  events: {
    widget: 'event-portfolio',
    version: 'v2.9.1-event-performance.html',
    category: 'portfolios',
    description: 'Event photography portfolio',
  },
  'featured-work': {
    widget: 'featured-portfolio',
    version: 'v1.5.1-featured-optimization.html',
    category: 'portfolios',
    description: 'Featured work showcase',
  },
  portraits: {
    widget: 'portrait-portfolio',
    version: 'v2.0.2-portrait-performance.html',
    category: 'portfolios',
    description: 'Portrait photography portfolio',
  },
  nature: {
    widget: 'nature-portfolio',
    version: 'v1.9.0-performance-optimized.html',
    category: 'portfolios',
    description: 'Nature photography portfolio',
  },
  video: {
    widget: 'video-portfolio',
    version: 'v0.2.0-video-portfolio.html',
    category: 'portfolios',
    description: 'Video portfolio with inline playback and filtering',
  },
  // Navigation and layout
  navigation: {
    widget: 'site-navigation',
    version: 'v2.0.7-site-navigation.html',
    category: '_navigation',
    description: 'Main site navigation',
  },
  footer: {
    widget: 'site-footer',
    version: 'v1.4.0-footer-roadmap.html',
    category: '_navigation',
    description: 'Site footer',
  },
  about: {
    widget: 'complete-about-page',
    version: 'v2.4.2-about-roadmap.html',
    category: '_content/about',
    description: 'About page content',
  },
  'contact-us': {
    widget: 'contact-form',
    version: 'v1.1.0-contact-enhanced.html',
    category: '_content',
    description: 'Contact page',
  },
  'request-a-quote': {
    widget: 'quote-request',
    version: 'v1.1.0-quote-multistep.html',
    category: '_content',
    description: 'Quote request multi-step form',
  },
  'policies-legal': {
    widget: 'policies-legal',
    version: 'v1.1.1-policies-legal-monochrome.html',
    category: '_content',
    description: 'Policies, legal, FAQs, cookies, and accessibility statement',
  },
  abridged: {
    widget: 'abridged',
    version: 'v1.0-landing.html',
    category: 'projects',
    description: 'Abridged app overview widget',
  },
  roadmap: {
    widget: 'roadmap',
    version: 'v1.5.0-roadmap-dual.html',
    category: 'projects',
    description: 'Project roadmap',
  },
  'design-systems': {
    widget: 'design-system-portfolio',
    version: 'v1.4.0-design-system-portfolio-overview-dynamic.html',
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
