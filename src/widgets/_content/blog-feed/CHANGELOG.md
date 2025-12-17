# Blog Feed Widget Changelog

## Version 3.0.0 - 2025-12-17

### 🎉 Major Release - Minimal, Scalable Blog System

**Breaking Changes**

- Complete rewrite from direct Google Docs fetching to manifest-based system
- New data architecture with separation of concerns (posts + authors)

**Added**

- Manifest-based blog system (`blog.manifest.json` + `authors.json`)
- Author resolution with fallback to "Unknown Author"
- Sources panel with copy-to-clipboard (Plain Text & Markdown)
- Modal post view with shareable URL anchors (`#slug`)
- Google Docs ingestion script (`scripts/blog/fetch-from-docs.js`)
- Proper metadata extraction (date, category, tags, excerpt, cover image)
- Mobile-friendly lightbox (no popup blockers!)
- Magazine-style single-column layout (900px max-width)
- Comprehensive error handling and safe fallbacks

**Google Docs Format**

- Supports structured format with `POST:` markers
- Metadata fields: `date:`, `category:`, `tags:`, `excerpt:`, `image:`
- Automatic Sources section detection
- See `README.md` for formatting guide

**Technical**

- Widget never fetches Google Docs directly (build-time only)
- All data normalized to canonical shape before rendering
- Ready for multiple authors and future API integration
- Regex-based HTML parser (no heavy dependencies)
- UI is 100% data-source agnostic

**Files Added**

- `v3.0.0-minimal-blog.html` - New minimal widget
- `scripts/blog/fetch-from-docs.js` - Google Docs ingestion
- `src/data/blog/blog.manifest.json` - Post data
- `src/data/blog/authors.json` - Author data
- `src/types/blog.ts` - TypeScript types
- `src/lib/blog-loader.ts` - Data abstraction layer

---

## Version 1.0.0 - 2025-09-19

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
