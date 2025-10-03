# Featured Portfolio### Follow-up Tasks
- ✅ Created scripts/generate-featured-manifest.js for automated featured manifest generation
- Backfill existing portfolio manifests with cover image references for lightbox quality
- Validate image paths across Concert, Events, Journalism, and future collections
- Add featured manifest generation to CI/CD pipelineget Changelog

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




