# Blog Feed Widget (Google Sheets)

A lightweight blog feed widget you can update live via Google Sheets — supports images and auto captions. No API keys required.

## Why Google Sheets?
- Easy to edit from anywhere
- Live updates (just refresh the page)
- Public read-only access without auth (when shared properly)

## Quick Start

1) Create a Google Sheet and add a tab named `Blog` (or any name you prefer)
2) In row 1, add headers (case-insensitive):
   - Title
   - Date (YYYY-MM-DD or any parseable date)
   - Image (URL for hero image)
   - Body (plain text or simple HTML: p, a, ul, li, strong, em)
   - Images (optional: additional image URLs separated by commas or new lines)
3) Share the sheet so Anyone with the link can view (read-only)
4) Copy the Spreadsheet ID from the URL (between `/d/` and `/edit`)
5) Use the example snippet: `widgets/blog-feed/v1-google-sheets.html`
   - Set `data-sheet-id` to the Spreadsheet ID
   - Set `data-sheet-name` to the tab name (e.g., `Blog`)

## Example Embed (local site)

Include this container where you want the feed:

```html
<div id="blogFeed" data-blog-feed data-provider="sheets"
     data-sheet-id="YOUR_SHEET_ID" data-sheet-name="Blog" data-max-posts="5"
     data-show-dates="true" data-show-images="true" data-auto-captions="true"></div>
```

Then include the scripts (paths relative to this repo):

```html
<script src="../shared/universal-caption-system.js"></script>
<script src="./blog-feed.js"></script>
```

Minimal CSS is already in `v1-google-sheets.html`. You can copy those styles or integrate them into your site stylesheet.

## Auto Captions
This widget integrates with `widgets/shared/universal-caption-system.js` to auto-generate captions from EXIF/IPTC when possible:
- If an image has `alt`, that becomes the caption
- Else, EXIF/IPTC metadata is used when accessible
- Else, it falls back to a readable filename-based title

Note: Some remote hosts (e.g., certain CDNs or Google-hosted images) may not expose metadata due to CORS or image processing. In those cases, provide an `alt` or include captions in the Body content.

## Troubleshooting
- If you see "Failed to load blog":
  - Ensure the sheet is shared as Anyone with the link (Viewer)
  - Confirm `data-sheet-id` and `data-sheet-name` are correct
  - Make sure your image URLs are publicly accessible (no auth)
- Date formatting shows "(untitled)" or missing date:
  - Verify your column headers match the expected names (case-insensitive)
  - Ensure Date values are valid dates (e.g., 2025-09-19)

## Roadmap
- Google Docs provider (Published-to-web parsing)
- Self-contained single-code-block version (no external script references)
- Tag filtering and pagination
- Optional lightbox for inline images
