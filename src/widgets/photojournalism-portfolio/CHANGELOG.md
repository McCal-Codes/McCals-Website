# Changelog — Photojournalism Portfolio

All notable changes to this widget will be documented in this file.

## v3.0.1 (2024-09-23) — Data Correction
• Fixed Rooney Rule image marked as unpublished
• Updated test data accuracy

## v3.0 (2024-09-23) — Published Work Support 📰 [Pushed 2024-09-23]
### Major Release - Publication Tracking 🎉
- **NEW**: Green "Published" badges for published images
- **NEW**: Outlet information display in card overlays
- **NEW**: Clickable outlet links when provided  
- **NEW**: Enhanced lightbox with publication details section
- **NEW**: Article titles with direct links to published stories
- **NEW**: Published dates with proper formatting
- **NEW**: "Published Work" filter category with special green styling
- **NEW**: `generate-journalism-manifest.js` script for manifest management
- **NEW**: Publication metadata in manifest.json (`published`, `outlet`, `outletUrl`, `articleUrl`, `articleTitle`, `publishedDate`)
- **ENHANCED**: Improved auto-categorization based on folder structure
- **ENHANCED**: Support for nested folder structures
- **ENHANCED**: Distinctive green color scheme for published work (`--published:#00d4aa`)
- **FIXED**: Better error handling for missing manifest files
- **TECHNICAL**: Full backwards compatibility with v2.x, optimized caching system

## v2.2 (2025-09-19) — Path-Based Category Linking 🔗
### Advanced URL Navigation 🌐
- **NEW**: Path-based category URLs (e.g., `/photojournalism-portfolio/politics`)
- **NEW**: Clean, shareable category links with SEO-friendly structure
- **NEW**: Link icons (🔗) on category buttons for easy sharing
- **NEW**: Copy-to-clipboard functionality with visual feedback
- **NEW**: Browser history support for category navigation
- **NEW**: Automatic path detection and category filtering
- **IMPROVED**: URL structure supports both hash and path-based navigation
- **ENHANCED**: Link generation creates clean URLs for better sharing

### URL Structure Support 🔍
- `yoursite.com/photojournalism` - All categories
- `yoursite.com/photojournalism/politics` - Politics category
- `yoursite.com/photojournalism/events` - Events category  
- `yoursite.com/photojournalism/portraits` - Portraits category
- `yoursite.com/photojournalism/featured` - Featured stories

## v2.1 (2025-09-16)
- **Caption Support**: Reads captions from EXIF/IPTC data (journalism standard)
- **manifest.json Support**: Custom captions, descriptions, and metadata
- **Enhanced Lightbox**: Displays full captions in image viewer
- **IPTC Parser**: Professional journalism metadata extraction
- **Priority System**: manifest.json → EXIF → auto-generated captions

## v2.0 (2025-09-16)
- Dynamic GitHub integration with automatic image discovery
- EXIF date extraction with commit date fallback
- Smart auto-categorization based on filename patterns
- Political figure detection (Trump, Biden, Harris, local politicians)
- Added "Featured Stories" category for high-profile coverage
- Enhanced "Portraits" detection for professionals and experts
- Multi-category support (images appear in multiple relevant categories)
- Performance optimization with intelligent caching
- Debug mode with performance metrics
- Progressive image loading
- Error handling and retry logic

## v1.0 (2025-09-16)
- Initial release of filterable masonry portfolio
- Manual category filtering (Politics, Events, Portraits)
- Multi-category support per image
- Hover overlay with title and metadata
- Lightbox with full caption
- Basic GitHub CDN integration using data-file pattern
- Responsive CSS columns layout

// ...existing code...

## 4.3.0 — 2025-09-29
- Added versions/v4.3-unified.html using shared theme and unified manifest loader.
- Backward-compatible; older versions untouched.


## 4.3.1 — 2025-09-29
- Matched v4.3 unified styling to the live Photojournalism grid with neutral cards, eyebrow dates, and tag emphasis.

## 4.3.2 — 2025-09-30
- Reworked the v4.3 unified look with on-image overlays, monochrome gradients, and date-forward captions like the Concert grid.

## 4.3.3 — 2025-09-30
- Reworked the v4.3 unified journalism gallery with tall full-width frames, shuffled sequencing, and caption stacks for tags and locales.
