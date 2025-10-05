# About Widgets - Structure Migration

**Date**: January 14, 2025  
**Action**: Reorganized from `about-widgets` to `about/client-carousel`  

## Migration Summary

The client carousel widget has been moved from the old flat structure to a new organized structure:

### Old Location (Deprecated):
```
src/widgets/about-widgets/
├── client-logos-widget-squarespace.html
├── versions/v1.1.x-client-carousel-squarespace.html
├── README.md
└── CHANGELOG.md
```

### New Location (Current):
```
src/widgets/about/
├── client-carousel/
│   ├── client-carousel-squarespace.html    # Main production file
│   ├── versions/v1.1.x-client-carousel-squarespace.html
│   ├── README.md
│   └── CHANGELOG.md
└── README.md                               # Section overview
```

## Changes Made

1. **Moved Files**: Copied all carousel-related files to new structure
2. **Updated Versions**: All v1.1.0 through v1.1.5 versions preserved
3. **Enhanced Documentation**: Added section-level README for organization
4. **Improved Logos**: Updated 4 client logos with better quality versions
5. **Maintained Compatibility**: All functionality preserved

## Updated Logo URLs

- **Penn State**: High-resolution FreebieSupply logo
- **The Globe**: Latest Point Park University Globe header (2024)
- **Watchful Shepherd**: Official 2024 logo from watchful.org
- **Voyage Visuals**: Professional V logo from website assets

## Next Steps

1. **Old Directory Cleanup**: The `about-widgets` directory can be archived or removed
2. **Reference Updates**: Update any deployment scripts or documentation pointing to old paths
3. **Future Organization**: Add new about-section widgets to `src/widgets/about/[widget-name]/`

## Benefits

- **Scalable Structure**: Easy to add new about-section widgets
- **Clear Organization**: Logical grouping by page section
- **Maintainable**: Consistent structure across all widget types
- **Version Control**: Complete history preserved in organized manner

---

**Note**: The old `about-widgets` directory remains for reference but should be considered deprecated. All future development should use the new `about/client-carousel/` structure.