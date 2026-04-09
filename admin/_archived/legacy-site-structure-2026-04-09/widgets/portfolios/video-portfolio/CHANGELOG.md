# Video Portfolio Widget Changelog

All notable changes to the Video Portfolio widget will be documented in this file. Versioning follows the policy defined in `docs/standards/versioning.md`.

## [0.2.0] - 2025-12-14

### Added

- **Compliance Upgrade**: precise compliance with `WIDGET-DEVELOPMENT.md`.
- **Changelog Modal**: Interactive changelog modal for viewing version history directly in the widget.
- **Version Indicator**: Clickable version indicator in the header that opens the changelog.

## [0.1.0] - 2025-11-19

### Added

- Initial scaffold of self-contained video portfolio widget (`v0.1-video-portfolio.html`) with inline CSS/JS.
- Basic responsive masonry-like grid using CSS columns for video thumbnails.
- Accessible lightbox/player overlay with focus trap, Escape close, and keyboard media controls.
- Inline sample dataset (local MP4 + YouTube + Vimeo placeholder sources) — replace with real sources or future manifest integration.
- Lazy loading of thumbnails & deferred video player initialization.
- Reduced motion support (disables thumbnail hover scale & fancy transitions).
- Basic JSON-LD structured data injection (VideoObject + ItemList) for SEO.
- README with usage instructions and roadmap.

### TODO (Roadmap)

- Manifest generator for video metadata (`scripts/manifest/generate-video-manifest.js`).
- Caption & transcript integration (WebVTT + accessible transcript panel).
- Adaptive bitrate streaming (HLS/DASH) with fallbacks.
- Performance audit (Lighthouse) + structured data validator automation.
- CI enforcement of ≤2 active versions.

---

## Legend

- Added: new features
- Changed: modifications to existing functionality
- Fixed: bug fixes
- Deprecated: soon-to-be removed features
- Removed: removed features
- Security: security impact changes
