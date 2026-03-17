# Photojournalism Portfolio Widget

Current version: `v5.5.3-photojournalism-performance.html`  
Previous stable: `v5.5.2-photojournalism-performance.html`

## Overview

The photojournalism portfolio is a mature editorial gallery with:

- manifest-driven image loading
- constrained shuffle and one-image-per-album freshness rules
- published-work filtering
- deep-link support and load-more behavior in the newer enhancement line
- immersive lightbox isolation and structured data

## Content scope

The current content set is strong technically but narrower editorially than the other major
portfolios. The changelog already notes that the public collection is currently political work only,
with more journalism to be added over time.

## Use in Squarespace

1. Open `src/widgets/portfolios/photojournalism-portfolio/versions/v5.5.3-photojournalism-performance.html`.
2. Copy the full file into a Squarespace Code Block.
3. Keep `src/images/Portfolios/Journalism/journalism-manifest.json` current.

## Data source

- Primary manifest: `src/images/Portfolios/Journalism/journalism-manifest.json`
- Legacy per-folder manifests are still tolerated, but the aggregate manifest is the canonical source

## Current status

- Production-ready bridge widget
- Main improvement area is content breadth, not widget reliability

## Active versions

- `v5.5.3-photojournalism-performance.html`: current performance build
- `v5.5.2-photojournalism-performance.html`: previous stable performance build

Older versions are archived in `src/widgets/_archived/Legacy Widgets/photojournalism-portfolio/`.

## Notes

- The dev app route should target `v5.5.3`.
- See `CHANGELOG.md` for the current content note and the full enhancement history.
