# Blog Feed Widget Changelog

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