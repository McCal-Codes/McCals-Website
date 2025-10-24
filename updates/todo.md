# Widget Enhancement To-Do (October 2025)


Reference standards:
- `docs/standards/preflight-afterflight.md`
- `docs/standards/widget-standards.md`
- `docs/standards/widget-development.md`

Follow portfolio -> podcast -> navigation -> footer priority.

## Preflight / Afterflight Anchors
- [ ] TODO: Run `npm run ai:preflight:short` (or VS Code task) before edits to confirm context.
- [ ] TODO: Confirm planned changes align with widget standards and enhancement patterns before touching code.
- [ ] TODO: After each batch of edits, run targeted lint/tests if applicable and re-run preflight summary to capture updated guidance.
- [ ] TODO: Update `.github/copilot-instructions.md`, `CHANGELOG.md`, and related standards after completing implementation batches.

## Performance Context - Concert Page Audit (Lighthouse 2025-10-06)
- [ ] TODO: Review FCP/LCP/TBT/Speed Index metrics and address primary issues: render-blocking Squarespace CSS/JS, oversized images, cache TTLs, legacy JS payloads.
- [ ] TODO: Inline or defer non-critical CSS/JS within widgets; lean on critical CSS model to offset Squarespace assets.
- [ ] TODO: Implement responsive image sizing, compression, and format upgrades (WebP/AVIF) for gallery content.
- [ ] TODO: Ensure widget-delivered assets ship with aggressive caching headers when feasible.
- [ ] TODO: Avoid legacy polyfills in custom scripts; rely on modern browser targets.

## Priority 2 - Podcast Feed v2.0 (`src/widgets/podcast-feed/versions/v2.0-performance-optimized.html`)
- [ ] TODO: Replace corrupted icon text (e.g., button labels) with accessible inline SVG or ASCII labels.
- [ ] TODO: Ensure call-to-action buttons meet enhancement typography/spacing standards.
- [ ] TODO: Add minimal status / episode badges if relevant (published, featured) following enhancement pattern section 3.
- [ ] TODO: Review lazy-loading strategy for audio/debug features; confirm alignment with performance stack (requestIdleCallback, async scripts).
- [ ] TODO: Introduce version indicator pattern if missing and cross-check structured data output.
- [ ] TODO: Update widget README/changelog after functional improvements.

## Priority 3 - Site Navigation v1.7.0 (`src/widgets/site-navigation/versions/v1.7.0-performance-optimized.html`)
- [ ] TODO: Review glassmorphism variables vs. standards (consistent color tokens, hover states).
- [ ] TODO: Confirm responsive breakpoints and mobile drawer align with navigation enhancement guidance (keyboard support, focus states).
- [ ] TODO: Add/version indicator badge within nav heading container per standards doc.
- [ ] TODO: Evaluate deferred analytics/debug loading for performance compliance.
- [ ] TODO: Prepare documentation updates reflecting navigation refinements.

## Priority 4 - Site Footer v1.3.0 (`src/widgets/site-footer/versions/v1.3.0-performance-optimized.html`)
- [ ] TODO: Normalize typography, button, and link spacing with current standards.
- [ ] TODO: Ensure newsletter form accessibility (labels, focus styles) and safe-area spacing for any fixed elements.
- [ ] TODO: Add version indicator + changelog hook in footer heading per standards.
- [ ] TODO: Validate structured data snippet and lazy-loaded features follow enhancement stack.

## Cross-Cutting Tasks
- [ ] Update `scripts/utils/ai-instructions-preflight.js` to reflect new bullet points or icons once widget changes land; verify console output remains ASCII-only.
- [ ] Update `docs/standards/widget-standards.md` to incorporate any newly adopted patterns or revisions. <!-- Only use TODO: tags for changelog/code-related items for tree compatibility -->
- [ ] Append details on portfolio/podcast/nav/footer refinements to `docs/standards/widget-standards.md` after implementation.
- [ ] Re-run afterflight checklist (`docs/standards/preflight-afterflight.md`) before final hand-off.

_Last updated: 2025-10-06_
