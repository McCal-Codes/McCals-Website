# Blog Feed Widget

A lightweight blog feed widget you can update live via **Google Sheets** or **Google Docs** — supports images and auto captions. No API keys required.

## Why Google Sheets or Docs?

- **Easy to edit** from anywhere
- **Live updates** (just refresh the page)
- **Public read-only access** without auth (when shared properly)
- **Google Sheets**: Structured data with columns
- **Google Docs**: Natural writing format with headings and content

## Quick Start

### Option 1: Google Sheets

1. Create a Google Sheet and add a tab named `Blog` (or any name you prefer)
2. In row 1, add headers (case-insensitive):
   - Title
   - Date (YYYY-MM-DD or any parseable date)
   - Image (URL for hero image)
   - Body (plain text or simple HTML: p, a, ul, li, strong, em)
   - Images (optional: additional image URLs separated by commas or new lines)
3. Share the sheet so Anyone with the link can view (read-only)
4. Copy the Spreadsheet ID from the URL (between `/d/` and `/edit`)
5. Use the example snippet: `widgets/blog-feed/v1-google-sheets.html`

### Option 2: Google Docs (Recommended for Natural Writing)

1. Create a Google Doc with your blog content
2. Use **headings** (H1, H2, or H3) for blog post titles
3. Write content under each heading (supports formatting, lists, links)
4. Add images directly in the document
5. **Publish to web**: File > Share > Publish to web
6. Copy the Document ID from the URL (between `/d/` and `/edit`)
7. Use the example snippet: `widgets/blog-feed/v1-google-docs.html`

## Example Embed (local site)

### Google Sheets Version:

```html
<div
  id="blogFeed"
  data-blog-feed
  data-provider="sheets"
  data-sheet-id="YOUR_SHEET_ID"
  data-sheet-name="Blog"
  data-max-posts="5"
  data-show-dates="true"
  data-show-images="true"
  data-auto-captions="true"
></div>

<script src="../shared/universal-caption-system.js"></script>
<script src="./blog-feed.js"></script>
```

### Google Docs Version:

```html
<div
  id="blogFeed"
  data-blog-feed-docs
  data-provider="docs"
  data-doc-id="YOUR_DOC_ID"
  data-max-posts="5"
  data-show-dates="true"
  data-show-images="true"
  data-auto-captions="true"
></div>

<script src="../shared/universal-caption-system.js"></script>
<script src="./blog-feed-docs.js"></script>
```

Minimal CSS is already in `v1-google-sheets.html`. You can copy those styles or integrate them into your site stylesheet.

## Auto Captions

This widget integrates with `widgets/shared/universal-caption-system.js` to auto-generate captions from EXIF/IPTC when possible:

- If an image has `alt`, that becomes the caption
- Else, EXIF/IPTC metadata is used when accessible
- Else, it falls back to a readable filename-based title

Note: Some remote hosts (e.g., certain CDNs or Google-hosted images) may not expose metadata due to CORS or image processing. In those cases, provide an `alt` or include captions in the Body content.

## Troubleshooting

### Google Sheets Issues:

- If you see "Failed to load blog":
  - Ensure the sheet is shared as Anyone with the link (Viewer)
  - Confirm `data-sheet-id` and `data-sheet-name` are correct
  - Make sure your image URLs are publicly accessible (no auth)
- Date formatting shows "(untitled)" or missing date:
  - Verify your column headers match the expected names (case-insensitive)
  - Ensure Date values are valid dates (e.g., 2025-09-19)

### Google Docs Issues:

- If you see "Failed to load blog from Google Docs":
  - Make sure the document is **Published to web** (not just shared)
  - Go to File > Share > Publish to web and click "Publish"
  - Confirm `data-doc-id` matches your document ID
- No blog posts appear:
  - Use proper headings (H1, H2, H3) for post titles
  - Make sure there's content under each heading

## Versions

### Active Versions (≤2 Policy)

The following versions are maintained in `versions/`:

- **v3.0.0** (Current): Multi-author blog feed with interactive filtering, search, and modern architecture
- **v2.1.0** (Previous Stable): Google Docs blog feed with natural writing format

### Legacy Versions (Archived)

Versions v1-google-sheets and v1-google-docs have been archived to maintain repository organization:

- **Archive Location**: `src/widgets/_archived/Legacy Widgets/blog-feed/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/blog-feed/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1-google-sheets, v1-google-docs (2 versions)

## v3.0.0 Multi-Author Features

### Author Object Structure

```javascript
{
  id: 'unique-author-id',
  name: 'Author Name',
  bio: 'Short bio description',
  avatar: '/path/to/avatar.jpg',
  social: {
    twitter: '@handle',
    instagram: '@handle',
    email: 'email@example.com'
  }
}
```

### Post Object Structure

```javascript
{
  id: 'unique-post-id',
  title: 'Article Title',
  excerpt: 'Brief excerpt (150-200 chars)',
  content: '<p>Full HTML content...</p>',
  author: 'author-id', // References author.id
  category: 'Category Name',
  tags: ['Tag1', 'Tag2', 'Tag3'],
  date: '2025-12-02', // ISO date string
  image: '/path/to/featured-image.jpg',
  readTime: '8 min read'
}
```

### Configuration Options

```html
<div
  class="mcc-blog"
  id="blogWidget"
  data-widget-version="3.0.0"
  data-max-posts="12"
  data-author-filter="true"
  data-category-filter="true"
  data-search="true"
></div>
```

**Attributes:**

- `data-max-posts`: Maximum posts to display (default: 12)
- `data-author-filter`: Enable author filtering (default: true)
- `data-category-filter`: Enable category filtering (default: true)
- `data-search`: Enable search functionality (default: true)
- `data-authors`: URL to authors.json or inline JSON string
- `data-posts`: URL to posts.json or inline JSON string

### Interactive Features

**Search**: Live search across titles, excerpts, and tags with 300ms debounce

**Filters**:

- By Author: Dropdown populated from author list
- By Category: Dropdown auto-generated from post categories
- Sort: Newest first, oldest first, or alphabetical by title

**Modal View**: Click any card to open full post in modal with:

- Author profile display
- Full formatted content
- Close on Escape key or overlay click
- Focus management for accessibility

### Modernization Benefits

1. **CSS Tokens**: Uses shared design system with fallbacks
2. **BEM Naming**: Predictable, maintainable class names
3. **Modern JavaScript**: ES6+ patterns throughout
4. **Accessibility**: Full ARIA support and keyboard navigation
5. **Performance**: Debounced search, efficient filtering
6. **Responsive**: Adapts to mobile, tablet, desktop
7. **Theme Support**: Light/dark mode via CSS custom properties

## Roadmap

- Google Docs provider (Published-to-web parsing)
- Self-contained single-code-block version (no external script references)
- Tag filtering and pagination
- Optional lightbox for inline images
