# Photojournalism Portfolio Widget

Filterable masonry gallery for displaying photojournalism work with categories. Features responsive design, hover overlays, and click-to-open lightbox functionality.

## Features

### Visual 🎨
- **Filterable Categories**: Politics, Events, Portraits with "All" option
- **Natural Masonry**: CSS columns with responsive breakpoints (4→3→2→1)
- **Hover Overlays**: Title, date, publication info with gradient background
- **Lightbox Gallery**: Click to view full-size images with captions
- **Multi-category Support**: Images can belong to multiple categories
- **Dark/Light Mode**: Automatic theme detection and adaptation

### Performance 🚀
- **GitHub CDN Integration**: Direct loading from GitHub repository
- **Lazy Loading**: Progressive image loading for better performance
- **Error Handling**: Graceful degradation for failed image loads
- **Responsive Design**: Mobile-optimized layout and interactions

### Accessibility ♿
- **Keyboard Navigation**: Full keyboard support with focus management
- **ARIA Attributes**: Proper screen reader compatibility
- **Focus Management**: Lightbox focus trapping and restoration

## Usage

### Basic Implementation
```html
<!-- Squarespace Code Block -->
<div id="photojournalism-portfolio">
  <!-- Paste v1.0-filterable-masonry.html content here -->
</div>
```

### GitHub Repository Structure
```
images/Portfolios/Journalism/
├── manifest.json (optional - for custom captions)
├── 250315_Butler Democracy Protest_CAL9773.jpg
├── 250417 The Rooney Rule_CAL3148.jpg
└── [your journalism photos]
```

### Caption Sources (Priority Order)
1. **manifest.json** - Custom captions and metadata
2. **EXIF/IPTC data** - Embedded photo captions (journalism standard)
3. **Auto-generated** - Fallback based on filename

### Configuration
Update the GitHub repository in the script section:
```javascript
const GH = { owner:'YOUR-USERNAME', repo:'YOUR-REPO', branch:'main', base:['images','Portfolios','Journalism'] };
```

### Custom Captions with manifest.json
Create a `manifest.json` file in your Journalism directory:
```json
{
  "your-photo.jpg": {
    "caption": "Detailed caption for lightbox display",
    "description": "Brief description", 
    "date": "2025-03-15",
    "categories": ["politics", "events"],
    "publication": "Your Publication Name",
    "location": "City, State"
  }
}
```

### Adding New Images
1. Upload image to appropriate category folder in your GitHub repo
2. Add a new `<article class="portfolio-card">` block:

```html
<article class="portfolio-card" data-cats="Politics" tabindex="0">
  <img data-file="politics/your-image.jpg" alt="Description">
  <div class="portfolio-info">
    <h3 class="portfolio-title">Your Title</h3>
    <div class="portfolio-meta">
      <span>Date</span>
      <span>Published with Publication</span>
      <span>Politics</span>
    </div>
    <p class="portfolio-desc">Full caption for lightbox...</p>
  </div>
</article>
```

### Multi-category Support
For images that belong to multiple categories:
```html
<article class="portfolio-card" data-cats="Politics, Events" tabindex="0">
  <!-- Image will appear in both Politics and Events filters -->
</article>
```

## Responsive Breakpoints

- **Desktop**: 4 columns (>1200px)
- **Tablet**: 3 columns (861px-1200px)  
- **Small Tablet**: 2 columns (521px-860px)
- **Mobile**: 1 column (≤520px)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Versions

- **v2.0**: Dynamic GitHub Integration (Latest)
  - Automatic image discovery from GitHub repository
  - EXIF date extraction with commit date fallback
  - Smart auto-categorization based on filename patterns
  - Political figure detection (Trump, Biden, Harris, etc.)
  - Multi-category support (images can be in multiple categories)
  - Performance optimized with intelligent caching
  - Debug mode with performance metrics
  - Hover overlays and lightbox functionality

- **v1.0**: Initial filterable masonry implementation
  - Manual category filtering (Politics, Events, Portraits)
  - Hover overlays with metadata
  - Lightbox with captions
  - Basic GitHub CDN integration

See CHANGELOG.md for detailed version history.
