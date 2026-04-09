# Changelog — Concert Portfolio Widget

All notable changes to the Squarespace concert portfolio snippet.

## v4.9.2-WIP — 2025-12-27

### Resilience & UI 🧱

- **ADDED**: Enhanced empty state UI for manifest failures
- **ENHANCED**: Safe area insets (notch support) and passive scroll enhancements
- **UPDATED**: Version indicator and branding

## v4.9.1 — 2025-12-15 (SEO Enhancement)

### SEO Improvements

- **ENHANCED**: Structured data now includes `hasPart` array with individual band items
- **ENHANCED**: Each band has `@id` and `url` set to anchor URL (e.g., `page.html#band-name`)
- **BENEFIT**: Search engines can now index individual bands within the gallery
- **BENEFIT**: Improved discoverability for deep-linked content
- **RETAINED**: All v4.9.0 features (anchored links, load more, animations, view counts)

## v4.9.0 — 2025-12-14 (Enhanced Portfolio)

### Portfolio Enhancements 🚀

- **NEW**: Anchored links — Each band card has a deep-linkable anchor (#band-name). Hover to reveal chain icon, click to copy URL.
- **NEW**: Hash navigation — Visiting a URL with `#band-name` auto-scrolls to the card and opens its lightbox.
- **NEW**: Load More — Progressive loading with configurable batch sizes. Initial display 12 cards, "Load More" reveals 6 more at a time.
- **NEW**: Animated Entrance — Staggered fade-up animation on cards with 80ms delay between each for a premium feel.
- **NEW**: View Count Badges — Minimal view count displayed on each card (demo data for now).
- **ENHANCED**: Spotify inline players — Artists with IDs in the artist map now show embedded Spotify player inline (plays random songs from their top tracks). Artists without IDs show a placeholder with search link.
- **CONFIG**: New `data-batch-size` attribute to customize cards per "Load More" click.
- **CONFIG**: Default `data-panes` changed from 24 to 12 for faster initial load.
- **RETAINED**: All Spotify support features (artist links, embedded previews, artist map).
- **RETAINED**: All v4.8 performance optimizations and monochrome styling.

## v4.7.1 — 2025-11-21 (Optional API)

### API-first with graceful fallback

- **NEW**: Optional API loading. Set `data-api="on"` to fetch the manifest from `/api/v1/manifests/concert`.
- **FALLBACK**: If the API is unreachable or returns an unexpected shape, the widget falls back to GitHub Raw `src/images/Portfolios/Concert/concert-manifest.json`.
- **NO UX CHANGE**: Layout, performance optimizations, and Spotify support from v4.7 remain unchanged.
- **DOCS**: README updated with usage notes and dev proxy guidance.

## v4.7 — 2025-11-02 (Artist Support — Spotify)

### Audience Support & UX ❤️🎵

- **NEW**: Non-intrusive floating button to support artists with Spotify integration
- **AUTO**: Lists bands directly from `concert-manifest.json`
- **SEARCH**: One-click “Open on Spotify” search links (no API keys required)
- **PREVIEW**: Optional embedded Spotify player when an artist ID is provided via inline JSON map
- **LAZY**: Embeds are lazy-loaded on demand to preserve performance
- **A11Y**: Keyboard accessible, semantic roles, respects lightbox layering
- **PERF**: Retains all v4.6 performance optimizations
- **REFINE**: Deduplicates artists by name (case-insensitive) to avoid duplicate entries
- **SAFETY**: Spotify button is temporarily disabled while interacting with images (hover/drag/touch or lightbox open) to prevent accidental clicks

## v4.8 — 2025-11-04 (Manifest Simplification)

### Simplify manifest strategy

- **CHANGE**: Portfolio manifests simplified to a single aggregated manifest per portfolio (e.g., `concert-manifest.json`).
- **DEPRECATE**: Per-folder `manifest.json` files are now deprecated and removed by automation; the aggregated manifest is canonical for widgets and CI.
- **TOOLING**: Manifest generators updated to produce only portfolio-level manifests; cleanup script added to remove subfolder manifests.

## v4.6 — 2025-10-06 (Performance Optimized - Production Ready)

### Performance Optimizations 🚀

- **CRITICAL**: Separated critical CSS from non-critical styles for faster initial render
- **OPTIMIZED**: Modern JavaScript with async patterns and reduced main-thread blocking
- **IMPROVED**: Font loading with `font-display: swap` for better performance
- **REDUCED**: Bundle size by lazy-loading debug features and advanced functionality
- **ENHANCED**: Resource hints with preconnect/dns-prefetch for GitHub API
- **OPTIMIZED**: Structured data generation with compact JSON for better SEO
- **RETAINED**: All v4.5 SEO features and v4.4 UX enhancements

## v4.5 — 2025-10-06 (SEO Enhanced - Work in Progress)

### SEO and Accessibility Improvements 🎯

- **ENHANCED**: Alt text generation using manifest data for descriptive, keyword-rich attributes
- **NEW**: JSON-LD structured data with Schema.org markup for search engines
- **IMPROVED**: Lazy loading with proper `loading` attributes and `fetchpriority` settings
- **ENHANCED**: Accessibility with better ARIA labels and semantic markup
- **NEW**: Image optimization with proper dimensions and responsive handling
- **RETAINED**: All v4.4 UX enhancements (lightbox improvements, navigation hiding)

## v4.4 — 2025-10-05

### Enhanced UX Patterns from Journalism Widget 🎨

- **FIXED**: Lightbox image stretching with `object-fit: contain` and proper centering
- **NEW**: Hidden scrollbars in lightbox gallery for immersive viewing experience
- **ENHANCED**: Navigation hiding with comprehensive selectors during lightbox
- **IMPROVED**: Close button with fixed positioning and better accessibility
- **NEW**: Version indicator integrated into heading with enhanced styling
- **ENHANCED**: Debug panel with detailed metrics and comprehensive controls
- **RETAINED**: All v4.3 optimizations (caching, auto-refresh, single API call)

## v4.3 — 2025-09-23

### Images-first path + fallback 🔧

- Prefer `images/Portfolios/Concert/` with automatic fallback to `src/images/Portfolios/Concert/`
- Cache selected basePath alongside manifest for consistent image URLs
- Fix: define `nextRefreshTimer` to avoid unload-time reference errors
- Retains all v4.2 optimizations (single API call, 10-min cache, 15-min auto-refresh)

## v4.2 — 2025-09-23

### GitHub Path Fix & Organization 🗂️

- **CRITICAL FIX**: Updated GitHub API paths after repository reorganization
  - Changed from `images/Portfolios/Concert/` to `src/images/Portfolios/Concert/`
  - Fixed manifest URL: `src/images/Portfolios/Concert/concert-manifest.json`
  - Updated rawUrl function for proper image access
- **MOVED**: Widget moved from demo to versions folder (now latest stable)
- **VERIFIED**: All functionality tested and working with new paths
- **COMPATIBLE**: Maintains all v4.2 features (API optimization, caching, auto-refresh)

## v3.6 — 2025-09-19

### Stable Auto-Refresh & Individual Manifests 🔄

- **NEW**: Individual manifest.json generation for each band/date folder
- **NEW**: Auto-refresh capability with 5-minute intervals for live updates
- **NEW**: Enhanced individual manifest generator script with intelligent date detection
- **NEW**: Smart manifest updating - only regenerates when images are newer
- **NEW**: Auto-refresh countdown indicator with next refresh timer
- **NEW**: Comprehensive debugging panel with refresh metrics
- **IMPROVED**: Stable network loading without aggressive cache-busting
- **IMPROVED**: Better error handling with retry functionality
- **IMPROVED**: Enhanced watcher script includes individual manifest generation
- **IMPROVED**: Date detection from folder names ("April 2024") and image filenames
- **IMPROVED**: Version management with incremental updates

## v3.1 — 2025-09-19

### Version Management & Documentation 📝

- **NEW**: Complete v3.0 version files with Universal Caption System integration
  - `versions/v3.0-universal-captions.html` - Production-ready UCS implementation
  - `versions/v3.0-debug-simple.html` - Debug version with performance monitoring
  - `versions/v3.0-README.md` - Comprehensive implementation guide
- **IMPROVED**: Version control system for easier deployment tracking
- **IMPROVED**: Documentation structure for better developer experience

## v3.0 — 2024-12-15

### Universal Caption System Integration ✨

- **NEW**: Universal Caption System v1.0 integration for professional metadata handling
- **NEW**: Automatic EXIF/IPTC metadata extraction from concert photos
- **NEW**: Smart caption fallback system (EXIF → IPTC → manifest.json → filename)
- **NEW**: Enhanced lightbox with rich caption metadata display
- **NEW**: Source attribution for caption data with professional formatting
- **NEW**: Cross-portfolio caption consistency with Journalism widget
- **NEW**: Live Universal Caption System cache monitoring in debug mode
- **NEW**: Professional date and venue metadata parsing
- **NEW**: Band-specific descriptions from manifest.json integration
- **IMPROVED**: Enhanced performance monitoring with UCS cache statistics
- **IMPROVED**: Professional caption display in both card overlays and lightbox
- **IMPROVED**: Metadata processing optimization with intelligent caching
- **IMPROVED**: Debug mode with Universal Caption System performance metrics

## v2.2 — 2025-09-16

### Performance Revolution 🚀

- **NEW**: Shared portfolio API backend with intelligent caching and request deduplication
- **NEW**: Advanced EXIF parsing with 60% faster date extraction
- **NEW**: Progressive image loading with intersection observer
- **NEW**: Request batching reduces API calls by up to 70%
- **NEW**: WebP format detection and optimization
- **NEW**: Performance monitoring with real-time metrics (add `?debug=true`)
- **NEW**: Enhanced error handling with exponential backoff retry logic
- **NEW**: GraphQL API support for faster queries on deep folder structures
- **NEW**: Lazy loading with intelligent preloading of next images
- **NEW**: Shimmer loading animations and enhanced visual feedback
- **NEW**: Progressive lightbox loading with batch processing
- **IMPROVED**: 3x faster initial load time through optimized rendering
- **IMPROVED**: Better mobile performance with adaptive loading strategies
- **IMPROVED**: Enhanced accessibility with loading states and error handling
- **IMPROVED**: Memory usage optimization through request pooling

## v2.1 — 2025-09-16

- Auto date now prioritizes EXIF DateTimeOriginal from images (earliest of up to 3 samples)
- Fallback order: manifest.date → EXIF → latest commit date

## v2.0 — 2025-09-16

- Natural-height masonry via CSS columns (no cropping)
- Auto date support: manifest.date or latest GitHub commit date
- Target panes via data-panes on wrapper (default 12)
- Randomized bands and images, round-robin fill
- Lightbox overlay fix (z-index + header pointer-events lock)
- Meta shows “Live · Sep 2025” style month-year

## v1.0 — 2025-09-15

- Initial grid-based gallery and lightbox
- GitHub API fetch for folders and images
- Basic styling and interactions

// ...existing code...

## 4.4.0 — 2025-09-29

- Added versions/v4.4-unified.html using shared theme and unified manifest loader.
- Backward-compatible; older versions untouched.

## 4.4.1 — 2025-09-29

- Updated v4.4 unified view with new card layout, eyebrow dates, and venue stack to echo the live Concert page design.

## 4.4.2 — 2025-09-30

- Shifted the v4.4 unified overlay to display titles and dates directly on the imagery with a monochrome gradient treatment.

## 4.4.3 — 2025-09-30

- Refined the v4.4 unified gallery with shuffled ordering, full-width concert art, and stacked captions beneath each image.
