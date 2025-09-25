# Event Portfolio Widget

Professional event photography portfolio widget for displaying corporate events, conferences, celebrations, and special occasions.

## Features

- **Event-focused design** with professional purple-blue color scheme
- **Universal Caption System integration** for consistent metadata handling
- **GitHub API integration** for automatic event discovery
- **Natural-height masonry layout** optimized for event photography
- **Enhanced lightbox** with professional event context
- **Performance optimized** with intelligent caching and lazy loading
- **Debug mode** with event-specific metrics
- **Mobile responsive** with adaptive grid layout

## Usage

### Squarespace Integration
```html
<!-- Copy and paste the entire v1.1-manifest.html file into a Code Block -->
```

### GitHub Structure (v1.1 Manifest Approach)
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
- Click the "🔧 Debug Mode" button to view performance metrics
- Monitor load times, event count, and Universal Caption System status
- Mobile-friendly debug panel positioning

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

- **v1.1** (2025-09-19): Single manifest API call approach - ultra-efficient performance
- **v1.0** (2025-09-19): Initial release with full event portfolio functionality
