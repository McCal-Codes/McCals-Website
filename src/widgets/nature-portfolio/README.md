# Nature Portfolio Widget (v1.1)

Version v1.1 carries over the optimized manifest loader and auto-refresh from the concert widget but now mirrors the Featured highlights layout with nature-forward colors.

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
