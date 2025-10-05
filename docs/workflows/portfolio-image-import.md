# Portfolio Image Import Guide

This guide walks through the process of adding new photo sets so they appear in the legacy widgets, the unified widgets, and the universal manifest.

## 1. Organize the source files

1. Pick the portfolio bucket:
   - `src/images/Portfolios/Concert`
   - `src/images/Portfolios/Events`
   - `src/images/Portfolios/Journalism`
2. Create a new folder that matches the project slug you want to use (for example `My-New-Show-2025`).
3. Copy the exported JPGs into that folder. If you create multiple sizes, keep the naming consistent (e.g., `-1280.jpg`, `-640.jpg`, `-320.jpg`).

> Tip: the manifests only need the relative path to each asset. Keep everything under `src/images/Portfolios/...` so the paths stay short.

## 2. Update the per-portfolio manifest

Each portfolio has its own manifest JSON in the corresponding folder (for example `src/images/Portfolios/Events/events-manifest.json`). Add a new entry that lists the metadata for your folder:

```json
{
  "eventName": "My New Show",
  "slug": "my-new-show-2025",
  "dateDisplay": "May 2025",
  "images": [
    { "path": "src/images/Portfolios/Events/My-New-Show-2025/0501_My-Show-1280.jpg" }
  ],
  "tags": ["event", "2025"],
  "location": {
    "venue": "Riviera Theater",
    "city": "Chicago, IL"
  }
}
```

- Use the same property names that already exist in the file (`eventName`, `dateDisplay`, etc.).
- Only list the image sizes you want exposed. If you include multiple resolutions, the widgets pick the first entry as the cover.

For nature and wildlife collections, update `src/images/Portfolios/Nature/nature-manifest.json` instead. Nature entries use `collectionName` for the display title:

```json
{
  "collectionName": "Mist Valley Sunrise",
  "folderPath": "Landscapes/Mist-Valley-Sunrise",
  "dateDisplay": "September 2025",
  "images": [
    "Mist-Valley-Sunrise-1280.jpg"
  ],
  "tags": ["landscape", "sunrise"]
}
```

Keep the folder path in sync with your image directories so the widget resolves the files.

## 3. Refresh the universal manifest

After saving the per-portfolio manifest, regenerate `portfolio-manifest.json` so the unified widgets discover the new entry.

```bash
node scripts/generate-universal-manifest.js --root "./src/images/Portfolios" --out "./src/images/Portfolios/portfolio-manifest.json"
```

On Windows you can use the helper PowerShell script instead:

```powershell
pwsh ./scripts/win-generate-universal-manifest.ps1
```

The script scans every per-portfolio manifest under `src/images/Portfolios/**` and writes a single combined manifest that the unified widgets read.

## 4. Verify in the browser

1. Run the dev server (`npm run dev`) or open the HTML file directly in Live Server.
2. Open one of the unified pages, for example `src/widgets/event-portfolio/versions/v2.6-unified.html`.
3. Confirm the new entry appears with the correct title, date, and image preview.
4. Optionally open `tests/html/widgets/unified-portfolio-demo.html?type=event` to make sure the universal view sees the update.
5. Open `src/widgets/nature-portfolio/versions/v1.0.html` in your browser or Squarespace code block to confirm the dedicated nature widget picks up the new collections.

## 5. Commit the assets

When you are ready to push, commit:

- The new image folder inside `src/images/Portfolios/...`
- The per-portfolio manifest change (e.g., `events-manifest.json`)
- The regenerated `portfolio-manifest.json`

Keeping these three pieces in sync ensures both the legacy and unified widgets can load your photos without additional configuration.



