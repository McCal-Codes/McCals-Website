# Site Footer Widget

Drop-in footer embed for Squarespace code blocks with modern glass design aesthetic.

## Features

- **Back to Top Button**: Circular floating button with scroll progress ring
- Modern blur + backdrop filtering for enhanced visual depth
- CSS custom properties for consistent theming and dark mode support
- Responsive grid layout with social icons and newsletter signup
- Enhanced accessibility with ARIA labels and focus states
- Auto-updating copyright year with dynamic year range
- Mobile-optimized design with improved touch targets
- Animated link underlines and social icon tooltips
- Newsletter form with loading states and success feedback

## Usage

1. Copy the latest file from `versions/` (current: `v1.3.0-footer-back-to-top.html`)
2. Paste into a Squarespace Code Block at the bottom of your page
3. Customize link destinations and Mailchimp action URL as needed
4. For updates: duplicate version file, increment semantic version, then edit

## Versions

### Active Versions (≤2 Policy)

The following versions are maintained in `versions/`:

- **v1.3.0** (Current): Performance-optimized with modern glass design, CSS custom properties
- **v1.2.0** (Previous Stable): Baseline with accessibility enhancements

### Legacy Versions (Archived)

Versions v1.1.0 and earlier have been archived to maintain repository organization. These versions remain accessible for historical reference:

- **Archive Location**: `src/widgets/_archived/Legacy Widgets/site-footer/versions/`
- **Archive Index**: See [`INDEX.json`](../_archived/Legacy%20Widgets/site-footer/versions/INDEX.json) for complete version catalog
- **Archived Versions**: v1.0.0 through v1.1.0 (2 versions)

## Configuration

- Links grouped for About, Contact, Portfolio sections
- Social media icons (Facebook, Instagram) - update URLs as needed
- Newsletter form connects to Mailchimp (update form action URL)
- Version indicator shows current widget version (v1.3.0)

## Notes

- Keep the wrapper `<div class="mcc-footer-widget" data-widget-version="1.2.0">` intact
- All CSS/JS is inline for Squarespace compatibility
- Follows workspace standards for self-contained widget architecture
- Performance optimized with reduced motion support
