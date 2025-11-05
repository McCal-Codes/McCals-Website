# Changelog — CSS Playground Widget

All notable changes to the CSS Playground testing environment.

## v1.2 — 2025-11-05 (Dynamic Production Widget Loader)

### Major Feature: Dynamic Widget Loading 🚀
- **NEW**: Dynamic widget loader that pulls directly from production files
  - Click-to-load interface for all production widgets
  - Automatically loads latest versions from `src/widgets/[name]/versions/`
  - Iframe isolation for clean widget testing
  - Real-time production widget display
- **SUPPORTED WIDGETS**: 11 production widgets available
  - Site Navigation (v1.6.3)
  - Podcast Feed (v1.9.5)
  - Concert Portfolio (v4.7)
  - Event Portfolio (v2.6.0)
  - Photojournalism Portfolio (v5.2)
  - Featured Portfolio (v1.5)
  - Portrait Portfolio (v1.1)
  - Site Footer (v1.2.0)
  - About Section (v1.4.4)
  - Hero Slideshow
  - Policies & Legal (v1.0.0)

### Benefits 📈
- **Always Up-to-Date**: Any changes to production widgets automatically reflected in playground
- **No Duplication**: No need to copy/paste widget code - loads directly from source
- **Version Tracking**: Button labels show current production versions
- **Easy Testing**: One-click widget loading with clear success/error states
- **Isolated Testing**: Iframe embedding prevents CSS/JS conflicts

### Developer Experience 🛠️
- Fetch API-based widget loading
- Error handling with troubleshooting tips
- Console logging for debugging
- Clear widget path reference documentation
- Alternative direct file testing instructions

## v1.1 — 2025-11-05 (Production Widgets & Multi-Widget Testing)

### Production Widget Integration �
- **REPLACED**: Podcast section now uses real production v1.9.5 episode card HTML
  - Complete audio player with play/preview/volume controls
  - Platform links (Listen, Spotify, Apple)
  - Glass design with backdrop blur
  - Dark/light mode support via CSS variables
  - Production-ready episode metadata and styling
  
### New Widget Tests ✨
- **NEW**: Hero Slideshow widget test section
  - Image overlay patterns
  - Gradient backgrounds
  - Call-to-action button styling
  - Responsive title/subtitle sizing
- **NEW**: Site Footer widget test (v1.2.0 patterns)
  - Glass design footer layout
  - Social media link grid
  - Multi-column responsive layout
  - Backdrop blur effects
- **NEW**: About Section widget test
  - Profile image + content grid layout
  - Bio content styling
  - Contact CTA patterns
  - Responsive single-column mobile layout

### Bug Fixes 🐛
- **FIXED**: Submenu arrow positioning on mobile
  - Arrow now stays in the same position when rotating
  - Added `transform-origin: center` to prevent visual jumping
  - Rotation animation is smooth and centered

### Developer Experience 🛠️
- Comprehensive testing environment for all major widget types
- Production HTML for accurate styling tests
- Console logging for tracking interactions
- Easy to test hover states and responsive breakpoints

## v1.0 — 2025-11-05 (Initial Release)

### Initial Features 🎉
- **NEW**: Live testing environment for production UI patterns
- **NEW**: Squarespace Nav injection (v1.6.3-nav) with exact production code
  - Fixed positioning with 120px body padding for content spacing
  - Submenu with desktop hover and mobile grid toggle
  - Scroll-based gradient-to-frosted-glass transition
  - Mobile hamburger menu with proper ARIA labels
- **NEW**: Production button patterns from multiple widgets
  - Spotify Support Button (Concert Portfolio v4.7)
  - Download Button (Policies & Legal v1.0.0)
  - Version Badge with interactive hover states
  - Disabled state demonstrations
- **NEW**: Portfolio widget test section
  - Concert Portfolio v4.7 masonry grid patterns
  - 3-column responsive grid (→ 1 column mobile)
  - Hover effects with lift and shadow transitions
  - Sample cards with images and metadata
- **NEW**: Podcast widget test section
  - Podcast Feed v1.9.5 layout patterns
  - Episode cards with artwork and play buttons
  - Grid layout (artwork + episode info)
  - Responsive stacking on mobile
- **NEW**: Form and accessibility testing section
  - Input fields with proper labels
  - ARIA attribute demonstrations
  - Color swatch preview system
- **NEW**: Base styling and typography
  - Consistent spacing and section separation
  - Clean, professional layout
  - Responsive design patterns

### Structure 📁
- Created README.md with comprehensive documentation
- Established versions/ folder for future iterations
- Set up proper widget documentation standards

### Developer Experience 🛠️
- Self-contained HTML with inline CSS/JS
- Easy to copy/paste patterns between widgets
- Clear section labels with source widget references
- Scoped styles to prevent conflicts

---
*Last updated: 2025-11-05*
