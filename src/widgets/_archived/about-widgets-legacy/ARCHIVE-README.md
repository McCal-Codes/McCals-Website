# Archived About Widgets (Legacy)

**Archive Date**: January 14, 2025  
**Reason**: Reorganization to clean widget structure  

## Contents

This archive contains the original `about-widgets` directory that was reorganized into a cleaner structure under `src/widgets/about/`.

### Archived Files:

#### Widget Files:
- `about-section-squarespace.html` - Moved to `about/complete-about-page/`
- `complete-about-squarespace.html` - Moved to `about/complete-about-page/`
- `client-logos-widget-squarespace.html` - Superseded by `about/client-carousel/`
- `client-carousel-test.html` - Development test file
- `client-logos-test.html` - Development test file  
- `updated-logo-widget.html` - Development iteration

#### Documentation:
- `README.md` - Original documentation (preserved for reference)
- `CHANGELOG.md` - Original change history (preserved for reference)
- `MIGRATION-NOTICE.md` - Migration documentation

#### Version History:
- `versions/v1.1.0-client-carousel-squarespace.html` - Moved to `about/client-carousel/versions/`
- `versions/v1.1.1-client-carousel-squarespace.html` - Moved to `about/client-carousel/versions/`
- `versions/v1.1.2-client-carousel-squarespace.html` - Moved to `about/client-carousel/versions/`
- `versions/v1.1.3-client-carousel-squarespace.html` - Moved to `about/client-carousel/versions/`
- `versions/v1.1.4-client-carousel-squarespace.html` - Moved to `about/client-carousel/versions/`

## New Organization

### What Moved Where:

**Client Carousel Functionality**:
- **From**: `about-widgets/client-logos-widget-squarespace.html`
- **To**: `about/client-carousel/client-carousel-squarespace.html`
- **Versions**: All v1.1.x versions moved to new versions folder
- **Status**: Enhanced to v1.1.5 with improved logos and organization

**Complete About Page Functionality**:
- **From**: `about-widgets/complete-about-squarespace.html`
- **To**: `about/complete-about-page/complete-about-squarespace.html`
- **Additional**: `about-section-squarespace.html` also moved to same location
- **Status**: Maintained at v1.4.1 with new documentation

## Benefits of Reorganization

### Before (Flat Structure):
```
src/widgets/about-widgets/
├── Mixed widget types in one directory
├── No clear separation of concerns
├── Difficult to maintain and scale
└── Confusing file organization
```

### After (Organized Structure):
```
src/widgets/about/
├── client-carousel/          # Standalone carousel widget
├── complete-about-page/      # Full about page solution
└── README.md                 # Clear section overview
```

### Improvements:
- **Clear Separation**: Each widget type has its own directory
- **Scalable**: Easy to add new about-section widgets
- **Maintainable**: Predictable file structure
- **Professional**: Industry-standard organization pattern

## Migration Impact

### No Breaking Changes:
- All widget functionality preserved
- Same HTML content and Squarespace integration
- Asset URLs maintained
- Version history completely preserved

### Documentation Enhanced:
- Each widget now has dedicated README and CHANGELOG
- Clear usage instructions and examples
- Better organization for development team

## Recovery Instructions

If you need to reference or restore any legacy functionality:

1. **Access Archive**: Navigate to `src/widgets/_archived/about-widgets-legacy/`
2. **Compare Changes**: Use git diff to see what changed during migration
3. **Restore if Needed**: Copy specific files back to active directories
4. **Update References**: Ensure any deployment scripts point to new locations

## Deprecation Notice

**The `about-widgets` directory structure is deprecated as of January 14, 2025.**

- **Use Instead**: `src/widgets/about/client-carousel/` and `src/widgets/about/complete-about-page/`
- **No Support**: Legacy structure will not receive updates
- **Removal Timeline**: Archive may be cleaned up in future major releases

---

**Archive Maintained By**: McCal Media Development Team  
**Questions**: Refer to current widget documentation in active directories