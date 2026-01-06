# Podcast Feed Widget

High-performance RSS feed widget with liquid glass design and performance optimizations. Features intelligent caching, progressive loading, and responsive masonry layout.

## Features

### Performance 🚀

- **RSS Feed Parsing**: Direct RSS/XML feed consumption with caching
- **Progressive Loading**: Intersection observer with intelligent preloading
- **Request Batching**: Intelligent caching reduces redundant requests
- **Error Resilience**: Retry logic with graceful degradation
- **Performance Monitoring**: Real-time metrics with debug mode

### Visual 🎨

- **Dark Card Aesthetic**: Rich dark backgrounds matching your website design
- **Liquid Glass Design**: Glassmorphism buttons and interface elements
- **Audio Player**: 30-second previews with play/pause and progress controls
- **Platform Integration**: Spotify and Apple Podcasts buttons with official branding
- **Responsive Masonry**: CSS-based masonry layout with breakpoints
- **Smooth Animations**: Staggered loading with cubic-bezier easing
- **Enhanced Typography**: Larger titles and improved content hierarchy

### Developer Experience 🛠️

- **Debug Toggle**: Click button to view performance metrics
- **RSS Feed Support**: Standard RSS 2.0 and Atom feed compatibility
- **Customizable**: Easy to modify styling and layout
- **Self-Contained**: Works in Squarespace Code Blocks

## Usage

### Basic Implementation

```html
<!-- Squarespace Code Block -->
<div id="podcastFeed" data-feed-url="YOUR_RSS_FEED_URL" data-max-episodes="6">
  <!-- Paste widget content here -->
</div>
```

### Configuration Options

- `data-feed-url`: RSS feed URL (required)
- `data-max-episodes`: Number of episodes to display (default: 6)
- `data-show-descriptions`: Show episode descriptions (default: true)
- `data-show-dates`: Show publication dates (default: true)

## RSS Feed Support

- RSS 2.0 feeds
- Atom feeds
- iTunes podcast extensions
- Episode metadata (title, description, date, duration)
- Show artwork and branding

## Versions

### Active Versions (≤2 Policy)

The following versions are maintained in `versions/`:

- **v2.2.0** (Current): Core refactor with event delegation, simplified state, and explicit audio availability logic.
- **v2.1.0** (Previous): Resilience optimizations with background RSS fetching and improved fallback handling.

### Legacy Versions (Archived)

Versions v2.0.0 and earlier have been archived to maintain repository organization. These versions remain accessible for historical reference:

- **Archive Location**: `src/widgets/_archived/Legacy Widgets/podcast-feed/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/podcast-feed/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1.0.0 through v2.0.0 (13 versions)

### Notable Archived Features

- **v1.9.5**: Auto-hydrating RSS episodes with caching, Ep 9 fallback data
- **v1.9**: Calendar invite refresh with data attributes for intro copy
- **v1.1**: Audio previews, platform links, enhanced dark styling
- **v1.0**: Initial release with glassmorphism design

See CHANGELOG.md for detailed version history.
