# Squarespace Homepage Performance Matrix

Purpose: reduce mobile Lighthouse regressions on `https://www.mcc-cal.com/` by limiting heavy features/scripts on the homepage while preserving functionality on the pages that actually need them.

## Recommended page tiers

- **Tier A (Homepage / Landing):** `/`
- **Tier B (Portfolio + Editorial):** `/featured`, `/journalism`, `/concert`, `/event`, `/nature`, `/portraits`, `/about`, `/podcast`, `/blog`
- **Tier C (Transactional):** `/request-a-quote`, any commerce/shop/cart/account pages

Use this rule: keep Tier A minimal, allow feature load on Tier B only when required, and reserve account/commerce-heavy features for Tier C.

## Feature/script matrix

| Feature / Script Family | Tier A (Homepage) | Tier B (Portfolio/Editorial) | Tier C (Transactional) | Why / Expected impact |
|---|---:|---:|---:|---|
| Commerce CSS/JS bundles | **Disable** | Disable unless selling on page | **Enable** | Largest JS/CSS reduction; improves LCP/TBT materially |
| User account CSS/JS bundles | **Disable** | Disable unless account UI exists | **Enable** | Removes render-blocking CSS + JS parse/exec |
| Announcement bars/popups | Disable or delay | Optional | Optional | Reduces first-render work above fold |
| Newsletter modal on load | **Disable auto-open** | Delay until interaction | Optional | Avoids extra DOM/script work during LCP window |
| GTM / analytics non-critical tags | **Delay** (post-load or interaction) | Delay | Enable (consent-aware) | Lowers TBT and main-thread contention |
| Extra embeds (maps/social/iframes) above fold | **Remove** | Lazy-load below fold | Lazy-load where possible | Prevents network and CPU contention before hero paints |
| Web fonts (extra families/weights) | Keep only critical 1–2 weights | Same | Same | Reduces FCP delays from font chain |
| Hero first image (LCP candidate) | **Prioritize + compress** | N/A | N/A | Direct LCP win |
| Non-first carousel images | Lazy | Lazy | Lazy | Preserves bandwidth and parser time |
| Global custom code snippets | Minimal only | Minimal | Add only needed snippets | Avoid universal loading of page-specific logic |

## Practical Squarespace implementation map

### 1) Homepage (`/`)

- Keep only the hero widget + essential nav/footer.
- Remove/disable blocks that trigger commerce/account assets (if present).
- Move non-critical embeds below fold and lazy-load where possible.
- Delay analytics tags that are not required for initial route/view events.

### 2) Portfolio/editorial pages (Tier B)

- Keep gallery/media behavior only for that page.
- Avoid global code injection if script is page-specific; scope it to page-level code injection.
- Do not include account/commerce components unless user-facing on that page.

### 3) Transactional pages (Tier C)

- Enable commerce/account integrations only here.
- Keep these heavier scripts isolated from homepage template/layout.

## Click-by-click in Squarespace (how to actually do it)

### A) Create a safe baseline first

1. Duplicate your homepage (or save a full-page backup in your notes).
2. Run Lighthouse once and save the JSON/HTML report as baseline.
3. Make one performance change at a time, then retest.

### B) Reduce homepage payload

1. Go to **Pages** -> open `/` in editor.
2. Remove or move non-critical blocks below the fold (maps, social embeds, newsletter popups, extra galleries).
3. Keep only: nav, hero, core CTA, footer for first paint.
4. If any block references store/account features, remove it from homepage.

### C) Move scripts from global to page-scoped injection

1. Go to **Settings** -> **Advanced** -> **Code Injection**.
2. In **Header/Footer Injection**, identify scripts that are not required on every page.
3. Move page-specific scripts out of global injection into the specific page's code injection area.
4. Keep global injection minimal (sitewide essentials only).

### D) Delay non-critical analytics/tag execution

1. In GTM, keep only critical tags firing on initial pageview.
2. Change non-critical tags to fire on:
  - `Window Loaded`, or
  - `Timer` (e.g., 3–5s), or
  - first user interaction.
3. Re-test conversions/events after each tag change.

### E) Keep commerce/account off the landing path when possible

1. Verify homepage does not include account/cart UI elements.
2. Keep commerce/account UI and flows on Tier C routes only.
3. If Squarespace still serves some commerce/account assets globally, prioritize reducing everything else on homepage critical path (hero image, embeds, tag timing), which still yields strong wins.

### F) Optimize hero LCP image delivery

1. Ensure the first hero image is the smallest acceptable visual size for mobile.
2. Use modern compressed sources where supported.
3. Keep first slide eager/high priority; keep all following slides lazy.
4. Confirm visual quality at common mobile widths before publishing.

## Rollout order (highest ROI first)

1. Remove homepage dependencies that trigger commerce/account bundles.
2. Delay non-critical GTM tags and popup/announcement script execution.
3. Verify hero LCP image size/format and mobile source dimensions.
4. Trim font families/weights used above the fold.

## Verification checklist (after each step)

- Re-run mobile Lighthouse (Slow 4G, Moto class emulation).
- Track metric deltas:
  - LCP (target first)
  - TBT
  - FCP
- Confirm no regressions in:
  - Homepage hero visibility above fold
  - Navigation and CTA behavior
  - Transactional/account flows on Tier C pages

## Target outcomes

- LCP: from ~12s toward <4s
- TBT: from ~650ms toward <200ms
- FCP: from ~3.3s toward <2s

These are realistic directional targets for this architecture once non-essential bundles are removed from homepage critical path.