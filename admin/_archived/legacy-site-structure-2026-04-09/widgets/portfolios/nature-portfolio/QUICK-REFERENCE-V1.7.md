# Nature Portfolio Widget v1.7 - Quick Reference

## 🎯 What Changed

| Aspect | v1.6 | v1.7 |
|--------|------|------|
| **Default photos shown** | 16 | 32 |
| **Max photos per collection** | 1 | 3 |
| **Filter categories** | All, Animals, Landscapes, Etc | All, Wildlife, Landscapes, Other |
| **Category detection** | Basic folder matching | Smart folder + tag detection |
| **Filter visibility** | All tabs always shown | Only tabs with content |
| **Landscape support** | Limited | Full support with proper tab |

## 🚀 Key Features

### More Photos
- **32 photos by default** (configurable: 8-64)
- **3 photos per collection** for better variety
- **Smart distribution** across all collections

### Better Filtering
- **Wildlife tab**: All animal photos (birds, mammals, etc.)
- **Landscapes tab**: All landscape photos (West Virginia, forests, etc.)
- **Dynamic tabs**: Only shows categories that have content
- **Intelligent categorization**: Uses folder paths AND tags

### Enhanced UX
- Empty collections automatically hidden
- Better photo variety from each collection
- Smoother filtering transitions
- No more empty filter tabs

## 📋 Testing Checklist

```bash
# 1. Open test file
cd src/widgets/nature-portfolio
# Open test-v1.7.0.html in browser

# 2. Verify filters work
✓ Click "All" - should show all photos
✓ Click "Wildlife" - should show bird photos  
✓ Click "Landscapes" - should show West Virginia photos
✓ No empty tabs should appear

# 3. Test lightbox
✓ Click any photo card
✓ Lightbox opens with all images from that collection
✓ Close button works
✓ ESC key closes lightbox

# 4. Test responsiveness
✓ Resize browser - layout adapts
✓ Mobile view - still readable
✓ Filters wrap on narrow screens
```

## 🔧 Configuration

### Change number of photos displayed
```html
<!-- In the widget HTML, modify data-panes attribute -->
<div class="nature-portfolio" id="naturePf" data-panes="32">
  <!-- Min: 8, Max: 64, Default: 32 -->
</div>
```

### Current portfolio structure
```
src/images/Portfolios/Nature/
├── Wildlife/
│   └── Birds/
│       ├── Blue-bellied roller/  (3 photos) ✓
│       ├── Bare-faced Curassow/  (0 photos) ✗
│       └── Steller's Sea Eagle/  (0 photos) ✗
└── Landscapes/
    └── West Virginia/  (4 photos) ✓
```

**Result**: Shows 7 photo cards total
- 3 from Blue-bellied roller (Wildlife)
- 4 from West Virginia (Landscapes)

## 💡 Tips

### Adding more photos
1. Add photos to appropriate folders
2. Run `npm run manifest:generate`
3. Widget auto-detects new content
4. New filter tabs appear automatically

### Category mapping
- **Wildlife keywords**: wildlife, birds, mammals, insects, reptiles, animals
- **Landscape keywords**: landscape, scenery, west virginia, mountains, rivers, forests
- **Detection**: Checks folder path first, then tags
- **Fallback**: "Other" category if no match

### Customization
```javascript
// In widget JavaScript (advanced users)
const MAX_PER_COLLECTION = 3;  // Photos per collection
const TARGET_PANES = 32;        // Total photos to show
```

## 🐛 Troubleshooting

### No photos showing
- Check manifest exists: `nature-manifest.json`
- Verify collections have images
- Check browser console for errors

### Filter tabs not appearing
- Ensure collections have proper folder structure
- Check tags in manifest include category keywords
- Verify `totalImages > 0` for collections

### Landscape tab missing
- Check folder path includes "Landscapes" or "West Virginia"
- Verify tags include "landscape"
- Run manifest generator to update

## 📦 Deployment

### To Squarespace
1. Copy `versions/v1.7-enhanced-display.html`
2. Paste into Code Block
3. Save and publish
4. Widget is live!

### To update
1. Make changes to v1.7 file
2. Copy updated version
3. Replace Code Block content
4. Save and publish

---

**Version**: 1.7  
**Date**: October 24, 2025  
**Compatibility**: All modern browsers, Squarespace Code Blocks  
**Dependencies**: None (self-contained)
