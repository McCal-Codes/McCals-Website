# Heading North — November 2025

Drop your full-size JPEGs here. The manifest generator will pick them up automatically.

Guidelines:
- Keep original filenames if possible (date patterns like 20251101_*.jpg help).
- Prefer JPG/JPEG; PNG is supported but larger.
- No manual edits to manifest.json; run the generator instead.

When ready:
- Run the watcher (auto): AI Task "Watch: Auto Manifest" or `npm run watch:auto-manifest`
- Or generate once: AI Task "Manifest: Concert Only" or `npm run manifest:concert`

After generating:
- Verify "Concert Portfolio" widget shows the new images.
- If you reorganize folders, run `npm run manifest:cleanup` before regenerating.
