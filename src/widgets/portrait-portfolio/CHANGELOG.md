# Portrait Portfolio Widget Changelog

All notable changes to the Portrait Portfolio widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-24

### Added
- **Initial Release**: Portrait-optimized photography showcase widget
- **Vertical Composition Focus**: 3:4 aspect ratio cards designed for portrait images
- **Enhanced Detail Viewing**: Vertical lightbox gallery for intimate portrait viewing
- **Performance Optimization**: Critical CSS inlining and lazy loading for portrait images
- **SEO Structured Data**: JSON-LD markup optimized for portrait photography collections
- **Responsive Design**: Mobile-optimized card sizing maintaining vertical emphasis
- **Accessibility Features**: ARIA labels, keyboard navigation, and screen reader support
- **Debug Panel**: Comprehensive metrics and cache management with `?debug=true`
- **Performance Monitoring**: Real-time metrics via `window.portraitAPI.getMetrics()`
- **Intelligent Caching**: 10-minute TTL with automatic refresh capabilities
- **Error Resilience**: Graceful degradation with retry mechanisms
- **Dark/Light Mode**: Automatic theme detection and adaptation
- **Masonry Layout**: Natural flow with CSS columns and intelligent spacing
- **Smooth Animations**: Staggered loading effects and refined hover states
- **Immersive Lightbox**: Vertical scroll gallery with hidden scrollbars
- **Navigation Hiding**: Comprehensive site navigation isolation during fullscreen viewing

### Technical Details
- **Manifest Structure**: Support for collections with folder paths, tags, and metadata
- **Image Loading**: Progressive loading with proper aspect ratio handling
- **Cache Management**: LocalStorage-based caching with fallback mechanisms
- **GitHub Integration**: Raw content delivery with multiple base path fallbacks
- **Cross-browser Support**: Modern browser APIs with progressive enhancement

### Performance Features
- **Critical Path Optimization**: Essential styles loaded first for fast initial render
- **Resource Hints**: Preconnect and DNS prefetch for GitHub API calls
- **Lazy Loading**: Intersection observer with intelligent preloading
- **Bundle Size**: Optimized code with removed unused functionality

### Accessibility & UX
- **Alt Text Generation**: Intelligent creation from collection metadata and filenames
- **Keyboard Support**: Full keyboard navigation for gallery browsing
- **Touch Interactions**: Mobile-optimized touch gestures
- **Screen Reader Support**: Comprehensive ARIA implementation

### SEO Enhancements
- **Structured Data**: Schema.org ImageGallery markup for rich search results
- **Meta Information**: Automatic generation of SEO-friendly descriptions
- **Performance**: Fast loading contributes to improved search rankings
- **Image Optimization**: Proper dimensions and format handling

### Browser Compatibility
- **Modern Browsers**: Full feature support (Chrome, Firefox, Safari, Edge)
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Browsers**: Optimized for iOS Safari and Android Chrome

### Dependencies
- **None Required**: Self-contained widget with no external dependencies
- **GitHub Raw API**: Content delivery via GitHub's CDN
- **Browser APIs**: Intersection Observer, Fetch API, and modern DOM methods

### Future Roadmap
- Advanced filtering and search capabilities
- Portrait-specific editing and cropping tools
- Social media integration and sharing
- Print-ready portfolio generation
- Client collaboration and feedback features
- Analytics and engagement tracking
- Multi-language support
- Custom branding and theming options

## [1.1.0] - 2025-11-04

### Added
- Client-first-name titles: the widget now extracts the client's first name from folder paths for cleaner captions and card headings.
- Rotating selection: the grid shows a rotating subset of portraits on each load (randomized 1–4 panes per session) to keep the presentation fresh.
- Subject tabs: dynamic subject tabs are generated from the manifest collections; new subjects appear automatically when collections are added.

### Fixed
- Initialization bug: resolved a runtime error that could prevent the widget from initializing (missing structured-data helper now reintroduced and guarded).

### Changed
- UX & accessibility tweaks: safe-area aware close button, hidden scrollbar handling for immersive lightbox mode, and improved navigation-hiding selectors for fullscreen viewing.
- Debug and cache updates: cache key bumped for v1.1 and debug-panel text updated to reflect the rotating-selection behavior.

### Notes
- This release keeps the same manifest schema and read-paths; no changes are required to existing manifests. A small tooling improvement was also applied to the repository manifest generator to avoid unnecessary file writes when generated content is unchanged.
