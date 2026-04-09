# Video Portfolio Widget

Current version: `v0.2.0-video-portfolio.html`  
Previous stable: `v0.1.0-video-portfolio.html`  
Status: early / experimental

## Overview

The video portfolio is the least mature portfolio surface in the repo. It works as a self-contained
Squarespace widget, but it still depends on inline sample-style data and does not yet have the same
manifest-driven pipeline as the photo portfolios.

## Current behavior

- supports local MP4, YouTube, and Vimeo entries
- auto-generates filter chips from inline JSON data
- opens playback in an accessible lightbox
- injects basic `VideoObject` structured data

## Use in Squarespace

1. Open `src/widgets/portfolios/video-portfolio/versions/v0.2.0-video-portfolio.html`.
2. Copy the full file into a Squarespace Code Block.
3. Replace the inline `videoPortfolioData` JSON with real entries before publishing.

## Current status

- Functional as a standalone widget
- Not yet feature-complete compared with the image portfolios
- Still missing the planned manifest generator and external ingestion flow

## Active versions

- `v0.2.0-video-portfolio.html`: current build with version/changelog UI
- `v0.1.0-video-portfolio.html`: previous stable build

Older versions will be archived under `src/widgets/_archived/Legacy Widgets/video-portfolio/` as
the widget evolves.

## Known gaps

- No `generate-video-manifest.js` exists yet
- No aggregated `video-manifest.json` pipeline exists yet
- Transcript and caption support is still planned work
- The standalone app did not yet have a matching bridge route before this cleanup pass

## Notes

- The dev app bridge route should target `v0.2.0`.
- See `CHANGELOG.md` and the inline TODO notes in the widget file for the remaining roadmap.
