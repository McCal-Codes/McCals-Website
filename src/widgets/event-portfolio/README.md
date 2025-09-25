# Event Portfolio Widget

Professional event photography portfolio widget for displaying corporate events, conferences, celebrations, and special occasions.

## Features

- **Smart manifest caching** keeps galleries fast with a 10-minute freshness window
- **15-minute auto-refresh cadence** with live countdown badge for event control rooms
- **Modal changelog + version badge** to communicate release notes on-brand
- **Event-focused design** with professional purple-blue color scheme
- **Universal Caption System integration** for consistent metadata handling
- **GitHub manifest integration** for automatic event discovery via single fetch
- **Natural-height masonry layout** optimized for event photography
- **Enhanced lightbox** with professional event context
- **Event Ops debug console** surfaces cache source, sync timing, manifest version, and API metrics
- **Mobile responsive** with adaptive grid layout

## Usage

### Squarespace Integration
```html
<!-- Copy and paste the entire v2.0-manifest.html file into a Code Block -->
```

### GitHub Structure (v2.0 Smart Sync)
```
images/Portfolios/Events/
├── events-manifest.json (REQUIRED - single API call!)
├── Corporate-Summit-2025/
│   ├── image1.jpg
│   └── image2.jpg
├── Tech-Conference/
│   ├── keynote.jpg
│   └── networking.jpg
└── Wedding-Reception/
    ├── ceremony.jpg
    └── reception.jpg
```

#### Manifest Format
```json
{
  "version": "1.0",
  "generated": "2025-09-19T05:39:00.000Z",
  "totalEvents": 2,
  "events": [
    {
      "eventName": "Corporate Summit 2025",
      "folderPath": "Corporate-Summit-2025",
      "dateDisplay": "March 2025",
      "totalImages": 2,
      "images": ["image1.jpg", "image2.jpg"]
    }
  ]
}
```

### Debug Mode
- Click the "🛠️ Event Ops Console" button to open the debug panel
- Monitor cache source, API call count, sync timing, and Universal Caption System status
- Countdown badge in the lower corner shows time until the next auto-refresh

## Styling

### Color Scheme
- **Primary**: `#6366f1` (Event purple-blue)
- **Secondary**: `#8b5cf6` (Complementary purple)
- **Accent**: `#4d79ff` (Blue accent)

### Visual Elements
- Gradient text headings
- Event-themed card backgrounds
- Professional hover effects with event-specific shadows
- Enhanced lightbox with event photography context

## Technical Details

- **Framework**: Vanilla JavaScript with Universal Caption System
- **Performance**: Sub-200ms load times with intelligent caching
- **Compatibility**: Modern browsers with graceful fallbacks
- **Mobile**: Responsive design with touch-optimized interactions

## Version History

- **v2.0** (2025-09-20): Smart manifest cache, auto-refresh cadence, changelog modal, and Event Ops console
- **v1.1** (2025-09-19): Single manifest API call approach - ultra-efficient performance
- **v1.0** (2025-09-19): Initial release with full event portfolio functionality
