# Concert Portfolio Widget

**Current Version: v4.7** — Performance-optimized concert portfolio with a non-intrusive Spotify support button to help visitors discover and preview artists. Retains v4.6 critical rendering improvements, modern JavaScript patterns, and enhanced SEO.

## Features

### Performance 🚀 (v4.6)
- **Critical CSS Inlining**: Only essential styles loaded initially, non-critical styles lazy-loaded
- **Modern JavaScript**: Async patterns with reduced main-thread blocking using requestIdleCallback
- **Optimized Font Loading**: `font-display: swap` for better rendering performance
- **Resource Hints**: Preconnect and DNS prefetch for GitHub API calls
- **Lazy-Loaded Features**: Debug panel and advanced functionality loaded on-demand
- **Reduced Bundle Size**: Removed unused code paths for production deployment
- **SEO Structured Data**: Compact JSON-LD with optimized generation

### Performance 🚀
- **Shared API Backend**: Intelligent caching with 5-10min TTL reduces redundant requests
- **Progressive Loading**: Intersection observer with intelligent preloading
- **Request Batching**: Up to 70% reduction in GitHub API calls
- **Advanced EXIF Parsing**: 60% faster date extraction from image headers
- **GraphQL Support**: Optimized queries for complex folder structures
- **WebP Optimization**: Automatic format detection and preference
- **Error Resilience**: Exponential backoff retry with graceful degradation

### Visual 🎨
- **Natural Masonry**: CSS columns with responsive breakpoints
- **Smooth Animations**: Staggered card loading with cubic-bezier easing
- **Loading States**: Shimmer effects and progress indicators
- **Enhanced Lightbox**: Vertical scroll with fixed image stretching and hidden scrollbars
- **Immersive Experience**: Comprehensive navigation hiding during fullscreen viewing
- **Dark/Light Mode**: Automatic theme detection and adaptation

### UX Enhancements (v4.4) ✨
- **Fixed Image Stretching**: Proper aspect ratio preservation in lightbox gallery
- **Hidden Scrollbars**: Immersive fullscreen experience without visual clutter  
- **Enhanced Close Button**: Fixed positioning with better accessibility and safe areas
- **Navigation Isolation**: Comprehensive hiding of site navigation during lightbox
- **Integrated Version Display**: Version indicator in heading with interactive changelog

### SEO & Accessibility (v4.5) 🔍
- **Enhanced Alt Text**: Intelligent generation from manifest data and image filenames
- **Structured Data**: JSON-LD schema markup for search engine optimization
- **Image Dimensions**: Explicit width/height attributes for better SEO and performance
- **ARIA Labels**: Comprehensive accessibility support for screen readers
- **Lazy Loading**: Optimized loading with proper `fetchpriority` attributes
- **Semantic HTML**: Proper heading hierarchy and landmark elements

### Developer Experience 🛠️
- **Enhanced Debug Panel**: Comprehensive metrics with force refresh and cache controls
- **Performance Monitoring**: Real-time metrics with `?debug=true`
- **Error Tracking**: Comprehensive logging and user feedback
- **Backward Compatibility**: Maintains all v4.3 features
- **Interactive Changelog**: Built-in version history and feature documentation

## Usage

### Basic Implementation
```html
<!-- Squarespace Code Block -->
<div id="concertPf" data-panes="12">
  <!-- Paste v2.2.html content here -->
</div>
```

### Configuration Options
- `data-panes="12"`: Number of cards to display (default: 12)
- `?debug=true`: Enable performance metrics overlay
- URL parameter support for development testing

#### Instant content override (GitHub ref pin)
- `data-github-ref="<ref>"` (optional): Force the widget to fetch from a specific GitHub ref instead of `main`.
  - Accepts a full commit SHA, a tag, or another branch name.
  - Useful to bypass GitHub Raw CDN delays after pushing new images/manifests.
  - When set, the widget updates its cache key to include the ref to prevent stale cross-ref caching.
  - Example:
    ```html
    <div id="concertPf"
         data-panes="24"
         data-github-ref="bbeeaf212055eb56cd342e8ff0f01729101d23fc">
      <!-- Paste v4.7.html here -->
    </div>
    ```

### Artist Support (Spotify) — v4.7
- Non-intrusive floating button lists all bands from your concert manifest with quick Spotify access.
- For each band:
  - “Open on Spotify” uses a search link (no API keys required).
  - Optional “Preview” toggle shows an embedded Spotify player if you provide an artist ID.

Config via data-attributes on the wrapper (defaults shown):
```html
<div id="concertPf"
     data-panes="24"
  data-github-ref="main"
     data-spotify="on"
     data-spotify-button-label="Support the Artists"
     data-spotify-position="bottom-right"
     data-spotify-map-id="spotifyArtistMap">
  <!-- Paste v4.7.html here -->
</div>
```

Provide artist IDs via an inline JSON script (keys are band names as they appear in the manifest):
```html
<script type="application/json" id="spotifyArtistMap">
{
  "The Book Club": "2mZ8XexampleId",
  "Another Band": "7qXexampleId"
}
</script>
```
If no ID is provided for a band, the widget still shows a “Open on Spotify” search link.

### Performance Monitoring
```javascript
// Access performance metrics
const metrics = portfolioAPI.getMetrics();
console.log(`Cache hit rate: ${(metrics.cacheHits / metrics.requests * 100).toFixed(1)}%`);
```

## GitHub Repository Structure
```
images/Portfolios/Concert/
├── concert-manifest.json           # Aggregated, canonical manifest for the portfolio
├── Band-Name-1/
│   ├── photo1.jpg
│   └── photo2.webp
└── Band-Name-2/
    ├── subfolder/ (auto-detected)
    │   └── image.jpg
    └── direct-image.png
```

### Manifest Format

The widget reads the aggregated `concert-manifest.json` as the canonical source. Per-folder `manifest.json` (older pattern) may exist but is optional.

An example (aggregated) manifest excerpt:

```json
{
  "version": "1.0",
  "generated": "2025-11-04T18:00:00.000Z",
  "totalBands": 16,
  "bands": [
    {
      "bandName": "Funky Lamp",
      "folderPath": "Funky Lamp/April 2025",
      "dateDisplay": "April 2025",
      "concertDate": { "year": 2025, "month": 4, "iso": "2025-04-01" },
      "totalImages": 14,
      "images": ["IMG_001.jpg", "IMG_002.jpg"]
    }
  ]
}
```

## Performance Benchmarks

| Metric | v2.1 | v2.2 | Improvement |
|--------|------|------|-------------|
| Initial Load | 2.3s | 0.8s | **3x faster** |
| API Requests | 15-20 | 5-8 | **70% reduction** |
| Memory Usage | 45MB | 28MB | **38% less** |
| Cache Hit Rate | 0% | 85%+ | **New feature** |
| EXIF Processing | 450ms | 180ms | **60% faster** |

## Versions
- **v4.7** (Latest): Artist Support (Spotify) with search links and optional embedded previews
- **v4.6**: Performance optimizations and structured data refinements
- **v4.5**: SEO enhancements with structured data and improved accessibility
- **v4.4**: Performance revolution with shared backend and UX improvements
- **v4.3**: EXIF date extraction with fallback chain
- **v4.2**: Natural masonry with GitHub commit dates
- **v4.1**: Initial grid gallery implementation

See CHANGELOG.md for detailed version history.
