# Changelog - Accessibility Statement Widget

All notable changes to the Accessibility Statement Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
