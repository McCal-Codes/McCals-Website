# Featured Portfolio Widget

**Current Version: v1.5.1** — LCP-optimized iteration with native pre-rendered hero card, randomized cover images, masonry spacing refinements, and production-focused lightbox behavior.

## Versions

### Active Versions (≤2 Policy)
The following versions are maintained in `versions/`:
- **v1.5.1** (Current): Native pre-rendered LCP candidate (`<img loading="eager" fetchpriority="high">`) plus top-pin shuffle stabilization
- **v1.5.0-working** (Previous Stable): Baseline for v1.5.1 enhancements

### Legacy Versions (Archived)
Versions v1.3.0 and earlier have been archived to maintain repository organization. These versions remain accessible for historical reference:
- **Archive Location**: `src/widgets/_archived/Legacy Widgets/featured-portfolio/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/featured-portfolio/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1.0.0 through v1.3.0 (4 versions)

## Features
- Randomized cover image selection (Fisher-Yates shuffle)
- Masonry layout with optimized column gaps
- Scrollable lightbox modal with immersive viewing
- Minimal gray accent styling for neutral presentation
- Native pre-rendered hero card for JS-independent first paint
- Debug metrics panel (optional via `?debug=true`)

## Usage
Embed the latest HTML file (`versions/v1.5.1-featured-optimization.html`) directly into a Squarespace Code Block.

### Version History
Earlier versions experimented with layout densities, initial shuffle strategies, and debug panel scaffolding. All archived versions remain accessible for historical reference and feature comparison. Consult the archive INDEX.json and widget CHANGELOG.md for detailed progression.

## Future Enhancements
- Consider performance instrumentation alignment with v5+ portfolio widgets
- Optional integrated filter taxonomy for mixed-media showcases
- Accessibility refinements (focus outline theming, lightbox escape semantics parity)

_Last updated: 2026-03-03_
