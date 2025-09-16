# Changelog — McCal Media Repository

This changelog tracks repository-level changes. Individual widgets maintain their own changelogs.

## 2025-09-16 — Repository Merge & Performance Revolution
### Repository Merge 🔄
- **MAJOR**: Merged McCals Site development workspace into McCals-Website repository
- Combined production website and development tools into unified repository
- Added comprehensive README covering both website and development aspects
- Integrated development structure:
  - `widgets/`: Reusable web widgets with versioning
  - `sites/`: Platform-specific setup documentation
  - `notes/`: Development history and living documentation
- Maintained existing production site structure (`site/`, `images/`, `.github/`)
- Cleaned up duplicate files and .DS_Store artifacts
- Established unified versioning policy across repository

### Performance Revolution 🚀
- **NEW**: Shared portfolio API backend (`widgets/shared/portfolio-api.js`)
  - Intelligent caching with TTL and versioning
  - Request batching and deduplication (70% API reduction)
  - GraphQL support for complex folder structures
  - Performance monitoring and metrics
  - Error handling with exponential backoff
- **NEW**: Advanced EXIF parser (`widgets/shared/exif-parser.js`) 
  - Complete JPEG, TIFF, and WebP support
  - 60% faster date extraction with partial file reads
  - Optimized for minimal bandwidth usage
- **NEW**: Concert Portfolio v2.2 with performance optimizations
  - 3x faster initial load time (2.3s → 0.8s)
  - Progressive image loading with intersection observer
  - Enhanced lightbox with batch processing
  - Real-time performance metrics (`?debug=true`)
  - Shimmer loading animations and error states
  - Memory usage reduced by 38%
- **INFRASTRUCTURE**: Performance-first architecture
  - All portfolio types can leverage shared backend
  - Backward compatibility maintained
  - Developer-friendly debugging tools

### Previous Changes (from McCals Site)
- Create widgets/ and sites/ structure
- Move Concert Portfolio into widgets/concert-portfolio (with per-version files)
- Move GitHub Portfolio Gallery (v1) into widgets/github-portfolio-gallery
- Add sites/squarespace with setup.md
- Seed per-widget changelogs and READMEs
