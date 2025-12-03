# Blog Feed Versions Cleanup — 2025-12-03

Summary: Removed all legacy blog feed widget versions, keeping only `v0.1.0-blog-minimal.html` as the sole active version.

Affected directory:

- `src/widgets/blog-feed/versions/`

Removed files:

- v1-google-sheets.html
- v2.1.0-google-docs-blog.html
- v3.0.0-multi-author-blog.html
- v3.1.0-google-docs-blog.html
- v3.2.0-author-doc-blog.html
- v3.2.0-author-doc-blog.js
- v3.3.0-author-doc-blog.html
- v3.3.0-author-doc-blog.js

Rationale:

- User request to remove all blog versions outside the newly created minimal scaffold.
- Aligns with workspace policy to keep ≤2 active versions; for this widget, we are standardizing to a single active version during rebuild.

Validation:

- Will run `Widget: Validate HTML` task to confirm no structural regressions.

Traceability:

- Added TODO entries in `updates/todo.md` under "Blog Feed Reset — Minimal Scaffold".
