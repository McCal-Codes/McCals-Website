# Navigation Widget — sitemap autofill & configuration

This document describes the optional data-* configuration for the McCal navigation widget (`v1.7.1-rollback`) and the sitemap-driven submenu autofill feature.

File: `src/widgets/site/navigation/versions/v1.7.1-rollback.html`

## How to enable

- By default the widget uses the static menu items embedded in the HTML.
- To enable sitemap-driven autofill for the Work submenu, add `data-sitemap-autofill="true"` to the widget wrapper element.

Example:

<div class="mcc-nav-widget" data-widget-version="1.7.1-rollback" data-sitemap-autofill="true">
  <!-- ... -->
</div>

## Configuration attributes

- `data-sitemap-autofill` — `true|false` (default: `false`)
  - Enables the sitemap fetch and dynamic rebuild of the Work submenu.

- `data-sitemap-persistent` — `true|false` (default: `false`)
  - When `true` the widget caches results in `localStorage` with an expires timestamp.
  - When `false` (default) the widget caches results in `sessionStorage` for the browser session only.
  - Recommendation: Keep the default (sessionStorage) unless your sitemap is very stable and you want to minimize fetches across visits.

- `data-sitemap-cache-ttl` — integer milliseconds (default: `600000` / 10 minutes)
  - Controls the TTL used to consider cached data fresh.
  - For `localStorage` mode the widget stores an `expires` timestamp. For `sessionStorage` mode the widget stores a `ts` and validates its age against `cacheTtl`.

- `data-sitemap-url` — string (default: `/sitemap.xml`)
  - Override the sitemap location if your sitemap lives at a custom path.

- `data-sitemap-show-loading` — `visible|sr-only` (default: `sr-only`)
  - Controls whether a minimal loading text is shown while the Work submenu is fetching.
  - `sr-only` keeps the loading text accessible to screen readers only; `visible` shows a small inline "Loading…" text in the submenu.

## Accessibility

- The submenu uses `aria-busy` while fetching. A small sr-only loading node is present so screen readers announce the loading state.
- If you enable `data-sitemap-show-loading="visible"`, the loading text will also be visible to sighted users.

## Debugging & diagnostics

- The widget logs an informational message on initialization indicating whether sitemap autofill is enabled and which storage mode is active. Example:

  [mcc-nav] sitemap autofill: enabled ; storage: sessionStorage

- If your site blocks same-origin fetches or `localStorage` access is restricted by the environment, the widget falls back to the embedded static markup and emits a console warning.

## Tests

- A simple Node-based unit test validates the sitemap parsing logic: `tests/sitemap-parser.test.js`.
- Run locally:

```powershell
npm run test:sitemap-parser
```

## Notes & best practices

- Use session storage (default) when your sitemap changes occasionally or you support shared/public devices.
- Use persistent localStorage only for stable sites where reducing network requests is a priority.
- For large sitemaps, consider returning a compact index file (e.g., a small JSON of top-level sections) and point `data-sitemap-url` to that file to reduce parsing work in the browser.

If you want this document moved into another docs folder or added to the widget README, tell me where and I'll move it.
