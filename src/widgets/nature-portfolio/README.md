# Nature Portfolio Widget (v1.2)

Version v1.2 adds unified lightbox header isolation (html.lb-open) so Squarespace navigation or announcement bars never intercept clicks above the fullscreen gallery. v1.1 introduced the Featured-style masonry layout, colors, and caching.

## Usage

1. Populate `src/images/Portfolios/Nature` with folders for each collection (landscapes, wildlife, etc.).
2. Maintain `src/images/Portfolios/Nature/nature-manifest.json` so each collection lists `collectionName`, `folderPath`, and image filenames.
3. Drop `src/widgets/nature-portfolio/versions/v1.0.html` (v1.1 build) into a Squarespace code block or run locally in the browser.
4. After adding or updating collections, regenerate the universal manifest so other widgets stay in sync.

## Notes

- Matches the Featured widget masonry grid, overlay, and tag chips while keeping nature-themed accent colors.
- Caches the master manifest for 10 minutes with a 15-minute smart auto-refresh cycle.
- Debug overlay shows collection counts, total images, API calls, and last refresh timestamp.
- Lightbox loads full collections with progressive image loading and retry logic.
- While lightbox is open the global `html.lb-open` class disables header pointer-events for safe interaction.
