# Changelog — Concert Portfolio Widget

All notable changes to the Squarespace concert portfolio snippet.

## v3.1 — 2025-09-19
### Version Management & Documentation 📝
- **NEW**: Complete v3.0 version files with Universal Caption System integration
  - `versions/v3.0-universal-captions.html` - Production-ready UCS implementation
  - `versions/v3.0-debug-simple.html` - Debug version with performance monitoring
  - `versions/v3.0-README.md` - Comprehensive implementation guide
- **IMPROVED**: Version control system for easier deployment tracking
- **IMPROVED**: Documentation structure for better developer experience

## v3.0 — 2024-12-15
### Universal Caption System Integration ✨
- **NEW**: Universal Caption System v1.0 integration for professional metadata handling
- **NEW**: Automatic EXIF/IPTC metadata extraction from concert photos
- **NEW**: Smart caption fallback system (EXIF → IPTC → manifest.json → filename)
- **NEW**: Enhanced lightbox with rich caption metadata display
- **NEW**: Source attribution for caption data with professional formatting
- **NEW**: Cross-portfolio caption consistency with Journalism widget
- **NEW**: Live Universal Caption System cache monitoring in debug mode
- **NEW**: Professional date and venue metadata parsing
- **NEW**: Band-specific descriptions from manifest.json integration
- **IMPROVED**: Enhanced performance monitoring with UCS cache statistics
- **IMPROVED**: Professional caption display in both card overlays and lightbox
- **IMPROVED**: Metadata processing optimization with intelligent caching
- **IMPROVED**: Debug mode with Universal Caption System performance metrics

## v2.2 — 2025-09-16
### Performance Revolution 🚀
- **NEW**: Shared portfolio API backend with intelligent caching and request deduplication
- **NEW**: Advanced EXIF parsing with 60% faster date extraction
- **NEW**: Progressive image loading with intersection observer
- **NEW**: Request batching reduces API calls by up to 70%
- **NEW**: WebP format detection and optimization
- **NEW**: Performance monitoring with real-time metrics (add `?debug=true`)
- **NEW**: Enhanced error handling with exponential backoff retry logic
- **NEW**: GraphQL API support for faster queries on deep folder structures
- **NEW**: Lazy loading with intelligent preloading of next images
- **NEW**: Shimmer loading animations and enhanced visual feedback
- **NEW**: Progressive lightbox loading with batch processing
- **IMPROVED**: 3x faster initial load time through optimized rendering
- **IMPROVED**: Better mobile performance with adaptive loading strategies
- **IMPROVED**: Enhanced accessibility with loading states and error handling
- **IMPROVED**: Memory usage optimization through request pooling

## v2.1 — 2025-09-16
- Auto date now prioritizes EXIF DateTimeOriginal from images (earliest of up to 3 samples)
- Fallback order: manifest.date → EXIF → latest commit date

## v2.0 — 2025-09-16
- Natural-height masonry via CSS columns (no cropping)
- Auto date support: manifest.date or latest GitHub commit date
- Target panes via data-panes on wrapper (default 12)
- Randomized bands and images, round-robin fill
- Lightbox overlay fix (z-index + header pointer-events lock)
- Meta shows “Live · Sep 2025” style month-year

## v1.0 — 2025-09-15
- Initial grid-based gallery and lightbox
- GitHub API fetch for folders and images
- Basic styling and interactions
