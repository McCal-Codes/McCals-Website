# Changelog - Event Portfolio

## 2.6.5 — 2025-12-14

### Safety: Scoped Cache Clearing 🧹

- **FIXED**: Debug "Clear Cache" no longer calls `localStorage.clear()`
- **CHANGED**: Cache controls now only remove Event Portfolio cache keys (`events_manifest_cache`, `events_manifest_timestamp`)

## 2.6.4 — 2025-12-01

### Category + Featured Filter Refinements ✨

- **UPDATED**: Simplified category structure with Performance Art designation
- **CLARIFIED**: Featured filter shows most recent or manually selected events
- **UPDATED**: Love's A Game and Howl At The Moon as Performance Art
- **ADDED**: Fisher-Yates shuffle for randomized hero images on each refresh

## 2.6.2 — 2025-10-05

### GitHub-First Robust Manifest Loading 🚀

- **PRIORITIZED**: GitHub RAW URL as primary source for production reliability
- **ENHANCED**: Multi-source fallback system (GitHub → Local → Development paths)
- **IMPROVED**: Manifest source tracking in debug panel (GitHub/Local/Cache/Failed)
- **ADDED**: Comprehensive error handling with specific error messages
- **OPTIMIZED**: 10-second timeout for robust loading across network conditions
- **MAINTAINED**: All v2.6.1 UX enhancements and data corrections
- **BULLETPROOF**: Always works in Squarespace production, degrades gracefully for local dev

## 2.6.1 — 2025-01-05

### Data Updates & Display Enhancement 📊

- **ENHANCED**: Increased featured items display from 6 to 12 cards for more content visibility
- **CORRECTED**: Denver Robotics Convention date from October 2025 to April 2019 (spring timeline) (historical accuracy)
- **ADDED**: Local Insulators Union Officers Conference (March 2024, Corporate category)
- **UPDATED**: Total events count from 7 to 8 reflecting new addition
- **IMPROVED**: All journalism widget v4.9 UX patterns retained with data corrections

## 2.6.0 — 2025-10-05

### Enhanced UX Patterns from Journalism Widget 🎨

- **FIXED**: Lightbox image stretching with `object-fit: contain` and proper centering
- **NEW**: Hidden scrollbars in lightbox gallery for immersive viewing experience
- **ENHANCED**: Navigation hiding with comprehensive selectors during lightbox
- **IMPROVED**: Close button with fixed positioning and better accessibility
- **NEW**: Version indicator integrated into heading with enhanced styling
- **ENHANCED**: Debug panel with detailed metrics and comprehensive controls
- **RETAINED**: All v2.5.6 optimizations (caching, auto-refresh, filters)

## 2.5.6

- Removed "On-Location", "Published", and "Conference" filter tabs for streamlined navigation
- Moved "Dance For A Cause" from Corporate to Celebration category for better categorization
- Updated cache key to reflect manifest changes

## 2.5.5

- Optimized lightbox close button positioning: fixed to viewport instead of relative to dialog
- Enhanced close button with backdrop blur effect and improved hover states
- Removed card borders for cleaner, more minimal appearance
- Removed debug panel border for consistent design
- Improved close button accessibility with larger hit target (44px)

## 2.5.4

- Added explicit cache-busting param on manual (Force + Bust) refresh to defeat CDN edge caching.
- Scoped cache key by manifest generated date (regenerations invalidate immediately).
- Added separate Force + Bust button to debug panel; updates manifest URL display when used.
- Improved debug status line to include manifest generated date.

## 2.5.1

- Added CMU Business Graduation gallery assets to base manifest
- Added `watch:events-manifest` script for automatic manifest regeneration
- Documented live watch workflow in README
- Updated markup + manifest path handling; use `versions/v2.5.1.html`

## 2.5

- Featured-first (top 6 newest), shuffle-on-load
- Gradient fallback, centered Debug, hidden scrollbars
- Robust manifest loader (raw/src/embedded; timeout + cache)

## 2.0

- Smart Sync (10m cache, 15m auto-refresh); Event Ops Console

## 1.0

- Initial release

// ...existing code...

## 2.6.0 — 2025-09-29

- Added versions/v2.6-unified.html using shared theme and unified manifest loader.
- Backward-compatible; older versions untouched.

## 2.6.1 — 2025-09-29

- Polished v2.6 unified cards with uppercase headings, warm neutrals, and venue/date stacks aligned to the Event Work section.

## 2.6.2 — 2025-09-30

- Updated v2.6 unified layout so event names and dates live on the imagery with grayscale overlays and darker gradients.

## 2.6.3 — 2025-09-30

- Updated the v2.6 unified page to show uncropped event photography with vertical scrolling cards and randomized ordering.
