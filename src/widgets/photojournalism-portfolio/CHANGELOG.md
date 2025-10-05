# Changelog — Photojournalism Portfolio

All notable changes to this widget will be documented in this file.

## v4.9 (2025-10-05) — Fixed Image Stretching in Lightbox 🔧
- FIXED: Image aspect ratio preservation in lightbox gallery
- IMPROVED: Added `object-fit: contain` to prevent image stretching/distortion
- IMPROVED: Enhanced image centering with `display: block` and `margin: 0 auto`
- IMPROVED: Maintains proper image proportions regardless of viewport size or image dimensions

## v4.8 (2025-10-05) — Hidden Lightbox Scrollbars 🖼️
- NEW: Completely hidden scrollbars in lightbox gallery for cleaner appearance
- NEW: Cross-browser scrollbar hiding (webkit, firefox, IE/Edge) 
- IMPROVED: Maintains scroll functionality while removing visual scrollbar clutter
- IMPROVED: Enhanced immersive fullscreen viewing experience

## v4.7 (2025-10-05) — Enhanced Navigation Hiding 🚫
- NEW: Comprehensive navigation bar hiding when lightbox is open
- NEW: Triple isolation with opacity + visibility + pointer-events rules
- IMPROVED: Enhanced CSS selectors target all common navigation patterns  
- IMPROVED: Prevents navigation interference with fullscreen image viewing

## v4.6 (2025-10-05) — Enhanced Filtering & Minimal Published Badge ✨
- FIXED: Spacing issue with filters - hidden cards no longer take up space
- NEW: Redesigned published indicator as minimal dot at top-left of card
- IMPROVED: Enhanced published badge with subtle backdrop blur styling
- IMPROVED: Cards now appear at top when filtered without awkward gaps

## v4.5 (2025-10-05) — Fixed Published Work Filter 🔧
- FIXED: "Published Work" filter now shows items tagged with "Published Work"
- IMPROVED: Enhanced buildCard function detects published items from tags array
- IMPROVED: Updated filter logic properly handles published content categorization
- IMPROVED: Streamlined filter tabs by removing unused categories

## v4.4 (2025-10-05) — Optimized Close Button 🎯
- FIXED: Close button positioning to avoid header overlap (fixed to viewport)
- IMPROVED: Enhanced close button with backdrop blur and improved styling
- IMPROVED: Increased button size to 44px for better accessibility
- IMPROVED: Higher z-index ensures button stays above all headers

## v4.3.4 (2025-10-05) — Cache Bust + Header Isolation ♻️
- NEW: Generated-date–scoped cache key automatically invalidates stale localStorage entries when the manifest regenerates
- NEW: Force + Bust debug control adds a timestamp query parameter to defeat CDN / edge caching immediately
- NEW: Global `html.lb-open` pointer-events isolation (prevents Squarespace header / announcement bar interaction under lightbox)
- NEW: Debug panel fields for Manifest Generated date and active Bust token
- IMPROVED: Unified debug action layout (Force, Force + Bust, Clear Cache, Logs toggle, Tests)
- IMPROVED: Lightbox overlay receives explicit max z-index (2,147,483,647) parity with Events / Featured widgets
- TECHNICAL: Local cache TTL remains 10m; scheduled background refresh every 15m now uses new generated-date key
- NOTE: Previous 4.3.x experimental styling entries retained below for historical record

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
