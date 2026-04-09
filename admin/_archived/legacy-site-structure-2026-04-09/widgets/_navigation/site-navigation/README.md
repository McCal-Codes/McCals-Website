# Site Navigation Widget

Translucent navigation bar for Squarespace that replaces the stock header with a glassmorphism shell.

## Features

- Automatically hides Squarespace header elements and injects the new nav at the top of the body.
- Regex-driven active link state so AJAX navigation stays in sync.
- Mobile drawer toggle, focus-visible styling, and version badge + changelog modal.

## Versions

### Active Versions (≤2 Policy)

The following versions are maintained in `versions/`:

- **v2.0.6** (Current): Projects IA alignment with dedicated `Projects` submenu while preserving `Work` photography hierarchy
- **v2.0.5** (Previous Stable): Strict monochrome baseline with improved submenu state handling and crawl/A11y hardening

### Legacy Versions (Archived)

Versions v1.6.3 and earlier have been archived to maintain repository organization. These versions remain accessible for historical reference:

- **Archive Location**: `src/widgets/_archived/Legacy Widgets/site-navigation/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/site-navigation/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1.0.0 through v1.6.3 (5 versions)

## Usage

1. Copy the latest file from `versions/` (current: `v2.0.6-site-navigation.html`).
2. Paste into a Code Block or site-wide Code Injection near the top of the page.
3. Update link text/URLs or add additional `<li>` items as needed. Adjust `data-match` patterns for custom routing.
4. Before editing for future releases, duplicate the current version file, rename it with the next semantic version, then change the contents.

### IA Note (v2.0.6)

- `Work` remains photography-focused.
- `Projects` is now explicitly separated for creative-technology/system work.
- `Projects` submenu includes routes for design-system context and related surfaces (Abridged, Roadmap).

## Notes

- Wrapper `<div class="mcc-nav-widget">` must remain so the scoped styles execute before cloning.
- The script listens for `SquarespaceRoutingComplete` to re-run active link detection after AJAX transitions.
