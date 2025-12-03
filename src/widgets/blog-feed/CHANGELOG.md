# Blog Feed Widget Changelog

## Version 0.2.0 - 2025-12-03

### ✍️ Minimal Authoring (Login + Publish)

Adds a simple Author Panel for logging in and publishing posts directly from the widget.
Backend powered by new API v1 Blog routes.

**New Features**

- Author Panel with login/logout and minimal Publish Post form
- API integration:
  - `POST /api/v1/blog/auth/login` returns JWT and author info
  - `POST /api/v1/blog/posts` creates a post (auth required)
  - `GET /api/v1/blog/posts` lists posts (future: alternative to JSON feed)
- LocalStorage token persistence; simple status messages
- Cache busting after publish to immediately reflect new content

**Security & Config**

- Development-only plaintext passwords in `src/api/config/blog-authors.json`
- Environment variable `BLOG_JWT_SECRET` required; added `.env` placeholder
- CORS configured in `src/api/server.js` for local dev and Squarespace domains
- TODO: Replace plaintext with bcrypt before production

**Files**

- `versions/v0.2.0-authoring-minimal.html` — Widget with Author Panel
- `src/api/routes/blog.js` — API v1 Blog routes (auth/login, posts list/create)
- `src/api/config/blog-authors.json` — Development authors config
- `package.json` — Add `jsonwebtoken` dependency
- `.env` — Add `BLOG_JWT_SECRET` placeholder

**Notes**

- Read path remains unchanged (JSON feed with localStorage caching)
- Write path uses API and stores posts in `src/images/blog/blog-posts.json`
- Future iterations may move read path to API as well

---

## Version 0.1.0 - 2025-12-03

### 🎯 Reset & Simplification - Minimal JSON Feed

**Major Changes**

- Complete reset from legacy Google Sheets/Docs architecture
- New minimal JSON-based feed system with clean slate
- Self-contained HTML widget (inline CSS/JS, no external dependencies)
- Progressive enhancement from static demo posts

**Core Features**

- **JSON Feed Support**: Simple JSON file structure for blog posts
- **localStorage Caching**: 1-hour TTL cache to reduce network requests
- **Graceful Fallback**: Demo posts displayed if fetch fails
- **Masonry Grid**: CSS column-based responsive layout (3/2/1 columns)
- **Modal Post Viewer**: Full-content modal with keyboard navigation
- **Sources Copy**: Automatic detection and copy-to-clipboard for citations
- **Optional Images**: Per-post image galleries with captions
- **Dark Mode**: Automatic theme support via `prefers-color-scheme`

**JSON Structure**

```json
{
  "posts": [
    {
      "title": "Post Title",
      "author": "Author Name",
      "date": "2025-12-03",
      "excerpt": "Preview text...",
      "body": ["Paragraph 1", "## Sources", "1. Citation"],
      "images": [{ "src": "path.jpg", "alt": "desc", "caption": "text" }]
    }
  ]
}
```

**Technical Details**

- Self-contained single HTML file (~15KB)
- ES6+ JavaScript with async/await
- No external script dependencies
- Semantic HTML5 structure
- WCAG AA accessibility compliance
- Structured data (Schema.org Blog markup)

**Performance**

- 1-hour localStorage cache for JSON feed
- Lazy image loading (`loading="lazy"`)
- Progressive enhancement pattern
- Minimal DOM manipulation
- Debounced interactions

**Accessibility**

- Semantic HTML (`<article>`, `<time>`, `<figure>`)
- ARIA attributes on modal
- Keyboard navigation (ESC to close)
- Focus management
- Proper heading hierarchy
- Alt text support
- Color contrast meets WCAG AA

**Development Features**

- `data-dev` attribute for development badge toggle
- Console warnings for fetch failures
- Demo post fallback for testing
- Clear error messages

**Files**

- `versions/v0.1.0-blog-minimal.html` - Complete widget
- `../../images/blog/blog-posts.json` - Sample JSON feed
- `README.md` - Updated for v0.1.0
- `CHANGELOG.md` - This file

**Migration from v3.x**

This version is a ground-up rebuild. Key differences:

1. **Data Source**: JSON file instead of Google Docs/Sheets
2. **Architecture**: Single self-contained HTML file
3. **Dependencies**: Zero external scripts (was: multiple JS files)
4. **Caching**: localStorage (was: none)
5. **Complexity**: Minimal (~500 lines vs 1000+)

To migrate:

1. Export content from Google Docs/Sheets
2. Convert to JSON format (see README)
3. Upload `blog-posts.json` to `src/images/blog/`
4. Replace widget embed code

**Browser Support**

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Known Limitations**

- No RSS feed generation (roadmap item)
- No category/tag filtering (roadmap item)
- No pagination (roadmap item)
- No search functionality (roadmap item)

**Next Steps (Phase 2)**

- [ ] Add RSS feed generation
- [ ] Implement post sorting options
- [ ] Add category/tag filtering
- [ ] Implement search functionality
- [ ] Add pagination support
- [ ] Create blog post editor widget

---

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
