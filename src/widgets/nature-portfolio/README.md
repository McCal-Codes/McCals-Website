# Nature Portfolio Widget (v1.7)

Version v1.7 enhances photo display and filtering with support for showing more photos (32 by default, up to 3 per collection), improved landscape categorization, and dynamic filter visibility. Based on the journalism widget v5.2 architecture for performance and style consistency. v1.6 refined filter tab accent colors. v1.5 added glass-like filter buttons, badge styling, and multi-animal manifest conventions. v1.2 added unified lightbox header isolation (html.lb-open) so Squarespace navigation or announcement bars never intercept clicks above the fullscreen gallery.

## Usage

1. Populate `src/images/Portfolios/Nature/Wildlife/<AnimalType>/<Species>` and `src/images/Portfolios/Nature/Landscapes/<Location>` with folders for each collection.
2. Maintain `src/images/Portfolios/Nature/nature-manifest.json` so each collection lists `collectionName`, `folderPath`, `tags`, and image filenames. Tags should include animal type (e.g., 'Birds', 'Mammals') or 'landscape' for filtering.
3. Drop `src/widgets/nature-portfolio/versions/v1.7-enhanced-display.html` into a Squarespace code block or run locally in the browser.
4. After adding or updating collections, run `npm run manifest:generate` to update the manifest for all animal types and landscapes.
5. Use the filter bar to view 'All', 'Wildlife', 'Landscapes', or any specific collection. Only tabs with actual content are displayed.
6. Customize display count with `data-panes` attribute (default: 32, range: 8-64).

## Key Features

- **Enhanced Display**: Shows up to 32 photos by default (configurable), with up to 3 photos per collection
- **Smart Filtering**: Dynamic filter tabs that only show categories with actual photos
- **Landscape Support**: Proper landscape categorization with dedicated tab
- **Category Detection**: Intelligent categorization based on folder paths and tags
- **Performance**: Matches journalism widget v5.2 style with glass-like buttons, overlay effects, and caching
- **Accessibility**: Full keyboard navigation and ARIA support in lightbox
- **Auto-refresh**: Smart 15-minute refresh cycle that respects tab visibility

## Notes

- Matches the journalism widget v5.2 style: glass-like filter buttons, overlay effects, badge styling, and info panels.
- Caches the master manifest for 10 minutes with a 15-minute smart auto-refresh cycle.
- Filter bar dynamically shows only categories with content ('All' always visible).
- Lightbox loads full collections with progressive image loading and retry logic.
- While lightbox is open the global `html.lb-open` class disables header pointer-events for safe interaction.
- Manifest generator script (`generate-nature-manifest.js`) automatically tags and aggregates all animal types and locations for robust filtering.
- Widget supports Wildlife (birds, mammals, etc.), Landscapes (West Virginia, forests, etc.), and Other categories.
