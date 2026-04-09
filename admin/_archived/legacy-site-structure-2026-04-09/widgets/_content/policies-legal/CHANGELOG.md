# Policies & Legal Widget - Changelog

All notable changes to the Policies & Legal widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-11

### Added
- Accessibility enhancements aligned with Accessibility Statement patterns:
  - Skip link to main content for keyboard users
  - Unified `:focus-visible` outline (3px, offset 2px)
  - Scroll spy sets `aria-current="true"` on active sidebar link (and clears others)
  - Mobile nav closes on link selection, overlay click, and Escape key; `aria-expanded` kept in sync
  - Landmark hardening with `role="document"`, explicit `role="navigation"` and `role="main"`
  - `prefers-reduced-motion` respected (disables smooth scrolling)
  - Print stylesheet refinement: hides navigation, scrim, modal; content only

### Changed
- Sidebar/mobile drawer behavior brought in line with documented accessibility patterns while retaining existing UI/UX

### Notes
- No breaking changes to content structure; HTML remains self-contained and Squarespace-ready

## [1.0.0] - 2025-01-27

### Added - Initial Release
- **Comprehensive Legal Documentation**
  - License (Usage Rights) section with detailed rights explanation
  - Privacy Policy with data collection, usage, retention, and user rights
  - Cookie Policy with essential, analytics, and third-party cookie details
  - Terms & Conditions with 23 detailed sections:
    - Pre-Project Consultation
    - Cost structure
    - Fee payment terms
    - Late fee policy
    - Expense handling
    - Account access requirements
    - Confidentiality agreements
    - Relationship definitions (independent contractor)
    - Intellectual property rights (copyright retention)
    - Style release expectations
    - Liability limitations
    - Indemnification clauses
    - Assumption of risk
    - Non-disparagement agreement
    - Cancellation & rescheduling policies (tiered refund structure)
    - Force majeure provisions
    - No-show policy
    - Governing law (Pennsylvania jurisdiction)
    - Notice requirements (email communication)
    - Severability clause
    - Amendment process
    - Assignment restrictions
  - FAQ section with 7 common client questions:
    - Turnaround times
    - Photo backups
    - Social media sharing
    - Weather contingencies
    - Raw file delivery
    - Photo quantity expectations
  - Contact section with full business information

- **Navigation & UX**
  - Sticky sidebar navigation with collapsible sections
  - Scroll spy active link highlighting
  - Mobile-responsive drawer menu
  - Floating "Menu" button for mobile (bottom-right)
  - Backdrop overlay (scrim) for mobile menu
  - Smooth scroll navigation between sections
  - Heading anchors with visible § symbols on hover
  - Auto-closing mobile menu on section click

- **SEO & Structured Data**
  - WebPage JSON-LD schema with publisher, dates, language
  - BreadcrumbList JSON-LD schema (Home > Policies & Legal)
  - FAQPage JSON-LD schema with 6 structured Q&A pairs
  - Semantic HTML5 elements:
    - `<main>`, `<aside>`, `<nav>`, `<section>`, `<article>`, `<address>`, `<time>`, `<dl>`, `<dt>`, `<dd>`
  - Proper heading hierarchy (H1 → H2 → H3)
  - Meta tag template for Open Graph and Twitter Cards
  - Canonical URL configuration
  - Robots meta tag

- **Accessibility**
  - ARIA labels on all interactive elements
  - ARIA roles: `navigation`, `main`, `separator`, `presentation`, `dialog`, `button`
  - `aria-labelledby` for section associations
  - `aria-expanded` for mobile menu state
  - `aria-controls` for menu toggle
  - `aria-modal` for changelog dialog
  - Keyboard navigation support (Tab, Enter, Escape)
  - Screen reader optimized structure
  - Visible focus states
  - Color contrast meeting WCAG AA standards

- **Design & Styling**
  - Unsplash-inspired clean minimalist design
  - CSS custom properties for theming
  - Dark mode by default
  - Light mode via `prefers-color-scheme: light`
  - Responsive breakpoints:
    - Desktop: Sidebar + content (>980px)
    - Tablet/Mobile: Drawer menu (≤980px)
  - Glassmorphism effects:
    - Backdrop blur on effective date badge
    - Backdrop blur on mobile menu
    - Backdrop blur on changelog modal
  - Smooth transitions and animations
  - Color-mix for dynamic color variations
  - Clamp-based responsive typography

- **JavaScript Features**
  - Dynamic Squarespace header height detection
  - Auto-updating effective date (current date)
  - Auto-updating copyright year
  - Intersection Observer for scroll spy
  - Mobile drawer toggle with state management
  - Automatic heading anchor injection
  - Changelog modal controls
  - Smooth scroll polyfill
  - URL hash updates without page jump
  - Event delegation for performance
  - Single initialization guard

- **Performance**
  - Self-contained widget (all CSS/JS inline)
  - No external dependencies
  - No jQuery (vanilla JavaScript)
  - Efficient CSS selectors
  - Passive event listeners
  - Minimal DOM manipulation
  - CSS containment for layout optimization
  - Intersection Observer for efficient scroll detection
  - ~200 lines of JavaScript (minified ~6KB)

- **Documentation**
  - Comprehensive README with:
    - Installation instructions
    - Usage examples
    - Customization guide
    - Mobile behavior details
    - Accessibility features
    - SEO best practices
    - Performance metrics
    - Browser support matrix
    - Testing checklist
    - Legal considerations
  - Inline code comments for developers
  - Squarespace-specific usage notes
  - Meta tag template in HTML comments

### Technical Details
- **Version**: 1.0.0
- **Release Date**: 2025-01-27
- **Widget Type**: Legal Documentation Page
- **CSS Variables**: 7 custom properties for theming
- **Breakpoints**: 980px (tablet/mobile), 640px (small mobile)
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, iOS 14+

### Known Limitations
- Requires Squarespace header height detection script (included)
- Mobile drawer requires JavaScript (gracefully degrades)
- Scroll spy requires Intersection Observer API (fallback: no active states)
- Smooth scroll may not work in older browsers (fallback: instant scroll)

### Future Enhancements (Planned)
- [ ] Multi-language support (i18n)
- [ ] Print stylesheet optimization
- [ ] PDF export functionality
- [ ] Client signature/acknowledgment feature
- [ ] Integration with contract management systems
- [ ] Dark/light mode manual toggle
- [ ] Customizable color schemes
- [ ] Table of contents permalink copying
- [ ] Reading progress indicator

---

## Version Format

**MAJOR.MINOR.PATCH**

- **MAJOR**: Breaking changes, complete redesign, major functionality changes
- **MINOR**: New features, new sections, significant enhancements
- **PATCH**: Bug fixes, typo corrections, minor improvements

---

**Changelog Maintained By:** McCal Media Development Team  
**Last Updated:** 2025-11-11
