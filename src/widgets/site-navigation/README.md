# Site Navigation Widget

Translucent navigation bar for Squarespace that replaces the stock header with a glassmorphism shell.

## Features
- Automatically hides Squarespace header elements and injects the new nav at the top of the body.
- Regex-driven active link state so AJAX navigation stays in sync.
- Mobile drawer toggle, focus-visible styling, and version badge + changelog modal.

## Usage
1. Copy the latest file from `versions/` (start with `v1.7.1-site-navigation.html`).
## Active Versions
- v1.7.1 (current)
- v1.6.3 (previous stable)

Older versions are archived in `src/widgets/_archived/legacy-widget-versions/site-navigation/`.
2. Paste into a Code Block or site-wide Code Injection near the top of the page.
3. Update link text/URLs or add additional `<li>` items as needed. Adjust `data-match` patterns for custom routing.
4. Before editing for future releases, duplicate the current version file, rename it with the next semantic version, then change the contents.

## Notes
- Wrapper `<div class="mcc-nav-widget">` must remain so the scoped styles execute before cloning.
- The script listens for `SquarespaceRoutingComplete` to re-run active link detection after AJAX transitions.
