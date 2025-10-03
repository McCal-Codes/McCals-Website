# Nature Portfolio Assets

This folder stores nature, landscape, and wildlife collections for the Nature Portfolio widget.

## Expected structure

```
Nature/
  Landscapes/
    Mist-Valley-Sunrise/
      Mist-Valley-Sunrise-1280.jpg
      ...
  Forests/
    Redwood-Rain/
      Redwood-Rain-1280.jpg
      ...
  Wildlife/
    Arctic-Fox-Watch/
      Arctic-Fox-Watch-1280.jpg
      ...
  nature-manifest.json
```

Replace the sample filenames shown in the manifest with your actual images. Keep the folder names and casing in sync so the widget can build image URLs correctly.

After updating images or adding new collections, regenerate the universal manifest:

```
node scripts/generate-universal-manifest.js
```

Alternatively on Windows:

```
pwsh ./scripts/win-generate-universal-manifest.ps1
```

This keeps `src/images/Portfolios/portfolio-manifest.json` up to date so the other widgets discover the new nature entries.
