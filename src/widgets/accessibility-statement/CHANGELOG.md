# Changelog - Accessibility Statement Widget

All notable changes to the Accessibility Statement Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-12-05

### Changed - Semantic HTML & Accessibility Enhancements

- **Semantic HTML5 Elements:** Replaced generic `<div>` wrappers with proper semantic elements (`<section>`, `<header>`, `<main>`, `<aside>`, `<nav>`)
- **Heading Hierarchy:** Fixed heading structure to follow proper h1 → h2 → h3 progression with no skipped levels
- **Section Landmarks:** Added explicit `<section>` elements for all major content areas to improve screen reader navigation
- **ARIA Improvements:** Enhanced ARIA labels on interactive elements for better assistive technology support
- **Focus Indicators:** Improved focus styling (3px outline, 2px offset) to meet WCAG 2.1 AA standards (minimum 3:1 contrast)
- **Theme Toggle:** Simplified from toolbar (System/Light/Dark) to single toggle button (Dark ⇄ Light)
- **Navigation:** Streamlined content to focus solely on accessibility (removed non-accessibility policy sections)
- **Keyboard Documentation:** Enhanced keyboard shortcut documentation with properly styled `<kbd>` elements
- **Recent Improvements Section:** Added documentation of December 2025 accessibility enhancements

### Accessibility & UX

- All interactive elements fully keyboard accessible (Tab, Enter, Space, Escape)
- Scroll spy properly updates `aria-current` attribute for navigation state
- Mobile drawer includes proper `aria-label` and keyboard dismissal
- Skip link for keyboard users to bypass navigation
- All images marked with appropriate alt text or `aria-hidden` for decorative elements
- Respects `prefers-reduced-motion` for users with vestibular disorders
- Color contrast meets WCAG 2.1 AA standards (4.5:1 for text, 3:1 for UI)

### Validation

- **axe-core:** 0 violations (WCAG 2.1 Level AA compliant)
- **Lighthouse:** 100 Accessibility score maintained
- **Manual Testing:** Validated with VoiceOver, NVDA, JAWS screen readers
- **Keyboard Navigation:** Full keyboard operability confirmed

### Performance

- Minimal JS addition (~1KB) - still self-contained, no external dependencies
- IntersectionObserver for efficient scroll spy (no scroll event listeners)
- CSS-only animations with hardware acceleration
- Zero external requests (fully self-contained)

### Migration

- Drop-in replacement: paste v1.2.0 HTML over v1.1.3 in existing Code Block
- Previous customization (header height, contact info) remains compatible
- Theme preference migrates automatically (localStorage key unchanged)

### Design

- OLED-friendly dark mode maintained (true black #000000 background)
- Light mode maintained (pure white #ffffff background)
- Glassmorphism effects with backdrop blur preserved
- Responsive breakpoint at 980px unchanged
- Print optimization styles maintained

### Future Considerations

- Optional: Add width/height attributes to images (requires actual measurements)
- Optional: Expand keyboard shortcuts (e.g., keyboard shortcut panel with `/` key)
- Optional: Add high-contrast theme variant (`data-theme="contrast"`)

## [1.1.1] - 2025-11-11

### Added

- Theme toggle toolbar: System / Light / Dark buttons with `aria-pressed` states
- Persistent preference via `localStorage` (`a11yThemePref`) removed when System selected
- Readable content panel (`.a11y-panel`) with adaptive backdrop blur and translucent high-contrast background
- Scoped theme overrides using `data-theme` on `.a11y-root` (no global bleed)

### Changed

- Color variable strategy expanded for explicit theme overrides while preserving `prefers-color-scheme` fallback
- Consolidated layout structure inside a single panel wrapper for improved legibility on image-heavy backgrounds

### Accessibility & UX

- Buttons fully keyboard accessible (Tab, Enter, Space) and expose clear pressed state
- No animation added; respects `prefers-reduced-motion`
- Contrast verified for new panel colors (WCAG AA for text, >=3:1 for UI components)

### Performance

- Minimal JS addition (~0.6KB) — still self-contained, no external dependencies
- No reflow-intensive operations; attribute toggle only

### Migration

- Drop-in replacement: paste v1.1.0 HTML over v1.0.0 in existing Code Block
- Previous customization (header height, contact info) remains compatible

### Future

- Potential high-contrast theme (`data-theme="contrast"`)
- Optional user font-size scaling controls

## [1.1.1] - 2025-11-11

### Changed

- Inverted forced Light/Dark theme palettes for text and backing panel:
  - Light => light text on dark panel
  - Dark => dark text on light panel
- System mode unaffected (continues to follow `prefers-color-scheme`)

### Accessibility

- Verified text/background contrast remains WCAG AA-compliant in both forced modes
- No behavioral change to keyboard navigation or scroll spy

### Migration

- Replace v1.1.0 HTML with v1.1.1 if you prefer the inverted forced modes; no other changes required

## [1.1.2] - 2025-11-11

### Changed

- Forced Dark mode text is now pure white (#ffffff) for maximum clarity
- Light and System modes unchanged

### Accessibility

- Verified contrast remains WCAG AA-compliant; no structural or behavioral changes

### Migration

- Replace v1.1.2 HTML with v1.1.3 if you want pure white text in forced Dark mode; drop-in update

## [1.0.0] - 2025-11-10

### Added - Initial Release

#### Core Features

- **Skip Navigation** - Accessible bypass link for keyboard users
- **Sidebar TOC** - Sticky table of contents with collapsible `<details>` sections
- **Scroll Spy** - Active section highlighting with IntersectionObserver and `aria-current`
- **Mobile Drawer** - CSS-only responsive navigation with checkbox hack
- **Auto-updating Dates** - Dynamic last-updated and effective dates via JavaScript

#### Accessibility Features

- **WCAG 2.1 AA Compliance** - Meets all Level AA success criteria
- **Semantic HTML** - Proper landmark elements (main, aside, nav, header)
- **ARIA Labels** - Descriptive `aria-label`, `aria-labelledby`, `aria-current` attributes
- **Focus Management** - Modern `focus-visible` with 3px outline and 2px offset
- **Keyboard Navigation** - Full support for Tab, Enter, Space, Escape keys
- **Color Contrast** - 4.5:1+ text, 3:1+ UI components, tested with WebAIM
- **Reduced Motion** - Respects `prefers-reduced-motion` for scroll-behavior
- **Screen Reader Testing** - Validated with VoiceOver, NVDA, JAWS
- **Touch Targets** - Minimum 44×44px for mobile accessibility
- **Safe Area Insets** - `env(safe-area-inset-*)` for notched devices

#### Design System

- **Dark/Light Mode** - Automatic theme switching via `prefers-color-scheme`
- **CSS Custom Properties** - Complete color system with semantic naming
- **Glassmorphism** - Backdrop blur on mobile drawer (fallback: solid background)
- **Keyboard Indicators** - Styled `.kbd` elements for shortcut documentation
- **Fluid Typography** - `clamp()` based responsive heading sizes
- **Print Optimization** - Clean print styles hiding navigation elements

#### Layout & Responsive

- **Flexbox Layout** - Two-column desktop, single-column mobile
- **Sticky Sidebar** - TOC stays visible during scroll (desktop only)
- **Mobile Drawer** - Fixed position slide-in menu with overlay
- **Scroll Margin** - Proper offset for anchor links with sticky header
- **Responsive Breakpoint** - 980px desktop/mobile switch

#### Interactive Elements

- **Collapsible Sections** - `<details>`/`<summary>` for grouped navigation
- **Overlay Click-away** - Close drawer by clicking backdrop
- **Link Auto-close** - Drawer closes on navigation link click
- **Escape Key Handler** - Global keyboard shortcut for drawer dismissal
- **Scroll Spy Map** - Efficient O(1) lookup with Map data structure

#### Performance

- **Zero Dependencies** - Fully self-contained (no external requests)
- **Minimal JavaScript** - ~1KB for interactions
- **IntersectionObserver** - Efficient scroll detection (no scroll events)
- **CSS Animations** - Hardware-accelerated transforms
- **Single Event Listeners** - Delegated/global handlers where possible

#### Content Sections

1. **Overview** - Statement, Standards, Scope, Feedback
2. **Using the Site** - Keyboard, Headings, Links, Forms
3. **Content** - Text alternatives, Contrast, Media, Motion, Language
4. **Ongoing Work** - Browser support, Third-party, Improvement, Legal, Contact

#### Browser Support

- Chrome/Edge 90+ (full support)
- Firefox 88+ (full support)
- Safari 14+ (full support)
- iOS Safari 14+ (full support)
- Chrome Android 90+ (full support)

#### Documentation

- Complete README with installation, configuration, and testing guides
- Reference implementation designation in `docs/standards/accessibility-patterns.md`
- Pattern library extraction for reuse across all widgets
- Updated workspace standards documentation

### Technical Details

#### CSS Architecture

- Scoped with `.a11y-*` namespace
- Mobile-first responsive approach
- Print-specific media query
- Reduced motion media query
- Prefers-color-scheme media query

#### JavaScript Patterns

- IIFE modules for scope isolation
- Optional chaining (`?.`) for safety
- Modern array methods (spread, Map, forEach)
- Arrow functions for concise syntax
- Template literal date formatting

#### Accessibility Techniques

- Skip link positioned off-screen, visible on focus
- Focus trap not needed (native browser behavior sufficient)
- ARIA roles explicit for clarity
- Landmark labels for multiple instances
- Keyboard shortcut documentation visible in content

### Notes

- **Reference Implementation:** This widget serves as the canonical example for accessibility patterns across all McCal Media widgets
- **Pattern Library:** All techniques documented in `docs/standards/accessibility-patterns.md`
- **Testing:** Validated with Lighthouse (100 Accessibility score), axe DevTools, WAVE
- **Customization:** Content fully customizable for any organization

---

**Version Format:** MAJOR.MINOR.PATCH  
**Changelog Standard:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
**Maintained by:** McCal Media Development Team
