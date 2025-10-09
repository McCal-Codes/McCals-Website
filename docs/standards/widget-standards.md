# TODO Auto-Checker: Keyword & Diff Heuristics (2025-10-09)

The workspace auto-checker (see `scripts/welcome.js`) now supports:

- **Keyword-based auto-checking**: If a commit message contains a configured keyword (e.g., `Close Button Optimization`), any TODO containing that phrase will be checked off automatically.
- **File-diff-based auto-checking**: If a changed file matches a configured substring or path (e.g., `src/widgets/site-navigation/`), any TODO mentioning the mapped pattern (e.g., `Navigation Hiding pattern`) will be checked off.

To add a new auto-check rule, update the `AUTO_CHECK_MAP` array in `scripts/welcome.js`:

```js
// Example:
{ keyword: 'Close Button Optimization', todoMatch: 'Close Button Optimization' },
{ file: 'src/widgets/site-navigation/', todoMatch: 'Navigation Hiding pattern' },
```

**Pinning the Welcome File:**
To keep your dashboard visible, right-click the `updates/welcome.md` tab in VS Code and select **Pin**. It will always be there when you return!

_See also: `updates/welcome.md` for the latest pinned tips and checklist status._
# See [workspace-organization.md](./workspace-organization.md) for workspace/process standards and validation checklists.
# Widget Standardization Guide

> **Status**: Active Standards Documentation  
> **Created**: October 5, 2025  
> **Purpose**: Define consistent patterns and standards across all McCal Media widgets

## Overview

This document establishes standardized patterns for McCal Media widgets based on analysis of production-ready widgets including portfolio galleries, site navigation/footer, hero slideshows, and podcast feeds. These standards ensure consistent user experience, maintainability, and Squarespace compatibility.

---

## 🏗️ Core Architecture Standards

### 1. **Self-Contained Structure**
Every widget must be completely self-contained for Squarespace Code Block compatibility:

```html
<!-- Widget Name v1.0.0 -->
<div class="widget-namespace" data-widget-version="1.0.0">
  <style>
    /* All CSS inline here */
  </style>
  
  <!-- Widget HTML content -->
  
  <script>
    // All JavaScript inline here
  </script>
</div>
```

#### **Requirements**:
- **Namespace wrapper**: Unique class prefix (e.g., `mcc-`, `journalism-`, `podcast-`)
- **Version attribute**: `data-widget-version` for tracking
- **Inline styles/scripts**: No external dependencies
- **Scoped CSS**: All selectors prefixed to prevent conflicts
- **Self-executing JavaScript**: No global pollution

### 2. **Versioning Standards**
Following semantic versioning (MAJOR.MINOR.PATCH):

```
versions/
├── v1.0.0-widget-name.html     # Initial release
├── v1.1.0-widget-name.html     # Feature addition
├── v1.1.1-widget-name.html     # Bug fix
└── v2.0.0-widget-name.html     # Breaking changes
```

#### **Guidelines**:
- **Never modify existing versions** - always create new files
- **Descriptive suffixes**: Include widget purpose in filename
- **Preserve backwards compatibility** when possible
- **Document changes** in widget-specific CHANGELOG.md

---


## 🎨 Visual Design Standards

### Accent & Gradient System (2025-10-09)

- All widgets must use the dark base palette for backgrounds and cards (see `src/widgets/shared/theme.css`).
- The business palette is integrated as accent/gradient variables ONLY—never as base backgrounds.
- Use `--mc-accent-*` and `--mc-gradient-*` variables for highlights, chips, overlays, and accent lines.
- Do NOT use these as base backgrounds or for large surfaces.
- For usage examples, see `docs/standards/widget-ui-colors-and-buttons.md` and the comment block in `theme.css`.
- All widgets must remain dark mode by default. Light/dark toggle is a future enhancement.

### 1. **CSS Custom Properties (Variables)**
Standardized color palette and design tokens:

```css
:root {
  /* Core colors */
  --fg: #f5f5f5;                    /* Foreground text */
  --bg: #0a0a0a;                    /* Background */
  --line: #2a2a2a;                  /* Borders/lines */
  --accent: #ff4d6d;                /* Accent/interactive */
  --published: #00d4aa;             /* Success/published indicator */
  
  /* Semantic colors */
  --mcc-hover: rgba(255, 255, 255, 0.9);
  --mcc-focus: rgba(255, 255, 255, 0.6);
  --mcc-disabled: rgba(255, 255, 255, 0.4);
}

/* Dark mode support */
@media (prefers-color-scheme: light) {
  :root {
    --fg: #0a0a0a;
    --bg: #fff;
    --line: #e5e5e5;
  }
}
```

### 1a. **Accent Highlight Button (Minimal, Randomized)**
For accent highlights (chips, callouts, or special buttons), use a dark base with a subtle accent border or shadow. To add variety, you can randomly select from the accent palette for the border or shadow, but keep the effect minimal and never use a full gradient background for buttons.

**Example CSS:**
```css
.accent-highlight-btn {
  background: var(--mc-accent-black);
  color: var(--mc-accent-taupe);
  border: 2px solid var(--mc-accent-dark); /* Default accent border */
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px 0 rgba(95, 212, 240, 0.08); /* Subtle blue accent shadow */
}
.accent-highlight-btn:hover {
  border-color: var(--mc-accent-slate); /* Or randomly pick: --mc-accent-stone, --mc-accent-taupe */
  box-shadow: 0 4px 16px 0 rgba(184, 176, 170, 0.12); /* Subtle taupe accent shadow */
  transform: translateY(-1px);
}
/* Optional: Add a JS snippet to randomize accent border/shadow on mount for extra variety */
```

> **Tip:** For a more dynamic effect, use JavaScript to randomly assign one of the accent border colors or shadow colors from the palette when the button is rendered. Always keep the effect subtle and minimal to maintain a professional look.

> **Never** use the accent gradient as a button background. Use it only for chips, overlays, or accent lines.

### 2. **Typography Standards**
Consistent font stacks and sizing:

```css
/* System font stack (preferred) */
font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;

/* Font weights (standardized) */
font-weight: 400;  /* Body text */
font-weight: 500;  /* Medium emphasis */
font-weight: 600;  /* Semi-bold */
font-weight: 700;  /* Bold headings */
font-weight: 800;  /* Extra bold titles */

/* Font sizes (rem-based) */
font-size: 0.875rem;  /* 14px - Small text */
font-size: 1rem;      /* 16px - Body */
font-size: 1.125rem;  /* 18px - Large body */
font-size: 1.5rem;    /* 24px - Headings */
font-size: 2rem;      /* 32px - Large headings */
```

### 3. **Responsive Design Patterns**
Mobile-first responsive breakpoints:

```css
/* Mobile first (320px+) */
.widget-container {
  padding: 20px;
  font-size: 14px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .widget-container {
    padding: 40px;
    font-size: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .widget-container {
    padding: 60px;
    max-width: 1600px;
    margin: 0 auto;
  }
}
```

---

## ⚡ Performance Standards

### 1. **Image Loading Patterns**
Optimized image handling for portfolios:

```html
<!-- Lazy loading with responsive sizing -->
<img 
  loading="lazy" 
  decoding="async"
  src="image-url.jpg"
  alt="Descriptive alt text"
  style="width: 100%; height: auto; object-fit: cover;"
>
```

### 2. **Progressive Enhancement**
Loading states and error handling:

```css
.widget-card {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.widget-card.loaded {
  opacity: 1;
  transform: translateY(0);
}

.widget-card.error {
  background: #2a1a1a;
  border: 1px solid #4a2a2a;
}
```

### 3. **Caching Strategy**
For data-driven widgets:

```javascript
// Cache configuration
const CACHE_KEY = 'widget-data-cache-v1';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_DURATION) {
      return data.content;
    }
  } catch (e) {
    console.warn('Cache read failed:', e);
  }
  return null;
}
```

---

## 🔧 Interactive Patterns

### 1. **Modal/Lightbox Standards**
For portfolio and gallery widgets:

```css
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2147483647 !important; /* Always on top */
  backdrop-filter: blur(8px);
}

.lightbox.is-open {
  display: flex;
}

/* Enhanced close button */
.close-button {
  position: fixed;
  top: max(24px, env(safe-area-inset-top));
  right: max(24px, env(safe-area-inset-right));
  width: 44px;
  height: 44px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font: 800 18px ui-sans-serif, system-ui;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483648;
  backdrop-filter: blur(8px);
}

/* Lightbox images - prevent stretching/distortion */
.lightbox img {
  max-width: 92vw;
  max-height: 82vh;
  width: auto;
  height: auto;
  object-fit: contain; /* Preserves aspect ratio */
  display: block;      /* Proper block rendering */
  margin: 0 auto;      /* Centers horizontally */
  border-radius: 10px;
}

/* Navigation hiding during lightbox */
html.lb-open header,
html.lb-open .Header,
html.lb-open [id*="Header"],
html.lb-open .site-header,
html.lb-open nav,
html.lb-open .navbar,
html.lb-open .navigation {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

### 2. **Filter/Navigation Controls**
For portfolio and content widgets:

```html
<div class="filter-controls" role="tablist" aria-label="Content filters">
  <button 
    type="button" 
    class="filter-btn" 
    data-filter="*" 
    aria-pressed="true" 
    role="tab"
  >
    All
  </button>
  <button 
    type="button" 
    class="filter-btn" 
    data-filter="category" 
    role="tab"
  >
    Category
  </button>
</div>
```

```css
.filter-btn {
  background: transparent;
  border: 1px solid var(--fg);
  color: var(--fg);
  padding: 12px 20px;
  border-radius: 999px;
  cursor: pointer;
  font: 600 14px/1 ui-sans-serif, system-ui;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.6;
}

.filter-btn:hover {
  transform: translateY(-2px);
  opacity: 1;
}

.filter-btn[aria-pressed="true"] {
  background: var(--fg);
  color: var(--bg);
  opacity: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## ♿ Accessibility Standards

### 1. **Keyboard Navigation**
Essential for all interactive widgets:

```javascript
// Focus management for modals
function openModal(modal) {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  
  // Trap focus within modal
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

// Escape key handling
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeActiveModal();
  }
});
```

### 2. **ARIA Attributes**
Proper labeling and roles:

```html
<!-- For interactive cards -->
<article 
  class="portfolio-card" 
  tabindex="0" 
  role="button"
  aria-label="View photo gallery: Event Name"
>
  
<!-- For live regions -->
<div 
  class="status-message" 
  role="status" 
  aria-live="polite"
>
  Loading content...
</div>

<!-- For modal dialogs -->
<div 
  class="modal" 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
>
```

---

## 🐛 Debug & Development Standards

### 1. **Debug Mode Pattern**
Standardized debug controls for development:

```html
<!-- Debug toggle (bottom of widget) -->
<button class="debug-toggle" onclick="toggleDebug()">🔍 Debug</button>
<div class="debug-info" id="debugInfo">
  <div style="margin-bottom: 6px; color: var(--accent); font-weight: 700">
    🔧 Widget Debug v1.0.0
  </div>
  <div>Status: <span id="debugStatus">Ready</span></div>
  <div>Load Time: <span id="debugLoadTime">--</span>ms</div>
  <div class="debug-actions">
    <button class="dbg-btn" onclick="refreshData()">Refresh</button>
    <button class="dbg-btn" onclick="clearCache()">Clear Cache</button>
  </div>
</div>
```

```css
.debug-toggle {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid var(--line);
  color: var(--fg);
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  font: 600 12px/1 ui-sans-serif, system-ui;
  z-index: 1000;
}

@media (max-width: 768px) {
  .debug-toggle {
    display: none;
  }
}
```

### 2. **Version Indicator Pattern**
Consistent version display and changelog access:

```html
<h2 class="widget-heading">
  Widget Name 
  <span class="version-indicator" onclick="showChangelog()" title="View changelog">
    v1.0.0
  </span>
</h2>
```

```css
.version-indicator {
  display: inline-block;
  margin-left: 12px;
  font: 600 14px/1.2 ui-sans-serif, system-ui;
  color: rgba(128, 128, 128, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.08);
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(128, 128, 128, 0.2);
}

.version-indicator:hover {
  color: var(--accent);
  background: rgba(77, 121, 255, 0.12);
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

---

## 📱 Widget Categories & Specific Patterns

### 1. **Portfolio Widgets** *(Concert, Event, Photojournalism, Featured)*
- **Masonry Layout**: CSS columns with `break-inside: avoid`
- **Lazy Loading**: Intersection Observer API
- **Lightbox Gallery**: Full-screen viewing with navigation hiding
- **Filter Controls**: Category-based filtering with smooth animations
- **GitHub Integration**: Direct loading from repository assets

### 2. **Navigation Widgets** *(Site Navigation, Site Footer)*
- **Glassmorphism**: Backdrop blur with transparency
- **Active State Management**: URL-based active link detection
- **Mobile Responsiveness**: Collapsible/drawer patterns
- **Focus Management**: Enhanced keyboard navigation

### 3. **Content Widgets** *(Podcast Feed, Blog Feed)*
- **RSS/API Integration**: External data loading with caching
- **Progressive Loading**: Skeleton states and error handling
- **Rich Media Support**: Audio players, embedded content
- **Performance Monitoring**: Real-time metrics and debugging

### 4. **Hero/Showcase Widgets** *(Hero Slideshow)*
- **Full-Viewport Design**: Edge-to-edge layouts
- **Auto-Play Controls**: User-controlled animations
- **Touch/Swipe Support**: Mobile gesture handling
- **Accessibility First**: Reduced motion preferences

---

## 🚀 Implementation Checklist

### For New Widgets
- [ ] **Namespace**: Unique CSS class prefix
- [ ] **Self-Contained**: All CSS/JS inline
- [ ] **Version Tracking**: `data-widget-version` attribute
- [ ] **Responsive Design**: Mobile-first breakpoints
- [ ] **Accessibility**: ARIA labels, keyboard navigation
- [ ] **Error Handling**: Graceful degradation patterns
- [ ] **Debug Mode**: Development tools (if applicable)
- [ ] **Documentation**: README.md with usage instructions

### For Existing Widget Updates
- [ ] **New Version File**: Don't modify existing versions
- [ ] **Changelog Entry**: Document all changes
- [ ] **Pattern Compliance**: Apply standardized patterns from this guide
- [ ] **Testing**: Verify in Squarespace Code Block
- [ ] **Performance**: Check load times and responsiveness
- [ ] **Accessibility**: Test with screen readers and keyboard only

---

## 📚 Reference Implementation

### Portfolio Widget Template
See `src/widgets/photojournalism-portfolio/versions/v4.8-event-cards.html` for:
- Complete lightbox implementation
- Filter system with accessibility
- Debug mode integration
- Performance optimization patterns

### Navigation Widget Template  
See `src/widgets/site-navigation/versions/v1.6.3.header-injection.html` for:
- Glassmorphism styling
- Active state management
- Mobile-responsive patterns

### Content Feed Template
See `src/widgets/podcast-feed/` for:
- External API integration
- Caching strategies
- Progressive loading patterns

---

## 🔄 Continuous Improvement

### Enhancement Application Process

1. **Reference**: Review `docs/standards/widget-standards.md`, `widget-reference.md`, and `widget-development.md` for all enhancement patterns and best practices
2. **Plan**: Create implementation plan for pattern application
3. **Apply**: Implement patterns incrementally
4. **Test**: Validate functionality and performance
5. **Document**: Update widget README and changelog
6. **Share**: Update this standardization guide with new patterns

### Quality Standards
- **Performance**: < 2s initial load, smooth 60fps animations
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Compatibility**: Works in Squarespace Code Blocks
- **Maintainability**: Clear code structure with comments
- **User Experience**: Intuitive interaction patterns

---

*This document is maintained as part of the McCal Media widget development standards. Update when new patterns are established or existing patterns are refined.*