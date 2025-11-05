# Nature Portfolio Widget (v1.8)

Version v1.8 delivers performance-optimized image loading with instant display for first 8 images, retry logic with exponential backoff, and enhanced caching. Removes lazy loading delays for immediate visual feedback. v1.7 enhanced photo display (32 photos, 3 per collection) and filtering. Based on the journalism widget v5.2 architecture for performance and style consistency. v1.2 added unified lightbox header isolation (html.lb-open) so Squarespace navigation or announcement bars never intercept clicks above the fullscreen gallery.

## Usage

1. Populate `src/images/Portfolios/Nature/Wildlife/<AnimalType>/<Species>` and `src/images/Portfolios/Nature/Landscapes/<Location>` with folders for each collection.
2. Maintain `src/images/Portfolios/Nature/nature-manifest.json` so each collection lists `collectionName`, `folderPath`, `tags`, and image filenames. Tags should include animal type (e.g., 'Birds', 'Mammals') or 'landscape' for filtering.
3. Drop `src/widgets/nature-portfolio/versions/v1.8-performance-optimized.html` into a Squarespace code block or run locally in the browser.
4. After adding or updating collections, run `npm run manifest:nature` to update the manifest for all animal types and landscapes.
5. Use the filter bar to view 'All', 'Wildlife', 'Landscapes', or any specific collection. Only tabs with actual content are displayed.
6. Instant loading: First 8 images load immediately without lazy loading for better UX.

## Key Features

- **Instant Loading**: First 8 images load immediately without lazy loading for instant display
- **Retry Logic**: Automatic retry with exponential backoff (3 attempts) and manual retry button on failure
- **Enhanced Display**: Shows up to 32 photos by default (configurable), with up to 3 photos per collection
- **Smart Filtering**: Dynamic filter tabs that only show categories with actual photos
- **Landscape Support**: Proper landscape categorization with dedicated tab
- **Category Detection**: Intelligent categorization based on folder paths and tags
- **Performance**: Optimized caching, preloading strategy, and progressive enhancement
- **Accessibility**: Full keyboard navigation and ARIA support in lightbox
- **Debug Mode**: Add `?debug=true` to URL for performance metrics

## Notes

- Matches the journalism widget v5.2 style: glass-like filter buttons, overlay effects, badge styling, and info panels.
- Caches the master manifest for 10 minutes with a 15-minute smart auto-refresh cycle.
- Filter bar dynamically shows only categories with content ('All' always visible).
- Lightbox loads full collections with progressive image loading and retry logic.
- While lightbox is open the global `html.lb-open` class disables header pointer-events for safe interaction.
- Manifest generator script (`generate-nature-manifest.js`) automatically tags and aggregates all animal types and locations for robust filtering.
- Widget supports Wildlife (birds, mammals, etc.), Landscapes (West Virginia, forests, etc.), and Other categories.
