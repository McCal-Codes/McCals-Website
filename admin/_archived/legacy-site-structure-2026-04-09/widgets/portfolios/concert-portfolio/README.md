# Concert Portfolio Widget

Current version: `v4.9.3-concert-performance.html`  
Previous stable: `v4.9.2-concert-enhanced.html`

## Overview

The concert portfolio is the most mature live music gallery in the widget set. It is manifest-driven
and currently combines:

- performance-first rendering
- deep-linkable band cards
- load-more pagination
- Spotify support links and optional embeds
- resilient empty-state handling
- structured data and lightbox isolation

## Use in Squarespace

1. Open `src/widgets/portfolios/concert-portfolio/versions/v4.9.3-concert-performance.html`.
2. Copy the full file into a Squarespace Code Block.
3. Ensure `src/images/Portfolios/Concert/concert-manifest.json` is current.

## Data source

- Primary manifest: `src/images/Portfolios/Concert/concert-manifest.json`
- Optional API mode: `data-api="on"` to use `/api/v1/manifests/concert`
- Fallback mode: GitHub Raw manifest loading remains supported

## Current status

- Production-ready bridge widget
- Good candidate for native route conversion because behavior is already well defined

## Active versions

- `v4.9.3-concert-performance.html`: current performance-oriented build
- `v4.9.2-concert-enhanced.html`: previous stable build

Older versions are archived in `src/widgets/_archived/Legacy Widgets/concert-portfolio/`.

## Notes

- If you need the current bridge route in the dev app, it should point at `v4.9.3`.
- See `CHANGELOG.md` for the full history of Spotify support, SEO anchors, and UI refinements.
