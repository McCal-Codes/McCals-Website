# Portrait Portfolio Widget

Current version: `v2.0.2-portrait-performance.html`  
Previous stable: `v2.0.1-portrait-performance.html`

## Overview

The portrait portfolio is a production-ready vertical gallery focused on:

- portrait-first card ratios
- deep-linkable portrait cards
- rotating selections and subject tabs
- structured data and alt-text generation
- immersive lightbox behavior tuned for portrait compositions

## Use in Squarespace

1. Open `src/widgets/portfolios/portrait-portfolio/versions/v2.0.2-portrait-performance.html`.
2. Copy the full file into a Squarespace Code Block.
3. Ensure `src/images/Portfolios/Portrait/portrait-manifest.json` exists and is current.

## Manifest shape

The widget expects a manifest with collection-level metadata, for example:

```json
{
  "version": "2.0.2",
  "generated": "2026-01-06T00:00:00.000Z",
  "totalCollections": 5,
  "collections": [
    {
      "collectionName": "Character Studies",
      "folderPath": "Portrait/Character Studies",
      "totalImages": 12,
      "images": ["image1.jpg", "image2.jpg"],
      "tags": ["portrait", "character"],
      "dateDisplay": "2024",
      "dateISO": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Current status

- Production-ready bridge widget
- Content volume is healthy; repo issues were mostly stale docs and route references

## Active versions

- `v2.0.2-portrait-performance.html`: current performance build
- `v2.0.1-portrait-performance.html`: previous stable build

Older versions are archived in `src/widgets/_archived/Legacy Widgets/portrait-portfolio/`.

## Notes

- The dev app route should target `v2.0.2`.
- See `CHANGELOG.md` for the newer anchor-link and structured-data enhancements.
