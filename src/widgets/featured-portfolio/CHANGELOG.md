# Featured Portfolio Widget### Follow-up Tasks
- ✅ Created scripts/generate-featured-manifest.js for automated featured manifest generation
- ✅ Enhanced widget to ensure diverse portfolio type representation
- Backfill existing portfolio manifests with cover image references for lightbox quality
- Validate image paths across Concert, Events, Journalism, and future collections
- Add featured manifest generation to CI/CD pipelinengelog

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




