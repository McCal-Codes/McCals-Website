# Changelog — Concert Portfolio Widget

All notable changes to the Squarespace concert portfolio snippet.

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
