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
- **Liquid Glass Design**: Glassmorphism buttons and interface elements
- **Responsive Masonry**: CSS-based masonry layout with breakpoints
- **Smooth Animations**: Staggered loading with cubic-bezier easing
- **Dark/Light Mode**: Automatic theme detection and adaptation
- **Expandable Content**: "Read more" functionality for descriptions

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
- **v1.0** (Latest): Initial release with glassmorphism design
- Performance-optimized RSS parsing with caching
- Responsive masonry layout with smooth animations
- Debug mode with performance metrics

See CHANGELOG.md for detailed version history.