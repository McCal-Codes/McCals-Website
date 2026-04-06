# Widget-to-Vite Migration Guide

Quick reference for transitioning legacy widget patterns to the Vite site architecture.

---

## Core Concept Shifts

| Widget Pattern | Vite Equivalent |
|----------------|-----------------|
| Self-contained HTML file | React component + CSS module |
| `data-widget-version` attribute | Component props + Git versioning |
| Scoped CSS prefixes (`.mcc-*`) | CSS modules or Tailwind classes |
| Inline `<script>` tags | TypeScript/React hooks |
| Squarespace injection | Static build + deployment |
| Widget namespace (`mcc-`) | Component directory organization |

---

## File Structure Migration

### Widget (Legacy)
```
src/widgets/concert-portfolio/
├── README.md
├── CHANGELOG.md
└── versions/
    └── v4.6-concert-portfolio.html
```

### Vite Component (New)
```
src/components/portfolio/
├── ConcertPortfolio.tsx      # Main component
├── ConcertPortfolio.css      # Scoped styles
├── ConcertPortfolio.test.tsx # Tests
└── index.ts                  # Barrel export
```

---

## CSS Migration

### Widget (Legacy)
```css
/* Scoped with namespace prefix */
.mcc-concert-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.mcc-concert-card {
  background: var(--mc-bg);
}
```

### Vite (New)
```css
/* CSS Module */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.card {
  background: var(--color-bg);
}
```

Or Tailwind:
```jsx
<div className="grid grid-cols-3 gap-4">
```

---

## JavaScript Migration

### Widget (Legacy)
```html
<script>
  document.querySelectorAll('.mcc-concert-card').forEach(card => {
    card.addEventListener('click', handleClick);
  });
</script>
```

### Vite (New)
```tsx
import { useState, useCallback } from 'react';

export function ConcertCard({ data }: { data: PortfolioItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <button onClick={handleClick} className="card">
      {/* ... */}
    </button>
  );
}
```

---

## Manifest Consumption

### Widget (Legacy)
Used per-folder or aggregated JSON manifests.

### Vite (New)
Import directly as modules or fetch at build time:
```tsx
import concertData from '@data/concert-manifest.json';

// Or fetch if dynamic
const data = await fetch('/data/concert-manifest.json').then(r => r.json());
```

---

## Accessibility Upgrades

| Widget | Vite |
|--------|------|
| ARIA added manually | Semantic HTML first |
| `div` with click handlers | `<button>` or proper interactive element |
| Hidden focus outlines | Visible focus indicators |
| Hardcoded colors | CSS variables + Tailwind |

---

## Deployment Changes

| Aspect | Widget | Vite |
|--------|--------|------|
| Build | Manual/Squarespace | `npm run build` |
| Hosting | Squarespace | GitHub Pages/Static host |
| Versioning | File-level in versions/ | Git commits + tags |
| Testing | Manual | Automated (Vitest) |

---

## Checklist: Migrating a Widget

- [ ] Extract HTML structure to JSX component
- [ ] Convert CSS to module or Tailwind classes
- [ ] Replace vanilla JS with React hooks
- [ ] Add TypeScript types for props/data
- [ ] Implement semantic HTML (reduce ARIA needs)
- [ ] Add keyboard navigation
- [ ] Test with screen reader
- [ ] Verify responsive behavior
- [ ] Update import paths for manifests
- [ ] Add component tests

---

> **Legacy Reference**: Original widget standards archived in `archive/legacy-standards/`
