# Blog Feed Widget Changelog

## Version 3.5.2-WIP - 2025-12-27

### Theme Toggle Integration 🌙

- **NEW**: Manual Light/Dark theme toggle button with backdrop blur
- **FIXED**: Standardized theme variables with `data-theme` attributes
- **FIXED**: Better consistency with other themed widgets (Event Portfolio, Contact Form)
- **UPDATED**: Version indicator and title branding

## Version 3.5.1-WIP - 2025-12-27

### UX Polish & Resilience 🩹

- **ENHANCED**: Search debouncing (300ms) to improve performance during typing
- **NEW**: Added "Blog" header with visible version indicator
- **FIXED**: Modal positioning bug on mobile devices (over Safari chrome)
- **UPDATED**: Branding throughout the widget

## Version 3.5.0 - 2025-12-17

### ✨ Enhanced User Experience & Performance

**New Features**

- **🔍 Search & Filter System**
  - Real-time search across titles, content, excerpts, and tags
  - Client-side filtering (zero API calls, instant results)
  - Tag-based filtering with visual pill buttons
  - "Clear filters" quick action
  - Results counter showing filtered/total posts
  - Smooth fade animations when filtering

- **⏱️ Reading Time Indicator**
  - Auto-calculated based on word count (200 words/min average)
  - Displayed on both card previews and modal header
  - Helps users decide what to read based on time available

- **📊 Scroll Progress Bar**
  - Gradient progress indicator at top of modal
  - Only visible when reading a post
  - Smooth real-time updates as user scrolls

- **🖼️ Lazy-Loaded Images with Blur Placeholder**
  - Tiny gradient placeholder based on image URL hash
  - Smooth fade-in transition when image loads
  - IntersectionObserver for optimal performance
  - Fallback to gradient if image fails to load

- **📚 Copy All Citations Button**
  - One-click copy of all post references/sources
  - Formatted as numbered bibliography (plain text)
  - Only appears when post has sources
  - Integrates with existing citation system

- **👤 Clickable Author Filtering**
  - Click any author name to filter posts by that author
  - Underlined author names indicate clickability
  - Clears other filters when selecting an author
  - Shows "by [Author Name]" in results counter
  - Auto-scrolls to top when filter applied

- **📚 Authors Directory View**
  - Integrated via seamless toggle in search bar
  - Displays all authors in a responsive grid layout
  - Shows author avatar, name, bio, and post count
  - Clickable cards filter posts by that author
  - "Back to Posts" navigation included

- **🧼 Smart Content Cleaning (Google Docs)**
  - Automatically strips duplicate Title, Author, and Date headers from body
  - Prevents visual redundancy in post modal and excerpts
  - "Sources" section parser converts citations to structured data

- **💎 Premium UI Updates**
  - **Redesigned Search Bar**: Glassmorphic pill design with integrated SVG icons
  - **Citation Handling**: "Copy All Citations" moved to Sources section for better context
  - **Unified Navigation**: Toggle between Posts and Authors views without reload

**Enhanced Layout**

- Improved spacing to respect navigation header (`--mcc-nav-height`)
- Larger, more prominent page header (3rem title)
- Better card hierarchy with constrained title/excerpt (line-clamp)
- Increased grid max-width to 1400px for better desktop use
- Enhanced card hover effects (6px lift vs 4px)
- Better responsive breakpoints for tablet/mobile

**Visual Improvements**

- Glassmorphic search bar with premium feel
- Improved meta section layout with reading time
- Better color contrast and typography hierarchy
- Smooth animations for filter interactions
- "No results" state with helpful messaging
- Enhanced modal backdrop blur

**Technical**

- Client-side filtering for instant UX (no network delays)
- IntersectionObserver for lazy image loading
- Scroll event optimization for progress bar
- Better state management for filters and search
- All tags extracted and deduplicated from posts
- Maintained backward compatibility with v3.0.0 data format

**Performance**

- Lazy image loading reduces initial page weight
- Blur placeholders improve perceived performance
- Client-side filtering eliminates server round-trips
- Optimized animations with CSS transforms

---

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
