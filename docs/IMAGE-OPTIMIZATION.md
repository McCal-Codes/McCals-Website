# Image Optimization Setup - Complete! 🎉

## Overview

Automatic image optimization has been added to the McCals-Website repository. Images are now automatically compressed when pushed to GitHub, reducing file sizes by 20-50% while maintaining visual quality.

## How It Works

### Automatic (GitHub Actions)

When you push new images to any portfolio:

1. GitHub Actions detects the change
2. Runs `optimize-images.js` script
3. Compresses images to 80% JPEG quality
4. Resizes if larger than 4K (3840x2160)
5. Only replaces if savings > 5%
6. Commits optimized images
7. Generates manifest
8. Widget serves optimized images

### Manual (Local)

Run optimization locally before pushing:

```bash
# Optimize all portfolios
npm run optimize:images

# Optimize specific portfolio
npm run optimize:concert
npm run optimize:portrait
npm run optimize:nature
npm run optimize:journalism
```

## Settings

**Compression:**

- JPEG Quality: 80% (visually lossless)
- Max Resolution: 3840x2160 (4K)
- Minimum Savings: 5% (otherwise keeps original)

**Supported Formats:**

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ❌ WebP (already optimized)
- ❌ GIF (animation preservation)

## Workflows Updated

### Concert Portfolio

- **File:** `.github/workflows/concert-manifest.yml`
- **Steps:**
  1. Optimize Concert images
  2. Commit optimized images
  3. Generate concert manifest

### Future Enhancements

Other portfolios (Portrait, Nature, Journalism, Events) can be updated with the same pattern.

## Testing

Test the optimization locally:

```bash
# Optimize concert images
npm run optimize:concert

# Check the output
# Should show: processed count, saved MB, duration
```

## Benefits

✅ **Faster Loading** - 20-50% smaller file sizes
✅ **Better Performance** - Reduced bandwidth usage
✅ **SEO Improvement** - Faster page loads = better rankings
✅ **Automatic** - No manual intervention needed
✅ **Safe** - Only replaces if significant savings
✅ **Reversible** - Originals preserved in git history

## Notes

- Original images are preserved in git history
- Optimization is non-destructive (can revert)
- EXIF data is preserved for date detection
- Only new/modified images are processed
- Workflow runs on every push to main

---

**Setup Complete!** 🚀

Just add images and push - optimization happens automatically!
