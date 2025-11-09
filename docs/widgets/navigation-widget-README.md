# Navigation widget (v1.7.1-rollback) — README

This README describes the safe rollback navigation widget `v1.7.1-rollback` located at `src/widgets/site/navigation/versions/v1.7.1-rollback.html`.

Summary of changes
- Restored mobile submenu/arrow behavior from v1.6.3 to ensure stable UX for mobile users.
- Introduced an opt-in sitemap-driven submenu autofill prototype (disabled by default).
- Implemented a shared sitemap parser (`scripts/utils/sitemap-parser.js`) used by both browser widget and Node tests.
- Added configurable caching with TTL (sessionStorage default; opt-in localStorage via `data-sitemap-persistent="true"`).
- Added accessible loading state (`aria-busy`) and optional visible loading text.

Quick usage
- File to edit for deployment: `src/widgets/site/navigation/versions/v1.7.1-rollback.html` (copy into Squarespace header injection as needed).
- To enable sitemap autofill (opt-in): add `data-sitemap-autofill="true"` to the widget wrapper element. See `docs/widgets/navigation-widget-config.md` for full options.

Testing
- Unit tests for the sitemap parser live in `tests/sitemap-parser.test.js` and are executable with:

```powershell
npm run test:sitemap-parser
```

Notes
- Default caching is session-backed to avoid cross-session staleness; enable persistent caching with `data-sitemap-persistent="true"`.
- The parser is intentionally lightweight (regex-based) to avoid adding dependencies in the browser. If you need stronger XML parsing, consider serving a compact JSON index from the server and point `data-sitemap-url` to it.

If you want these changes packaged as a separate widget release or a new versioned file for Squarespace, tell me and I will create the versioned file and update CHANGELOG/CHANGELOG entries as requested.
