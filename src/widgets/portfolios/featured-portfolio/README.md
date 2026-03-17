# Featured Portfolio Widget

Current version: `v1.5.1-featured-optimization.html`  
Previous stable: `v1.5.0-working.html`

## Overview

The featured portfolio is an aggregate showcase that pulls highlights from the broader portfolio
manifests. It is intended to surface a curated cross-section of the work rather than function as a
single-category gallery.

## Current behavior

- loads from `src/images/Portfolios/featured-manifest.json`
- mixes items across portfolio types
- uses a masonry-style presentation with lightbox support
- keeps the lead item stable for better LCP behavior in `v1.5.1`

## Use in Squarespace

1. Open `src/widgets/portfolios/featured-portfolio/versions/v1.5.1-featured-optimization.html`.
2. Copy the full file into a Squarespace Code Block.
3. Regenerate `src/images/Portfolios/featured-manifest.json` when featured selections change.

## Current status

- Production-ready bridge widget
- Better than it looked during the audit; most of the gap was doc drift, not missing functionality

## Active versions

- `v1.5.1-featured-optimization.html`: current LCP-optimized build
- `v1.5.0-working.html`: previous stable build

Older versions are archived in `src/widgets/_archived/Legacy Widgets/featured-portfolio/`.

## Notes

- The dev app route should target `v1.5.1`.
- See `CHANGELOG.md` for manifest generation notes and follow-up tasks around source quality.
