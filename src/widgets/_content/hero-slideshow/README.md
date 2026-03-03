# Hero Slideshow Widget

Modern landing hero slideshow for Squarespace with accessible controls and minimal footprint.

## Current Version

- v1.3.14 (current): Fast-LCP initialization (favorites first paint) + progressive dynamic hydration + long-task optimized chunking/yields + explicit slot overrides (`concert:dynamic,journalism:favorite`) + responsive focal points + overlay-strength toggle + SEO + CTA polish + full-bleed drag/swipe hero
- v1.3.13 (previous stable)

Older versions are archived in `src/widgets/_archived/Legacy Widgets/hero-slideshow/`.

## Features

- Accessible play/pause and previous/next controls
- Focus-visible styling and keyboard navigation
- IntersectionObserver-based lazy initialization
- Reduced motion support
- Dynamic source mode from portfolio manifest (`dynamic`)
- Curated shuffled favorite slides (`favorites`)
- Hybrid mode (`hybrid`) with optional per-slide plan
- Category-slot planning for named slide targets (politics, journalism, pittsburgh, portraits, corporate, event, concert, theatre, nature)

## Usage

1. Copy the latest file from `versions/` (current: `v1.3.14-fast-lcp-progressive-dynamic.html`).
2. Paste into a Squarespace Code Block on the landing page.
3. Configure mode via data attributes on the root `.mcc-hero-widget` element:
	- `data-source-mode="dynamic"` → manifest-driven newest items
	- `data-source-mode="favorites"` → shuffled curated favorites only
	- `data-source-mode="hybrid"` → favorites first, then dynamic fill
4. Optional per-slide control with `data-slide-plan`.
	- Source slots: `favorite` or `dynamic`
	- Category slots: `politics,journalism,pittsburgh,portraits,corporate,event,concert,theatre,nature`
	- 9-slide category example:
		`data-slide-plan="politics,journalism,pittsburgh,portraits,corporate,event,concert,theatre,nature"`
	- Pair with `data-max-slides="9"` for all 9 category slots.
5. `v1.3.9` ships with a built-in mcc-cal.com parity preset matching your current 9 categories: politics, journalism, pittsburgh, portraits, corporate, event, concert, theatre, nature.
6. To mirror Squarespace exactly, keep `data-source-mode="favorites"`.
7. To auto-refresh from manifests while keeping category slots, use `data-source-mode="hybrid"` or `data-source-mode="dynamic"`.
8. `v1.3.9` includes carousel interactions:
	- Autoplay advances to the next slide automatically.
	- Mouse/touch drag or swipe moves slides left/right.
	- Arrow controls and dot navigation are included.
9. Visual-parity defaults in `v1.3.9`:
	- `data-show-text="false"` hides large title/meta so the slide CTA button dominates like the live site.
	- `data-show-dots="false"` hides dots by default for a cleaner Squarespace-like presentation.
10. Full-bleed + no-adjacent behavior in `v1.3.9`:
	- Locks the hero to viewport height (`100dvh` with JS fallback sync) for true screen-fill.
	- Suppresses section/content wrapper padding and width constraints in Squarespace hosts.
	- Drag gestures no longer expose adjacent slide peeks; swipe still changes slides on release.
11. Taller hero control in `v1.3.9`:
	- Use `data-height-multiplier` to scale height beyond viewport (default `1.12`).
	- Examples: `1.05` = slightly taller, `1.12` = current default, `1.2` = much taller.
12. Responsive focal-point control in `v1.3.9`:
	- `focalPointMobile` and `focalPointDesktop` are supported per slide.
	- Mobile values currently match your Squarespace focal data.
	- Desktop values are independently tunable without affecting mobile.
13. Overlay strength control in `v1.3.9`:
	- `data-overlay-strength="none|soft|default"`
	- `none` = cleanest image edge, `soft` = subtle cinematic, `default` = strongest contrast.
14. Top black bar removal in `v1.3.9`:
	- Hero top overlay darkening at the very top edge is removed.
	- Host section/root receives a slight negative top offset to eliminate visible top seam in Squarespace layouts.
15. SEO enhancements in `v1.3.9`:
	- Improved alt-text fallback generation when source alt text is missing.
	- Added semantic slide aria-labels and richer CTA aria-labels.
	- Injects JSON-LD `ItemList` with `ImageObject` entries for slide images.
	- Uses standard `<img src>` rendering and async decoding for crawler-friendly image discovery.
16. CTA visual polish in `v1.3.9`:
	- Pill button style, subtle gradient, blur, improved hover/focus states, and animated shine effect.
17. Explicit slot overrides in `v1.3.12`:
	- Root attribute default: `data-slot-overrides="concert:dynamic,journalism:favorite"`.
	- Keeps `data-source-mode="favorites"` behavior for remaining slots (still shuffled), while concert pulls dynamic manifest data and journalism is pinned to favorites.
	- You can add more overrides as comma-separated entries, for example: `data-slot-overrides="concert:dynamic,journalism:favorite,nature:favorite"`.
18. Long-task optimization in `v1.3.13`:
	- Initialization now yields to the main thread between heavy phases using `scheduler.yield()` when available, with a `requestAnimationFrame`/`setTimeout` fallback.
	- Dynamic manifest conversion is processed in chunks to avoid long uninterrupted scripting blocks.
	- Rendering, structured-data injection, and slider boot are split by yields to reduce main-thread contention on slower devices.
19. Fast-LCP progressive hydration in `v1.3.14`:
	- First render now happens immediately from favorites/fallback data (no manifest wait), so the hero can paint sooner.
	- Dynamic manifest fetch/conversion runs after first paint and then hydrates the slide set progressively.
	- Existing slide position is preserved during hydration to avoid jarring UX while still improving LCP.

## Notes

- Keep the wrapper `div.mcc-hero-widget` intact for scoped styles and script.
- All CSS/JS is inline; no external dependencies.
- Default manifest endpoint is `src/images/Portfolios/featured-manifest.json` on the GitHub raw URL and can be overridden with `data-manifest-url`.
