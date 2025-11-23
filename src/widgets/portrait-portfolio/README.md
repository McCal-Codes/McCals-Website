# Portrait Portfolio Widget

**Current Version: v1.1** — Portrait-optimized photography showcase with vertical composition layouts, rotating selections, and dynamic subject tabs for fresher presentations.

## Features

### Portrait-Specific Design 🎨
- **Vertical Composition Focus**: Optimized 3:4 aspect ratio cards for portrait photography
- **Enhanced Detail Viewing**: Vertical lightbox gallery showcasing portrait intimacy
- **Intimate Storytelling**: Layout designed for personal narratives and character studies
- **Responsive Portrait Cards**: Mobile-optimized sizing maintaining vertical emphasis

### Performance 🚀
- **Portrait Image Optimization**: Efficient loading patterns for vertical compositions
- **Critical CSS Inlining**: Fast initial render with portrait-specific styles
- **Lazy Loading**: Progressive image loading with proper aspect ratio handling
- **SEO Structured Data**: JSON-LD markup optimized for portrait photography collections

### Visual Excellence ✨
- **Natural Masonry Flow**: CSS columns with intelligent spacing for portrait collections
- **Smooth Animations**: Staggered loading with refined hover effects for vertical images
- **Dark/Light Mode**: Automatic theme adaptation with portrait-focused color schemes
- **Immersive Lightbox**: Vertical scroll gallery with hidden scrollbars for distraction-free viewing

### Accessibility & UX ♿
- **Enhanced Alt Text**: Intelligent generation from collection metadata and image names
- **Keyboard Navigation**: Full keyboard support for portrait gallery browsing
- **ARIA Labels**: Comprehensive accessibility for screen readers
- **Touch-Friendly**: Mobile-optimized interactions for portrait viewing

### Developer Experience 🛠️
- **Debug Panel**: Comprehensive metrics with `?debug=true` URL parameter
- **Performance Monitoring**: Real-time metrics via `window.portraitAPI.getMetrics()`
- **Cache Management**: Intelligent caching with manual override options
- **Error Resilience**: Graceful degradation with retry mechanisms

## Usage

1. **Copy the Widget Code**: Copy the entire contents of `versions/v1.0.0.html`
2. **Squarespace Integration**: Paste into a Code Block on your Squarespace page
3. **Manifest Setup**: Ensure `src/images/Portfolios/Portrait/portrait-manifest.json` exists
4. **Customization**: Modify `data-panes` attribute to control number of displayed portraits. Note: the widget now selects a rotating subset of portraits on each load (default behavior shows 1–4 random panes per session) unless `data-panes` is explicitly set to a fixed number.

## Manifest Structure

The widget expects a manifest file at `src/images/Portfolios/Portrait/portrait-manifest.json`:

```json
{
  "version": "1.0",
  "generated": "2025-10-24T16:57:52.183Z",
  "totalCollections": 5,
  "collections": [
    {
      "collectionName": "Character Studies",
      "folderPath": "Portraits/Character Studies",
      "totalImages": 12,
      "images": ["image1.jpg", "image2.jpg", ...],
      "tags": ["portrait", "character"],
      "dateDisplay": "2024",
      "dateISO": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Configuration Options

- **`data-panes`**: Number of portrait cards to display (default: 20)
- **`data-widget-version`**: Version identifier for debugging

### What's new in v1.1

- Client-first-name titles: captions and headings are now derived from the first name in folder paths for cleaner presentation.
- Rotating selection: by default the widget shows a randomized subset of portraits on each page load (1–4 panes) to keep the gallery feeling fresh. You can override this with `data-panes`.
- Subject tabs: the widget auto-generates subject tabs from manifest collections so new collections appear in the UI automatically.
- Initialization fix: resolved a rare runtime failure related to structured-data injection.
- Minor UX/accessibility tweaks: safe-area aware close button, hidden scrollbar handling for immersive lightbox, and improved navigation-hiding selectors.

## Performance Features

- **Critical Path Optimization**: Essential styles loaded first for fast initial render
- **Resource Hints**: Preconnect to GitHub for faster manifest/image loading
- **Intelligent Caching**: 10-minute TTL with automatic refresh capabilities
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## Browser Support

- **Modern Browsers**: Full feature support with CSS Grid and ES6+
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Optimized**: Touch interactions and responsive design

## SEO Benefits

- **Structured Data**: Schema.org ImageGallery markup for rich snippets
- **Alt Text Generation**: Automatic SEO-friendly image descriptions
- **Performance**: Fast loading contributes to better search rankings
- **Accessibility**: Screen reader support improves user experience scores

## Changelog

See `CHANGELOG.md` for detailed version history and feature updates.

## Dependencies

- **None**: Self-contained widget with no external dependencies
- **GitHub Raw Content**: Served via GitHub's raw content delivery
- **Modern Browser APIs**: Uses Intersection Observer and Fetch API

## Troubleshooting

- **Images Not Loading**: Check manifest file path and GitHub repository access
- **Layout Issues**: Verify CSS is not being overridden by Squarespace styles
- **Performance Problems**: Use `?debug=true` to access performance metrics
- **Cache Issues**: Clear browser cache or use debug panel cache controls

## Future Enhancements

- Advanced filtering and search capabilities
- Portrait-specific editing tools
- Social media integration
- Print-ready portfolio generation
- Client collaboration features