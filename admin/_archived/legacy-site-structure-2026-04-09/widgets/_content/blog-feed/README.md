# Blog Feed Widget

A lightweight blog feed widget you can update live via **Google Sheets** or **Google Docs** — supports images and auto captions. No API keys required.

## Why Google Sheets or Docs?

- **Easy to edit** from anywhere
- **Live updates** (just refresh the page)
- **Public read-only access** without auth (when shared properly)
- **Google Sheets**: Structured data with columns
- **Google Docs**: Natural writing format with headings and content

## Widget Modes

The widget supports two views:

1. **Posts View** (default): Displays blog posts in a grid with search, filtering, and reading
2. **Authors Directory**: Displays all authors with their bios and post counts

### Usage

```html
<!-- Blog Posts (default) -->
<div class="mcc-blog-widget" id="mccBlogWidget" data-limit="24" data-show-covers="true"></div>

<!-- Authors Directory -->
<div class="mcc-blog-widget" id="mccBlogWidget" data-view="authors"></div>
```

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

### Current Version: v3.5.0 (2025-12-17)

**Manifest-Based System with Enhanced UX**

The blog widget now uses a manifest-based architecture (no direct Google Docs/Sheets fetching in the widget itself):

**Key Features:**

- 🔍 **Real-time Search & Filter** - Client-side filtering across titles, content, and tags
- ⏱️ **Reading Time Indicators** - Auto-calculated from word count
- 📊 **Scroll Progress Bar** - Visual reading progress in post modal
- 🖼️ **Lazy Images with Blur Placeholders** - Premium loading experience
- 📱 **Responsive Layout** - Respects nav header height, optimized for all devices
- 🎨 **Glassmorphism 2.0** - Monochrome aesthetic with premium feel

**Data Architecture:**

- `data/blog/blog.manifest.json` - All blog posts
- `data/blog/authors.json` - Author profiles
- `scripts/blog/fetch-from-docs.js` - Build-time Google Docs ingestion

**Widget File:** `versions/v3.5.0-enhanced-blog.html`

### Previous Stable Versions

#### v3.0.0 - Minimal Blog System

- Manifest-based architecture (breaking change from v2.x)
- Author resolution system
- Sources panel with copy-to-clipboard
- Modal post view with shareable URLs
- No direct Google Docs fetching in widget

**Widget File:** `versions/v3.0.0-minimal-blog.html`

### Active Versions (≤2 Policy)

The following versions are maintained in `versions/`:

- **v2.1.0** (Current): Google Docs blog feed with natural writing format
- **v1-google-sheets** (Previous Stable): Structured data via Google Sheets

### Legacy Versions (Archived)

Versions v1-google-docs have been archived to maintain repository organization:

- **Archive Location**: `src/widgets/_archived/Legacy Widgets/blog-feed/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/blog-feed/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1-google-docs (1 version)

## Roadmap

- Google Docs provider (Published-to-web parsing)
- Self-contained single-code-block version (no external script references)
- Tag filtering and pagination
- Optional lightbox for inline images
