# Nature Portfolio Widget (v1.5)

Version v1.5 adds glass-like filter buttons, badge styling, and multi-animal manifest conventions. Based on the journalism widget v5.2 architecture for performance and style consistency. v1.2 added unified lightbox header isolation (html.lb-open) so Squarespace navigation or announcement bars never intercept clicks above the fullscreen gallery. v1.1 introduced the Featured-style masonry layout, colors, and caching.

## Usage

1. Populate `src/images/Portfolios/Nature/Wildlife/<AnimalType>/<Species>` and `src/images/Portfolios/Nature/Landscapes/<Location>` with folders for each collection.
2. Maintain `src/images/Portfolios/Nature/nature-manifest.json` so each collection lists `collectionName`, `folderPath`, `tags`, and image filenames. Tags should include animal type (e.g., 'Birds', 'Mammals') for filtering.
3. Drop `src/widgets/nature-portfolio/versions/v1.5-performance-optimized.html` into a Squarespace code block or run locally in the browser.
4. After adding or updating collections, run `npm run manifest:generate` to update the manifest for all animal types and landscapes.
5. Use the filter bar to view 'All', 'Birds', or any specific animal type or landscape collection. Bird images/collections show a 'Birds' badge.

## Notes

- Matches the journalism widget v5.2 style: glass-like filter buttons, overlay effects, badge styling, and info panels.
- Caches the master manifest for 10 minutes with a 15-minute smart auto-refresh cycle.
- Bird images/collections show a green badge with a bird emoji for easy identification.
- Filter bar supports 'All', 'Birds', and all unique animal types and landscape collections.
- Lightbox loads full collections with progressive image loading and retry logic.
- While lightbox is open the global `html.lb-open` class disables header pointer-events for safe interaction.
- Manifest generator script (`generate-nature-manifest.js`) automatically tags and aggregates all animal types and locations for robust filtering.
