# Widget Development Tutorial Series — Part 1: Structure & Foundations

> Goal: Build a minimal, standards-compliant widget scaffold ready for enhancement.
> Prerequisites: Read `docs/standards/widget-standards.md` and `widget-reference.md`.

---
## 1. Plan Namespace & Version
- Choose prefix: `concert-`, `podcast-`, `about-`, etc.
- Decide initial version: `v1.0.0` (only when feature-complete), otherwise `v0.x` for prototypes.
- Git tag pattern: `<widget>@<version>` (e.g., `testimonials@0.1.0`).

## 2. Create Versioned HTML File
Example skeleton:
```html
<!-- Testimonials Widget v0.1.0 -->
<div class="testimonials-widget" data-widget-version="0.1.0" data-theme="system">
  <style>
    .testimonials-widget { font: 400 16px/1.4 ui-sans-serif, system-ui; color: #f5f5f5; }
    /* TODO: Add base layout */
  </style>
  <div class="testimonials-root" aria-live="polite">
    <p>Loading testimonials…</p>
  </div>
  <script>
    (function(){
      const root = document.currentScript.closest('.testimonials-widget').querySelector('.testimonials-root');
      // TODO: Load data (static placeholder for now)
      root.innerHTML = '<article class="testimonial" tabindex="0">Sample testimonial placeholder.</article>';
    })();
  </script>
</div>
```

## 3. Self-Containment Checklist
- [ ] Namespace wrapper present
- [ ] Inline CSS & JS only
- [ ] No global variables leaked
- [ ] `data-widget-version` added
- [ ] `data-theme` attribute reserved for future theme handling

## 4. Accessibility Baseline
- [ ] Interactive elements keyboard reachable
- [ ] `aria-live` used for dynamic content regions
- [ ] Focus outline visible (rely on `:focus-visible`)

## 5. Debug Hook (Optional Early)
Add a tiny toggle for early troubleshooting:
```html
<button class="debug-toggle" aria-pressed="false" type="button" onclick="(function(btn){btn.setAttribute('aria-pressed',btn.getAttribute('aria-pressed')==='false');})(this)">Debug</button>
```
Keep minimal until performance patterns applied.

## 6. Common Pitfalls
- Forgetting to version gate features (avoid editing old version file)
- Mixing unrelated CSS concerns → start minimal, layer patterns incrementally
- Using un-prefixed selectors that can collide in Squarespace environment

## 7. Promotion Checklist (Prototype → v1.0.0)
- [ ] Lightbox / interactions stable (if applicable)
- [ ] Performance baseline measured (`TODO: Add metrics capture`)
- [ ] Accessibility spot check (axe, keyboard-only)
- [ ] README created with embed instructions
- [ ] CHANGELOG entry for v1.0.0

## 8. Next Steps
Proceed to Part 2 for performance optimization (critical CSS, lazy strategies, observer discipline).

---
*Last updated: 2025-11-19*
