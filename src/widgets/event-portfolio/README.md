# Event Portfolio Widget (v2.6.0)

**Current Version: v2.6.0** — Squarespace-ready single-file widget with enhanced UX patterns. Featured-first + shuffle, immersive lightbox, comprehensive debug console.

## Use in Squarespace
1. Open `src/widgets/event-portfolio/versions/v2.6.0-event-portfolio.html`
2. Copy **all** HTML and paste into a Squarespace **Code Block**.
3. The widget fetches the manifest from:
   `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Events/events-manifest.json`
   (override by editing `data-manifest` on `<main id="eventsPf">`)

## New v2.6.0 Features
- **Fixed Image Stretching**: Proper aspect ratio preservation in lightbox gallery
- **Hidden Scrollbars**: Immersive fullscreen experience without visual clutter  
- **Enhanced Close Button**: Fixed positioning with better accessibility and safe areas
- **Navigation Isolation**: Comprehensive hiding of site navigation during lightbox
- **Integrated Version Display**: Version indicator in heading with interactive changelog
- **Enhanced Debug Panel**: Comprehensive metrics with force refresh and cache controls

## Local generation
```bash
node scripts/generate-events-manifest.js --root src/images/Portfolios/Events --force
```

## Live watch
```bash
npm run watch:events-manifest
```
