# Sitemap & Lighthouse Work — 2025-11-08

Summary of the session: implemented a sitemap for the Squarespace site (canonical: https://mcc-cal.com), added `robots.txt`, created a GitHub Actions workflow to regenerate the sitemap on push, and added an automated Lighthouse CI workflow to produce mobile audit JSON artifacts. Also experimented with image optimization and a few low-risk performance tweaks.

What was done
- Added `scripts/utils/generate-sitemap.js` — scans site/widget HTML and writes `dist/sitemap.xml` and `sitemap.xml` at repo root using base URL `https://mcc-cal.com`.
- Added `robots.txt` pointing to the sitemap.
- Added `.github/workflows/sitemap-regenerate.yml` to regenerate the sitemap on content/script pushes and commit any changes.
- Created `scripts/optimize-images.cjs` (CommonJS) to optimize images locally using `sharp` and `fast-glob`. Ran locally: optimized ~819 images into `dist/optimized-images` (not committed).
- Deferred a heavy shared script in a few widget pages, preloaded demo hero images, and added `preconnect` hints to `src/site/index.html`.
- Added `.github/workflows/lighthouse-report.yml` to `main` so CI can run Lighthouse in GitHub Actions and upload the JSON artifact for later comparison.
- Added a local commit hook at `.githooks/commit-msg` that appends `Author: mccal` to new commit messages (contributor-side hook; will only run for clones that adopt `core.hooksPath` or copy the hook).

Problems encountered and how we solved them
- ESM vs CommonJS: the repository is configured as an ES module (`"type": "module"`) so scripts that used `require()` fail. Solution: put Node scripts that need `require()` in `.cjs` files (e.g., `scripts/optimize-images.cjs`).
- Local Lighthouse run failed because Chrome/Chromium was not available in the environment. Solution: added a GitHub Actions workflow that installs Chromium on the runner and runs Lighthouse, uploading the JSON result as an artifact.
- Git push non-fast-forward rejections: remote changed while we were working. Solution: used `git pull --rebase --autostash` and rebased/pushed; when necessary, merged the branch into `main` and pushed the merge commit.

Decisions & recommendations
- Do NOT commit `dist/optimized-images/` into git — it's large (~437 MB). Instead, either generate optimized images in CI during build or upload optimized assets to a CDN and reference them from the build output.
- For performance work, prioritize the following (high ROI):
  1. Identify true production LCP resources (which image is LCP) and preload it on the production page(s).
  2. Defer or async non-critical scripts; avoid inlining heavy JS in critical path.
  3. Audit and remove unused JS/CSS (bundle analysis) and lazy-load non-essential code.
  4. Wire the locally-generated optimized images into your build or use CI generation + CDN upload for deployment.

Next steps (suggested)
1. Run the Lighthouse CI workflow on `main` and download the JSON artifact. Compare key metrics (Performance, FCP, LCP, TBT, CLS) to the PSI snapshot and prioritize fixes.
2. Prepare a small PR to wire optimized images into the build — copy only the needed optimized variants (webp) for public pages or implement CI generation to avoid committing large files.
3. Perform a repo-wide safe pass to defer non-critical scripts and add preload hints for real production LCP images (not demo/playground).

Notes
- The commit hook is local and optional; to make it effective for all contributors, add a short README note in CONTRIBUTING.md explaining `git config core.hooksPath .githooks` or provide an install script.

If you want, I can run step (1) now: fetch the lighthouse JSON artifact from the Actions run and produce a delta report vs. PSI. Otherwise we can pause here and pick up item (2) when you’re ready.

— mccal (author note appended by commit hook)
