# CSS Standardization Plan

**Status**: In Progress  
**Goal**: Eliminate CSS inconsistency - standardize on CSS Modules for components/pages, Global CSS for layout/themes

---

## Current State Analysis

### Global CSS Files (12 files in `src/styles/`)
| File | Purpose | Status |
|------|---------|--------|
| `globals.css` | Site layout, themes, base styles | Keep (global) |
| `fonts.css` | Font imports | Keep (global) |
| `nav.css` | Navigation styles | Migrate to module |
| `footer.css` | Footer styles | Migrate to module |
| `authors.css` | Authors page styles | Migrate to module |
| `blog.css` | Blog page styles | Migrate to module |
| `podcast.css` | Podcast page styles | Migrate to module |
| `scheduling.css` | Booking pages styles | Migrate to module |
| `about-widget.css` | Legacy widget styles | Remove with widgets |
| `abridged.css` | Abridged page styles | Migrate to module |
| `heroCarousel.module.css` | Hero carousel | Already module ✅ |
| `homepage.module.css` | Homepage | Already module ✅ |

### Component CSS
| File | Location | Status |
|------|----------|--------|
| `portfolio.css` | `components/portfolio/` | Global - should be module |

### Page CSS
| File | Location | Import Style |
|------|----------|--------------|
| `about.module.css` | `pages/` | Module ✅ |
| `faq.css` | `pages/` | Global - should be module |
| `policies-legal.css` | `pages/` | Global - should be module |

---

## Standardization Rules

### When to Use CSS Modules
- **Component-scoped styles** (Button, Card, Input)
- **Page-specific styles** (AboutPage, BlogPage)
- **Any styles with class names that might collide**

**Naming**: `ComponentName.module.css` or `pageName.module.css`
**Location**: Co-located with component/page
**Import**: `import styles from './ComponentName.module.css'`

### When to Use Global CSS
- **CSS variables/design tokens** (colors, spacing, typography scale)
- **Layout shell styles** (html, body, #root)
- **Third-party library overrides** (normalize, swiper)
- **Animation keyframes** (if shared across components)

**Naming**: `purpose.css`
**Location**: `src/styles/`
**Import**: `import './styles/purpose.css'` (in main.tsx)

### Forbidden Patterns
- ❌ Global CSS in `src/components/*/` (except index.css pattern)
- ❌ Page-scoped `.css` files (use `.module.css`)
- ❌ Mixing modules and global in same component
- ❌ Widget-specific CSS (to be removed with widgets)

---

## Migration Phases

### Phase 1: Component CSS Modules
**Priority**: High - Portfolio components used everywhere

1. **Create `portfolio.module.css`**
   - Convert from `portfolio.css`
   - Use camelCase class names
   - Update all imports

2. **Migrate Layout components**
   - `Nav.tsx` + `nav.css` → `Nav/index.tsx` + `Nav/Nav.module.css`
   - `Footer.tsx` + `footer.css` → `Footer/index.tsx` + `Footer/Footer.module.css`

### Phase 2: Page CSS Modules
**Priority**: Medium - Reduces global CSS pollution

1. Convert page global CSS to modules:
   - `faq.css` → `faq.module.css`
   - `policies-legal.css` → `policies-legal.module.css`
   - `authors.css` → `authors.module.css`
   - `blog.css` → `blog.module.css`
   - `podcast.css` → `podcast.module.css`
   - `scheduling.css` → `scheduling.module.css`
   - `abridged.css` → `abridged.module.css`

### Phase 3: Cleanup
**Priority**: Low - After widget migration

1. Remove `about-widget.css` with widget purge
2. Consolidate any remaining global styles into `globals.css`
3. Audit for unused styles

---

## Naming Conventions

### CSS Modules
```css
/* ComponentName.module.css */
.container { }
.title { }
.buttonPrimary { }  /* camelCase for multi-word */
.listItem { }

/* Usage in TSX */
import styles from './ComponentName.module.css';
<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### Global CSS (design tokens)
```css
/* globals.css - CSS variables only */
:root {
  --color-primary: #007bff;
  --color-bg-dark: #0b0b0d;
  --color-bg-light: #f8f8f8;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --font-heading: 'Inter', sans-serif;
}
```

---

## Implementation Priority

### Week 1: Portfolio Module
- [ ] Create `portfolio.module.css`
- [ ] Migrate `portfolio.css` classes to camelCase
- [ ] Update `PortfolioCard.tsx` imports
- [ ] Update `PortfolioGrid.tsx` imports
- [ ] Update `PortfolioLightbox.tsx` imports
- [ ] Update `PortfolioFilters.tsx` imports
- [ ] Update page imports (concerts.tsx, events.tsx, etc.)
- [ ] Delete `portfolio.css`

### Week 2: Layout Components
- [ ] Restructure `Layout/` folder
- [ ] Move `Nav.tsx` to `Layout/Nav/index.tsx`
- [ ] Create `Layout/Nav/Nav.module.css` from `nav.css`
- [ ] Move `Footer.tsx` to `Layout/Footer/index.tsx`
- [ ] Create `Layout/Footer/Footer.module.css` from `footer.css`
- [ ] Delete `nav.css`, `footer.css`

### Week 3: Page Modules (Batch 1)
- [ ] Convert `faq.css` → `faq.module.css`
- [ ] Convert `policies-legal.css` → `policies-legal.module.css`
- [ ] Convert `authors.css` → `authors.module.css`

### Week 4: Page Modules (Batch 2)
- [ ] Convert `blog.css` → `blog.module.css`
- [ ] Convert `podcast.css` → `podcast.module.css`
- [ ] Convert `scheduling.css` → `scheduling.module.css`
- [ ] Convert `abridged.css` → `abridged.module.css`

---

## Benefits After Migration

| Before | After |
|--------|-------|
| 12 global CSS files | 2 global files (globals.css, fonts.css) |
| Naming collision risk | Scoped class names via modules |
| Unused styles remain in bundle | Tree-shaking removes unused module styles |
| Hard to trace styles | Co-located with components |
| Widget CSS pollution | Clean separation |

---

## Success Metrics

- [ ] Zero `.css` files in `src/components/*/` (only `.module.css`)
- [ ] Zero `.css` files in `src/pages/` (only `.module.css`)
- [ ] Only 2-3 global CSS files in `src/styles/`
- [ ] All class names use camelCase in modules
- [ ] No console warnings about CSS
- [ ] Build bundle size reduced (tree-shaking)

---

## References

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Vite CSS Modules](https://vitejs.dev/guide/features.html#css-modules)
- Current implementation: `about.module.css` + `about.tsx`
