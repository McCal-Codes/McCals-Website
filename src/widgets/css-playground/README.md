# CSS Playground Widget

**Current Version:** v1.2 (Dynamic Production Widget Loader)  
**Purpose:** Development testing environment for production widgets  
**Platform:** Local development (requires dev server)

---

## 🎯 Purpose

The CSS Playground provides a dynamic testing environment for McCal Media production widgets. Instead of embedding static HTML, v1.2 introduces a **dynamic widget loader** that pulls widgets directly from their source files, ensuring the playground always reflects the latest production code.

---

## ✨ Features

### 🚀 v1.2: Dynamic Widget Loading
- **One-Click Testing**: Button interface to load any production widget instantly
- **Always Current**: Automatically pulls from `src/widgets/[name]/versions/` - no manual updates needed
- **11 Production Widgets**: Site Navigation, Podcast Feed, Concert/Event/Photojournalism/Featured/Portrait Portfolios, Site Footer, About, Hero Slideshow, Policies & Legal
- **Iframe Isolation**: Each widget loads in isolated iframe to prevent CSS/JS conflicts
- **Version Tracking**: Button labels display current production versions
- **Error Handling**: Clear success/error states with troubleshooting tips

### 📦 Legacy: Static Widget Tests (v1.0-v1.1)
- **Site Navigation v1.6.3**: Exact Squarespace injection with fixed positioning, gradient background, scroll effects, submenu system
- **Podcast Feed v1.9.5**: Production episode card with audio player, progress bar, platform links
- **Portfolio Tests**: Concert, Event, Photojournalism, Featured, Portrait
- **Utility Tests**: Hero slideshow, site footer, about section

---

## 🔧 Usage

### Dynamic Loading (v1.2+)
1. **Start Dev Server**: `npm run dev` (required for relative path resolution)
2. **Open Playground**: Navigate to `/src/widgets/css-playground/versions/v1.2.html`
3. **Load Widgets**: Click any widget button to load production code
4. **Test Changes**: Widget modifications auto-reflect on reload

**Supported Widgets:**
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

### Static Testing (v1.0-v1.1)
- Open `v1.0.html` or `v1.1.html` for embedded production widget tests
- No dev server required for these versions

## Purpose

This widget serves as a **testing environment** for experimenting with production UI patterns before deploying them to Squarespace. It contains exact copies of navigation, buttons, and widget patterns used across the site, allowing for safe experimentation and visual iteration.

## Features

### Interactive Controls 🎮 (v1.1)
- **Podcast Play Buttons**: Working JavaScript for play/pause toggle
  - Click to play/pause episodes
  - Visual state changes (play ↔ pause)
  - Only one episode plays at a time
  - Console logging for debugging
  - Smooth animations and hover effects

### Production Nav Testing 🧭
- **Exact Squarespace Code**: Uses the actual v1.6.3-nav code injection from production
- **Fixed Positioning**: Test nav bar behavior with proper spacing for underlying content
- **Submenu Patterns**: Desktop hover and mobile grid toggle functionality
- **Scroll Effects**: Gradient-to-frosted-glass transition on scroll
- **Mobile Menu**: Full mobile hamburger menu with grid layout
- **Accessibility**: Complete ARIA labels and keyboard navigation

### Production Button Patterns 🎨
- **Spotify Support Button**: From Concert Portfolio v4.7
- **Download Button**: From Policies & Legal v1.0.0
- **Version Badge**: Interactive badge with hover states
- **Disabled States**: Visual feedback for non-interactive elements

### Widget Pattern Testing 📦
- **Portfolio Cards**: Concert Portfolio v4.7 masonry grid patterns
  - Hover effects and shadow transitions
  - Responsive grid layout (3 columns → 1 column mobile)
  - Image loading and aspect ratios
- **Podcast Episodes**: Podcast Feed v1.9.5 layout patterns
  - Episode card layouts with artwork
  - Play button interactions
  - Grid layout (artwork + info)
  - Responsive stacking on mobile

### Form & Accessibility Testing ♿
- **Form Fields**: Input fields with proper labels
- **ARIA Patterns**: Testing accessibility attributes
- **Color Swatches**: Quick visual color reference

## Usage

### Local Testing
1. Open the widget file directly in a browser
2. Test nav interactions (scroll, submenu, mobile menu)
3. Experiment with button styles and states
4. Modify portfolio/podcast layouts
5. Test responsive breakpoints by resizing window

### Production Integration
This widget is **NOT** meant for Squarespace deployment. It's a **local development tool** for testing patterns that will be used in production widgets.

### Customization
- **Top Spacing**: Adjust `padding-top: 120px` on `<body>` to control space below fixed nav
- **Add New Patterns**: Copy production widget code into new sections
- **Test Colors**: Update color swatches to match your design system
- **Layout Experiments**: Modify grid patterns, spacing, and responsive breakpoints

## File Structure
```
css-playground/
├── README.md           # This file
├── CHANGELOG.md        # Version history
└── versions/
    └── v1.0.html      # Current playground version
```

## Best Practices

### When Adding New Patterns
1. **Use Production Code**: Copy exact HTML/CSS/JS from deployed widgets
2. **Label Sections**: Clearly mark which widget the pattern comes from
3. **Version Reference**: Note the source widget version (e.g., "Concert v4.7 patterns")
4. **Maintain Scoping**: Keep CSS scoped to avoid conflicts
5. **Document Changes**: Update CHANGELOG.md when adding significant patterns

### Testing Workflow
1. Copy production widget code to playground
2. Test interactions and visual appearance
3. Iterate on styling and functionality
4. Copy refined code back to production widget
5. Deploy to Squarespace and verify

## Notes

- **Fixed Nav**: The nav bar is fixed at the top; underlying content has 120px top padding
- **Self-Contained**: All CSS and JS are inline for easy copying and pasting
- **Playground Only**: This widget is for development/testing, not production deployment
- **Responsive**: Test at different breakpoints to ensure mobile compatibility

## Related Documentation
- [Widget Standards](../../docs/standards/widget-standards.md)
- [Widget Development Guide](../../docs/standards/widget-development.md)
- [Performance Standards](../../docs/standards/performance-standards.md)

---
*Last updated: 2025-11-05*
