# Event Portfolio Widget

**Current Version: v2.6.4** — Production-optimized Squarespace widget with GitHub-first manifest loading. Enhanced UX patterns, bulletproof reliability, comprehensive fallbacks.

## Use in Squarespace
1. Open `src/widgets/event-portfolio/versions/v2.6.4-event-portfolio.html`
2. Copy **all** HTML and paste into a Squarespace **Code Block**.
3. The widget fetches the manifest from:
   `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Events/events-manifest.json`
   (override by editing `data-manifest` on `<main id="eventsPf">`)

## New v2.6.4 Features
- **Fixed Image Stretching**: Proper aspect ratio preservation in lightbox gallery
- **Hidden Scrollbars**: Immersive fullscreen experience without visual clutter  
- **Enhanced Close Button**: Fixed positioning with better accessibility and safe areas
- **Navigation Isolation**: Comprehensive hiding of site navigation during lightbox
- **Integrated Version Display**: Version indicator in heading with interactive changelog
- **Enhanced Debug Panel**: Comprehensive metrics with force refresh and cache controls

## Versions

### Active Versions (≤2 Policy)
The following versions are maintained in `versions/`:
- **v2.6.4** (Current): Production-optimized with enhanced UX patterns, fixed image stretching, hidden scrollbars
- **v2.6.2** (Previous Stable): Baseline for v2.6.x series enhancements

### Legacy Versions (Archived)
Versions v2.6.1 and earlier have been archived to maintain repository organization. These versions remain accessible for historical reference:
- **Archive Location**: `src/widgets/_archived/Legacy Widgets/event-portfolio/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/event-portfolio/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1.0.0 through v2.6.1 (8 versions)

## Local generation
```bash
node scripts/generate-events-manifest.js --root src/images/Portfolios/Events --force
```

## Live watch
```bash
npm run watch:events-manifest
```
