# Changelog — Event Portfolio Widget

All notable changes to the Event Portfolio widget.

## v1.1 (2025-09-19) — Single Manifest API Call 🚀
### Ultra-Efficient Performance Revolution ⚡
- **NEW**: Single API call approach using `events-manifest.json` (no rate limiting needed!)
- **PERFORMANCE**: Eliminates multiple GitHub API calls - now uses only ONE request
- **EFFICIENCY**: Follows the same manifest pattern as Concert Portfolio v3.4
- **RELIABILITY**: No more API rate limiting concerns or request queue management
- **SPEED**: Faster load times with pre-structured event data
- **SCALABILITY**: Can handle unlimited events without API throttling

### Technical Implementation 🔧
- **Manifest-based architecture**: All event data loaded from single JSON file
- **Round-robin card distribution**: Balanced image selection across all events
- **Progressive image loading**: Staggered loading with visual feedback
- **Debug mode enhancements**: API call count monitoring (should always show "1")
- **Error handling**: Graceful fallback for missing or malformed manifest

### File Structure 📁
- `events-manifest.json` → Central data source for all event information
- No more recursive folder scanning or multiple API requests
- Compatible with existing Universal Caption System integration

---

## v1.0 (2025-09-19) — Initial Release 🎯
### Event-Focused Portfolio System ✨
- **NEW**: Complete event portfolio system based on Concert Portfolio architecture
- **NEW**: Event-specific color scheme with purple-blue gradients and professional styling
- **NEW**: Universal Caption System integration for consistent metadata handling
- **NEW**: Event-focused lightbox with professional event photography descriptions
- **NEW**: GitHub API integration for automatic event folder discovery
- **NEW**: Performance optimized with intelligent caching and lazy loading
- **NEW**: Debug mode with event-specific performance metrics
- **NEW**: Natural-height masonry layout optimized for event photography
- **NEW**: Enhanced error handling and loading states

### Visual Design 🎨  
- **Purple-blue gradient theme** distinguishing it from concert portfolio's red accent
- **Event-specific styling** with professional corporate event aesthetics
- **Enhanced card hover effects** with event-themed shadows and borders
- **Professional lightbox** with event photography context

### Technical Features 🔧
- **GitHub Structure**: `images/Portfolios/Events/[Event-Name]/[image files]`
- **Universal Caption System** for cross-widget caption consistency
- **Responsive masonry grid** with mobile-optimized breakpoints
- **Performance monitoring** with load time and cache metrics
- **Error resilience** with graceful fallbacks for missing content

### Event Categories Supported 📅
- Corporate Events
- Conferences  
- Celebrations
- Special Occasions
- Professional gatherings and networking events