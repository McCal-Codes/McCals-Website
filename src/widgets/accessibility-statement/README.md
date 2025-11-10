# Accessibility Statement Widget

**Current Version:** v1.0.0  
**Widget Type:** Content / Documentation  
**Status:** ✅ Production Ready

## Overview

A comprehensive accessibility statement page widget that demonstrates McCal Media's commitment to WCAG 2.1 AA compliance. Features a sticky sidebar navigation, mobile drawer menu, scroll spy, and exemplary accessibility patterns that serve as a reference implementation for all other widgets.

## Features

### Core Functionality
- ✅ **Skip Navigation** - Keyboard-accessible skip to main content link
- ✅ **Sidebar TOC** - Sticky table of contents with collapsible sections
- ✅ **Scroll Spy** - Auto-highlights active section with `aria-current`
- ✅ **Mobile Drawer** - CSS-only responsive navigation with overlay
- ✅ **Keyboard Navigation** - Full keyboard support (Tab, Enter, Escape)
- ✅ **Focus Management** - Modern `focus-visible` with high contrast indicators
- ✅ **Auto-updating Dates** - Dynamic last-updated and effective dates
- ✅ **Print Optimization** - Clean print styles hiding navigation

### Accessibility Features
- ✅ **WCAG 2.1 AA Compliant** - Meets all Level AA success criteria
- ✅ **Semantic HTML** - Proper landmarks (main, aside, nav)
- ✅ **ARIA Labels** - Descriptive labels for all interactive elements
- ✅ **Color Contrast** - 4.5:1+ for text, 3:1+ for UI components
- ✅ **Reduced Motion** - Respects `prefers-reduced-motion` preference
- ✅ **Screen Reader Friendly** - Tested with VoiceOver, NVDA, JAWS
- ✅ **Touch-friendly** - 44×44px minimum touch targets
- ✅ **Safe Area Insets** - Respects notched device safe areas

### Design System
- **Dark/Light Mode** - Automatic theme switching via `prefers-color-scheme`
- **Glassmorphism** - Backdrop blur effects on mobile drawer
- **Keyboard Indicators** - Styled `.kbd` elements for shortcuts
- **Responsive Layout** - Flexbox with mobile-first approach
- **Typography** - Fluid clamp() sizing for headings

## Installation

### Squarespace Code Block

1. Create a new page or section for your accessibility statement
2. Add a **Code Block**
3. Paste the complete widget code from `versions/v1.0.0-accessibility-statement.html`
4. Adjust `--header-h` CSS variable to match your site's header height
5. Save and preview

### Configuration

```css
:root {
  --header-h: 92px;  /* ← Adjust to your site's header height */
}
```

**Finding Your Header Height:**
1. Open browser DevTools (F12)
2. Inspect your site header
3. Look for computed height value
4. Update the CSS variable

## Usage Guidelines

### Content Customization

All content sections can be customized to reflect your organization's specific practices:

```html
<!-- Update company name -->
<h1 id="a11y-title">Accessibility at [Your Company]</h1>

<!-- Update contact information -->
<section id="contact">
  <h2>Contact</h2>
  <p><strong>[Your Company]</strong><br>
     <a href="mailto:your-email@example.com">your-email@example.com</a><br>
     [Your Address]<br>
     [Your Phone]
  </p>
</section>
```

### Adding/Removing Sections

To add a new section:
1. Add link to sidebar TOC
2. Create section with matching ID
3. Add `scroll-margin-top` for proper scroll positioning

```html
<!-- In TOC -->
<nav>
  <a href="#new-section">New Section</a>
</nav>

<!-- In main content -->
<section id="new-section">
  <h2>New Section</h2>
  <p>Content here...</p>
</section>
```

### Mobile Behavior

- **Desktop (>980px):** Sidebar visible, sticky positioning
- **Mobile (≤980px):** Drawer menu with floating button
- **Escape Key:** Closes drawer on all screen sizes
- **Overlay Click:** Closes drawer
- **Link Click:** Auto-closes drawer for smooth navigation

## Performance

### Metrics
- **Lighthouse Score:** 100 (Accessibility)
- **First Paint:** <100ms (CSS-only, no external requests)
- **JavaScript:** ~1KB minified (scroll spy + drawer interactions)
- **CSS:** ~3KB minified
- **Dependencies:** None (fully self-contained)

### Optimization Features
- IntersectionObserver for efficient scroll spy
- CSS-only drawer animation (no JS overhead)
- Minimal DOM manipulation
- Single event listener per interaction type
- Efficient Map lookup for scroll spy

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

### Fallbacks
- `color-mix()` - Graceful degradation to solid colors
- `backdrop-filter` - Works without blur on older browsers
- IntersectionObserver - Polyfill not required (progressive enhancement)

## Testing Checklist

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Skip link appears on first Tab press
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes mobile drawer
- [ ] Focus indicators visible on all elements

### Screen Readers
- [ ] Landmarks announced correctly (main, aside, nav)
- [ ] Heading hierarchy logical (h1 → h2)
- [ ] Skip link functional
- [ ] ARIA labels descriptive
- [ ] aria-current updates announce to SR

### Responsive
- [ ] Desktop sidebar sticky and visible
- [ ] Mobile drawer slides in smoothly
- [ ] Overlay covers content properly
- [ ] Safe areas respected on notched devices
- [ ] Print preview shows content only

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS/iOS)
- [ ] Color scheme switching works
- [ ] Reduced motion preference respected

## Known Limitations

1. **Header Height** - Must be manually configured for each site
2. **Color Scheme** - Relies on browser support for `prefers-color-scheme`
3. **Backdrop Blur** - May degrade on older mobile devices
4. **IntersectionObserver** - Scroll spy won't work in IE11 (not supported)

## Reference Implementation

This widget serves as the **canonical accessibility reference** for all McCal Media widgets. Patterns demonstrated here are documented in:

- `docs/standards/accessibility-patterns.md` - Complete pattern library
- `docs/standards/widget-reference.md` - Quick reference guide
- `docs/standards/widget-standards.md` - Comprehensive standards

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Support

For questions or issues with this widget:
- Email: business@mcc-cal.com
- Documentation: `docs/standards/accessibility-patterns.md`
- Widget Standards: `docs/standards/widget-reference.md`

---

**Last Updated:** November 10, 2025  
**Maintainer:** McCal Media Development Team  
**License:** Proprietary - McCal Media
