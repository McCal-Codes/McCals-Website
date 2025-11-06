# Blog Feed Widget - Changelog

## [2.1.0] - 2025-11-05

### 🎉 Enhanced Google Docs Integration with Advanced Features

**Status:** Production Ready ✅

### Added
- ✅ **Sources section**: Collapsible dropdown for APA citations with copy functionality
- ✅ **H5 heading support**: Detects both "Sources" heading and H5-formatted citations
- ✅ **Local hero images**: Auto-loads images from `images/blog/` folder by post slug
- ✅ **URL routing**: Direct links to posts with shareable URLs (`?post=slug`)
- ✅ **Browser navigation**: Back/forward button support for post viewing
- ✅ **Deep linking**: Open specific posts via URL parameters
- ✅ **Cache busting**: Force fresh content from Google Docs with timestamps
- ✅ **Header spacing**: 80px top padding for fixed navigation compatibility
- ✅ **Blog description**: Minimal subtitle under heading
- ✅ **Image path configuration**: Customizable via `data-image-path` attribute

### Changed
- Updated description from "Essays" to "Articles on politics, photography, and the human condition"
- Sources now render as collapsible dropdown instead of dedicated bottom section
- Plain text APA citations supported (no URL required)
- Image loading now checks local folder before falling back to Google Doc images
- Modal updates URL when opened, clears when closed
- Google Docs fetch includes `cache: 'no-store'` for immediate updates

### Fixed
- H5 sources detection now handles both heading and citation elements
- Empty H2 headings no longer trigger post finalization prematurely
- Sources with null URLs render properly (copy button only, no visit link)
- Image paths corrected for proper relative path resolution

### Technical Details
- File: `versions/v2.1-google-docs-blog.html`
- New features: URL routing, local images, collapsible sources
- Image structure: `images/blog/{slug}.jpg`
- URL format: `?post=the-capitalist-contradiction`
- Browser APIs: History API (pushState/popstate), URLSearchParams

---

## [2.0.0] - 2025-11-05

### 🎉 Production Release - Self-Contained Squarespace Widget

**Status:** Production Ready ✅

### Added
- ✅ **Self-contained architecture**: All CSS/JS inline (no external dependencies)
- ✅ **Widget standards compliance**: Version badge, structured data, semantic HTML
- ✅ **SEO optimization**: Schema.org BlogPosting structured data for all posts
- ✅ **Accessibility enhancements**: ARIA labels, semantic HTML5, keyboard navigation
- ✅ **Performance patterns**: Lazy loading images, optimized parsing, reduced motion support
- ✅ **Version badge**: Visual indicator (v2.0) with hover tooltip
- ✅ **Production-ready deployment**: Single HTML file for Squarespace Code Blocks
- ✅ **Enhanced error handling**: Clear messages for missing/invalid configuration
- ✅ **Mobile-first responsive design**: Optimized breakpoints for all screen sizes

### Changed
- Consolidated all dependencies into single HTML file (no external scripts needed)
- Simplified Google Docs integration (removed UniversalCaptionSystem dependency)
- Improved date extraction and formatting with better fallbacks
- Enhanced HTML sanitization for security
- Updated card-based layout with modern design patterns
- Improved loading and error states with better UX

### Technical Details
- File: `versions/v2.0-google-docs-squarespace.html`
- Size: ~15KB (all-inclusive)
- Dependencies: None (fully self-contained)
- Compatibility: All modern browsers, Squarespace Code Blocks
- Performance: Fast initial load, lazy image loading, optimized rendering

### Migration from v1.0
- v1.0 required external scripts (`universal-caption-system.js`, `blog-feed-docs.js`)
- v2.0 includes everything inline - just copy/paste into Squarespace
- Configuration unchanged: same data attributes work in both versions
- Auto-captions removed (simplified for stability)

---

## [1.0.0] - 2025-09-19

### 🎉 Initial Release

**Core Features**
- Live blog updates via Google Sheets (no API keys required)
- Auto-caption generation from EXIF/IPTC image metadata
- Responsive card-based layout with modern styling
- Configurable via HTML data attributes
- Lightweight & self-contained

**Google Sheets Integration**
- GViz API for public sheet access
- Column mapping: Title, Date, Image, Body, Images
- Case-insensitive header recognition
- Graceful error handling with clear messages

**Auto Caption System**
- Integration with UniversalCaptionSystem.js
- EXIF/IPTC metadata extraction for professional photography
- Fallback to alt text or filename-based titles
- Smart caching and performance optimization

**Technical**
- ES6+ with backward compatibility
- Zero external dependencies
- HTML sanitization for safe content rendering
- Lazy image loading with progressive enhancement
- CORS-friendly implementation

**Files Added**
- `blog-feed.js` - Core widget logic
- `v1-google-sheets.html` - Ready-to-use example
- `README.md` - Complete setup guide
- `CHANGELOG.md` - Version history

**Browser Support**
- Modern browsers (Chrome 60+, Firefox 60+, Safari 12+)
- Graceful degradation for older browsers
- Mobile responsive design