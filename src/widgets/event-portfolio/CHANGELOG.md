# Changelog - Event Portfolio

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
