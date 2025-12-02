# Blog Feed Widget - Google Docs Setup Guide

## Version 3.1.0 - Google Docs Integration

This guide explains how to set up and use the blog widget with Google Docs as your content source.

## Architecture Overview

**One Document = One Blog Post**

Each blog post is stored in a separate Google Doc. The widget fetches published docs, parses metadata, and displays them in a filterable blog feed.

### Benefits

- ✅ **Easy authoring**: Write in familiar Google Docs interface
- ✅ **Real-time updates**: Changes reflect automatically (with cache TTL)
- ✅ **Multiple authors**: Each doc can have different author metadata
- ✅ **No database**: All content lives in Google Docs
- ✅ **Performance**: localStorage caching minimizes API calls
- ✅ **SEO-friendly**: Structured data and semantic HTML

---

## Step-by-Step Setup

### 1. Create Your Blog Posts in Google Docs

For each blog post:

1. **Create a new Google Doc**
2. **Add metadata at the very top** (plain text in this format):

```
---
author: Caleb McCartney
author-avatar: https://example.com/images/caleb-avatar.jpg
date: 2025-11-15
category: Politics
tags: Photography, Politics, Social Justice
image: https://example.com/images/blog/photojournalism.jpg
excerpt: Exploring how documentary photography shapes public perception and drives social change in modern political discourse.
---
```

3. **Add your article title** as the first heading (H1 or H2)
4. **Write your content** using standard Google Docs formatting:
   - Headings (H1, H2, H3)
   - Paragraphs
   - Bold, italic
   - Images (upload directly to doc)
   - Lists, links, etc.

### 2. Publish Each Doc to the Web

For each blog post doc:

1. Click **File → Share → Publish to web**
2. Click **Publish** (confirm if prompted)
3. **Copy the published URL** - it looks like:
   ```
   https://docs.google.com/document/d/e/LONG_DOC_ID/pub
   ```
4. **Convert to export URL** by replacing `/pub` with `/export?format=html`:
   ```
   https://docs.google.com/document/d/e/LONG_DOC_ID/export?format=html
   ```

**Important**: Use the `/export?format=html` URL in your widget config!

### 3. Configure the Widget

Add the widget to your Squarespace Code Block:

#### Option A: Direct URLs in HTML

```html
<div
  id="blogWidget"
  data-widget-version="3.1.0"
  data-posts-source='[
    "https://docs.google.com/document/d/e/DOC_ID_1/export?format=html",
    "https://docs.google.com/document/d/e/DOC_ID_2/export?format=html",
    "https://docs.google.com/document/d/e/DOC_ID_3/export?format=html"
  ]'
  data-cache-ttl="60"
  data-max-posts="12"
></div>
```

#### Option B: External Manifest (Recommended for many posts)

Create a `posts-manifest.json` file:

```json
{
  "posts": [
    "https://docs.google.com/document/d/e/DOC_ID_1/export?format=html",
    "https://docs.google.com/document/d/e/DOC_ID_2/export?format=html",
    "https://docs.google.com/document/d/e/DOC_ID_3/export?format=html"
  ]
}
```

Then reference it in the widget:

```html
<div
  id="blogWidget"
  data-posts-source="/path/to/posts-manifest.json"
  data-cache-ttl="60"
></div>
```

---

## Metadata Reference

All metadata fields are **optional** but recommended for best results:

| Field           | Type            | Default          | Description                                   |
| --------------- | --------------- | ---------------- | --------------------------------------------- |
| `author`        | String          | "Unknown Author" | Author's full name                            |
| `author-avatar` | URL             | Default avatar   | Author profile image (recommended: 200x200px) |
| `date`          | YYYY-MM-DD      | Current date     | Publication date                              |
| `category`      | String          | "Uncategorized"  | Article category (for filtering)              |
| `tags`          | Comma-separated | `[]`             | Tags for searching/filtering                  |
| `image`         | URL             | Default image    | Featured image (recommended: 1200x630px)      |
| `excerpt`       | String          | Auto-generated   | Brief description (150 chars recommended)     |

### Metadata Format Rules

1. Must start with `---` on its own line
2. Must end with `---` on its own line
3. Format: `field: value` (one per line)
4. Tags: comma-separated list
5. URLs: must be absolute (include `https://`)

### Example with All Fields

```
---
author: Caleb McCartney
author-avatar: https://mccal.media/images/authors/caleb.jpg
date: 2025-11-15
category: Photography
tags: Documentary, Politics, Ethics, Social Justice
image: https://mccal.media/images/blog/campaign-trail.jpg
excerpt: A first-hand account of documenting the presidential campaign and the challenges of capturing authentic moments in modern political journalism.
---

# Behind the Lens: Covering the 2024 Campaign Trail

Your article content starts here...
```

---

## Widget Configuration Options

Configure via `data-*` attributes on `#blogWidget`:

| Attribute              | Type              | Default | Description                                 |
| ---------------------- | ----------------- | ------- | ------------------------------------------- |
| `data-posts-source`    | JSON Array or URL | `[]`    | Google Docs export URLs or path to manifest |
| `data-cache-ttl`       | Number            | `60`    | Cache time-to-live in minutes               |
| `data-max-posts`       | Number            | `12`    | Maximum posts per page                      |
| `data-author-filter`   | Boolean           | `true`  | Enable author dropdown filter               |
| `data-category-filter` | Boolean           | `true`  | Enable category dropdown filter             |
| `data-search`          | Boolean           | `true`  | Enable search box                           |

---

## Performance & Caching

### How Caching Works

1. **First load**: Widget fetches all Google Docs (parallel batches of 5)
2. **Parsed data cached** in localStorage with TTL
3. **Subsequent loads**: Instant from cache (until TTL expires)
4. **After TTL**: Fresh fetch from Google Docs

### Cache Management

**View cache in browser console:**

```javascript
// See all cached posts
Object.keys(localStorage).filter((k) => k.startsWith("mcc-blog-cache-"));

// Clear cache manually
CacheManager.clear();
```

**Cache keys:**

- `mcc-blog-cache-post-[URL]` - Individual posts
- `mcc-blog-cache-manifest-[URL]` - Manifest file

### Performance Tips

1. **Set appropriate TTL**:

   - Frequently updated blog: `data-cache-ttl="15"` (15 min)
   - Rarely updated: `data-cache-ttl="360"` (6 hours)

2. **Use manifest for many posts**: Easier to manage than inline URLs

3. **Optimize images**:

   - Featured images: 1200x630px, <200KB
   - Author avatars: 200x200px, <50KB

4. **Batch docs logically**: Widget fetches 5 at a time to avoid overwhelming browser

---

## Common Issues & Troubleshooting

### "Failed to load blog posts"

**Problem**: Widget can't fetch Google Docs

**Solutions**:

1. Verify docs are **published to web** (not just shared)
2. Use `/export?format=html` URL format (not `/pub`)
3. Check browser console for CORS errors
4. Ensure docs are publicly accessible (no login required)

### Metadata not parsing

**Problem**: Author/date/category not showing correctly

**Solutions**:

1. Verify metadata block starts/ends with `---` (exactly 3 dashes)
2. Check format: `field: value` (colon + space)
3. Ensure no extra whitespace or special characters
4. Metadata must be at **very top** of document

### Images not loading

**Problem**: Images from Google Docs don't appear

**Solutions**:

1. Upload images to your own server/CDN
2. Use absolute URLs in `image:` metadata field
3. Images inside doc content: Google Docs exports them, but large images may be slow

### Cache not updating

**Problem**: Changes to Google Docs not reflecting

**Solutions**:

1. Wait for TTL to expire (check `data-cache-ttl`)
2. Clear cache manually: `CacheManager.clear()` in console
3. Force refresh: Clear browser cache or use incognito mode

---

## Example Workflow

### Adding a New Blog Post

1. **Write post in Google Docs**

   - Add metadata block at top
   - Write content with headings/formatting
   - Upload/reference images

2. **Publish to web**

   - File → Share → Publish to web → Publish
   - Copy URL and convert to export format

3. **Add to widget**

   - Option A: Add URL to `data-posts-source` array in HTML
   - Option B: Add URL to `posts-manifest.json` and commit

4. **Wait for cache refresh** (or clear cache manually)

5. **Verify on site**
   - Check post appears in feed
   - Test filters and search
   - Verify metadata displays correctly

### Updating Existing Post

1. **Edit Google Doc** (changes are live on Google's side)
2. **Wait for TTL** or clear cache
3. **Refresh page** - changes should appear

### Managing Multiple Authors

Each doc can have different author metadata:

```
---
author: Jane Smith
author-avatar: https://example.com/jane.jpg
---
```

The widget automatically:

- Extracts unique authors for dropdown filter
- Groups posts by author
- Displays correct avatar per post

---

## Advanced Usage

### Custom Styling

The widget uses CSS custom properties you can override:

```css
:root {
  --mcc-accent: #your-color;
  --mcc-fg: #your-text-color;
  /* etc. */
}
```

### Programmatic Access

Access widget state in browser console:

```javascript
// Get all posts
BlogWidget.state.posts;

// Get current filters
BlogWidget.state.currentFilters;

// Manually refresh (bypass cache)
CacheManager.clear();
location.reload();
```

### Dark Mode

Widget automatically adapts to system dark mode via `prefers-color-scheme`.

---

## Best Practices

### Content Strategy

1. **Consistent metadata**: Always fill author, date, category
2. **Descriptive excerpts**: Write compelling 150-char summaries
3. **Relevant tags**: 3-5 tags per post for better filtering
4. **Quality images**: High-res featured images (1200x630px)

### Organization

1. **Use manifest** for 10+ posts (easier to manage)
2. **Organize by date folders** in Google Drive (e.g., "Blog Posts 2025")
3. **Naming convention**: "YYYY-MM-DD - Post Title"
4. **Version docs**: Use "File → Version history" for major edits

### Performance

1. **Reasonable cache TTL**: 30-60 minutes is sweet spot
2. **Limit post count**: 20-30 max for best performance
3. **Optimize images**: Compress before uploading
4. **Monitor bundle size**: Keep docs focused (3,000-5,000 words)

---

## Migration Guide

### From v3.0 (Sample Data) to v3.1 (Google Docs)

1. Create Google Docs for existing sample posts
2. Publish each doc and get export URLs
3. Update `data-posts-source` from sample data to Google Docs URLs
4. Test thoroughly before deploying

### From Other Platforms

**WordPress/Ghost/Medium export:**

1. Export to HTML
2. Copy content to Google Docs
3. Add metadata block at top
4. Publish and configure widget

---

## Support & Resources

- **Widget Version**: 3.1.0
- **Documentation**: This file
- **Example Manifest**: See `posts-manifest.example.json`
- **GitHub Issues**: Report bugs or request features

---

## Changelog

### v3.1.0 (2025-12-02)

- ✨ Added Google Docs integration (one doc per post)
- ✨ Metadata parsing from doc content (YAML-like format)
- ✨ localStorage caching with configurable TTL
- ✨ Support for manifest URLs or direct doc URLs
- ✨ Automatic excerpt generation from content
- ✨ Read time estimation
- ✨ Batch fetching (5 docs at a time)
- ✨ Improved error handling and user feedback
- 🐛 Fixed filter state reset on pagination
- 🐛 Fixed modal keyboard navigation conflicts

### v3.0.0 (Previous)

- Multi-author support with profiles
- Interactive filtering (author, category, tags)
- Search functionality
- Responsive masonry layout
- Sample data (now replaced with Google Docs)

---

## License

© 2025 Caleb McCartney / McCal Media. All rights reserved.
