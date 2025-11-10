# Accessibility Pattern Library

## Purpose

This document provides reusable accessibility patterns extracted from production widgets, demonstrating WCAG 2.1 AA compliance techniques for McCal Media widgets.

**Reference Implementation:** Accessibility Statement Widget (v1.0)

---

## Table of Contents

1. [Skip to Main Content](#skip-to-main-content)
2. [Focus Management](#focus-management)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Mobile Drawer Pattern](#mobile-drawer-pattern)
5. [Scroll Spy with ARIA](#scroll-spy-with-aria)
6. [Semantic HTML & Landmarks](#semantic-html--landmarks)
7. [ARIA Attributes](#aria-attributes)
8. [Reduced Motion](#reduced-motion)
9. [Color & Contrast](#color--contrast)
10. [Keyboard Shortcut Display](#keyboard-shortcut-display)
11. [Print Styles](#print-styles)
12. [Sticky Navigation](#sticky-navigation)

---

## 1. Skip to Main Content

**Purpose:** Allow keyboard and screen reader users to bypass repeated navigation and jump directly to main content.

### Implementation

```html
<a class="skip-link" href="#main-content">Skip to main content</a>

<main id="main-content">
  <!-- main content here -->
</main>
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
  padding: 0.6rem 0.9rem;
  background: var(--chip);
  color: var(--fg);
  border: 2px solid var(--focus);
  border-radius: 10px;
}
```

**Key Points:**
- Link is visually hidden but accessible to screen readers
- Becomes visible when focused via Tab key
- High z-index ensures visibility over other content
- Clear focus indicator with high-contrast border

---

## 2. Focus Management

**Purpose:** Provide clear visual indication of keyboard focus for all interactive elements.

### Implementation

```css
/* Modern focus-visible for better UX */
:where(a, button, [role="button"], summary):focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
  border-radius: 10px;
}

/* Focus colors with good contrast */
:root {
  --focus: #7dd3fc; /* Sky blue for dark mode */
}

@media (prefers-color-scheme: light) {
  :root {
    --focus: #0ea5e9; /* Darker blue for light mode */
  }
}
```

**Key Points:**
- Use `focus-visible` instead of `focus` to avoid focus rings on mouse clicks
- Minimum 3px outline for visibility
- `outline-offset` prevents overlap with element borders
- Color contrast meets WCAG AA standards (3:1 for UI components)
- Use `:where()` to keep specificity low for easy overrides

---

## 3. Keyboard Navigation

**Purpose:** Enable full keyboard control of all interactive elements.

### Implementation

```javascript
// ESC key to close menus/dialogs
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close drawer/modal
    toggle.checked = false;
  }
});

// Tab navigation is native, but ensure proper tab order
// Use tabindex="-1" for programmatic focus only
// Use tabindex="0" to add to natural tab order
```

**Standard Keyboard Patterns:**
- **Tab / Shift+Tab:** Move focus forward/backward
- **Enter / Space:** Activate buttons and links
- **Escape:** Close menus, dialogs, and drawers
- **Arrow keys:** Navigate within menus or grouped controls

**Key Points:**
- Never use `tabindex` values > 0 (breaks natural tab order)
- Ensure all interactive elements are keyboard accessible
- Provide visible focus indicators
- Document keyboard shortcuts for users

---

## 4. Mobile Drawer Pattern

**Purpose:** Accessible off-canvas navigation for mobile devices using CSS-only checkbox hack.

### Implementation

```html
<!-- Checkbox toggle (hidden visually but accessible) -->
<input class="drawer-toggle" id="mobile-menu" type="checkbox" aria-hidden="true" />
<label class="drawer-btn" for="mobile-menu" aria-label="Open navigation menu">Menu</label>

<!-- Drawer sidebar -->
<aside class="drawer" aria-label="Main navigation">
  <!-- navigation content -->
</aside>

<!-- Click-away overlay -->
<div class="drawer-overlay" aria-hidden="true"></div>
```

```css
/* Hide checkbox, show button on mobile */
.drawer-toggle { display: none; }

.drawer-btn {
  display: none; /* Hidden on desktop */
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 999;
}

/* Drawer slides in from left */
.drawer {
  position: fixed;
  left: 0;
  top: calc(var(--header-h) + env(safe-area-inset-top));
  bottom: env(safe-area-inset-bottom);
  width: min(84vw, 360px);
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: saturate(120%) blur(6px);
  transform: translateX(-110%);
  transition: transform 0.25s ease;
  z-index: 999;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* Overlay behind drawer */
.drawer-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: var(--header-h);
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 998;
}

/* Show drawer when checked */
.drawer-toggle:checked ~ .drawer {
  transform: translateX(0);
}

.drawer-toggle:checked ~ .drawer-overlay {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 980px) {
  .drawer-btn { display: inline-flex; }
}
```

```javascript
// Close drawer on overlay click or link selection
const toggle = document.getElementById('mobile-menu');
const overlay = document.querySelector('.drawer-overlay');
const links = document.querySelectorAll('.drawer a');

overlay?.addEventListener('click', () => { toggle.checked = false; });
links.forEach(a => a.addEventListener('click', () => { toggle.checked = false; }));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggle.checked = false;
});
```

**Key Points:**
- No JavaScript required for basic functionality
- Checkbox marked `aria-hidden="true"` (implementation detail)
- Label has descriptive `aria-label`
- Overlay marked `aria-hidden="true"` (not focusable)
- Respects safe area insets for notched devices
- Smooth transitions with hardware acceleration
- ESC key closes drawer
- Clicking overlay or link auto-closes drawer

---

## 5. Scroll Spy with ARIA

**Purpose:** Highlight active section in table of contents as user scrolls, with proper ARIA attributes for screen readers.

### Implementation

```javascript
(function() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.toc nav a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        // Clear all active states
        links.forEach(a => {
          a.classList.remove('active');
          a.setAttribute('aria-current', 'false');
        });
        // Set active link
        const link = map.get(id);
        if (link) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');
        }
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: [0, 1]
  });
  
  sections.forEach(s => obs.observe(s));
})();
```

```css
/* Active link styling */
.toc nav a.active,
.toc nav a[aria-current="true"] {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  color: var(--fg);
  font-weight: 600;
}
```

**Key Points:**
- Uses `IntersectionObserver` for performance (better than scroll events)
- Updates both `.active` class and `aria-current` attribute
- `aria-current="true"` announces current location to screen readers
- `rootMargin` fine-tunes when sections become "active"
- Map lookup for O(1) performance
- IIFE prevents global namespace pollution

---

## 6. Semantic HTML & Landmarks

**Purpose:** Provide clear document structure for assistive technologies.

### Implementation

```html
<a class="skip-link" href="#main-content">Skip to main content</a>

<div role="document" aria-labelledby="page-title">
  <aside aria-label="Page navigation">
    <nav>
      <!-- navigation links -->
    </nav>
  </aside>
  
  <main id="main-content" role="main">
    <header>
      <h1 id="page-title">Page Title</h1>
    </header>
    
    <section id="section-1">
      <h2>Section 1</h2>
      <!-- content -->
    </section>
    
    <section id="section-2">
      <h2>Section 2</h2>
      <!-- content -->
    </section>
  </main>
</div>
```

**Required Landmarks:**
- `<main>` - Primary content (one per page)
- `<nav>` - Navigation sections
- `<aside>` - Complementary content
- `<header>` - Page or section header
- `<footer>` - Page or section footer

**Key Points:**
- Use semantic HTML5 elements
- Add ARIA labels for multiple landmarks of same type
- Connect headings with `aria-labelledby`
- Maintain logical heading hierarchy (h1 → h2 → h3)
- One `<main>` per page
- Use `role="document"` for widget containers in Squarespace

---

## 7. ARIA Attributes

**Purpose:** Enhance semantic meaning and state for assistive technologies.

### Common ARIA Patterns

```html
<!-- Labels and descriptions -->
<button aria-label="Close menu">×</button>
<div role="document" aria-labelledby="title-id">
  <h1 id="title-id">Document Title</h1>
</div>

<!-- Current state -->
<a href="#section" aria-current="true">Active Section</a>
<button aria-pressed="true">Toggled On</button>

<!-- Hidden decorative content -->
<div aria-hidden="true">🎨</div>
<input type="checkbox" aria-hidden="true" /> <!-- Implementation detail -->

<!-- Expanded/collapsed state -->
<details>
  <summary aria-expanded="false">Expandable Section</summary>
  <!-- content -->
</details>

<!-- Live regions -->
<div role="status" aria-live="polite">
  Loading complete
</div>

<!-- Required fields -->
<input type="text" required aria-required="true" />

<!-- Error messages -->
<input type="email" aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">Please enter a valid email</span>
```

**Key Points:**
- Use native HTML semantics first, ARIA second
- `aria-label` provides accessible name when visual text is insufficient
- `aria-labelledby` connects elements to their labels
- `aria-current` indicates current item in navigation
- `aria-hidden="true"` removes decorative elements from accessibility tree
- `aria-live` announces dynamic content changes
- `aria-pressed` for toggle buttons
- `aria-expanded` for expandable sections

**ARIA Rules:**
1. Use semantic HTML first
2. Don't override native semantics (e.g., `<button role="link">`)
3. All interactive ARIA controls must be keyboard accessible
4. Don't use `aria-label` on generic divs
5. `aria-hidden="true"` removes element and all children from accessibility tree

---

## 8. Reduced Motion

**Purpose:** Respect user preference for reduced animations.

### Implementation

```css
/* Default: smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Key Points:**
- Respect `prefers-reduced-motion` media query
- Reduce transitions to near-instant (0.01ms, not 0s to avoid breaking JS)
- Apply to all elements including pseudo-elements
- Test with OS accessibility settings enabled
- Essential animations (loading indicators) can remain with reduced duration

---

## 9. Color & Contrast

**Purpose:** Ensure sufficient color contrast for text readability (WCAG AA: 4.5:1 for normal text, 3:1 for large text and UI components).

### Implementation

```css
:root {
  /* Dark mode (default) */
  --fg: #f7f7f7;        /* Body text: white on dark */
  --muted: #a6a6a6;     /* Secondary text */
  --link: #d1d5db;      /* Links */
  --accent: #9bd7ff;    /* Interactive elements */
  --focus: #7dd3fc;     /* Focus indicator */
  --line: #2a2a2a;      /* Borders */
  --chip: #1b1b1b;      /* Surfaces */
  --bg: transparent;    /* Background */
}

@media (prefers-color-scheme: light) {
  :root {
    --fg: #1b1b1b;      /* Body text: black on light */
    --muted: #5b5b5b;   /* Secondary text */
    --link: #0f172a;    /* Links */
    --accent: #0ea5e9;  /* Interactive elements */
    --focus: #0ea5e9;   /* Focus indicator */
    --line: #e5e5ea;    /* Borders */
    --chip: #fafafa;    /* Surfaces */
  }
}
```

**Testing Contrast:**
```css
/* Body text (14-16px): minimum 4.5:1 */
body {
  color: var(--fg);
  background: var(--bg);
}

/* Large text (18px+ or 14px+ bold): minimum 3:1 */
h1, h2 {
  color: var(--fg);
}

/* UI components (borders, icons): minimum 3:1 */
button {
  border: 1px solid var(--line);
}

/* Focus indicators: minimum 3:1 against adjacent colors */
:focus-visible {
  outline: 3px solid var(--focus);
}
```

**Key Points:**
- Use CSS custom properties for consistent color system
- Provide both light and dark mode variants
- Test contrast ratios with tools (WebAIM, Chrome DevTools)
- Never convey information by color alone (add text/icons)
- Minimum contrast ratios:
  - **Normal text:** 4.5:1 (WCAG AA), 7:1 (AAA)
  - **Large text:** 3:1 (AA), 4.5:1 (AAA)
  - **UI components:** 3:1 (AA)
  - **Focus indicators:** 3:1 (AA)

---

## 10. Keyboard Shortcut Display

**Purpose:** Visually display keyboard shortcuts in a way that's clear and accessible.

### Implementation

```html
<p>Press <span class="kbd">Tab</span> to move focus forward</p>
<p>Press <span class="kbd">Shift</span> + <span class="kbd">Tab</span> to move focus backward</p>
<p>Press <span class="kbd">Esc</span> to close dialogs</p>
```

```css
.kbd {
  font: 600 0.85rem/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  padding: 0.05rem 0.45rem;
  border: 1px solid var(--line);
  border-bottom-width: 2px; /* 3D effect */
  border-radius: 6px;
  background: var(--chip);
  white-space: nowrap;
}
```

**Key Points:**
- Use monospace font for keyboard keys
- Styled like physical keyboard keys (bordered, slight 3D effect)
- Semantic HTML (can use `<kbd>` element instead of classed `<span>`)
- Document all keyboard shortcuts on page
- Use standard key names (Tab, Enter, Escape, not "ESC" or "ENTER")

---

## 11. Print Styles

**Purpose:** Optimize page for printing by hiding non-essential elements.

### Implementation

```css
@media print {
  /* Hide navigation, controls, and decorative elements */
  .drawer,
  .drawer-btn,
  .drawer-overlay,
  .skip-link,
  header nav,
  aside {
    display: none !important;
  }
  
  /* Reset spacing for print */
  .main-content {
    padding: 0;
    max-width: 100%;
  }
  
  /* Ensure dark text on white background */
  * {
    background: white !important;
    color: black !important;
  }
  
  /* Show link URLs after text */
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.9em;
    color: #666;
  }
  
  /* Prevent page breaks inside elements */
  section,
  article,
  figure {
    page-break-inside: avoid;
  }
  
  /* Add page breaks between major sections */
  section {
    page-break-before: auto;
  }
}
```

**Key Points:**
- Hide navigation, footers, and interactive elements
- Force black text on white background (ignore color schemes)
- Show URLs for links
- Control page breaks to keep content together
- Remove decorative backgrounds and shadows
- Ensure good contrast for grayscale printing

---

## 12. Sticky Navigation

**Purpose:** Keep navigation visible during scroll while accounting for fixed site headers.

### Implementation

```css
:root {
  /* Adjust this to match Squarespace header height */
  --header-h: 92px;
}

.sticky-nav {
  position: sticky;
  top: calc(var(--header-h) + 24px); /* Header + spacing */
  align-self: flex-start; /* Important for flex containers */
  z-index: 10;
}

/* Scroll margin for anchor targets */
section {
  scroll-margin-top: calc(var(--header-h) + 120px);
}
```

**Key Points:**
- Use `position: sticky` for CSS-only solution
- Calculate top offset to avoid covering site header
- Add `scroll-margin-top` to anchor targets so they don't hide behind sticky elements
- Use `align-self: flex-start` in flex containers to prevent stretching
- Test with various header heights (collapsed/expanded states)
- Use CSS custom properties for easy adjustment

---

## Best Practices Summary

### Testing Checklist

- [ ] Test with keyboard only (unplug mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test color contrast with WebAIM or Chrome DevTools
- [ ] Test with browser zoom at 200%
- [ ] Test with browser zoom text-only at 200%
- [ ] Test with reduced motion enabled in OS
- [ ] Test in high contrast mode (Windows)
- [ ] Test print preview
- [ ] Validate HTML (W3C validator)
- [ ] Check heading hierarchy (browser extension)

### Common Mistakes to Avoid

1. **Don't use `outline: none` without replacement focus indicator**
2. **Don't use positive tabindex values (> 0)**
3. **Don't hide content with `display: none` if it needs to be accessible**
4. **Don't use color alone to convey information**
5. **Don't override native HTML semantics with ARIA**
6. **Don't forget `alt` text on images**
7. **Don't use ambiguous link text ("click here", "read more")**
8. **Don't auto-play video/audio**
9. **Don't disable zoom/scaling on mobile**
10. **Don't use `aria-label` on non-interactive elements**

### WCAG 2.1 Level AA Quick Reference

**Perceivable:**
- Text alternatives (alt text)
- Captions for video
- Color contrast 4.5:1 (normal), 3:1 (large)
- Text resize up to 200%
- Color not the only visual means

**Operable:**
- Keyboard accessible
- No keyboard trap
- Skip navigation
- Descriptive page titles
- Focus order logical
- Link purpose clear
- Focus visible
- Multiple ways to find pages

**Understandable:**
- Page language identified
- Predictable navigation
- Consistent identification
- Error identification
- Labels or instructions for inputs
- Error suggestions

**Robust:**
- Valid HTML
- Name, role, value for components
- Status messages

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

**Last Updated:** November 10, 2025  
**Reference Widget:** Accessibility Statement v1.0  
**Maintained by:** McCal Media Development Team
