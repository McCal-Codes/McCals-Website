Contributing to McCals-Website

Thanks for contributing! This is a quick-start guide for local development and common workflows.

Quick-start

1. Install dependencies:

   npm install

2. Run the local dev server and preview widgets:

   npm run dev

3. Generate manifests (if you change images):

   npm run manifest:generate

Useful tasks

- npm run repo:health — repository health checks
- npm run analyze:large-files — find large files
- npm run validate:widgets — validate widget HTML

Housekeeping & policies

- Images and binary assets live under `src/images/Portfolios/`. Avoid committing very large binaries (>5MB) directly; prefer Git LFS or external hosting for very large source files.
- There is a single aggregated manifest per portfolio type (e.g., `portrait-manifest.json`). Do not create per-folder `manifest.json` files unless instructed.
- CI will run manifest validation on PRs via `.github/workflows/validate-manifests.yml`.

Code style

- Keep widget files self-contained. Follow patterns in `docs/standards/*`.

If you need help, open an issue or reach out to the repo owners listed in `CODEOWNERS`.
