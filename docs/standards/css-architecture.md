# CSS Architecture & Modularization Guide

> **Version**: 2.0.0  
> **Last Updated**: December 2, 2025  
> **Purpose**: Define CSS architecture, naming conventions, and modularization strategies for McCal Media widgets

---

## Table of Contents

1. [Overview](#overview)
2. [Design Token System](#design-token-system)
3. [Naming Conventions](#naming-conventions)
4. [Component Patterns](#component-patterns)
5. [Utility Classes](#utility-classes)
6. [Theme System](#theme-system)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)

---

## Overview

The McCal Media CSS architecture uses a combination of:

- **CSS Custom Properties** for design tokens
- **BEM-inspired naming** for components
- **Utility-first classes** for common patterns
- **Namespace prefixing** (`mcc-`) to avoid conflicts
- **Self-contained widgets** for Squarespace compatibility

### Key Files

- **`tailwind.config.js`**: Design system tokens for build-time CSS generation
- **`src/widgets/_shared/site-widgets.css`**: Runtime CSS custom properties and utility classes
- **Widget HTML files**: Inline CSS with local fallbacks

---

## Design Token System

### Color Tokens

```css
:root {
  /* Brand Colors */
  --mcc-brand-primary: #ff4d6d; /* Primary brand color */
  --mcc-brand-secondary: #4d79ff; /* Secondary brand color */
  --mcc-brand-accent: #00d4aa; /* Accent/success color */

  /* UI Colors */
  --mcc-accent: #4d79ff; /* Interactive elements */
  --mcc-bg: #ffffff; /* Background */
  --mcc-fg: #0e0f10; /* Foreground/text */
  --mcc-line: #e7e7e7; /* Borders/lines */
  --mcc-muted: #6b7280; /* Muted text */

  /* Surface Colors */
  --mcc-chip: #fafafa; /* Chip/badge background */
  --mcc-panel-bg: rgba(255, 255, 255, 0.82);
  --mcc-panel-border: rgba(0, 0, 0, 0.08);

  /* Interactive States */
  --mcc-hover: rgba(0, 0, 0, 0.05);
  --mcc-focus: #7dd3fc;
  --mcc-active: rgba(0, 0, 0, 0.1);
  --mcc-disabled: rgba(0, 0, 0, 0.3);
}
```

### Spacing Scale

4px base unit system:

```css
--mcc-space-0: 0; /* 0px */
--mcc-space-1: 4px; /* 4px */
--mcc-space-2: 8px; /* 8px */
--mcc-space-3: 12px; /* 12px */
--mcc-space-4: 16px; /* 16px */
--mcc-space-5: 24px; /* 24px */
--mcc-space-6: 32px; /* 32px */
--mcc-space-7: 48px; /* 48px */
--mcc-space-8: 64px; /* 64px */
--mcc-space-9: 96px; /* 96px */
```

### Typography Tokens

```css
/* Font Families */
--mcc-font-sans: ui-sans-serif, system-ui, -apple-system, ...;
--mcc-font-mono: ui-monospace, "SF Mono", Monaco, ...;

/* Font Sizes */
--mcc-text-xs: 0.75rem; /* 12px */
--mcc-text-sm: 0.875rem; /* 14px */
--mcc-text-base: 1rem; /* 16px */
--mcc-text-lg: 1.125rem; /* 18px */
--mcc-text-xl: 1.25rem; /* 20px */
--mcc-text-2xl: 1.5rem; /* 24px */
--mcc-text-3xl: 1.875rem; /* 30px */
--mcc-text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--mcc-weight-light: 300;
--mcc-weight-normal: 400;
--mcc-weight-medium: 500;
--mcc-weight-semibold: 600;
--mcc-weight-bold: 700;
--mcc-weight-extrabold: 800;
```

### Layout Tokens

```css
/* Border Radius */
--mcc-radius-sm: 4px;
--mcc-radius: 8px;
--mcc-radius-md: 10px;
--mcc-radius-lg: 12px;
--mcc-radius-xl: 16px;
--mcc-radius-full: 9999px;

/* Control Heights */
--mcc-control-height: 40px;
--mcc-control-height-sm: 32px;
--mcc-control-height-lg: 48px;

/* Z-Index */
--mcc-z-dropdown: 900;
--mcc-z-sticky: 800;
--mcc-z-modal: 2147483647;
--mcc-z-modal-content: 2147483648;
```

---

## Naming Conventions

### BEM-Inspired Pattern

```
.mcc-{block}__{element}--{modifier}
```

- **Namespace**: Always prefix with `mcc-`
- **Block**: Component name (lowercase, hyphenated)
- **Element**: Sub-component (double underscore `__`)
- **Modifier**: Variant (double hyphen `--`)

### Examples

```css
/* Button Component */
.mcc-btn                  /* Block */
/* Block */
.mcc-btn--secondary       /* Modifier */
.mcc-btn--small           /* Modifier */
.mcc-btn--disabled        /* Modifier */

/* Card Component */
.mcc-card                 /* Block */
.mcc-card__header         /* Element */
.mcc-card__body           /* Element */
.mcc-card__footer         /* Element */
.mcc-card--clickable      /* Modifier */
.mcc-card--flat           /* Modifier */

/* Modal Component */
.mcc-modal                /* Block */
.mcc-modal__dialog        /* Element */
.mcc-modal__close         /* Element */
.mcc-modal--open; /* Modifier */
```

### State Classes

Use clear state naming:

```css
.is-open .is-active .is-disabled .is-loading .is-hidden;
```

---

## Component Patterns

### Button Component

```css
.mcc-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--mcc-space-2);
  padding: 0.6rem 1.2rem;
  height: var(--mcc-control-height);
  border-radius: var(--mcc-radius-full);
  background: var(--mcc-accent);
  color: #fff;
  font-weight: var(--mcc-weight-semibold);
  transition: all var(--mcc-transition-base);
}

.mcc-btn--secondary {
  background: transparent;
  border: 1px solid var(--mcc-line);
  color: var(--mcc-fg);
}

.mcc-btn--small {
  height: var(--mcc-control-height-sm);
  padding: 0.4rem 1rem;
  font-size: var(--mcc-text-xs);
}
```

### Card Component

```css
.mcc-card {
  background: var(--mcc-bg);
  border: 1px solid var(--mcc-line);
  border-radius: var(--mcc-radius-lg);
  overflow: hidden;
}

.mcc-card__header {
  padding: var(--mcc-space-4);
  border-bottom: 1px solid var(--mcc-line);
}

.mcc-card__body {
  padding: var(--mcc-space-4);
}

.mcc-card--clickable {
  cursor: pointer;
  transition: transform var(--mcc-transition-base);
}

.mcc-card--clickable:hover {
  transform: translateY(-2px);
}
```

### Modal Component

```css
.mcc-modal {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: var(--mcc-z-modal);
}

.mcc-modal--open {
  display: flex;
}

.mcc-modal__dialog {
  background: var(--mcc-bg);
  border-radius: var(--mcc-radius-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}
```

---

## Utility Classes

### Layout Utilities

```css
.mcc-row      /* Flex row with gap */
/* Flex row with gap */
.mcc-col      /* Flex column with gap */
.mcc-center   /* Center content */
.mcc-grid     /* CSS Grid */
.mcc-grid--2  /* 2-column grid */
.mcc-grid--3  /* 3-column grid */
.mcc-grid--4; /* 4-column grid */
```

### Spacing Utilities

```css
.mcc-mt-{0-6}  /* Margin top */
.mcc-mb-{0-6}  /* Margin bottom */
.mcc-p-{0-6}   /* Padding (all sides) */
```

### Typography Utilities

```css
.mcc-text-xs       /* Font size: 12px */
/* Font size: 12px */
.mcc-text-sm       /* Font size: 14px */
.mcc-text-base     /* Font size: 16px */
.mcc-text-lg       /* Font size: 18px */

.mcc-font-normal   /* Font weight: 400 */
.mcc-font-medium   /* Font weight: 500 */
.mcc-font-semibold /* Font weight: 600 */
.mcc-font-bold     /* Font weight: 700 */

.mcc-text-center   /* Text align: center */
.mcc-text-left     /* Text align: left */
.mcc-text-right; /* Text align: right */
```

### Color Utilities

```css
.mcc-text-muted    /* Muted text color */
/* Muted text color */
.mcc-text-accent   /* Accent text color */
.mcc-bg-accent     /* Accent background */
.mcc-bg-muted; /* Muted background */
```

### Image Utilities

```css
.mcc-img-cover     /* object-fit: cover */
/* object-fit: cover */
.mcc-img-contain; /* object-fit: contain */
```

### Visibility Utilities

```css
.mcc-sr-only          /* Screen reader only */
/* Screen reader only */
.mcc-hidden           /* Display: none */
.mcc-hidden-mobile    /* Hidden on mobile */
.mcc-hidden-desktop; /* Hidden on desktop */
```

---

## Theme System

### Theme Modes

```html
<!-- Light Mode -->
<div class="mcc-widget" data-theme="light">
  <!-- Widget content -->
</div>

<!-- Dark Mode -->
<div class="mcc-widget" data-theme="dark">
  <!-- Widget content -->
</div>

<!-- System Preference -->
<div class="mcc-widget" data-theme="system">
  <!-- Widget content -->
</div>
```

### Theme Switching

```javascript
// Set theme
const setTheme = (theme) => {
  const widget = document.querySelector(".mcc-widget");
  widget.setAttribute("data-theme", theme);
  localStorage.setItem("mcc-theme", theme);
};

// Load saved theme
const savedTheme = localStorage.getItem("mcc-theme") || "system";
setTheme(savedTheme);
```

---

## Best Practices

### 1. Always Use Fallbacks

```css
/* Good - with fallback */
color: var(--mcc-accent, #4d79ff);

/* Avoid - no fallback */
color: var(--mcc-accent);
```

### 2. Scope Styles to Widget

```css
/* Good - scoped */
.event-portfolio .card {
  /* styles */
}

/* Avoid - global */
.card {
  /* styles */
}
```

### 3. Use Modern CSS Features

```css
/* Good - modern */
.card {
  display: grid;
  gap: 1rem;
  aspect-ratio: 16 / 9;
}

/* Avoid - outdated */
.card {
  display: block;
  float: left;
  margin: 0 1rem 1rem 0;
}
```

### 4. Mobile-First Approach

```css
/* Good - mobile first */
.widget {
  padding: 20px;
}

@media (min-width: 768px) {
  .widget {
    padding: 40px;
  }
}

/* Avoid - desktop first */
.widget {
  padding: 40px;
}

@media (max-width: 767px) {
  .widget {
    padding: 20px;
  }
}
```

### 5. Optimize for Performance

```css
/* Good - efficient */
.card {
  will-change: transform;
  transform: translateZ(0);
}

/* Avoid - causes reflow */
.card:hover {
  margin-top: -2px;
}
```

### 6. Accessibility First

```css
/* Focus styles */
.mcc-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px var(--mcc-focus);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Migration Guide

### Migrating Existing Widgets

#### Step 1: Add Namespace

```css
/* Before */
.portfolio {
}

/* After */
.event-portfolio {
}
```

#### Step 2: Use CSS Custom Properties

```css
/* Before */
.card {
  background: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
}

/* After */
.card {
  background: var(--mcc-bg, #ffffff);
  color: var(--mcc-fg, #111827);
  border: 1px solid var(--mcc-line, #e5e7eb);
}
```

#### Step 3: Apply BEM Naming

```css
/* Before */
.card {
}
.card-header {
}
.card-body {
}
.active {
}

/* After */
.mcc-card {
}
.mcc-card__header {
}
.mcc-card__body {
}
.mcc-card--active {
}
```

#### Step 4: Use Utility Classes

```css
/* Before - custom CSS */
.button {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* After - utility class */
<button class="mcc-center">Click Me</button>
```

#### Step 5: Add Theme Support

```css
/* Add to widget root */
<div class="event-portfolio" data-theme="system">
  <!-- content -->
</div>
```

---

## Examples

### Complete Widget Structure

```html
<div
  class="mcc-event-portfolio"
  data-theme="system"
  data-widget-version="2.7.0"
>
  <style>
    .mcc-event-portfolio {
      --local-accent: var(--mcc-accent, #4d79ff);
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--mcc-space-6);
    }

    .mcc-event-portfolio__header {
      text-align: center;
      margin-bottom: var(--mcc-space-5);
    }

    .mcc-event-portfolio__title {
      font-size: var(--mcc-text-3xl);
      font-weight: var(--mcc-weight-extrabold);
      color: var(--mcc-fg);
    }

    .mcc-event-portfolio__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--mcc-space-4);
    }

    .mcc-event-card {
      background: var(--mcc-bg);
      border: 1px solid var(--mcc-line);
      border-radius: var(--mcc-radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--mcc-transition-base);
    }

    .mcc-event-card:hover {
      transform: translateY(-2px);
    }

    .mcc-event-card__image {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }

    .mcc-event-card__content {
      padding: var(--mcc-space-4);
    }

    .mcc-event-card__title {
      font-size: var(--mcc-text-lg);
      font-weight: var(--mcc-weight-semibold);
      margin: 0 0 var(--mcc-space-2);
    }

    .mcc-event-card__meta {
      font-size: var(--mcc-text-sm);
      color: var(--mcc-muted);
    }
  </style>

  <header class="mcc-event-portfolio__header">
    <h1 class="mcc-event-portfolio__title">Event Portfolio</h1>
  </header>

  <div class="mcc-event-portfolio__grid" id="eventGrid">
    <!-- Cards rendered by JavaScript -->
  </div>

  <script>
    // Widget JavaScript
  </script>
</div>
```

---

## Resources

- **Tailwind Config**: `/tailwind.config.js`
- **Shared CSS**: `/src/widgets/_shared/site-widgets.css`
- **Widget Standards**: `/docs/standards/widget-standards.md`
- **JavaScript Patterns**: `/docs/standards/javascript-patterns.md`

---

_Last updated: December 2, 2025_
