# See [workspace-organization.md](./workspace-organization.md) for workspace/process standards and validation checklists.
# Widget Standards Quick Reference

> **Quick access guide for McCal Media widget development standards**  
> **For complete details**: See `widget-standards.md`

## 📋 New Widget Checklist

### Basic Structure ✅
```html
<!-- Widget Name v1.0.0 -->
<div class="widget-namespace" data-widget-version="1.0.0">
  <style>/* All CSS here */</style>
  <!-- HTML content -->
  <script>/* All JS here */</script>
</div>
```

- [ ] **Unique namespace** (e.g., `mcc-`, `journalism-`, `podcast-`)
- [ ] **Version attribute** (`data-widget-version`)
- [ ] **Self-contained** (no external dependencies)
- [ ] **Scoped CSS** (all selectors prefixed)

### Required Files ✅
```
src/widgets/widget-name/
├── README.md                    # Usage instructions
├── CHANGELOG.md                 # Version history
└── versions/
    └── v1.0.0-widget-name.html # Widget code
```


### CSS Variables ✅
```css
:root {
  /* See src/widgets/shared/theme.css for full variable list */
  --mc-bg: #050506;           /* Base background (dark only) */
  --mc-text: #f3f5f8;         /* Text color */
  --mc-accent-black: #272423; /* Accent (business palette) */
  --mc-accent-taupe: #B8B0AA; /* Accent (business palette) */
  --mc-gradient-accent: linear-gradient(90deg, #5fd4f0 0%, #B8B0AA 100%); /* Accent gradient */
}
```

> **Accent/Gradient System:**
> - Use `--mc-accent-*` and `--mc-gradient-*` for highlights, chips, overlays, and accent lines only.
> - Never use as base backgrounds. See `theme.css` and `widget-ui-colors-and-buttons.md` for details.

---

## 🎨 Common Patterns

### Responsive Grid (Portfolio Widgets)
```css
.widget-grid {
  column-width: 320px;
  column-gap: 20px;
}
.widget-card {
  break-inside: avoid;
  margin-bottom: 20px;
}
@media (max-width: 768px) {
  .widget-grid { column-width: 240px; }
}
```

### Filter Buttons (Category Controls)
```html
<button class="filter-btn" data-filter="category" aria-pressed="false" role="tab">
  Category Name
</button>
```

```css
.filter-btn {
  background: transparent;
  border: 1px solid var(--fg);
  color: var(--fg);
  padding: 12px 20px;
  border-radius: 999px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.6;
}
.filter-btn[aria-pressed="true"] {
  background: var(--fg);
  color: var(--bg);
  opacity: 1;
}
```

### Lightbox Modal (Gallery Widgets)
```css
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: none;
  z-index: 2147483647 !important;
  backdrop-filter: blur(8px);
}
.lightbox.is-open { display: flex; }

/* Navigation hiding during lightbox */
html.lb-open header,
html.lb-open nav,
html.lb-open .navbar {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

### Close Button (Modal/Lightbox)
```css
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
  z-index: 2147483648;
  backdrop-filter: blur(8px);
}
```

---

## ⚡ Performance Patterns

### Image Loading
```html
<img loading="lazy" decoding="async" src="image.jpg" alt="Description">
```

### Loading States
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
```

### Caching (Data Widgets)
```javascript
const CACHE_KEY = 'widget-cache-v1';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCached() {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEY));
    return (Date.now() - data.timestamp < CACHE_DURATION) ? data.content : null;
  } catch (e) { return null; }
}
```

---

## ♿ Accessibility Must-Haves

> **📖 Complete Guide**: See `accessibility-patterns.md` for comprehensive examples and WCAG compliance patterns

### Interactive Elements
```html
<!-- Cards -->
<article class="card" tabindex="0" role="button" aria-label="View gallery">

<!-- Live regions -->
<div role="status" aria-live="polite">Loading...</div>

<!-- Modal dialogs -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
```

### Keyboard Navigation
```javascript
// Escape key handling
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Enter/Space for custom buttons
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
});
```

### Skip Navigation
```html
<a class="skip-link" href="#main-content">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  left: 20px;
  top: 20px;
  z-index: 1000;
  width: auto;
  height: auto;
}
```

### Focus Indicators
```css
:where(a, button, [role="button"]):focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
  border-radius: 10px;
}
```

---

## 🐛 Debug Mode (Development)

### Debug Toggle
```html
<button class="debug-toggle" onclick="toggleDebug()">🔍 Debug</button>
<div class="debug-info" id="debugInfo" style="display: none;">
  <div>Status: <span id="debugStatus">Ready</span></div>
  <div>Load: <span id="debugLoadTime">--</span>ms</div>
</div>
```

```css
.debug-toggle {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
}
@media (max-width: 768px) {
  .debug-toggle { display: none; }
}
```

### Version Indicator
```html
<h2>Widget Name <span class="version-indicator" onclick="showChangelog()">v1.0.0</span></h2>
```

---

## 🎯 Widget Type Guidelines

| Widget Type | Key Patterns | Examples |
|-------------|--------------|----------|
| **Portfolio** | Masonry grid, lightbox, filters, lazy loading | Concert, Event, Photojournalism |
| **Navigation** | Glassmorphism, active states, mobile drawer | Site Navigation, Site Footer |
| **Content Feed** | API integration, caching, progressive loading | Podcast Feed, Blog Feed |
| **Hero/Showcase** | Full viewport, auto-play, touch gestures | Hero Slideshow |

---

## 🚀 Deployment Process

### Version Management
1. **Never edit existing versions** - create new files
2. **Semantic versioning**: `v1.0.0` → `v1.1.0` (features) → `v1.1.1` (fixes)
3. **Update CHANGELOG.md** with detailed changes
4. **Test in Squarespace** Code Block before marking production-ready

### File Naming
```
v1.0.0-widget-name.html          # Basic version
v1.1.0-enhanced-widget-name.html # Feature addition
v2.0.0-redesigned-widget.html    # Major changes
```

### Status Management
- **Production**: Add to main README "Available Widgets"
- **Work in Progress**: Create `STATUS.md` file in widget directory
- **Archive**: Move to `src/widgets/_archived/` if no longer needed

---

## 📚 Reference Examples

### Complete Implementations
- **Portfolio**: `photojournalism-portfolio/v4.8-event-cards.html`
- **Navigation**: `site-navigation/v1.6.3.header-injection.html`
- **Footer**: `site-footer/v1.2.0.footer-widget.html`
- **Content**: `podcast-feed/v1.1.html`

### Enhancement Patterns
- **Proven improvements**: `docs/standards/widget-standards.md`
- **Systematic application**: `docs/standards/widget-development.md`
- **Accessibility patterns**: `docs/standards/accessibility-patterns.md` ⭐

---

*💡 **Pro Tip**: Use VS Code tasks `npm run ai:preflight:short` to validate workspace context before major changes*