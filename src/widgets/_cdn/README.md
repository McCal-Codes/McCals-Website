# jsDelivr CDN loader for widgets (non-destructive upgrade)

This folder contains a small loader and example snippets to let you serve widget HTML from jsDelivr (GitHub) while keeping the repository's existing widget files intact.

Why this is nondestructive
- The loader injects fetched widget HTML into an existing container element — it does not replace or delete source files in `src/widgets/`.
- You can pin a specific version (tag/commit) for stability and still keep local versions for testing/fallback.
- Widgets continue to work as-is; this is an optional enhancement that lets you update code centrally on GitHub and have sites fetch the new version automatically.

Files added
- `src/widgets/cdn/jsdelivr-loader.js` — small runtime that finds `data-cdn-widget` or `.mccal-widget` containers and loads HTML from jsDelivr. If the CDN fetch fails it can fall back to a provided local path.
- `src/widgets/_cdn/widget-snippet.html` — an example embed snippet to paste into a Squarespace Code Block (or other site). Shows loader include (local or CDN) and fallback usage.

How to construct jsDelivr URLs
- Pattern: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<version_or_branch>/<path-to-file>`
- Example: `https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@v1.2.3/src/widgets/example-widget/versions/v1.2.3-example-widget.html`
- If `@<version>` is omitted the loader will fetch the file from the default branch (not recommended for production because it isn't pinned).

Recommended safe rollout (per-widget)
1. Keep the canonical widget HTML/JS in `src/widgets/<widget>/versions/` as-is. Do not overwrite existing versioned files.
2. Publish a new widget version file following the repo's versioning pattern (e.g., `v2.0.0-my-widget.html`) and commit to GitHub.
3. Create the jsDelivr URL for that exact file and version tag (or commit SHA) and test it in a local page using `widget-snippet.html` by updating `data-path` and `data-version`.
4. When validated, update your Squarespace Code Block snippet to point the `data-path` and `data-version` to the jsDelivr-hosted file, and include the loader from jsDelivr (or the local loader if you prefer).
5. If you need an immediate revert, repoint the `data-version` back to the previous tag/commit in the page markup (no repository edits needed on the site).

Testing locally
- Use the local loader include in `widget-snippet.html` for preview (the local loader path is `/src/widgets/cdn/jsdelivr-loader.js`).
- To test CDN fetches locally, load the CDN loader URL with the `@main` or a tag and ensure CORS allows fetching raw HTML from jsDelivr (jsDelivr is CORS-friendly).

Notes & caveats
- Some widgets include inline CSS/JS that depends on being present before page load. The loader injects HTML after DOMContentLoaded in many cases — test widgets for any race conditions.
- Inline scripts in fetched HTML are executed by the loader (it replaces <script> tags so they run). If a widget uses `document.write` or depends on head-level CSS, adapt the widget to be loader-friendly (prefer appending CSS to document head).
- Version pinning is strongly recommended for production.
- Do not remove or rename existing versioned widget files in `src/widgets/versions/` — the loader's fallback option expects those files to remain for preview/testing.

Next steps (optional)
- Add a short CI step that copies/version-bumps a widget HTML file and creates a release/tag when you want a new CDN-published version.
- Optionally host the loader itself on jsDelivr by referencing `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/widgets/cdn/jsdelivr-loader.js` in production snippets.

If you'd like, I can: add a simple release script that tags a widget version and prints the resulting jsDelivr URL; or sweep `src/widgets/` and generate recommended `data-path` values for each widget so you can paste snippets quickly.
