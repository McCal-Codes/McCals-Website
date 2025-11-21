# Widget Performance & SEO Case Studies (November 2025)

> Purpose: Provide concrete before/after narratives and measurable (or placeholder) metrics for major widget optimization waves to guide future enhancements and justify standards.
> Status: Living Document — add more case studies as optimizations land.

---

## Methodology
Each case study captures:
1. Baseline version & issues
2. Optimization interventions (grouped by category)
3. Resulting improvements (metrics & qualitative UX)
4. Lessons learned / reusable patterns
5. Follow-up TODOs

Metrics categories (populate when measured):
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Bundle size / transferred bytes
- Requests count
- Structured Data validation status

> TODO: Integrate automated Lighthouse snapshot task and append real metrics for each case study.

---

## Concert Portfolio v4.5 → v4.6 → v4.7

### Baseline (v4.5)
Issues:
- Redundant observers increasing main-thread overhead
- Unoptimized structured data injection (per-image risk)
- Lightbox image stretching (poor UX & accessibility)
- Non-deduplicated Spotify artist list

### Interventions (v4.6)
- Critical CSS inlining and elimination of unused selectors
- Consolidated reveal/lazy observers (Observer Discipline pattern)
- Deferred single JSON-LD `ImageGallery` injection post initial render
- Lightbox containment fixes (`object-fit: contain`, hidden scrollbars, navigation hiding)

### Refinements (v4.7)
- Case-insensitive artist list deduplication
- Interaction safety: disable support button while lightbox open/media interaction
- Micro-performance polish (reduced layout thrash via batch DOM writes)

### Results (Placeholders — replace with measurements)
| Metric | v4.5 | v4.6 | v4.7 | Delta v4.5→v4.7 |
|--------|------|------|------|------------------|
| FCP (s) | TODO | TODO | TODO | TODO |
| LCP (s) | TODO | TODO | TODO | TODO |
| TBT (ms) | TODO | TODO | TODO | TODO |
| Bundle Size (KB) | TODO | TODO | TODO | TODO |

### Lessons
- Single schema injection drastically lowers long tasks.
- Observer consolidation prevents cascading reflows.
- Artist list deduping improves perceived polish without runtime cost.

### Follow-Ups
- TODO: Add automated metrics capture & historical trend logging.
- TODO: Evaluate adding WebP prioritization + srcset in future minor release.

---

## Photojournalism Portfolio v4.4 → v4.8 → v5.x

### Baseline (v4.4)
Issues:
- Published filter logic inconsistent
- Lightbox navigation/hiding incomplete
- Image adjacency not optimized → visual clustering

### Interventions (v4.8)
- Fixed Published filter (binary state clarity)
- Enhanced lightbox: overlay containment, scrollbars hidden, navigation hiding pattern
- Fisher-Yates shuffle + adjacency minimization algorithm

### Evolution (v5.x)
- Glass filter buttons with backdrop blur
- Performance polish: minimized layout shifts, consolidated observers
- Accessibility refinements (ARIA roles, keyboard enhancements)

### Results (Placeholders)
| Metric | v4.4 | v4.8 | v5.x | Delta v4.4→v5.x |
|--------|------|------|------|------------------|
| FCP (s) | TODO | TODO | TODO | TODO |
| LCP (s) | TODO | TODO | TODO | TODO |
| TBT (ms) | TODO | TODO | TODO | TODO |
| CLS | TODO | TODO | TODO | TODO |

### Lessons
- Shuffle + adjacency minimization improves perceived diversity of gallery.
- Backdrop blur requires careful performance consideration (limit high blur radii).
- Consolidated version badge + debug panel simplifies maintenance.

### Follow-Ups
- TODO: Add responsive `srcset` with WebP/AVIF detection fallback layer.
- TODO: Integrate accessibility snapshot (axe) into CI for regression detection.

---

## Policies & Legal v1.0.0 → v1.1.0

### Baseline (v1.0.0)
- Solid structured content but limited accessibility tooling.

### Interventions (v1.1.0)
- Skip link added
- Unified `:focus-visible` styling
- Scroll spy with `aria-current` markers
- Reduced motion support integrated
- Hardened landmarks and print stylesheet refinement

### Results (Placeholders)
| Metric | v1.0.0 | v1.1.0 | Delta |
|--------|--------|--------|-------|
| TBT (ms) | TODO | TODO | TODO |
| Accessibility Score | TODO | TODO | TODO |
| Print Layout Validity | N/A | PASS | + |

### Lessons
- Early integration of scroll spy semantics reduces later retrofitting effort.
- Print stylesheet ensures multi-channel distribution readiness.

### Follow-Ups
- TODO: Add structured data extension (e.g., `LegalService` or nested FAQ extraction if applicable).

---

## Accessibility Statement v1.1.1 → v1.1.2

### Baseline (v1.1.1)
- Theme semantics inverted (naming mismatch).

### Interventions (v1.1.2)
- Correct Light/Dark semantics
- Maintained System mode; preserved anchors/IDs
- Verified WCAG AA contrast

### Results
| Metric | v1.1.1 | v1.1.2 |
|--------|--------|--------|
| Contrast Compliance | Partial | Full |
| Theme Accuracy | Inverted | Correct |

### Lessons
- Naming clarity prevents cognitive friction in maintenance.
- Contrast verification step should be standardized (add automated audit).

### Follow-Ups
- TODO: Incorporate theme audit script into preflight.

---

## Structured Data & SEO Consolidation (Cross-Widget)

### Baseline
- Early versions risked per-image structured data (inflated DOM & parse time).

### Consolidated Pattern
- Single JSON-LD block (ImageGallery / CollectionPage) injected after first render.
- Enhanced alt text generation referencing manifest metadata.

### Benefits (Qualitative)
- Lower long tasks
- Reduced duplicate parsing cost
- Cleaner dev tooling for schema validation

### Follow-Ups
- TODO: Add schema diff validator to CI for major version bumps.

---

## Appendix: Measuring & Recording Metrics
- TODO: Implement `scripts/utils/lighthouse-snapshot.js` (Node + Chrome devtools protocol) to output JSON/HTML reports under `reports/` with timestamp naming.
- TODO: Add `npm run metrics:record` to trigger snapshots for key widgets (config-driven list).
- TODO: Store historical metrics in `reports/history/<widget>.json` for trending and regression detection.

---

*Last updated: 2025-11-19*
