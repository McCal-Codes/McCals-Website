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

## Active Versions

Active versions retained in `versions/` (x.x.0 format):
- **v5.2.0** (Latest): Performance optimized iteration
- **v5.1.0**: Previous performance pass baseline

Legacy versions (v4.x.x and earlier) have been moved to `src/widgets/_archived/legacy-widget-versions/photojournalism-portfolio/`.

### Legacy Highlights (Archived)
- **v4.8**: Hidden scrollbars in lightbox for immersive experience
- **v4.7**: Comprehensive navigation hiding during lightbox viewing  
- **v4.6**: Enhanced filtering (no gaps) + minimal published indicators
- **v4.5**: Fixed "Published Work" filter functionality with tag support
- **v4.4**: Optimized close button positioning and accessibility

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
├── journalism-manifest.json        # Aggregated, canonical manifest for the portfolio
├── 250315_Butler Democracy Protest_CAL9773.jpg
├── 250417 The Rooney Rule_CAL3148.jpg
└── [your journalism photos]
```

Note: Prefer a single aggregated manifest (`journalism-manifest.json`) at the portfolio root. Per-folder or per-directory `manifest.json` files are supported as legacy/optional caption sources but are no longer required.

### Caption Sources (Priority Order)
1. **journalism-manifest.json** (aggregated) - Preferred canonical source for custom captions and metadata
2. **Per-folder `manifest.json`** - Legacy/optional (supported when present for custom captions)
3. **EXIF/IPTC data** - Embedded photo captions (journalism standard)
4. **Auto-generated** - Fallback based on filename

### Configuration
Update the GitHub repository in the script section:
```javascript
const GH = { owner:'YOUR-USERNAME', repo:'YOUR-REPO', branch:'main', base:['images','Portfolios','Journalism'] };
```

### Custom Captions with manifest.json
Create a `journalism-manifest.json` (or a `manifest.json` mapping in legacy setups) in your Journalism directory. Example aggregated entry:
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

## Version History

Full historical versions (v1.0–v4.8) are archived. See archive `INDEX.json` for the list and consult the widget CHANGELOG for detailed entries. Earlier versions established filtering, manifest loading, and UX patterns that informed the current performance optimized series.

## Enhancement Patterns

This widget (v4.4-v4.8) served as the foundation for establishing systematic UX improvement patterns documented in `docs/standards/widget-enhancements.md`. These patterns include:

- **Close Button Optimization**: Fixed positioning to avoid header overlap
- **Enhanced Filter Layout**: No gaps when filtering content  
- **Minimal Status Indicators**: Clean, unobtrusive publication badges
- **Comprehensive Navigation Hiding**: Full isolation during lightbox viewing
- **Hidden Scrollbars**: Immersive gallery experience
- **Version Indicator Standards**: Consistent placement and styling

These patterns can be systematically applied to enhance all other widgets in the McCal Media ecosystem.
