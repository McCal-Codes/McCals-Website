# Widget Development Tutorial Series — Part 3: Accessibility Hardening

> Goal: Elevate widget from baseline to WCAG 2.1 AA compliance baseline.
> Pre-req: Performance tuning (Part 2) completed.

---
## 1. Semantic Structure
Use landmark-like wrappers even in embedded contexts:
```html
<section class="widget-section" aria-labelledby="widget-heading">
  <h2 id="widget-heading">Testimonials</h2>
  <div class="widget-list" role="list"></div>
</section>
```

## 2. Focus Management
Modal/lightbox pattern:
```js
function trapFocus(scope){
  const items=[...scope.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')];
  let first=items[0], last=items[items.length-1];
  scope.addEventListener('keydown',e=>{if(e.key==='Tab'){if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}}});
}
```

## 3. Keyboard Shortcuts
- Escape closes modals/drawers.
- Arrow keys can navigate gallery items (add roving tabindex if needed).

## 4. ARIA Patterns
- Use `role="status"` for async loading messages.
- Use `aria-live="polite"` for incremental content reveal.
- Toggle buttons: maintain `aria-pressed` state.

## 5. Reduced Motion Compliance
Wrap animations:
```css
@media (prefers-reduced-motion: reduce){
  .fade-in { transition: none; opacity: 1 !important; transform: none !important; }
}
```

## 6. Color & Contrast
- Target contrast ratio ≥ 4.5:1 for body text.
- Use CSS custom properties for quick palette adjustments.
- TODO: Add automated contrast audit script.

## 7. Accessible Media
- Provide transcripts and/or alt text for audio & images.
- Lazy load non-critical media descriptions but ensure main alt text inline.

## 8. Testing Toolkit
- Manual: keyboard-only navigation pass.
- Automated: axe-core via Playwright (planned CI integration).
- TODO: Add `npm run a11y:widgets` script wrapper.

## 9. Common Pitfalls
- Missing focus outlines replaced by custom but lower-contrast styles.
- Scroll locking without restoring focus.
- Incorrect `aria-hidden` usage (hiding visible content for AT).

## 10. Next Steps
Proceed to Part 4 for deployment & versioning workflow.

---
*Last updated: 2025-11-19*
