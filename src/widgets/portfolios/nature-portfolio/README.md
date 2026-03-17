# Nature Portfolio Widget

Current testing build: `v1.9.0-performance-optimized.html`  
Previous stable testing build: `v1.8.0-performance-optimized.html`  
Status: WIP

## Overview

The nature portfolio is still in the bridge-phase validation bucket. The widget itself is functional,
but it remains content-light and has not met the full exit criteria documented in `STATUS.md`.

## Current behavior

- manifest-driven wildlife and landscape filtering
- retry logic for failed image loads
- progressive lightbox loading
- structured data injection in the current testing builds
- debug mode via `?debug=true`

## Use in Squarespace

1. Open `src/widgets/portfolios/nature-portfolio/versions/v1.9.0-performance-optimized.html`.
2. Copy the full file into a Squarespace Code Block only for testing or controlled bridge use.
3. Keep `src/images/Portfolios/Nature/nature-manifest.json` current.
4. Run `npm run manifest:nature` after adding or reorganizing source images.

## Data source

- Primary manifest: `src/images/Portfolios/Nature/nature-manifest.json`
- Expected folders:
  - `src/images/Portfolios/Nature/Wildlife/...`
  - `src/images/Portfolios/Nature/Landscapes/...`

## Current status

- Still WIP
- Needs more varied wildlife and landscape content
- Needs final performance and accessibility signoff before promotion

## Active versions

- `v1.9.0-performance-optimized.html`: current testing build
- `v1.8.0-performance-optimized.html`: previous stable testing build

Older versions are archived in `src/widgets/_archived/Legacy Widgets/nature-portfolio/`.

## Notes

- The dev app bridge route should target `v1.9.0`, but the widget should still be treated as WIP.
- See `STATUS.md` for the remaining content and validation exit criteria.
