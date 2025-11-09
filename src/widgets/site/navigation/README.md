# Site Navigation Widget

Translucent navigation bar for Squarespace that replaces the stock header with a glassmorphism shell.

## Features
- Automatically hides Squarespace header elements and injects the new nav at the top of the body.
- Regex-driven active link state so AJAX navigation stays in sync.
- Mobile drawer toggle, focus-visible styling, and version badge + changelog modal.

## Recommended Version
**Start with `v1.6.header-injection.html`** - This is the stable, production-ready version with proven reliability.

## Usage
1. Copy `v1.6.header-injection.html` from `versions/` (or use `site-navigation.html` in the main folder, which is identical to v1.6).
2. Paste into a Code Block or site-wide Code Injection near the top of the page.
3. Update link text/URLs or add additional `<li>` items as needed. Adjust `data-match` patterns for custom routing.
4. Before editing for future releases, **duplicate v1.6 as your starting point**, rename it with the next semantic version, then change the contents.

## Notes
- Wrapper `<div class="mcc-nav-widget">` must remain so the scoped styles execute before cloning.
- The script listens for `SquarespaceRoutingComplete` to re-run active link detection after AJAX transitions.

## Available Versions

### v1.6 (Recommended - Production Ready)
- **File**: `v1.6.3.header-injection.html` or `site-navigation.html`
- **Status**: ✅ Stable and production-ready
- **Features**: Glassmorphism design, mobile responsive, scroll effects, active link detection
- **Use when**: You need a reliable, well-tested navigation widget

### v1.7 Enhanced
- **File**: `v1.7.0-enhanced.html`
- **Status**: 🔄 Enhanced with new features
- **Features**: All v1.6 features PLUS:
  - Smooth scroll animations and transitions
  - Enhanced keyboard navigation (Tab, Escape, Arrow keys)
  - Improved focus management and ARIA labels
  - Smooth mobile menu animations with staggered entrance
  - Better touch interactions
  - Link preloading for faster navigation
  - Work submenu with /portraits link
- **Use when**: You want enhanced accessibility and smoother animations while keeping v1.6's visual style

### v1.7.0 Performance Optimized (Legacy)
- **File**: `v1.7.0-performance-optimized.html`
- **Status**: ⚠️ Legacy/Different design approach
- **Features**: Different styling (light theme, dropdown menus, CTA button)
- **Use when**: You prefer a completely different visual approach (not recommended for current design)
