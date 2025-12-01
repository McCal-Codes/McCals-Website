Repository asset policy
=======================

This document explains recommended patterns for storing image assets and large files in this repository.

Summary recommendations
- Keep only optimized, web-ready images in the repo (thumbnails, compressed JPG/WEBP). Move original/raw images (>5MB) to external storage (S3, Google Cloud Storage, or Git LFS).
- Use the manifest generator to reference CDN-hosted originals where possible.
- Prevent large files from being committed accidentally by using the staged-size-check pre-commit script (5MB default).

How to add images
- Add optimized images under `src/images/Portfolios/...` using the manifest generator (`npm run optimize:events` or `npm run optimize:events:webp`).
- For large raw files, upload to the canonical asset store and reference the CDN URL in manifests.

If you need to migrate history
- See `scripts/utils/migrate-to-git-lfs.sh` (TODO) or use `git lfs migrate import` to move historical binaries to LFS. History rewrite requires coordination with other contributors.

Local dev tips
- Install `webp` tools via Homebrew: `brew install webp` and run the quick conversion example in README or use `npm run optimize:events:webp`.
