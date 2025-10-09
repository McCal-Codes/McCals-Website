# Widget Enhancement To-Do (October 2025)

Reference standards:
- `docs/standards/preflight-afterflight.md`
- `docs/standards/widget-standards.md`
- `docs/standards/widget-standards.md` and `docs/standards/widget-development.md`

Follow portfolio -> podcast -> navigation -> footer priority.

## Preflight / Afterflight Anchors
- [ ] Run `npm run ai:preflight:short` (or VS Code task) before edits to confirm context.
- [ ] Confirm planned changes align with widget standards and enhancement patterns before touching code.
- [ ] After each batch of edits, run targeted lint/tests if applicable and re-run preflight summary to capture updated guidance.
- [ ] Update `.github/copilot-instructions.md`, `CHANGELOG.md`, and related standards after completing implementation batches.

## Performance Context - Concert Page Audit (Lighthouse 2025-10-06)
- FCP 4.6 s, LCP 14.5 s, TBT 170 ms, Speed Index 7.7 s (Moto G Power, Slow 4G).
- Primary issues: render-blocking Squarespace CSS/JS, 3.9 MB of oversized GitHub-hosted images, short cache TTLs, legacy JS payloads.
- Action items:
  - Inline or defer non-critical CSS/JS within widgets; lean on critical CSS model to offset Squarespace assets.
  - Implement responsive image sizing, compression, and format upgrades (WebP/AVIF) for gallery content.
  - Ensure widget-delivered assets ship with aggressive caching headers when feasible.
  - Avoid legacy polyfills in custom scripts; rely on modern browser targets.

## Priority 1 - Photojournalism Portfolio v5.2 (`src/widgets/photojournalism-portfolio/versions/v5.2-performance-optimized.html`) ✅ COMPLETE
- [x] **Glass-like filter buttons** with backdrop blur and subtle outlines
- [x] **Fisher-Yates shuffle** for true randomization with one image per album
- [x] **Adjacency minimization** to avoid same-folder clustering
- [x] **Excluded Events folder and Rooney events** from photojournalism feed
- [x] **Simplified filters** to "All" and "Published" only
- [x] **Muted green Published accent** (`#5fb189` → `#3f8f6d`)
- [x] **Updated subheading** for political work focus
- [x] **Added comprehensive changelog entries** to widget CHANGELOG.md and internal modal
- [x] **HTML validation passed** and production-ready

## Priority 2 - Podcast Feed v2.0 (`src/widgets/podcast-feed/versions/v2.0-performance-optimized.html`) 🎯 NEXT
- [ ] Add **sponsorship tab** with dedicated sponsorship content section
- [ ] Replace corrupted icon text (e.g., button labels) with accessible inline SVG or ASCII labels
- [ ] Ensure call-to-action buttons meet enhancement typography/spacing standards
- [ ] Add minimal status / episode badges if relevant (published, featured, sponsored) following enhancement pattern section 3
- [ ] Review lazy-loading strategy for audio/debug features; confirm alignment with performance stack (requestIdleCallback, async scripts)
- [ ] Introduce version indicator pattern if missing and cross-check structured data output
- [ ] Update widget README/changelog after functional improvements

## Priority 3 - Site Navigation v1.7.0 (`src/widgets/site-navigation/versions/v1.7.0-performance-optimized.html`)
- [ ] Review glassmorphism variables vs. standards (consistent color tokens, hover states).
- [ ] Confirm responsive breakpoints and mobile drawer align with navigation enhancement guidance (keyboard support, focus states).
- [ ] Add/version indicator badge within nav heading container per standards doc.
- [ ] Evaluate deferred analytics/debug loading for performance compliance.
- [ ] Prepare documentation updates reflecting navigation refinements.

## Priority 4 - Site Footer v1.3.0 (`src/widgets/site-footer/versions/v1.3.0-performance-optimized.html`)
- [ ] Normalize typography, button, and link spacing with current standards.
- [ ] Ensure newsletter form accessibility (labels, focus styles) and safe-area spacing for any fixed elements.
- [ ] Add version indicator + changelog hook in footer heading per standards.
- [ ] Validate structured data snippet and lazy-loaded features follow enhancement stack.

## Cross-Cutting Tasks
- [ ] `scripts/utils/ai-instructions-preflight.js`: update to reflect new bullet points or icons once widget changes land; verify console output remains ASCII-only.
- [ ] `docs/standards/widget-standards.md`: incorporate any newly adopted patterns or revisions.
- [ ] `docs/standards/widget-standards.md`: append details on portfolio/podcast/nav/footer refinements after implementation.
- [ ] Re-run afterflight checklist (`docs/standards/preflight-afterflight.md`) before final hand-off.

_Last updated: 2025-10-09_
