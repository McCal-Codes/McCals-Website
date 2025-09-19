# Changelog — Photojournalism Portfolio

All notable changes to this widget will be documented in this file.

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
