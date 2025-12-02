# Blog Feed Widget Changelog

## Version 3.0.0 - 2025-12-02

### 🚀 Major Release - Multi-Author Support

**Breaking Changes**

- Complete architecture rewrite with modern ES6+ patterns
- New data structure for authors and posts
- BEM naming convention adopted (mcc-blog\_\_element)
- CSS custom properties with fallbacks

**New Features**

- **Multi-Author Support**: Full author profiles with avatar, bio, and social links
- **Interactive Filtering**: Filter by author, category, and tags
- **Live Search**: Debounced search across titles, excerpts, and tags
- **Sort Options**: Newest, oldest, or alphabetical sorting
- **Enhanced UI**: Modern card-based layout with hover effects
- **Author Cards**: Display author info with each post
- **Read Time**: Estimated reading time per article
- **Modal View**: Full-screen post reading experience

**Modernization**

- CSS custom properties from site-widgets.css v2.0.0 (with fallbacks)
- BEM naming convention (mcc-blog\_\_element--modifier)
- Modern ES6+: const/let, arrow functions, async/await, destructuring
- Shared utility functions (debounce, truncate, formatDate)
- Enhanced accessibility with ARIA attributes and roles
- Keyboard navigation support
- Structured data (BlogPosting schema.org)

**Performance**

- Debounced search (300ms delay)
- CSS column-based masonry layout
- Lazy loading ready
- Reduced motion support
- Optimized re-renders

**Accessibility**

- ARIA labels and roles throughout
- Keyboard navigation (Tab, Enter, Space, Escape)
- Focus management in modals
- Semantic HTML5 elements
- Screen reader friendly

**Technical**

- Self-contained single-file widget
- No external dependencies
- Sample data structure included
- Extensible for API/Google Docs integration (v3.1 planned)
- Responsive design (3 → 2 → 1 columns)

**Files Added**

- `v3.0.0-multi-author-blog.html` - Complete multi-author widget

**Migration Notes**

- v3.0.0 is not backward compatible with v1.x/v2.x data structures
- New author object required: `{ id, name, bio, avatar, social }`
- New post object adds: `author` (ID), `category`, `tags`, `readTime`
- See README for complete data structure examples

---

## Version 2.1.0 - 2025-10-15

### Google Docs Support

**New Features**

- Google Docs as blog source (published-to-web)
- Natural writing format with heading-based posts
- Inline image support
- Auto-parsing of formatted content

**Files Added**

- `v2.1.0-google-docs-blog.html` - Google Docs integration
- `blog-feed-docs.js` - Docs parser

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
