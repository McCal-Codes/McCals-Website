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
│   ├── 250315_Corporate_Summit_Keynote.jpg
│   └── 250315_Corporate_Summit_Panel.jpg
├── Charity-Gala-2024/
│   ├── 241105_Charity_Gala_Auction.jpg
│   ├── 241105_Charity_Gala_Ballroom.jpg
│   └── 241105_Charity_Gala_Red_Carpet.jpg
└── Product-Launch-Expo-2025/
    ├── 250620_Product_Launch_Expo_Demo.jpg
    └── 250620_Product_Launch_Expo_Showcase.jpg
```

#### Manifest Format
```json
{
  "version": "2.0",
  "generated": "2025-09-19T05:39:00.000Z",
  "totalEvents": 2,
  "totalImages": 4,
  "events": [
    {
      "eventName": "Corporate Summit 2025",
      "category": "Events",
      "tags": ["Events"],
      "folderPath": "Corporate-Summit-2025",
      "eventDate": {
        "iso": "2025-03-15",
        "source": "filename_extraction"
      },
      "dateDisplay": "March 15, 2025",
      "totalImages": 2,
      "images": [
        {
          "filename": "250315_Corporate_Summit_Keynote.jpg",
          "path": "Corporate-Summit-2025/250315_Corporate_Summit_Keynote.jpg",
          "description": "Corporate Summit 2025 photography",
          "caption": "Corporate Summit 2025",
          "tags": ["Events"]
        }
      ],
      "published": false,
      "metadata": {}
    }
  ]
}
```

#### Regenerating the Manifest

Run the automation script after adding or removing event folders or images:

```bash
npm run manifest:events
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
