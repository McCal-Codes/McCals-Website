/**
 * Portfolio component barrel exports
 */

// Import global styles (theme-specific, HTML-level selectors)
import './portfolio-global.css';

// Export CSS module styles for components to use
export { default as portfolioStyles } from './portfolio.module.css';

// Component exports
export { default as PortfolioCard } from './PortfolioCard';
export { default as PortfolioFilters } from './PortfolioFilters';
export { default as PortfolioGrid } from './PortfolioGrid';
export { default as PortfolioLightbox } from './PortfolioLightbox';
export { default as PortfolioLoadMore } from './PortfolioLoadMore';
export { default as ConcertArtistSupport } from './ConcertArtistSupport';
export { useManifest, imageUrl } from './useManifest';
export { sortPortfolioGroups, comparePortfolioGroupsByDateDesc } from './sortGroups';
export type { PortfolioGroup, PortfolioImage } from './types';
