# Blog Feed Widget

A minimal, self-contained blog feed widget with JSON source support, masonry grid layout, and modal post viewer.

## Features

- **JSON Feed Support**: Fetches posts from a simple JSON file with localStorage caching
- **Masonry Grid Layout**: Responsive 3-column grid (2 on tablet, 1 on mobile) using CSS columns
- **Modal Post Viewer**: Full-content modal with keyboard navigation (ESC to close)
- **Sources Copy**: Automatic detection of Sources sections with copy-to-clipboard functionality
- **Optional Images**: Support for per-post image galleries with captions
- **Graceful Fallback**: Falls back to demo posts if JSON fetch fails
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme`
- **Performance**: 1-hour localStorage cache, lazy image loading, minimal JS bundle

## Active Versions (≤2 Policy)

### Current Version: v0.2.0

- **File**: `versions/v0.2.0-authoring-minimal.html`
- **Status**: Development/Testing
- **Release Date**: 2025-12-03
- **Features**: Author Panel (login/logout), minimal Publish Post form powered by API v1 blog routes; read path unchanged (JSON feed, caching, Sources copy, optional images)

### Previous Stable: v0.1.0

- **File**: `versions/v0.1.0-blog-minimal.html`
- **Release Date**: 2025-12-03
- **Features**: JSON feed, Sources copy, optional images, caching, graceful fallback

### Legacy Versions (Archived)

Older Google Sheets/Docs versions have been archived:

- **Archive Location**: `src/widgets/_archived/legacy-widget-versions/blog-feed/versions/`
- **Archived Versions**: v1-google-sheets, v2.1.0-google-docs, v3.0.0-multi-author, v3.1.0-google-docs, v3.2.0-author-doc (8 versions)
- See archive `INDEX.json` for complete version catalog

## Installation

### Squarespace Code Block

1. Add a Code Block to your Squarespace page
2. Paste the following:

```html
<div id="mccal-blog-feed"></div>
<script>
  (function () {
    fetch(
      "https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@blog-feed@0.2.0/src/widgets/blog-feed/versions/v0.2.0-authoring-minimal.html"
    )
      .then((r) => r.text())
      .then(
        (html) => (document.getElementById("mccal-blog-feed").innerHTML = html)
      );
  })();
</script>
```

### Direct Embed

Copy the entire contents of `versions/v0.2.0-authoring-minimal.html` into a Squarespace Code Block.

## Configuration

### Data Attributes

```html
<div class="blog" id="blog" data-dev="false"></div>
```

- `data-dev`: Set to `"false"` to hide the development badge (default: `"true"`)

### JSON Feed Format (Read Path)

Create a JSON file at `src/images/blog/blog-posts.json`:

```json
{
  "posts": [
    {
      "title": "Post Title",
      "author": "Author Name",
      "date": "2025-12-03",
      "excerpt": "Short excerpt or preview text...",
      "body": [
        "First paragraph of content.",
        "Second paragraph.",
        "## Sources",
        "1. Source citation 1",
        "2. Source citation 2"
      ],
      "images": [
        {
          "src": "../images/example.jpg",
          "alt": "Image description",
          "caption": "Optional caption"
        }
      ]
    }
  ]
}
```

**Note**: The `images` array is optional. Sources detection looks for `## Sources` or `Sources:` markers in the body array.

### Authoring (Write Path)

API v1 Blog routes are used for author login and publishing.

- Login: `POST /api/v1/blog/auth/login` → returns `{ token, author }`
- List posts: `GET /api/v1/blog/posts` → returns `{ posts: [...] }`
- Publish post: `POST /api/v1/blog/posts` (Authorization: Bearer `<token>`) → `{ success: true, post }`

Environment variables:

- `BLOG_JWT_SECRET` (required) — JWT signing secret; set in `.env`

Developer authors config:

- `src/api/config/blog-authors.json` with structure `{ "authors": [{ "id":"auth-001", "username":"mccal", "password":"demo123", "name":"McCal Media" }] }`

Security note: Development passwords are plaintext. Replace with bcrypt hashes before production.

## Troubleshooting

### Posts not loading

1. Check browser console for fetch errors
2. Verify `blog-posts.json` path is correct
3. Check CORS settings if using external host
4. Clear localStorage cache: `localStorage.removeItem('blog_posts_cache')`

### Login fails

1. Ensure API server is running locally (`npm run api:start` or dev server with API proxy)
2. Check `.env` contains `BLOG_JWT_SECRET`
3. Verify `src/api/config/blog-authors.json` contains your username/password
4. Confirm CORS allows your origin in `src/api/server.js`

### Sources not detected

- Ensure `## Sources` or `Sources:` marker appears on its own line in the body array
- Sources must come after main content in the body array

### Images not displaying

- Verify image paths are relative to the widget location
- Check image file permissions
- Confirm image URLs are accessible

## Performance

- **Cache Duration**: 1 hour localStorage cache for JSON feed
- **Image Loading**: Lazy loading with `loading="lazy"` attribute
- **Bundle Size**: ~15KB minified (inline CSS/JS, no external dependencies)
- **Render Strategy**: Progressive enhancement with demo fallback

## Accessibility

- Semantic HTML structure (`<article>`, `<time>`, `<figure>`)
- ARIA attributes on modal (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
- Keyboard navigation (ESC to close modal)
- Focus management in modal
- Proper heading hierarchy
- Alt text support for images
- Color contrast meets WCAG AA standards

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Local Testing

1. Start dev server: `npm run dev`
2. Navigate to test page with widget
3. Open browser console for debug output

### Validation

```bash
# Validate HTML structure
npm run validate:widgets

# Check all files
npm run repo:health
```

## Roadmap

- [ ] RSS feed generation
- [ ] Post sorting options (date, author, category)
- [ ] Category/tag filtering
- [ ] Search functionality
- [ ] Pagination support
- [ ] Rich text editor integration
- [ ] Comment system integration
- [ ] Image uploader for posts

## Support

For issues or questions:

- GitHub Issues: https://github.com/McCal-Codes/McCals-Website/issues
- Email: contact@mcc-cal.com

## License

MIT License - see repository for details

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.
