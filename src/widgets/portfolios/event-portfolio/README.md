# Event Portfolio Widget

Current version: `v2.9.1-event-performance.html`  
Previous stable: `v2.9.0-event-themed.html`

## Overview

The event portfolio is a production-ready manifest-driven gallery for conferences, corporate work,
performances, and other live assignments. The current build includes:

- pre-rendered hero treatment for performance
- themed light and dark presentation
- category, featured, and published filtering
- resilient manifest loading and fallback behavior
- immersive lightbox behavior with navigation isolation

## Use in Squarespace

1. Open `src/widgets/portfolios/event-portfolio/versions/v2.9.1-event-performance.html`.
2. Copy the full file into a Squarespace Code Block.
3. Keep `src/images/Portfolios/Events/events-manifest.json` current.

## Data source

- Primary manifest: `src/images/Portfolios/Events/events-manifest.json`
- The widget also supports fallback manifest resolution for local and GitHub-based embeds

## Current status

- Production-ready bridge widget
- Technically solid; the main repo issue was stale version references, not widget maturity

## Active versions

- `v2.9.1-event-performance.html`: current performance build
- `v2.9.0-event-themed.html`: previous stable themed build

Older versions are archived in `src/widgets/_archived/Legacy Widgets/event-portfolio/`.

## Notes

- The dev app route should target `v2.9.1`.
- See `CHANGELOG.md` for the history of cache scoping, URL normalization, theming, and UX upgrades.
