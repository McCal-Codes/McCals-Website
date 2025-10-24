# Watcher Scripts

Scripts for watching folders and auto-updating manifests or related data.

## Auto Manifest Watcher

`watch-auto-manifest.js` supports multiple portfolio targets. Use the `--target` flag (or npm aliases) to watch a specific set of folders and regenerate manifests automatically.

```
# Concert portfolio (default)
npm run watch:auto-manifest

# Nature portfolio
npm run watch:auto-manifest:nature

# All supported portfolios
npm run watch:auto-manifest:all
```

Available targets:
- `concert` – runs `npm run manifest:concert`
- `nature` – runs `npm run manifest:nature`
- `events` – runs `npm run manifest:events`
- `journalism` – runs `npm run manifest:journalism`

All watchers debounce changes for two seconds, log to `logs/auto-*-manifest.log`, and ignore `.DS_Store`, `Thumbs.db`, and existing `manifest.json` files.
