# Site Footer Widget

Drop-in footer embed for Squarespace code blocks with modern glass design aesthetic.

## Features
- Modern blur + backdrop filtering for enhanced visual depth
- CSS custom properties for consistent theming and dark mode support
- Responsive grid layout with social icons and newsletter signup
- Enhanced accessibility with ARIA labels and focus states
- Auto-updating copyright year and clean version indicator
- Mobile-optimized design with improved touch targets

## Usage
1. Copy the latest file from `versions/` (current: `v1.3.0.footer-widget.html`)
2. Paste into a Squarespace Code Block at the bottom of your page
3. Customize link destinations and Mailchimp action URL as needed
4. For updates: duplicate version file, increment semantic version, then edit

## Configuration
- Links grouped for About, Contact, Portfolio sections
- Social media icons (Facebook, Instagram) - update URLs as needed
- Newsletter form connects to Mailchimp (update form action URL)
- Version indicator shows current widget version (v1.3.0)

## Active Versions
- v1.3.0 (current)
- v1.2.0 (previous stable)

Older versions are archived in `src/widgets/_archived/legacy-widget-versions/site-footer/`.

## Notes
- Keep the wrapper `<div class="mcc-footer-widget" data-widget-version="1.2.0">` intact
- All CSS/JS is inline for Squarespace compatibility
- Follows workspace standards for self-contained widget architecture
- Performance optimized with reduced motion support
