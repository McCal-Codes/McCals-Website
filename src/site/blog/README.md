Blog content and authoring
=========================

This folder contains the blog content and a simple authoring workflow for the repository.

Purpose
-------
- Provide a minimal manifest-driven blog for the local test site and widget development.
- Allow contributors to author posts via PRs: add markdown files into `posts/` and update `manifest.json` when ready.

Structure
---------
- `manifest.json` — index of posts and (optionally) cached post metadata used by widgets.
- `authors.json` — list of author profiles consumed by widgets and pages.
- `posts/` — markdown files for each post. Filenames should use a slug (e.g. `2025-11-10-welcome.md`).

Authoring workflow (MVP)
------------------------
1. Create a markdown file in `src/site/blog/posts/` with frontmatter fields: `title`, `slug`, `date`, `author`, `summary`.
2. Add/update `manifest.json` to include the new post entry (or open a PR that updates `manifest.json` and the post file together).
3. Once PR is merged the blog widget will pick up the post during the next build or local dev server run.

Notes on comments & likes (MVP)
------------------------------
- The initial implementation stores "likes" and comments in each visitor's browser (localStorage). This is easy to ship, privacy-friendly, and requires no server.
- For team-wide comments, moderation, or long-term persistence, plan to integrate a backend or GitHub Issues / third-party commenting provider later.

Future work
-----------
- Add a script to regenerate `manifest.json` from `posts/` frontmatter automatically.
- Add server-side storage for comments & likes or GitHub Issues integration for community commenting.
- Add an author management UI and author gravatar/photos pipeline.

