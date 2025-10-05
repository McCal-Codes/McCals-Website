# Featured Portfolio Widget Changelog

## v1.6.1 - 2025-10-04
- **Lightbox Header Isolation**: Introduced `html.lb-open` pattern used by other widgets so Squarespace headers / announcement bars lose pointer-events while the lightbox is open (prevents clicks on nav behind overlay).
- **Consistent z-index**: Elevated lightbox to 2147483647 to match other portfolio widgets and guarantee top layering.
- **Reduced Diff Build**: Version file refactored for minimal footprint; feature parity retained with v1.5 (core data logic simplified for reliability when embedded).
- NOTE: v1.6.0 had planned debug/source enhancements but no separate version file was committed; this release focuses narrowly on interaction safety.

## v1.6.0 - 2025-10-03
- **Enhanced Source Tracking**: Added detailed source metadata with last updated timestamps
- **Improved Debugging**: Enhanced debug panel with scrollable log output and detailed source information
- **Better Error Handling**: More robust error handling with fallback loading strategies
- **Source Display**: Meta bar now shows loaded source names (Concert Photography, Event Photography, Journalism)
- **Enhanced Logging**: Comprehensive debug logging with timestamps and structured data
- **Reduced Cache TTL**: Shorter cache time (10 minutes) for better data freshness
- **GitHub URL Support**: Full compatibility with GitHub raw URLs for production deployment

## v1.5.0 - 2025-10-03
- **Enhanced Journalism Titles**: Improved article title extraction from folder paths and filenames
- **Ultra-Minimal Scrollbars**: Refined scrollbar design (4px width, 0.15 opacity) for better aesthetics  
- **Improved Masonry Layout**: Tighter grid spacing (16px gaps) for enhanced visual density
- **Randomized Cover Images**: Fisher-Yates shuffle algorithm for variety on each page load
- **Production-Ready GitHub Integration**: Complete GitHub raw URL support for image loading
- **Scrollable Lightbox**: Enhanced lightbox with repositioned close button and better image flow
- **15-Item Display Limit**: Optimized for performance with reasonable content volume

### Follow-up Tasks
- ✅ Created scripts/generate-featured-manifest.js for automated featured manifest generation
- ✅ Enhanced widget to ensure diverse portfolio type representation
- ✅ Implemented GitHub URL support for production deployment
- Backfill existing portfolio manifests with cover image references for lightbox quality
- Validate image paths across Concert, Events, Journalism, and future collections
- Add featured manifest generation to CI/CD pipeline

## v1.3.0 - 2025-10-03
- **Diverse Selection Algorithm**: Ensures representation from all portfolio types (Concert, Events, Journalism)
- **Extended Date Range**: Increased default range from 1 year to 3 years (1095 days) to include older portfolio content
- **Portfolio Type Distribution**: Added debug logging to show how many items are selected from each portfolio type
- **Smart Fallbacks**: If range filter removes all items, falls back to showing available items
- **Better Cache Keys**: Updated cache keys to v1.3 to prevent conflicts with older versions

## v1.2.0 - 2025-10-03
- Enhanced debug information with console logging for better troubleshooting
- Improved error handling and reporting for manifest loading failures
- Added console logging to track manifest loading process
- Fixed Unicode characters in debug messages
- Generated featured-manifest.json now available via scripts/generate-featured-manifest.js

## v1.1.0 - 2025-10-03
- Hardened manifest selection order so aggregate feeds load reliably even without a dedicated featured manifest.
- Replaced non-ASCII separators, refreshed cache keys, and retitled debug surfaces to match v1.1.
- Documented embed usage so Squarespace code blocks display the right version indicator.

## v1.0.0 - 2025-10-03
- First public release of the Featured Highlights widget.
- Aggregates entries from featured/portfolio manifests with category fallbacks.
- Adds progressive loading, manifest caching, and unified lightbox experience.
- Includes debug overlay and auto-refresh to detect newly published work.

### Follow-up Tasks
- Automate generation of eatured-manifest.json during deployments.
- Backfill existing portfolio manifests with cover image references for lightbox quality.
- Validate image paths across Concert, Events, Journalism, and future collections.




