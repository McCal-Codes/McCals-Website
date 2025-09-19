# Concert Portfolio Automation

This system automatically updates your concert portfolio manifests whenever you add, change, or remove images.

## Quick Start

### Option 1: Run the Watcher (Recommended)
```bash
# Start watching for changes (keeps running)
npm run watch:concerts

# Or run directly
node scripts/watch-concert-images.js
```

### Option 2: Manual Regeneration
```bash
# Regenerate only concert manifest
npm run manifest:concert

# Regenerate all manifests
npm run build:universal
```

## How It Works

1. **File Watching**: Monitors `images/Portfolios/Concert/` for image changes
2. **Debouncing**: Waits 2 seconds after last change to avoid rapid regenerations  
3. **Auto-Regeneration**: Runs both concert and universal manifest generators
4. **Auto-Commit**: Automatically commits manifest updates to git

## Folder Structure Requirements

Your concert images must follow this structure:
```
images/Portfolios/Concert/
├── Band Name/
│   └── Month Year/          # e.g., "August 2025"
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
└── Another Band/
    ├── March 2024/
    │   └── images...
    └── December 2024/
        └── images...
```

## Supported Image Types
- `.jpg` / `.jpeg`
- `.png` 
- `.webp`
- `.gif`

## What Gets Generated

### Concert Manifest (`images/Portfolios/Concert/concert-manifest.json`)
- Contains all concert bands with their images
- Used by Concert Portfolio Widget v3.4+
- Includes band names, dates, and image lists

### Universal Manifest (`images/Portfolios/portfolio-manifest.json`)
- Contains ALL portfolio types (Concert, Journalism, etc.)
- Used by universal portfolio widgets
- Provides overall statistics and cross-category browsing

## Adding New Concert Images

1. **Start the watcher** (if not already running):
   ```bash
   npm run watch:concerts
   ```

2. **Add images** using the correct folder structure:
   ```bash
   mkdir -p "images/Portfolios/Concert/New Band/October 2025"
   # Copy your images into this folder
   ```

3. **Watch the magic happen**:
   - Watcher detects the new images
   - Manifests regenerate automatically
   - Changes are committed to git
   - Your website widget updates automatically!

## Troubleshooting

### Images Not Showing in Widget?
- Check folder structure matches `Band Name/Month Year/` format
- Ensure images are supported file types
- Check console for watcher output
- Try manual regeneration: `npm run manifest:concert`

### Watcher Not Detecting Changes?
- Make sure you're in the project root directory
- Check that `images/Portfolios/Concert/` exists
- Restart the watcher: `Ctrl+C` then `npm run watch:concerts`

### Git Issues?
- Ensure git is initialized and configured
- Check you have permissions to commit
- Manual commit: `git add images/Portfolios/ && git commit -m "Update manifests"`

## Advanced Usage

### Disable Auto-Commit
Edit `scripts/watch-concert-images.js` and comment out the auto-commit section (lines 66-81).

### Change Debounce Timing
Edit `scripts/watch-concert-images.js` and modify `DEBOUNCE_DELAY` (default: 2000ms).

### Run Without Watcher
```bash
# Just regenerate manifests once
npm run manifest:concert
npm run manifest:universal
```

## Files Involved

- `scripts/watch-concert-images.js` - Main watcher script
- `scripts/generate-concert-manifest.js` - Concert manifest generator  
- `scripts/generate-universal-manifest.js` - Universal manifest generator
- `widgets/concert-portfolio/versions/v3.4-manifest.html` - Widget using manifests
- `package.json` - Contains npm scripts

## Need Help?

Check the script help:
```bash
node scripts/watch-concert-images.js --help
```

Or run manual generators with output:
```bash
npm run manifest:concert
npm run manifest:universal
```